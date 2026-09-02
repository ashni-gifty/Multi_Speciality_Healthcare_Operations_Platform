from django.urls import path

from .views import (
<<<<<<< HEAD
    AdminDashboardView,
    DepartmentListView,
=======
>>>>>>> 542af1449569d94938888abbe2cb0526e80c41ba
    StaffDetailView,
    StaffListCreateView,
)


urlpatterns = [
    path(
<<<<<<< HEAD
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
=======
>>>>>>> 542af1449569d94938888abbe2cb0526e80c41ba
        "staff/",
        StaffListCreateView.as_view(),
        name="staff-list-create"
    ),

    path(
<<<<<<< HEAD
        "departments/",
        DepartmentListView.as_view(),
        name="department-list"
    ),
    path(
=======
>>>>>>> 542af1449569d94938888abbe2cb0526e80c41ba
        "staff/<str:staff_id>/",
        StaffDetailView.as_view(),
        name="staff-detail"
    ),
]