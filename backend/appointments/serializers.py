from rest_framework import serializers

from staff.models import StaffProfile

from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):

    patient_name = serializers.SerializerMethodField()

    doctor_name = serializers.SerializerMethodField()

    doctor_staff_id = serializers.CharField(
        source="doctor.staff_id",
        read_only=True,
    )

    class Meta:
        model = Appointment

        fields = [
            "id",
            "patient",
            "patient_name",
            "doctor",
            "doctor_staff_id",
            "doctor_name",
            "appointment_date",
            "appointment_time",
            "status",
            "reason",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "patient_name",
            "doctor_name",
            "doctor_staff_id",
            "status",
            "created_at",
            "updated_at",
        ]

    def get_patient_name(self, obj):
        return (
            f"{obj.patient.first_name} "
            f"{obj.patient.last_name}"
        )

    def get_doctor_name(self, obj):
        return (
            f"Dr. {obj.doctor.first_name} "
            f"{obj.doctor.last_name}"
        )

    def validate_patient(self, value):

        if not value.is_active:
            raise serializers.ValidationError(
                "Selected patient is inactive."
            )

        return value

    def validate_doctor(self, value):

        if value.user.role != "DOCTOR":
            raise serializers.ValidationError(
                "Selected staff member is not a doctor."
            )

        if value.status != StaffProfile.Status.ACTIVE:
            raise serializers.ValidationError(
                "Selected doctor is inactive."
            )

        return value

    def validate(self, attrs):

        doctor = attrs.get(
            "doctor",
            getattr(
                self.instance,
                "doctor",
                None,
            ),
        )

        appointment_date = attrs.get(
            "appointment_date",
            getattr(
                self.instance,
                "appointment_date",
                None,
            ),
        )

        appointment_time = attrs.get(
            "appointment_time",
            getattr(
                self.instance,
                "appointment_time",
                None,
            ),
        )

        if doctor and appointment_date and appointment_time:

            existing = Appointment.objects.filter(
                doctor=doctor,
                appointment_date=appointment_date,
                appointment_time=appointment_time,
                status=Appointment.Status.SCHEDULED,
            )

            if self.instance:
                existing = existing.exclude(
                    pk=self.instance.pk
                )

            if existing.exists():
                raise serializers.ValidationError({
                    "appointment_time":
                        "This doctor already has an appointment "
                        "at the selected time."
                })

        return attrs