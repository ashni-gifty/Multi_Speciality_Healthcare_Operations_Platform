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

    patient_name = serializers.SerializerMethodField()
    patient_details = serializers.SerializerMethodField()

    test_name = serializers.CharField(
        source="test.test_name",
        read_only=True
    )

    sample_type = serializers.CharField(
        source="test.sample_type",
        read_only=True
    )

    technician_name = serializers.SerializerMethodField()

    date = serializers.SerializerMethodField()

    class Meta:
        model = LabReport

        fields = [
            "id",
            "report_id",

            "patient_id",
            "patient_name",
            "patient_details",

            "test",
            "test_name",
            "sample_type",

            "ordered_by_doctor",
            "technician",
            "technician_name",

            "status",
            "result_value",
            "reference_range",
            "finding_notes",

            "date",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "report_id",
            "patient_name",
            "patient_details",
            "test_name",
            "sample_type",
            "technician_name",
            "date",
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
        return (
            f"{obj.patient.patient_id} • "
            f"{obj.patient.age}y / {obj.patient.gender}"
        )

    def get_technician_name(self, obj):
        if obj.technician:
            return (
                f"{obj.technician.first_name} "
                f"{obj.technician.last_name}"
            )
        return None

    def get_date(self, obj):
        return obj.created_at.strftime(
            "%b %d, %Y - %I:%M %p"
        )

    def create(self, validated_data):
        patient_id_val = validated_data.pop("patient_id")

        try:
            patient = Patient.objects.get(
                patient_id=patient_id_val
            )
        except Patient.DoesNotExist:
            raise serializers.ValidationError({
                "patient_id": "Patient not found."
            })

        return LabReport.objects.create(
            patient=patient,
            **validated_data
        )


    def update(self, instance, validated_data):
        patient_id_val = validated_data.pop("patient_id", None)

        if patient_id_val:
            try:
                patient = Patient.objects.get(
                    patient_id=patient_id_val
                )
            except Patient.DoesNotExist:
                raise serializers.ValidationError({
                    "patient_id": "Patient not found."
                })

            instance.patient = patient

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()

        return instance
    
