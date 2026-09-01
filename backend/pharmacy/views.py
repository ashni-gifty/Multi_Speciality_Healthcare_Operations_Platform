from django.db.models import Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import CustomUser
from .models import Medicine
from .serializers import MedicineSerializer


class IsAdminOrPharmacist(APIView):
    """
    Permission check for Admin and Pharmacist roles.
    """
    def check_permissions(self, request):
        super().check_permissions(request)
        if not (request.user.is_authenticated and request.user.role in [CustomUser.Role.ADMIN, CustomUser.Role.PHARMACIST]):
            self.permission_denied(request, message="Only Admin and Pharmacist can access medicine inventory.")


class MedicineListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        medicines = Medicine.objects.all()

        search = request.query_params.get("search", "").strip()
        if search:
            medicines = medicines.filter(
                Q(name__icontains=search) |
                Q(generic_name__icontains=search) |
                Q(batch_number__icontains=search) |
                Q(medicine_id__icontains=search)
            )

        category = request.query_params.get("category", "").strip()
        if category and category != "ALL":
            medicines = medicines.filter(category__iexact=category)

        stock_status = request.query_params.get("stock_status", "").strip()
        if stock_status == "LOW_STOCK":
            medicines = [m for m in medicines if m.stock_status == "LOW_STOCK"]
            serializer = MedicineSerializer(medicines, many=True)
            return Response(serializer.data)

        serializer = MedicineSerializer(medicines, many=True)
        return Response(serializer.data)

    def post(self, request):
        if request.user.role not in [CustomUser.Role.ADMIN, CustomUser.Role.PHARMACIST]:
            return Response(
                {"detail": "Only Admin and Pharmacist can add medicines."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = MedicineSerializer(data=request.data)
        if serializer.is_valid():
            medicine = serializer.save()
            return Response(
                MedicineSerializer(medicine).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class MedicineDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Medicine.objects.get(pk=pk)
        except Medicine.DoesNotExist:
            return None

    def get(self, request, pk):
        medicine = self.get_object(pk)
        if not medicine:
            return Response(
                {"detail": "Medicine not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = MedicineSerializer(medicine)
        return Response(serializer.data)

    def put(self, request, pk):
        if request.user.role not in [CustomUser.Role.ADMIN, CustomUser.Role.PHARMACIST]:
            return Response(
                {"detail": "Only Admin and Pharmacist can modify medicines."},
                status=status.HTTP_403_FORBIDDEN
            )

        medicine = self.get_object(pk)
        if not medicine:
            return Response(
                {"detail": "Medicine not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = MedicineSerializer(medicine, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        if request.user.role not in [CustomUser.Role.ADMIN, CustomUser.Role.PHARMACIST]:
            return Response(
                {"detail": "Only Admin and Pharmacist can modify medicines."},
                status=status.HTTP_403_FORBIDDEN
            )

        medicine = self.get_object(pk)
        if not medicine:
            return Response(
                {"detail": "Medicine not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = MedicineSerializer(medicine, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        if request.user.role != CustomUser.Role.ADMIN:
            return Response(
                {"detail": "Only Admin can delete medicines from inventory."},
                status=status.HTTP_403_FORBIDDEN
            )

        medicine = self.get_object(pk)
        if not medicine:
            return Response(
                {"detail": "Medicine not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        medicine.delete()
        return Response(
            {"message": "Medicine deleted successfully from inventory."},
            status=status.HTTP_200_OK
        )
