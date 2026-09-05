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

        user = self.request.user
        user_role = str(getattr(user, "role", "")).upper()
        doctor_param = self.request.query_params.get("doctor")

        # Strictly scope appointments to logged-in doctor
        if user.is_authenticated and user_role == CustomUser.Role.DOCTOR:
            if hasattr(user, "staff_profile"):
                queryset = queryset.filter(doctor=user.staff_profile)
            else:
                queryset = queryset.none()
        elif doctor_param:
            queryset = queryset.filter(doctor_id=doctor_param)

        appointment_date = self.request.query_params.get("appointment_date")
        patient = self.request.query_params.get("patient")
        status_param = self.request.query_params.get("status")
        token_status = self.request.query_params.get("token_status")

        if appointment_date:
            queryset = queryset.filter(appointment_date=appointment_date)

        if patient:
            queryset = queryset.filter(patient_id=patient)

        if status_param:
            queryset = queryset.filter(status=status_param)

        if token_status:
            queryset = queryset.filter(token_status=token_status)

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

        # Only receptionist, admin, or staff can check in patients
        role = str(getattr(request.user, "role", "")).upper()
        if role not in [CustomUser.Role.RECEPTIONIST, CustomUser.Role.ADMIN] and not (
            request.user.is_superuser or request.user.is_staff
        ):
            return Response(
                {"detail": "Only receptionist or admin can check in patients."},
                status=status.HTTP_403_FORBIDDEN,
            )

        today = date.today()

        # Update appointment date to today if check-in is performed today
        if appointment.appointment_date != today:
            appointment.appointment_date = today

        # Appointment must be in a check-in eligible status
        if appointment.status not in [
            Appointment.Status.BOOKED,
            Appointment.Status.TOKEN_PENDING,
            Appointment.Status.CHECKED_IN,
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

        # Get or automatically create OPD bill
        from billing.models import Bill, BillingSettings

        bill = appointment.bills.filter(
            bill_type=Bill.BillType.OPD
        ).first()

        if not bill:
            patient = appointment.patient
            registration_fee = 0
            if patient.registered_at and patient.registered_at.date() == today:
                settings = BillingSettings.objects.first()
                if settings:
                    registration_fee = settings.registration_fee

            consultation_fee = getattr(appointment.doctor, "consultation_fee", 0) or 0

            bill = Bill.objects.create(
                patient=patient,
                appointment=appointment,
                bill_type=Bill.BillType.OPD,
                registration_fee=registration_fee,
                consultation_fee=consultation_fee,
                pharmacy_fee=0,
                lab_fee=0,
                payment_method=Bill.PaymentMethod.CASH,
                payment_status=Bill.PaymentStatus.PENDING,
            )

        # Process payment settlement if requested or not yet paid
        payment_method = request.data.get("payment_method") or request.data.get("paymentMethod") or "CASH"
        method_str = str(payment_method).upper()
        if method_str not in [Bill.PaymentMethod.CASH, Bill.PaymentMethod.GPAY]:
            method_str = Bill.PaymentMethod.CASH

        if bill.payment_status != Bill.PaymentStatus.PAID:
            bill.payment_method = method_str
            bill.payment_status = Bill.PaymentStatus.PAID
            bill.paid_at = timezone.now()
            bill.save()

        # Generate next token for this doctor today if not already issued
        if not appointment.token_number or appointment.token_status != Appointment.TokenStatus.ISSUED:
            last_token = (
                Appointment.objects.filter(
                    doctor=appointment.doctor,
                    appointment_date=today,
                    token_status=Appointment.TokenStatus.ISSUED,
                )
                .order_by("-token_number")
                .first()
            )

            next_token = (last_token.token_number + 1) if last_token and last_token.token_number else 1

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
                "bill_number": bill.bill_number,
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
        # Only Doctor, Admin, or Staff can access this queue
        # ---------------------------------
        if not IsDoctorRole().has_permission(request, self):
            return Response(
                {
                    "detail": "Only doctors or administrators can access the doctor queue."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        # ---------------------------------
        # Doctor's patient queue
        # ---------------------------------
        doctor_profile = getattr(request.user, "staff_profile", None)
        doctor_id = request.query_params.get("doctor")

        queue = Appointment.objects.select_related(
            "patient",
            "doctor",
            "doctor__user",
            "booked_by",
        ).all()

        # Strictly scope to doctor
        user_role = str(getattr(request.user, "role", "")).upper()
        if user_role == CustomUser.Role.DOCTOR:
            if doctor_profile:
                queue = queue.filter(doctor=doctor_profile)
            else:
                return Response([], status=status.HTTP_200_OK)
        elif doctor_id and doctor_id != "ALL":
            if str(doctor_id).isdigit():
                queue = queue.filter(doctor_id=int(doctor_id))
            else:
                queue = queue.filter(doctor__staff_id=doctor_id)
        elif doctor_profile:
            queue = queue.filter(doctor=doctor_profile)
        else:
            return Response([], status=status.HTTP_200_OK)

        # Date filtering
        appointment_date = request.query_params.get("appointment_date")
        if appointment_date and appointment_date != "ALL":
            queue = queue.filter(appointment_date=appointment_date)

        # Status filtering
        status_param = request.query_params.get("status")
        if status_param and status_param != "ALL":
            queue = queue.filter(status=status_param)

        queue = queue.order_by("appointment_date", "token_number", "appointment_time")

        serializer = self.get_serializer(
            queue,
            many=True
        )

        return Response(serializer.data)