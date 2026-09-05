from django.contrib import admin
from .models import Bill, BillingSettings


@admin.register(Bill)
class BillAdmin(admin.ModelAdmin):

    list_display = (
        "bill_number",
        "patient",
        "appointment",
        "bill_type",
        "registration_fee",
        "consultation_fee",
        "pharmacy_fee",
        "lab_fee",
        "total_amount",
        "payment_status",
        "payment_method",
        "created_at",
    )

    list_filter = (
        "bill_type",
        "payment_status",
        "payment_method",
    )

    search_fields = (
        "bill_number",
        "patient__patient_id",
        "patient__first_name",
        "patient__last_name",
    )

    readonly_fields = (
        "bill_number",
        "subtotal",
        "total_amount",
        "created_at",
        "updated_at",
    )


@admin.register(BillingSettings)
class BillingSettingsAdmin(admin.ModelAdmin):

    list_display = (
        "registration_fee",
        "updated_at",
    )