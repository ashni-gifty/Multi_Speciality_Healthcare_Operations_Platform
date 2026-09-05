from django.urls import path

from .views import (
    LabTestListCreateView,
    LabReportListCreateView,
    LabReportDetailView,
)


urlpatterns = [
    path(
        "tests/",
        LabTestListCreateView.as_view(),
        name="lab-test-list-create",
    ),

    path(
        "reports/",
        LabReportListCreateView.as_view(),
        name="lab-report-list-create",
    ),

    path(
        "reports/<int:pk>/",
        LabReportDetailView.as_view(),
        name="lab-report-detail",
    ),
]