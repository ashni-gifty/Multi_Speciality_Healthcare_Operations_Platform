from rest_framework import serializers
from .models import Prescription


class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = [
            "id",
            "rx_id",
            "patient",
            "doctor",
            "doctor_name",
            "diagnosis",
            "blood_pressure",
            "pulse",
            "temperature",
            "medicines",
            "lab_tests",
            "notes",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "rx_id",
            "created_at",
        ]