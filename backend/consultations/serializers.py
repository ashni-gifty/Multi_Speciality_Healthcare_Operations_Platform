from rest_framework import serializers

from appointments.models import Appointment
from .models import Consultation


class ConsultationSerializer(serializers.ModelSerializer):

    appointment = serializers.PrimaryKeyRelatedField(
        queryset=Appointment.objects.all(),
        validators=[],
    )

    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()

    chief_complaint = serializers.CharField(
        required=False,
        allow_blank=True,
    )
    symptoms = serializers.CharField(
        required=False,
        allow_blank=True,
    )
    diagnosis = serializers.CharField(
        required=False,
        allow_blank=True,
    )
    clinical_notes = serializers.CharField(
        required=False,
        allow_blank=True,
    )

    class Meta:
        model = Consultation

        fields = [
            "id",
            "appointment",
            "patient",
            "patient_name",
            "doctor",
            "doctor_name",
            "chief_complaint",
            "symptoms",
            "diagnosis",
            "clinical_notes",
            "follow_up_date",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "patient",
            "doctor",
            "patient_name",
            "doctor_name",
            "created_at",
            "updated_at",
        ]

    def get_patient_name(self, obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}"

    def get_doctor_name(self, obj):
        return f"Dr. {obj.doctor.first_name} {obj.doctor.last_name}"

    def validate_appointment(self, value):
        if value.status not in [
            value.Status.BOOKED,
            value.Status.TOKEN_PENDING,
            value.Status.CHECKED_IN,
            value.Status.IN_CONSULTATION,
            value.Status.COMPLETED,
        ]:
            raise serializers.ValidationError(
                "Consultation can be created only for an active consultation appointment."
            )

        return value

    def create(self, validated_data):
        appointment = validated_data["appointment"]

        validated_data["patient"] = appointment.patient
        validated_data["doctor"] = appointment.doctor

        if not validated_data.get("chief_complaint"):
            validated_data["chief_complaint"] = appointment.reason or "General Consultation"
        if not validated_data.get("diagnosis"):
            validated_data["diagnosis"] = "General Consultation / Routine Review"

        appointment.status = appointment.Status.IN_CONSULTATION
        appointment.save(update_fields=["status", "updated_at"])

        existing = Consultation.objects.filter(appointment=appointment).first()
        if existing:
            for key, val in validated_data.items():
                setattr(existing, key, val)
            existing.save()
            return existing

        return Consultation.objects.create(**validated_data)