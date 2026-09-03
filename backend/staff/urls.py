from django.urls import path

from .views import (
    AdminDashboardView,
    DepartmentDetailView,
    DepartmentListCreateView,
    StaffDetailView,
    StaffListCreateView,
)


urlpatterns = [
    path(
        "admin/dashboard/",
        AdminDashboardView.as_view(),
        name="admin-dashboard"
    ),
    path(
        "admin/",
        AdminDashboardView.as_view(),
        name="admin-dashboard-alt"
    ),
    path(
        "staff/",
        StaffListCreateView.as_view(),
        name="staff-list-create"
    ),

    path(
        "departments/",
        DepartmentListCreateView.as_view(),
        name="department-list"
    ),
    path(
        "departments/<str:department_id>/",
        DepartmentDetailView.as_view(),
        name="department-detail"
    ),
    path(
        "staff/<str:staff_id>/",
        StaffDetailView.as_view(),
        name="staff-detail"
    ),
]
