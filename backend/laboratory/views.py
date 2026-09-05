from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from accounts.permissions import (
    IsAdminOrLabTechnicianRole,
    IsLabTechnicianRole,
)

from .models import LabTest, LabReport
from .serializers import LabTestSerializer, LabReportSerializer


class LabTestListCreateView(generics.ListCreateAPIView):
    queryset = LabTest.objects.filter(
        is_active=True
    ).order_by("test_code")

    serializer_class = LabTestSerializer
    permission_classes = [IsAdminOrLabTechnicianRole]


class LabReportListCreateView(generics.ListCreateAPIView):
    queryset = LabReport.objects.all().order_by("-created_at")
    serializer_class = LabReportSerializer
    permission_classes = [IsAdminOrLabTechnicianRole]

    def perform_create(self, serializer):
        user = self.request.user

        technician = None

        if (
            user.is_authenticated
            and hasattr(user, "staff_profile")
            and user.role == "LAB_TECHNICIAN"
        ):
            technician = user.staff_profile

        serializer.save(technician=technician)


class LabReportDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LabReport.objects.all()
    serializer_class = LabReportSerializer
    permission_classes = [IsAdminOrLabTechnicianRole]