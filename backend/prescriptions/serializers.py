from rest_framework import serializers

from consultations.models import Consultation
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

    consultation = serializers.PrimaryKeyRelatedField(
        queryset=Consultation.objects.all(),
        validators=[],
        required=False,
        allow_null=True,
    )

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

        consultation = validated_data.get("consultation")

        if consultation:
            validated_data["patient"] = consultation.patient
            validated_data["doctor"] = consultation.doctor.user if hasattr(consultation.doctor, "user") else None
            validated_data["doctor_name"] = (
                f"Dr. {consultation.doctor.first_name} "
                f"{consultation.doctor.last_name}"
            )
            validated_data["diagnosis"] = (
                validated_data.get("diagnosis")
                or consultation.diagnosis
                or "General Consultation"
            )
        else:
            if "patient" not in validated_data:
                patient_id = self.context["request"].data.get("patient")
                from patients.models import Patient
                validated_data["patient"] = Patient.objects.get(id=patient_id)
            if "doctor" not in validated_data:
                validated_data["doctor"] = self.context["request"].user
            if "doctor_name" not in validated_data:
                user = self.context["request"].user
                validated_data["doctor_name"] = f"Dr. {user.first_name} {user.last_name}"
            if "diagnosis" not in validated_data or not validated_data["diagnosis"]:
                validated_data["diagnosis"] = "General Consultation"

        if consultation:
            existing_prescription = Prescription.objects.filter(consultation=consultation).first()
            if existing_prescription:
                existing_prescription.prescription_medicines.all().delete()
                existing_prescription.external_medicines.all().delete()
                existing_prescription.prescription_lab_tests.all().delete()
                existing_prescription.external_lab_tests.all().delete()
                for key, val in validated_data.items():
                    setattr(existing_prescription, key, val)
                existing_prescription.save()
                prescription = existing_prescription
            else:
                prescription = Prescription.objects.create(**validated_data)
        else:
            prescription = Prescription.objects.create(**validated_data)

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