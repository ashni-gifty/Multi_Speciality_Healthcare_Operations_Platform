from rest_framework import serializers
from .models import Patient


class PatientSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    age = serializers.ReadOnlyField()

    class Meta:
        model = Patient
        fields = [
            "id",
            "patient_id",
            "first_name",
            "last_name",
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
