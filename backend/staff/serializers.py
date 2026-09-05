from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import serializers

from accounts.models import CustomUser
from .models import (Department,StaffProfile,DoctorAvailability,)

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = [
            "id",
            "department_id",
            "name",
            "description",
            "status",
        ]


class StaffProfileSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    role = serializers.CharField(source="user.role", read_only=True)
    department_name = serializers.CharField(source="department.name", read_only=True)

    class Meta:
        model = StaffProfile
        fields = [
            "id",
            "staff_id",
            "user",
            "username",
            "email",
            "role",
            "first_name",
            "last_name",
            "date_of_birth",
            "gender",
            "blood_group",
            "address",
            "phone",
            "department",
            "department_name",
            "degree",
            "work_experience",
            "joining_date",
            "consultation_fee",
            "status",
        ]

class DoctorAvailabilitySerializer(serializers.ModelSerializer):

    doctor_name = serializers.SerializerMethodField()
    doctor_staff_id = serializers.CharField(
        source="doctor.staff_id",
        read_only=True
    )

    class Meta:
        model = DoctorAvailability

        fields = [
            "id",
            "doctor",
            "doctor_staff_id",
            "doctor_name",
            "day_of_week",
            "available_from",
            "available_to",
            "slot_duration",
        ]

    def get_doctor_name(self, obj):
        return (
            f"Dr. {obj.doctor.first_name} "
            f"{obj.doctor.last_name}"
        )

    def validate_doctor(self, value):

        if value.user.role != CustomUser.Role.DOCTOR:
            raise serializers.ValidationError(
                "Availability can only be assigned to doctors."
            )

        if value.status != StaffProfile.Status.ACTIVE:
            raise serializers.ValidationError(
                "Selected doctor is inactive."
            )

        return value

    def validate(self, attrs):

        available_from = attrs.get("available_from")
        available_to = attrs.get("available_to")

        if available_from and available_to:
            if available_from >= available_to:
                raise serializers.ValidationError({
                    "available_to":
                    "Available-to time must be later than available-from time."
                })

        return attrs

class StaffCreateSerializer(serializers.Serializer):

    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(
        write_only=True,
        min_length=6
    )

    role = serializers.ChoiceField(
        choices=[
            (CustomUser.Role.DOCTOR, "Doctor"),
            (CustomUser.Role.RECEPTIONIST, "Receptionist"),
            (CustomUser.Role.LAB_TECHNICIAN, "Lab Technician"),
            (CustomUser.Role.PHARMACIST, "Pharmacist"),
        ]
    )

    staff_id = serializers.CharField(max_length=20)

    first_name = serializers.CharField(max_length=40)
    last_name = serializers.CharField(max_length=40)

    date_of_birth = serializers.DateField()

    gender = serializers.ChoiceField(
        choices=StaffProfile.Gender.choices
    )

    blood_group = serializers.ChoiceField(
        choices=StaffProfile.BloodGroup.choices
    )

    address = serializers.CharField(max_length=255)

    phone = serializers.CharField(max_length=10)

    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.filter(status=True)
    )

    degree = serializers.CharField(max_length=150)

    work_experience = serializers.IntegerField(
        min_value=0
    )

    joining_date = serializers.DateField()

    consultation_fee = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        allow_null=True
    )

    def validate_username(self, value):
        if CustomUser.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "Username already exists."
            )

        return value

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Email already exists."
            )

        return value

    def validate_staff_id(self, value):
        if StaffProfile.objects.filter(staff_id=value).exists():
            raise serializers.ValidationError(
                "Staff ID already exists."
            )

        return value

    def validate_phone(self, value):
        if StaffProfile.objects.filter(phone=value).exists():
            raise serializers.ValidationError(
                "Phone number already exists."
            )

        return value

    def validate(self, attrs):

        role = attrs["role"]
        consultation_fee = attrs.get("consultation_fee")

        if role == CustomUser.Role.DOCTOR:

            if consultation_fee is None:
                raise serializers.ValidationError({
                    "consultation_fee":
                    "Consultation fee is required for doctors."
                })

        else:

            if consultation_fee is not None:
                raise serializers.ValidationError({
                    "consultation_fee":
                    "Consultation fee is allowed only for doctors."
                })

        return attrs

    @transaction.atomic
    def create(self, validated_data):

        username = validated_data.pop("username")
        email = validated_data.pop("email")
        password = validated_data.pop("password")
        role = validated_data.pop("role")

        user = CustomUser.objects.create_user(
            username=username,
            email=email,
            password=password,
            role=role,
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )

        staff_profile = StaffProfile(
            user=user,
            **validated_data
        )

        try:
            staff_profile.full_clean()

        except DjangoValidationError as exc:
            raise serializers.ValidationError(
                exc.message_dict
            )

        staff_profile.save()

        return staff_profile
