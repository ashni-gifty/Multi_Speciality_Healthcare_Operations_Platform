from django.contrib import admin
from .models import Prescription


@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = (
        "rx_id",
        "patient",
        "doctor_name",
        "diagnosis",
        "created_at",
    )

    list_filter = ("created_at",)

    search_fields = (
        "rx_id",
        "patient__first_name",
        "patient__last_name",
        "doctor_name",
        "diagnosis",
    )

    readonly_fields = ("rx_id", "created_at")