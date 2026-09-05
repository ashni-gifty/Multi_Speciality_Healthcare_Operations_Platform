from rest_framework import serializers

from .models import Bill


class BillSerializer(serializers.ModelSerializer):

    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()

    class Meta:
        model = Bill
        fields = [
            "id",
            "bill_number",
            "patient",
            "patient_name",
            "appointment",
            "doctor_name",
            "bill_type",
            "registration_fee",
            "consultation_fee",
            "pharmacy_fee",
            "lab_fee",
            "subtotal",
            "total_amount",
            "payment_method",
            "payment_status",
            "paid_at",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "bill_number",
            "patient_name",
            "doctor_name",
            "registration_fee",
            "consultation_fee",
            "pharmacy_fee",
            "lab_fee",
            "subtotal",
            "total_amount",
            "payment_status",
            "paid_at",
            "created_at",
            "updated_at",
        ]

    def get_patient_name(self, obj):
        return (
            f"{obj.patient.first_name} "
            f"{obj.patient.last_name}"
        )

    def get_doctor_name(self, obj):
        if not obj.appointment:
            return None

        doctor = obj.appointment.doctor

        return (
            f"Dr. {doctor.first_name} "
            f"{doctor.last_name}"
        )
    