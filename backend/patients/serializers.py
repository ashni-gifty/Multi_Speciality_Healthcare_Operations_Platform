<<<<<<< HEAD
from django.core.exceptions import ValidationError as DjangoValidationError

from rest_framework import serializers

=======
from rest_framework import serializers
>>>>>>> origin/develop
from .models import Patient


class PatientSerializer(serializers.ModelSerializer):
<<<<<<< HEAD

    age = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Patient

=======
    full_name = serializers.SerializerMethodField()
    age = serializers.ReadOnlyField()

    class Meta:
        model = Patient
>>>>>>> origin/develop
        fields = [
            "id",
            "patient_id",
            "first_name",
            "last_name",
<<<<<<< HEAD
            "date_of_birth",
            "age",
            "gender",
            "blood_group",
            "address",
            "phone",
            "email",
            "created_by",
            "created_by_name",
            "registered_at",
            "updated_at",
            "is_active",
        ]

        read_only_fields = [
            "id",
            "patient_id",
            "age",
            "created_by",
            "created_by_name",
            "registered_at",
            "updated_at",
        ]

    def get_age(self, obj):
        return obj.age

    def get_created_by_name(self, obj):
        if hasattr(obj.created_by, "staff_profile"):
            profile = obj.created_by.staff_profile

            return f"{profile.first_name} {profile.last_name}"

        return obj.created_by.username

    def create(self, validated_data):

        request = self.context["request"]

        patient = Patient(
            created_by=request.user,
            **validated_data
        )

        try:
            patient.full_clean()
        except DjangoValidationError as exc:
            raise serializers.ValidationError(
                exc.message_dict
            )

        patient.save()

        return patient

    def update(self, instance, validated_data):

        for field, value in validated_data.items():
            setattr(instance, field, value)

        try:
            instance.full_clean()
        except DjangoValidationError as exc:
            raise serializers.ValidationError(
                exc.message_dict
            )

        instance.save()

        return instance
=======
            "full_name",
            "age",
            "date_of_birth",
            "gender",
            "blood_group",
            "phone",
            "email",
            "address",
            "registered_at",
            "is_active",
        ]
        read_only_fields = ["id", "patient_id", "registered_at", "age"]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
>>>>>>> origin/develop
