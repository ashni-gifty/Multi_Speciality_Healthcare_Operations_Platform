from django.contrib import admin

from .forms import AppointmentAdminForm
from .models import Appointment


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):

    form = AppointmentAdminForm

    list_display = (
        "id",
        "patient",
        "doctor",
        "appointment_date",
        "display_time",
        "status",
        "reason",
    )

    list_filter = (
        "status",
        "appointment_date",
    )

    search_fields = (
        "patient__patient_id",
        "patient__first_name",
        "patient__last_name",
        "doctor__staff_id",
        "doctor__first_name",
        "doctor__last_name",
    )

    ordering = (
        "appointment_date",
        "appointment_time",
    )

    def display_time(self, obj):
        if obj.appointment_time:
            return obj.appointment_time.strftime("%I:%M %p")

        return "-"

    display_time.short_description = "Appointment Time"