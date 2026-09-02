from rest_framework import serializers
from .models import Medicine


class MedicineSerializer(serializers.ModelSerializer):
    stock_status = serializers.ReadOnlyField()

    class Meta:
        model = Medicine
        fields = [
            "id",
            "medicine_id",
            "name",
            "generic_name",
            "category",
            "dosage_form",
            "batch_number",
            "manufacturer",
            "quantity",
            "reorder_level",
            "unit_price",
            "cost_price",
            "expiry_date",
            "status",
            "stock_status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "medicine_id", "created_at", "updated_at"]
