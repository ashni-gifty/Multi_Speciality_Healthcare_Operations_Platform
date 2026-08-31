from django.urls import path

from .views import (
    StaffDetailView,
    StaffListCreateView,
)


urlpatterns = [
    path(
        "staff/",
        StaffListCreateView.as_view(),
        name="staff-list-create"
    ),

    path(
        "staff/<str:staff_id>/",
        StaffDetailView.as_view(),
        name="staff-detail"
    ),
]