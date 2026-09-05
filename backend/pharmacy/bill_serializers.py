from rest_framework import serializers

from .models import PharmacyBill


class PharmacyBillSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField()
    doctor_name = serializers.SerializerMethodField()
    patient_registration_date = serializers.SerializerMethodField()
    hospital_name = serializers.SerializerMethodField()

    class Meta:
        model = PharmacyBill
        fields = [
            "id", "serial_number", "patient", "patient_name", "doctor_name",
            "patient_registration_date", "hospital_name", "prescription", "medicines",
            "payment_mode", "grand_total", "gst", "amount_payable", "paid_status", "issued_date",
        ]
        read_only_fields = [
            "id", "serial_number", "patient_name", "doctor_name", "patient_registration_date",
            "hospital_name", "grand_total", "gst", "amount_payable", "issued_date",
        ]

    def get_patient_name(self, obj):
        return f"{obj.patient.first_name} {obj.patient.last_name}"

    def get_doctor_name(self, obj):
        return obj.prescription.doctor_name if obj.prescription else "-"

    def get_patient_registration_date(self, obj):
        return obj.patient.registered_at.strftime("%Y-%m-%d")

    def get_hospital_name(self, obj):
        return "Multi-Speciality Healthcare Hospital"