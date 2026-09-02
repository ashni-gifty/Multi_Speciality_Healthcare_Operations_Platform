from django.contrib import admin

from .models import Department, StaffProfile


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = (
        "department_id",
        "name",
        "status",
        "created_at",
    )

    list_filter = (
        "status",
    )

    search_fields = (
        "department_id",
        "name",
    )


@admin.register(StaffProfile)
class StaffProfileAdmin(admin.ModelAdmin):
    list_display = (
        "staff_id",
        "first_name",
        "last_name",
        "department",
        "phone",
        "joining_date",
        "status",
    )

    list_filter = (
        "department",
        "status",
    )

    search_fields = (
        "staff_id",
        "first_name",
        "last_name",
        "phone",
    )