from datetime import date

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

    booked_by_name = serializers.SerializerMethodField()

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
            "token_status",
            "token_number",
            "reason",
            "booked_by",
            "booked_by_name",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "patient_name",
            "doctor_name",
            "doctor_staff_id",
            "status",
            "token_status",
            "token_number",
            "booked_by",
            "booked_by_name",
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

    def get_booked_by_name(self, obj):
        if not obj.booked_by:
            return None

        return (
            f"{obj.booked_by.first_name} "
            f"{obj.booked_by.last_name}"
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

        patient = attrs.get(
            "patient",
            getattr(self.instance, "patient", None),
        )

        doctor = attrs.get(
            "doctor",
            getattr(self.instance, "doctor", None),
        )

        appointment_date = attrs.get(
            "appointment_date",
            getattr(self.instance, "appointment_date", None),
        )

        appointment_time = attrs.get(
            "appointment_time",
            getattr(self.instance, "appointment_time", None),
        )

        if not patient or not doctor or not appointment_date or not appointment_time:
            return attrs

        today = date.today()

        # -----------------------------------
        # Past dates are not allowed
        # -----------------------------------

        if appointment_date < today:
            raise serializers.ValidationError({
                "appointment_date":
                    "Past appointment dates are not allowed."
            })

        # -----------------------------------
        # New vs Existing Patient
        # -----------------------------------

        if appointment_date > today:

            if not patient.appointments.exists():
                raise serializers.ValidationError({
                    "appointment_date":
                        "A newly registered patient can book "
                        "only today's appointment. Future appointments "
                        "are allowed only for existing patients."
                })

        # -----------------------------------
        # Doctor slot uniqueness
        # -----------------------------------

        existing = Appointment.objects.filter(
            doctor=doctor,
            appointment_date=appointment_date,
            appointment_time=appointment_time,
            status__in=[
                Appointment.Status.BOOKED,
                Appointment.Status.CHECKED_IN,
                Appointment.Status.IN_CONSULTATION,
            ],
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