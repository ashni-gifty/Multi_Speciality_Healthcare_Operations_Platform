from django.urls import path

from .views import (
    PatientDetailView,
    PatientListCreateView,
)


urlpatterns = [
    path(
        "patients/",
        PatientListCreateView.as_view(),
        name="patient-list-create",
    ),

    path(
        "patients/<str:patient_id>/",
        PatientDetailView.as_view(),
        name="patient-detail",
    ),
]
