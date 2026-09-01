from rest_framework import generics, permissions
from .models import Patient
from .serializers import PatientSerializer


class PatientListCreateView(generics.ListCreateAPIView):
    queryset = Patient.objects.filter(is_active=True).order_by("patient_id")
    serializer_class = PatientSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = self.request.user if self.request.user.is_authenticated else None
        if not user:
            from django.contrib.auth import get_user_model
            user = get_user_model().objects.filter(is_staff=True).first()
        serializer.save(created_by=user)


class PatientDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "patient_id"
