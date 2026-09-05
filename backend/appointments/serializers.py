from datetime import date, timedelta
from django.utils import timezone

from rest_framework import serializers

from staff.models import StaffProfile,DoctorAvailability

from .models import Appointment


class AppointmentSerializer(serializers.ModelSerializer):

    patient_name = serializers.SerializerMethodField()
    patient_id = serializers.CharField(
        source="patient.patient_id",
        read_only=True,
    )
    patient_gender = serializers.CharField(
        source="patient.gender",
        read_only=True,
    )
    patient_phone = serializers.CharField(
        source="patient.phone",
        read_only=True,
    )
    patient_age = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()

    doctor_staff_id = serializers.CharField(
        source="doctor.staff_id",
        read_only=True,
    )
    doctor_user_id = serializers.IntegerField(
        source="doctor.user.id",
        read_only=True,
    )
    doctor_username = serializers.CharField(
        source="doctor.user.username",
        read_only=True,
    )

    booked_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Appointment

        fields = [
            "id",
            "patient",
            "patient_id",
            "patient_name",
            "patient_gender",
            "patient_phone",
            "patient_age",
            "doctor",
            "doctor_staff_id",
            "doctor_user_id",
            "doctor_username",
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
            "patient_id",
            "patient_name",
            "patient_gender",
            "patient_phone",
            "patient_age",
            "doctor_name",
            "doctor_staff_id",
            "booked_by",
            "booked_by_name",
            "created_at",
            "updated_at",
        ]

    def get_patient_age(self, obj):
        if not obj.patient or not obj.patient.date_of_birth:
            return None
        today = date.today()
        dob = obj.patient.date_of_birth
        return today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))

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
        # If this is a partial update on an existing instance and no booking schedule fields are being modified, skip slot re-validation
        is_schedule_update = (
            self.instance is None
            or "appointment_date" in attrs
            or "appointment_time" in attrs
            or "doctor" in attrs
            or "patient" in attrs
        )
        if not is_schedule_update:
            return attrs

        appointment_date = attrs.get("appointment_date", getattr(self.instance, "appointment_date", None))
        appointment_time = attrs.get("appointment_time", getattr(self.instance, "appointment_time", None))
        doctor = attrs.get("doctor", getattr(self.instance, "doctor", None))
        patient = attrs.get("patient", getattr(self.instance, "patient", None))

        if not appointment_date or not appointment_time or not doctor or not patient:
            return attrs

        # -----------------------------
        # Patient booking date rules
        # -----------------------------

        if appointment_date < date.today():
            raise serializers.ValidationError({
                "appointment_date":
                    "Past dates are not allowed."
            })

        today = date.today()

        patient_registered_date = patient.registered_at.date()

        # -----------------------------------------
        # New / Offline patient → Today only
        # -----------------------------------------

        if patient_registered_date == today:

            if appointment_date != today:
                raise serializers.ValidationError({
                    "appointment_date":
                        "Newly registered patients can book only today's appointment."
                })

        # -----------------------------------------
        # Existing patient → Today + next 2 days
        # -----------------------------------------

        elif patient_registered_date < today:

            if appointment_date > today + timedelta(days=2):
                raise serializers.ValidationError({
                    "appointment_date":
                        "Existing patients can book appointments only within the next 2 days."
                })

        # -----------------------------
        # Doctor validation
        # -----------------------------

        if doctor.user.role != "DOCTOR":
            raise serializers.ValidationError({
                "doctor": "Selected staff member is not a doctor."
            })

        if doctor.status != "ACTIVE":
            raise serializers.ValidationError({
                "doctor": "Selected doctor is inactive."
            })

        # -----------------------------
        # Doctor availability
        # -----------------------------

        day_name = appointment_date.strftime("%A").upper()

        availability = DoctorAvailability.objects.filter(
            doctor=doctor,
            day_of_week=day_name,
            available_from__lte=appointment_time,
            available_to__gt=appointment_time,
        ).first()

        if not availability:
            raise serializers.ValidationError({
                "appointment_time":
                    "Selected doctor is not available at this time."
            })

        # -----------------------------
        # Today's past-time check
        # -----------------------------

        if appointment_date == today and self.instance is None:
            current_time = timezone.localtime().time()

            if appointment_time <= current_time:
                raise serializers.ValidationError({
                    "appointment_time":
                        "Past time slots cannot be booked."
                })

        # -----------------------------
        # 15-minute slot validation
        # -----------------------------

        minutes_from_start = (
            appointment_time.hour * 60
            + appointment_time.minute
        ) - (
            availability.available_from.hour * 60
            + availability.available_from.minute
        )

        if minutes_from_start % availability.slot_duration != 0:
            raise serializers.ValidationError({
                "appointment_time":
                    f"Appointment time must follow the "
                    f"{availability.slot_duration}-minute slot interval."
            })

       # -----------------------------
        # Duplicate active appointment
        # -----------------------------
        if self.instance is None:
            if Appointment.objects.filter(
                doctor=doctor,
                appointment_date=appointment_date,
                appointment_time=appointment_time,
                status__in=[
                    Appointment.Status.BOOKED,
                    Appointment.Status.TOKEN_PENDING,
                    Appointment.Status.CHECKED_IN,
                    Appointment.Status.IN_CONSULTATION,
                ],
            ).exists():
                raise serializers.ValidationError({
                    "appointment_time":
                        "This appointment slot is already booked."
                })

        return attrs

    def create(self, validated_data):
        appointment_date = validated_data["appointment_date"]
        patient = validated_data["patient"]

        today = date.today()

        # Future appointment for an existing patient
        if (
            appointment_date > today
            and patient.registered_at.date() < today
        ):
            validated_data["status"] = Appointment.Status.TOKEN_PENDING

        return Appointment.objects.create(**validated_data)