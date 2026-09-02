from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import Appointment
from .serializers import AppointmentSerializer


class AppointmentViewSet(viewsets.ModelViewSet):

    queryset = Appointment.objects.select_related(
        "patient",
        "doctor",
        "doctor__user",
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

        status = self.request.query_params.get(
            "status"
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

        if status:
            queryset = queryset.filter(
                status=status
            )

        return queryset