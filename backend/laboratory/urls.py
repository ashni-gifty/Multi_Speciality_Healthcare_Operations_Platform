from django.urls import path
from .views import (
    LabTestListCreateView,
    LabReportListCreateView,
    LabReportDetailView,
)

urlpatterns = [
    path("laboratory/tests/", LabTestListCreateView.as_view(), name="lab-test-list-create"),
    path("laboratory/reports/", LabReportListCreateView.as_view(), name="lab-report-list-create"),
    path("laboratory/reports/<int:pk>/", LabReportDetailView.as_view(), name="lab-report-detail"),
]
