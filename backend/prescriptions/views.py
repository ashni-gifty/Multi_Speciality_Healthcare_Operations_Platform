from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from accounts.models import CustomUser
from .models import Prescription
from .serializers import PrescriptionSerializer


class PrescriptionListCreateView(generics.ListCreateAPIView):

    queryset = Prescription.objects.select_related(
        "patient",
        "doctor",
        "consultation",
        "consultation__doctor",
    ).order_by("-created_at")

    serializer_class = PrescriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()

        if self.request.user.role == CustomUser.Role.DOCTOR:
            queryset = queryset.filter(
                doctor=self.request.user
            )

        return queryset

    def create(self, request, *args, **kwargs):

        if request.user.role != CustomUser.Role.DOCTOR:
            return Response(
                {"detail": "Only doctors can create prescriptions."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().create(request, *args, **kwargs)


class PrescriptionDetailView(generics.RetrieveUpdateDestroyAPIView):

    queryset = Prescription.objects.select_related(
        "patient",
        "doctor",
        "consultation",
        "consultation__doctor",
    )

    serializer_class = PrescriptionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()

        if self.request.user.role == CustomUser.Role.DOCTOR:
            queryset = queryset.filter(
                doctor=self.request.user
            )

        return queryset

    def update(self, request, *args, **kwargs):

        if request.user.role != CustomUser.Role.DOCTOR:
            return Response(
                {"detail": "Only doctors can update prescriptions."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):

        if request.user.role != CustomUser.Role.DOCTOR:
            return Response(
                {"detail": "Only doctors can delete prescriptions."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return super().destroy(request, *args, **kwargs)
    