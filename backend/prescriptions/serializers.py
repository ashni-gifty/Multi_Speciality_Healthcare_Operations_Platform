from rest_framework import serializers

from .models import (
    Prescription,
    PrescriptionMedicine,
    ExternalMedicine,
    PrescriptionLabTest,
    ExternalLabTest,
)


class PrescriptionMedicineSerializer(serializers.ModelSerializer):
    medicine_name = serializers.CharField(
        source="medicine.name",
        read_only=True
    )

    class Meta:
        model = PrescriptionMedicine
        fields = [
            "id",
            "medicine",
            "medicine_name",
            "dosage",
            "frequency",
            "duration",
            "quantity",
        ]
        read_only_fields = ["id", "medicine_name"]


class ExternalMedicineSerializer(serializers.ModelSerializer):

    class Meta:
        model = ExternalMedicine
        fields = [
            "id",
            "medicine_name",
            "instructions",
        ]
        read_only_fields = ["id"]


class PrescriptionLabTestSerializer(serializers.ModelSerializer):
    test_name = serializers.CharField(
        source="test.test_name",
        read_only=True
    )

    class Meta:
        model = PrescriptionLabTest
        fields = [
            "id",
            "test",
            "test_name",
            "notes",
        ]
        read_only_fields = ["id", "test_name"]


class ExternalLabTestSerializer(serializers.ModelSerializer):

    class Meta:
        model = ExternalLabTest
        fields = [
            "id",
            "test_name",
            "instructions",
        ]
        read_only_fields = ["id"]


class PrescriptionSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name_display = serializers.SerializerMethodField()

    medicines = PrescriptionMedicineSerializer(
        source="prescription_medicines",
        many=True,
        required=False
    )

    external_medicines = ExternalMedicineSerializer(
        many=True,
        required=False
    )

    lab_tests = PrescriptionLabTestSerializer(
        source="prescription_lab_tests",
        many=True,
        required=False
    )

    external_lab_tests = ExternalLabTestSerializer(
        many=True,
        required=False
    )

    class Meta:
        model = Prescription
        fields = [
            "id",
            "rx_id",
            "consultation",
            "patient",
            "patient_name",
            "doctor",
            "doctor_name",
            "doctor_name_display",
            "diagnosis",
            "blood_pressure",
            "pulse",
            "temperature",
            "notes",
            "medicines",
            "external_medicines",
            "lab_tests",
            "external_lab_tests",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "rx_id",
            "patient",
            "doctor",
            "doctor_name",
            "patient_name",
            "doctor_name_display",
            "diagnosis",
            "created_at",
        ]

    def get_patient_name(self, obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}"

    def get_doctor_name_display(self, obj):
        if obj.doctor:
            return f"Dr.{obj.doctor.first_name} {obj.doctor.last_name}"

        return obj.doctor_name

    def validate_consultation(self, value):
        if hasattr(value, "prescription"):
            raise serializers.ValidationError(
                "A prescription already exists for this consultation."
            )

        return value

    def create(self, validated_data):
        medicines_data = validated_data.pop(
            "prescription_medicines", []
        )

        external_medicines_data = validated_data.pop(
            "external_medicines", []
        )

        lab_tests_data = validated_data.pop(
            "prescription_lab_tests", []
        )

        external_lab_tests_data = validated_data.pop(
            "external_lab_tests", []
        )

        consultation = validated_data["consultation"]

        validated_data["patient"] = consultation.patient
        validated_data["doctor"] = consultation.doctor.user

        validated_data["doctor_name"] = (
            f"Dr. {consultation.doctor.first_name} "
            f"{consultation.doctor.last_name}"
        )

        validated_data["diagnosis"] = (
            validated_data.get("diagnosis")
            or consultation.diagnosis
        )

        prescription = Prescription.objects.create(
            **validated_data
        )

        for medicine_data in medicines_data:
            PrescriptionMedicine.objects.create(
                prescription=prescription,
                **medicine_data
            )

        for medicine_data in external_medicines_data:
            ExternalMedicine.objects.create(
                prescription=prescription,
                **medicine_data
            )

        for lab_test_data in lab_tests_data:
            PrescriptionLabTest.objects.create(
                prescription=prescription,
                **lab_test_data
            )

        for lab_test_data in external_lab_tests_data:
            ExternalLabTest.objects.create(
                prescription=prescription,
                **lab_test_data
            )

        return prescription