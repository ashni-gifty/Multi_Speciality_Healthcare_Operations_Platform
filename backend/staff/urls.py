from django.urls import path

from .views import (
    AdminDashboardView,
    DepartmentDetailView,
    DepartmentListCreateView,
    StaffDetailView,
    StaffListCreateView,
    DoctorAvailabilityListCreateView,
    DoctorListView,
)


urlpatterns = [
    # Dashboard
    path("admin/dashboard/", AdminDashboardView.as_view(), name="admin-dashboard"),
    path("admin/", AdminDashboardView.as_view(), name="admin-dashboard-alt"),
    path("staff/admin/dashboard/", AdminDashboardView.as_view(), name="staff-admin-dashboard"),

    # Doctors (Must be before staff/<str:staff_id>/)
    path("doctors/", DoctorListView.as_view(), name="doctor-list"),
    path("staff/doctors/", DoctorListView.as_view(), name="staff-doctor-list"),

    # Availability (Must be before staff/<str:staff_id>/)
    path("doctor-availability/", DoctorAvailabilityListCreateView.as_view(), name="doctor-availability"),
    path("staff/doctor-availability/", DoctorAvailabilityListCreateView.as_view(), name="staff-doctor-availability"),

    # Departments (Must be before staff/<str:staff_id>/)
    path("departments/", DepartmentListCreateView.as_view(), name="department-list"),
    path("departments/<str:department_id>/", DepartmentDetailView.as_view(), name="department-detail"),
    path("staff/departments/", DepartmentListCreateView.as_view(), name="staff-department-list"),
    path("staff/departments/<str:department_id>/", DepartmentDetailView.as_view(), name="staff-department-detail"),

    # Staff List
    path("staff/", StaffListCreateView.as_view(), name="staff-list-create"),
    path("staff/staff/", StaffListCreateView.as_view(), name="staff-staff-list-create"),

    # Parameterized Staff Detail (Must be last)
    path("staff/staff/<str:staff_id>/", StaffDetailView.as_view(), name="staff-staff-detail"),
    path("staff/<str:staff_id>/", StaffDetailView.as_view(), name="staff-detail"),
]