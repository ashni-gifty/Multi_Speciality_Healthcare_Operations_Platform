from django.contrib import admin

from .models import Patient


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):

    list_display = (
        "patient_id",
        "first_name",
        "last_name",
        "date_of_birth",
        "gender",
        "blood_group",
        "phone",
        "created_by",
        "registered_at",
        "is_active",
    )

    list_filter = (
        "gender",
        "blood_group",
        "is_active",
    )

    search_fields = (
        "patient_id",
        "first_name",
        "last_name",
        "phone",
    )

    readonly_fields = (
        "patient_id",
        "registered_at",
        "updated_at",
    )