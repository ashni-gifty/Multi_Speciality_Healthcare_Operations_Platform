from django.contrib import admin
from .models import Medicine, MedicineStock, PharmacyBill, PharmacyBillItem


@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = (
        "medicine_id",
        "name",
        "generic_name",
        "manufacturer",
        "supplier",
        "dosage_form",
        "is_active",
    )
    list_filter = ("dosage_form", "is_active")
    search_fields = (
        "medicine_id",
        "name",
        "generic_name",
        "manufacturer",
        "supplier",
    )


@admin.register(MedicineStock)
class MedicineStockAdmin(admin.ModelAdmin):
    list_display = (
        "medicine",
        "batch_number",
        "manufacturing_date",
        "expiry_date",
        "price_per_unit",
        "units",
        "stock_status",
    )
    list_filter = ("expiry_date",)
    search_fields = (
        "medicine__name",
        "batch_number",
    )


@admin.register(PharmacyBill)
class PharmacyBillAdmin(admin.ModelAdmin):
    list_display = (
        "bill_number",
        "patient",
        "subtotal",
        "gst",
        "total_amount",
        "payment_method",
        "paid",
        "created_at",
    )
    list_filter = ("payment_method", "paid", "created_at")
    search_fields = (
        "bill_number",
        "patient__first_name",
        "patient__last_name",
    )


@admin.register(PharmacyBillItem)
class PharmacyBillItemAdmin(admin.ModelAdmin):
    list_display = (
        "bill",
        "medicine",
        "quantity",
        "price_per_unit",
        "amount",
    )
    search_fields = (
        "medicine__name",
        "bill__bill_number",
    )