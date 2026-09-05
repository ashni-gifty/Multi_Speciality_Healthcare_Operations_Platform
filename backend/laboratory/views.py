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

    serializer_class = LabReportSerializer
    permission_classes = [IsAuthenticated]

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
