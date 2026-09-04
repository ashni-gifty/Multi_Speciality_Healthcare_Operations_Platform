from rest_framework import serializers
from .models import LabReport, LabTest


class LabReportSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    patient_details = serializers.SerializerMethodField()

    class Meta:
        model = LabReport
        fields = [
            "id",
            "report_id",
            "patient",
            "patient_name",
            "patient_details",
            "test_name",
            "sample_type",
            "ordered_by_doctor",
            "technician_name",
            "status",
            "result_value",
            "reference_range",
            "finding_notes",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "report_id",
            "patient_name",
            "patient_details",
            "created_at",
            "updated_at",
        ]

    def get_patient_name(self, obj):
        patient = obj.patient

        first_name = getattr(patient, "first_name", "") or ""
        last_name = getattr(patient, "last_name", "") or ""

        name = f"{first_name} {last_name}".strip()

        return name or "Patient"

    def get_patient_details(self, obj):
        patient = obj.patient

        patient_id = getattr(patient, "patient_id", None)

        if patient_id:
            return str(patient_id)

        return str(patient.id)


class LabTestSerializer(serializers.ModelSerializer):

    class Meta:
        model = LabTest
        fields = "__all__"