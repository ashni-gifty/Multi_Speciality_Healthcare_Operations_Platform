from rest_framework import generics, permissions
from .models import LabTest, LabReport
from .serializers import LabTestSerializer, LabReportSerializer


class LabTestListCreateView(generics.ListCreateAPIView):
    queryset = LabTest.objects.filter(is_active=True).order_by("test_code")
    serializer_class = LabTestSerializer
    permission_classes = [permissions.AllowAny]


class LabReportListCreateView(generics.ListCreateAPIView):
    queryset = LabReport.objects.all().order_by("-created_at")
    serializer_class = LabReportSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        tech_name = (
            f"{user.first_name} {user.last_name}"
            if user and user.first_name
            else "Mark Vance"
        )
        serializer.save(technician_name=tech_name)


class LabReportDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = LabReport.objects.all()
    serializer_class = LabReportSerializer
    permission_classes = [permissions.AllowAny]
