from django.urls import path

from .views import (
    AdminDashboardView,
    DepartmentListView,
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
        DepartmentListView.as_view(),
        name="department-list"
    ),
    path(
        "staff/<str:staff_id>/",
        StaffDetailView.as_view(),
        name="staff-detail"
    ),
]