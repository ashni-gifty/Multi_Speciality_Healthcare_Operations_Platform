from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import CustomUser
from .models import Consultation
from .serializers import ConsultationSerializer


class ConsultationListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        consultations = Consultation.objects.select_related(
            "patient",
            "doctor",
            "appointment",
        )

        if request.user.role == CustomUser.Role.DOCTOR:
            consultations = consultations.filter(
                doctor=request.user.staff_profile
            )

        patient_id = request.query_params.get("patient_id")

        if patient_id:
            consultations = consultations.filter(
                patient__patient_id=patient_id
            )

        serializer = ConsultationSerializer(
            consultations,
            many=True,
        )

        return Response(serializer.data)

    def post(self, request):

        if request.user.role != CustomUser.Role.DOCTOR:
            return Response(
                {
                    "detail": "Only doctors can create consultations."
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = ConsultationSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        appointment = serializer.validated_data["appointment"]

        # Doctor can only consult their own appointment
        if appointment.doctor != request.user.staff_profile:
            return Response(
                {
                    "detail": (
                        "You can create consultation only "
                        "for your own appointment."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        consultation = serializer.save()

        return Response(
            ConsultationSerializer(consultation).data,
            status=status.HTTP_201_CREATED,
        )


class ConsultationDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get_object(self, request, pk):

        try:
            consultation = Consultation.objects.select_related(
                "patient",
                "doctor",
                "appointment",
            ).get(pk=pk)

        except Consultation.DoesNotExist:
            return None

        if request.user.role == CustomUser.Role.DOCTOR:
            if consultation.doctor != request.user.staff_profile:
                return None

        return consultation

    def get(self, request, pk):

        consultation = self.get_object(request, pk)

        if not consultation:
            return Response(
                {"detail": "Consultation not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ConsultationSerializer(consultation)

        return Response(serializer.data)

    def put(self, request, pk):

        if request.user.role != CustomUser.Role.DOCTOR:
            return Response(
                {"detail": "Only doctors can update consultations."},
                status=status.HTTP_403_FORBIDDEN,
            )

        consultation = self.get_object(request, pk)

        if not consultation:
            return Response(
                {"detail": "Consultation not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = ConsultationSerializer(
            consultation,
            data=request.data,
            partial=True,
        )

        serializer.is_valid(raise_exception=True)
        consultation = serializer.save()

        return Response(
            ConsultationSerializer(consultation).data
        )