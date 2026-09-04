from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import LabReport, LabTest
from .serializers import LabReportSerializer, LabTestSerializer


class LabReportViewSet(viewsets.ModelViewSet):
    queryset = (
        LabReport.objects
        .select_related("patient")
        .all()
        .order_by("-created_at")
    )

    serializer_class = LabReportSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(
            status=LabReport.Status.PENDING_SAMPLE
        )


class LabTestViewSet(viewsets.ModelViewSet):
    queryset = LabTest.objects.all().order_by("test_name")

    serializer_class = LabTestSerializer
    permission_classes = [IsAuthenticated]