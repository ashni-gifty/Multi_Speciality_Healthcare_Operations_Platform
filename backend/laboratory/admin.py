from django.contrib import admin
from .models import LabTest, LabReport


@admin.register(LabTest)
class LabTestAdmin(admin.ModelAdmin):
    list_display = (
        "test_code",
        "test_name",
        "category",
        "sample_type",
        "price",
        "turnaround_time",
        "is_active",
    )
    list_filter = ("category", "sample_type", "is_active")
    search_fields = ("test_code", "test_name")


@admin.register(LabReport)
class LabReportAdmin(admin.ModelAdmin):
    list_display = (
        "report_id",
        "patient",
        "test",
        "ordered_by_doctor",
        "technician",
        "status",
        "created_at",
    )
    list_filter = ("status", "created_at")
    search_fields = (
        "report_id",
        "patient__first_name",
        "patient__last_name",
        "test__test_name",
    )