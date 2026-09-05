from rest_framework import serializers

from .models import Consultation


class ConsultationSerializer(serializers.ModelSerializer):

    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()

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
            value.Status.CHECKED_IN,
            value.Status.IN_CONSULTATION,
            value.Status.COMPLETED,
        ]:
            raise serializers.ValidationError(
                "Consultation can be created only for an active consultation appointment."
            )

        if hasattr(value, "consultation"):
            raise serializers.ValidationError(
                "A consultation already exists for this appointment."
            )

        return value

    def create(self, validated_data):
        appointment = validated_data["appointment"]

        validated_data["patient"] = appointment.patient
        validated_data["doctor"] = appointment.doctor

        appointment.status = appointment.Status.IN_CONSULTATION
        appointment.save(update_fields=["status", "updated_at"])

        return Consultation.objects.create(**validated_data)