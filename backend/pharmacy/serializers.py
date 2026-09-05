from rest_framework import serializers

from .models import (
    Medicine,
    MedicineStock,
    PharmacyBill,
    PharmacyBillItem,
)


class MedicineStockSerializer(serializers.ModelSerializer):

    stock_status = serializers.ReadOnlyField()
    medicine_name = serializers.CharField(
        source="medicine.name",
        read_only=True
    )
    medicine_id = serializers.CharField(
        source="medicine.medicine_id",
        read_only=True
    )

    class Meta:
        model = MedicineStock

        fields = [
            "id",
            "medicine",
            "medicine_id",
            "medicine_name",
            "batch_number",
            "manufacturing_date",
            "expiry_date",
            "price_per_unit",
            "units",
            "reorder_level",
            "stock_status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "medicine_id",
            "medicine_name",
            "stock_status",
            "created_at",
            "updated_at",
        ]

    def validate(self, data):

        manufacturing_date = data.get("manufacturing_date")
        expiry_date = data.get("expiry_date")

        if (
            manufacturing_date
            and expiry_date
            and expiry_date <= manufacturing_date
        ):
            raise serializers.ValidationError(
                "Expiry date must be after manufacturing date."
            )

        return data


class MedicineSerializer(serializers.ModelSerializer):

    stock_status = serializers.SerializerMethodField()
    stocks = MedicineStockSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Medicine

        fields = [
            "id",
            "medicine_id",
            "name",
            "generic_name",
            "manufacturer",
            "supplier",
            "category",
            "dosage_form",
            "is_active",
            "stock_status",
            "stocks",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "medicine_id",
            "stock_status",
            "stocks",
            "created_at",
            "updated_at",
        ]

    def get_stock_status(self, obj):

        stocks = list(obj.stocks.all())

        if not stocks:
            return "OUT_OF_STOCK"

        today = __import__("datetime").date.today()

        active_stocks = [
            stock
            for stock in stocks
            if stock.expiry_date >= today
        ]

        if not active_stocks:
            return "EXPIRED"

        total_units = sum(
            stock.units
            for stock in active_stocks
        )

        if total_units == 0:
            return "OUT_OF_STOCK"

        if any(
            stock.units <= stock.reorder_level
            for stock in active_stocks
            if stock.units > 0
        ):
            return "LOW_STOCK"

        return "IN_STOCK"


class PharmacyBillItemSerializer(serializers.ModelSerializer):

    medicine_name = serializers.CharField(
        source="medicine.name",
        read_only=True
    )

    batch_number = serializers.CharField(
        source="stock.batch_number",
        read_only=True
    )

    class Meta:
        model = PharmacyBillItem

        fields = [
            "id",
            "medicine",
            "medicine_name",
            "stock",
            "batch_number",
            "quantity",
            "price_per_unit",
            "amount",
        ]

        read_only_fields = [
            "id",
            "medicine_name",
            "batch_number",
            "price_per_unit",
            "amount",
        ]


class PharmacyBillSerializer(serializers.ModelSerializer):

    patient_name = serializers.CharField(
        source="patient.full_name",
        read_only=True
    )

    items = PharmacyBillItemSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = PharmacyBill

        fields = [
            "id",
            "bill_number",
            "prescription_id",
            "patient",
            "patient_name",
            "items",
            "subtotal",
            "gst",
            "total_amount",
            "payment_method",
            "paid",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "bill_number",
            "subtotal",
            "gst",
            "total_amount",
            "paid",
            "items",
            "created_at",
        ]