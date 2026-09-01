from rest_framework import generics, permissions
from .models import Prescription
from .serializers import PrescriptionSerializer


class PrescriptionListCreateView(generics.ListCreateAPIView):
    queryset = Prescription.objects.all().order_by("-created_at")
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        doc_name = (
            f"Dr. {user.first_name} {user.last_name}"
            if user and user.first_name
            else "Dr. Robert Smith"
        )
        serializer.save(doctor=user, doctor_name=doc_name)


class PrescriptionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.AllowAny]
