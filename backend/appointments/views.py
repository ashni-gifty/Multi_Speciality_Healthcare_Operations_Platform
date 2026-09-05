from datetime import datetime, date, timedelta

from django.utils import timezone

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from accounts.permissions import IsDoctorRole
from rest_framework.response import Response

from accounts.models import CustomUser
from appointments.models import Appointment
from .models import Appointment
from staff.models import DoctorAvailability
from .serializers import AppointmentSerializer


class AppointmentViewSet(viewsets.ModelViewSet):

    queryset = Appointment.objects.select_related(
        "patient",
        "doctor",
        "doctor__user",
        "booked_by",
        "booked_by__user",
    ).all()

    serializer_class = AppointmentSerializer

    permission_classes = [
        IsAuthenticated,
    ]

    def get_queryset(self):

        queryset = super().get_queryset()

        appointment_date = self.request.query_params.get(
            "appointment_date"
        )

        doctor = self.request.query_params.get(
            "doctor"
        )

        patient = self.request.query_params.get(
            "patient"
        )

        status_param = self.request.query_params.get(
            "status"
        )

        token_status = self.request.query_params.get(
            "token_status"
        )

        if appointment_date:
            queryset = queryset.filter(
                appointment_date=appointment_date
            )

        if doctor:
            queryset = queryset.filter(
                doctor_id=doctor
            )

        if patient:
            queryset = queryset.filter(
                patient_id=patient
            )

        if status_param:
            queryset = queryset.filter(
                status=status_param
            )

        if token_status:
            queryset = queryset.filter(
                token_status=token_status
            )

        return queryset

    def perform_create(self, serializer):

        appointment = serializer.save()

        # Automatically record receptionist
        user = self.request.user

        if hasattr(user, "staff_profile"):
            appointment.booked_by = user.staff_profile
            appointment.save(
                update_fields=["booked_by", "updated_at"]
            )

    @action(
        detail=False,
        methods=["get"],
        url_path="available-slots",
    )
    def available_slots(self, request):

        doctor_id = request.query_params.get("doctor")
        appointment_date = request.query_params.get("date")

        if not doctor_id:
            return Response(
                {"detail": "doctor parameter is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not appointment_date:
            return Response(
                {"detail": "date parameter is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate date
        try:
            selected_date = datetime.strptime(
                appointment_date,
                "%Y-%m-%d"
            ).date()
        except ValueError:
            return Response(
                {
                    "detail":
                        "Invalid date format. Use YYYY-MM-DD."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Past dates are not allowed
        if selected_date < date.today():
            return Response(
                {
                    "detail":
                        "Past dates are not allowed."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Convert date to MONDAY, TUESDAY, etc.
        day_name = selected_date.strftime("%A").upper()

        # Get doctor's availability for that day
        availability = DoctorAvailability.objects.filter(
            doctor_id=doctor_id,
            day_of_week=day_name,
        ).order_by(
            "available_from"
        )

        if not availability.exists():
            return Response(
                {
                    "doctor": doctor_id,
                    "date": selected_date,
                    "day": day_name,
                    "available_slots": [],
                    "message":
                        "Doctor is not available on this day."
                }
            )

        available_slots = []

        for schedule in availability:

            current = datetime.combine(
                selected_date,
                schedule.available_from
            )

            end = datetime.combine(
                selected_date,
                schedule.available_to
            )

            while current < end:

                slot_time = current.time()

                # Today's past slots should not be shown
                if selected_date == date.today():
                    current_time = timezone.localtime().time()

                    if slot_time <= current_time:
                        current += timedelta(
                            minutes=schedule.slot_duration
                        )
                        continue

                # Check whether slot is already booked
                already_booked = Appointment.objects.filter(
                    doctor_id=doctor_id,
                    appointment_date=selected_date,
                    appointment_time=slot_time,
                    status__in=[
                        Appointment.Status.BOOKED,
                        Appointment.Status.TOKEN_PENDING,
                        Appointment.Status.CHECKED_IN,
                        Appointment.Status.IN_CONSULTATION,
                    ],
                ).exists()

                if not already_booked:
                    available_slots.append(
                        slot_time.strftime("%H:%M:%S")
                    )

                current += timedelta(
                    minutes=schedule.slot_duration
                )

        return Response({
            "doctor": doctor_id,
            "date": selected_date,
            "day": day_name,
            "available_slots": available_slots,
        })

    @action(detail=True, methods=["post"], url_path="check-in")
    def check_in(self, request, pk=None):
        appointment = self.get_object()

        # Only receptionist can check in patients
        if request.user.role != CustomUser.Role.RECEPTIONIST:
            return Response(
                {"detail": "Only receptionist can check in patients."},
                status=status.HTTP_403_FORBIDDEN,
            )

        today = date.today()

        # Future appointments cannot be checked in
        if appointment.appointment_date != today:
            return Response(
                {"detail": "Patient can be checked in only on the appointment date."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Appointment must be in a check-in eligible status
        if appointment.status not in [
            Appointment.Status.BOOKED,
            Appointment.Status.TOKEN_PENDING,
        ]:
            return Response(
                {
                    "detail": (
                        f"Appointment cannot be checked in from "
                        f"'{appointment.status}' status."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Payment must be completed before check-in
        bill = appointment.bills.filter(
            bill_type="OPD"
        ).first()

        if not bill:
            return Response(
                {"detail": "OPD bill has not been created for this appointment."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if bill.payment_status != "PAID":
            return Response(
                {
                    "detail": "Payment must be completed before check-in.",
                    "bill_number": bill.bill_number,
                    "payment_status": bill.payment_status,
                    "total_amount": str(bill.total_amount),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Generate next token for this doctor today
        last_token = (
            Appointment.objects.filter(
                doctor=appointment.doctor,
                appointment_date=today,
                token_status=Appointment.TokenStatus.ISSUED,
            )
            .order_by("-token_number")
            .first()
        )

        next_token = (last_token.token_number + 1) if last_token else 1

        appointment.token_number = next_token
        appointment.token_status = Appointment.TokenStatus.ISSUED
        appointment.status = Appointment.Status.CHECKED_IN
        appointment.save()

        return Response(
            {
                "message": "Patient checked in successfully.",
                "appointment_id": appointment.id,
                "patient": appointment.patient.patient_id,
                "patient_name": (
                    f"{appointment.patient.first_name} "
                    f"{appointment.patient.last_name}"
                ),
                "doctor": (
                    f"Dr. {appointment.doctor.first_name} "
                    f"{appointment.doctor.last_name}"
                ),
                "token_number": appointment.token_number,
                "status": appointment.status,
                "token_status": appointment.token_status,
                "payment_status": bill.payment_status,
            },
            status=status.HTTP_200_OK,
        )

    @action(
        detail=False,
        methods=["get"],
        url_path="doctor-queue",
    )
    def doctor_queue(self, request):

        # ---------------------------------
        # Only Doctor can access this queue
        # ---------------------------------

        if not IsDoctorRole().has_permission(request, self):
            return Response(
                {
                    "detail":
                        "Only doctors can access the doctor queue."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # ---------------------------------
        # Get logged-in doctor's profile
        # ---------------------------------

        try:
            doctor_profile = request.user.staff_profile

        except Exception:
            return Response(
                {
                    "detail":
                        "Doctor staff profile not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        appointment_date = request.query_params.get(
            "appointment_date"
        )

        if not appointment_date:
            appointment_date = date.today()

        # ---------------------------------
        # Only logged-in doctor's queue
        # ---------------------------------

        queue = self.get_queryset().filter(
            doctor=doctor_profile,
            appointment_date=appointment_date,
            status=Appointment.Status.CHECKED_IN,
            token_status=Appointment.TokenStatus.ISSUED,
        ).order_by(
            "token_number"
        )

        serializer = self.get_serializer(
            queue,
            many=True
        )

        return Response(serializer.data)