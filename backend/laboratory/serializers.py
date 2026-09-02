from rest_framework import serializers
from .models import LabTest, LabReport
from patients.models import Patient


class LabTestSerializer(serializers.ModelSerializer):
    class Meta:
        model = LabTest
        fields = [
            "id",
            "test_code",
            "test_name",
            "category",
            "sample_type",
            "price",
            "normal_range",
            "unit",
            "turnaround_time",
            "is_active",
        ]


class LabReportSerializer(serializers.ModelSerializer):
    patient_id = serializers.CharField(write_only=True)
    patient_name = serializers.SerializerMethodField(read_only=True)
    patient_details = serializers.SerializerMethodField(read_only=True)
    date = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = LabReport
        fields = [
            "id",
            "report_id",
            "patient_id",
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
            "date",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "report_id", "created_at", "updated_at"]

    def get_patient_name(self, obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}"

    def get_patient_details(self, obj):
        return f"{obj.patient.patient_id} • {obj.patient.age}y / {obj.patient.gender}"

    def get_date(self, obj):
        return obj.created_at.strftime("%b %d, %Y - %I:%M %p")

    def create(self, validated_data):
        patient_id_val = validated_data.pop("patient_id")
        try:
            patient = Patient.objects.get(patient_id=patient_id_val)
        except Patient.DoesNotExist:
            patient = Patient.objects.first()
        return LabReport.objects.create(patient=patient, **validated_data)
