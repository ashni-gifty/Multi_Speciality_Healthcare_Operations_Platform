from django.db.models import Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Patient
from .permissions import IsReceptionistOrReadOnly
from .serializers import PatientSerializer


class PatientListCreateView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsReceptionistOrReadOnly,
    ]

    def get(self, request):
        include_inactive = request.query_params.get("include_inactive") == "true"
        patients = Patient.objects.all() if include_inactive else Patient.objects.filter(is_active=True)
        
        patients = patients.select_related(
            "created_by",
            "created_by__staff_profile",
        ).order_by("-registered_at")

        search = request.query_params.get("search")
        patient_id = request.query_params.get("patient_id")
        phone = request.query_params.get("phone")
        name = request.query_params.get("name")

        if search:
            patients = patients.filter(
                Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(patient_id__icontains=search)
                | Q(phone__icontains=search)
                | Q(email__icontains=search)
            )
        else:
            if patient_id:
                patients = patients.filter(patient_id__iexact=patient_id)
            if phone:
                patients = patients.filter(phone__icontains=phone)
            if name:
                patients = patients.filter(
                    Q(first_name__icontains=name) | Q(last_name__icontains=name)
                )

        serializer = PatientSerializer(
            patients,
            many=True,
            context={"request": request},
        )

        return Response(serializer.data)

    def post(self, request):

        serializer = PatientSerializer(
            data=request.data,
            context={"request": request},
        )

        if serializer.is_valid():

            patient = serializer.save()

            return Response(
                PatientSerializer(
                    patient,
                    context={"request": request},
                ).data,
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class PatientDetailView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsReceptionistOrReadOnly,
    ]

    def get_patient(self, patient_id):

        try:
            return Patient.objects.select_related(
                "created_by",
                "created_by__staff_profile",
            ).get(
                patient_id=patient_id
            )

        except Patient.DoesNotExist:
            return None

    def get(self, request, patient_id):

        patient = self.get_patient(patient_id)

        if patient is None:
            return Response(
                {
                    "detail":
                    "Patient not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = PatientSerializer(
            patient,
            context={"request": request},
        )

        return Response(serializer.data)

    def put(self, request, patient_id):

        patient = self.get_patient(patient_id)

        if patient is None:
            return Response(
                {
                    "detail":
                    "Patient not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = PatientSerializer(
            patient,
            data=request.data,
            context={"request": request},
        )

        if serializer.is_valid():

            patient = serializer.save()

            return Response(
                PatientSerializer(
                    patient,
                    context={"request": request},
                ).data
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    def patch(self, request, patient_id):

        patient = self.get_patient(patient_id)

        if patient is None:
            return Response(
                {
                    "detail":
                    "Patient not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = PatientSerializer(
            patient,
            data=request.data,
            partial=True,
            context={"request": request},
        )

        if serializer.is_valid():

            patient = serializer.save()

            return Response(
                PatientSerializer(
                    patient,
                    context={"request": request},
                ).data
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    def delete(self, request, patient_id):

        patient = self.get_patient(patient_id)

        if patient is None:
            return Response(
                {
                    "detail":
                    "Patient not found."
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Soft delete / deactivate.
        patient.is_active = False

        patient.save(
            update_fields=[
                "is_active",
                "updated_at",
            ]
        )

        return Response(
            {
                "message":
                "Patient deactivated successfully."
            },
            status=status.HTTP_200_OK,
        )
