from rest_framework import serializers
from .models import Prescription
from patients.models import Patient


class PrescriptionSerializer(serializers.ModelSerializer):
    patient_id = serializers.CharField(write_only=True)
    patient_name = serializers.SerializerMethodField(read_only=True)
    date = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Prescription
        fields = [
            "id",
            "rx_id",
            "patient_id",
            "patient_name",
            "doctor_name",
            "diagnosis",
            "blood_pressure",
            "pulse",
            "temperature",
            "medicines",
            "lab_tests",
            "notes",
            "date",
            "created_at",
        ]
        read_only_fields = ["id", "rx_id", "created_at"]

    def get_patient_name(self, obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}"

    def get_date(self, obj):
        return obj.created_at.strftime("%b %d, %Y - %I:%M %p")

    def create(self, validated_data):
        patient_id_val = validated_data.pop("patient_id")
        try:
            patient = Patient.objects.get(patient_id=patient_id_val)
        except Patient.DoesNotExist:
            patient = Patient.objects.first()
        prescription = Prescription.objects.create(patient=patient, **validated_data)
        return prescription
