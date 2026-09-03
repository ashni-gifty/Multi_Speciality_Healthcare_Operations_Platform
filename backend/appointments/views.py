from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Appointment
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
        detail=True,
        methods=["post"],
        url_path="check-in",
    )
    def check_in(self, request, pk=None):

        appointment = self.get_object()

        if appointment.status != Appointment.Status.BOOKED:
            return Response(
                {
                    "detail":
                        "Only booked appointments can be checked in."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Token generated only during check-in
        today = appointment.appointment_date

        last_token = (
            Appointment.objects
            .filter(
                doctor=appointment.doctor,
                appointment_date=today,
                token_status=Appointment.TokenStatus.ISSUED,
            )
            .exclude(pk=appointment.pk)
            .order_by("-token_number")
            .first()
        )

        if last_token:
            token_number = last_token.token_number + 1
        else:
            token_number = 1

        appointment.status = Appointment.Status.CHECKED_IN
        appointment.token_status = Appointment.TokenStatus.ISSUED
        appointment.token_number = token_number

        appointment.save(
            update_fields=[
                "status",
                "token_status",
                "token_number",
                "updated_at",
            ]
        )

        return Response(
            AppointmentSerializer(
                appointment,
                context={"request": request},
            ).data
        )

    @action(
        detail=False,
        methods=["get"],
        url_path="doctor-queue",
    )
    def doctor_queue(self, request):

        doctor = request.query_params.get("doctor")
        appointment_date = request.query_params.get(
            "appointment_date"
        )

        if not doctor:
            return Response(
                {"detail": "doctor parameter is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not appointment_date:
            from datetime import date
            appointment_date = date.today()

        queue = self.get_queryset().filter(
            doctor_id=doctor,
            appointment_date=appointment_date,
            status=Appointment.Status.CHECKED_IN,
            token_status=Appointment.TokenStatus.ISSUED,
        ).order_by(
            "token_number"
        )

        serializer = self.get_serializer(queue, many=True)

        return Response(serializer.data)