import re
from datetime import date
from decimal import Decimal

from django.db import transaction
from django.db.models import Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import CustomUser
from patients.models import Patient
from prescriptions.models import Prescription
from .bill_serializers import PharmacyBillSerializer
from .models import Medicine, PharmacyBill
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
        medicines = Medicine.objects.filter(status=Medicine.Status.ACTIVE)

        search = request.query_params.get("search", "").strip()
        if search:
            medicines = medicines.filter(
                Q(name__icontains=search) |
                Q(generic_name__icontains=search) |
                Q(batch_number__icontains=search) |
                Q(medicine_id__icontains=search) |
                Q(manufacturer__icontains=search) |
                Q(supplier__icontains=search)
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

        medicine.status = Medicine.Status.DISCONTINUED
        medicine.save(update_fields=["status", "updated_at"])
        return Response(
            {"message": "Medicine deactivated successfully. Historical records are preserved."},
            status=status.HTTP_200_OK
        )


class DispenseMedicineView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != CustomUser.Role.PHARMACIST:
            return Response(
                {"detail": "Only pharmacists can dispense medicine."},
                status=status.HTTP_403_FORBIDDEN,
            )

        prescription_id = request.data.get("prescription_id")
        if not prescription_id:
            return Response({"detail": "prescription_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            prescription = Prescription.objects.get(pk=prescription_id)
        except Prescription.DoesNotExist:
            return Response({"detail": "Prescription not found."}, status=status.HTTP_404_NOT_FOUND)

        requested_medicines = request.data.get("medicines") or prescription.medicines
        if isinstance(requested_medicines, list):
            medicine_lines = requested_medicines
        else:
            medicine_lines = re.split(r"\n|,(?=\s*[A-Za-z])", str(requested_medicines))

        dispensed = []
        with transaction.atomic():
            for medicine_line in medicine_lines:
                if isinstance(medicine_line, dict):
                    medicine_name = medicine_line.get("name") or medicine_line.get("medicine_name")
                    quantity = int(medicine_line.get("quantity") or 1)
                else:
                    line = str(medicine_line).strip()
                    quantity_match = re.search(r"(?:x|qty|quantity)\s*[:=-]?\s*(\d+)|^(\d+)\s*x?\s+", line, re.IGNORECASE)
                    quantity = int(quantity_match.group(1) or quantity_match.group(2)) if quantity_match else 1
                    medicine_name = re.sub(r"(?:x|qty|quantity)\s*[:=-]?\s*\d+", "", line, flags=re.IGNORECASE)
                    medicine_name = re.sub(r"^\d+\s*x?\s+", "", medicine_name, flags=re.IGNORECASE)
                    medicine_name = re.split(r"[-,(]", medicine_name, maxsplit=1)[0].strip()
                    medicine_name = re.sub(r"\s+\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml|l|%)\b", "", medicine_name, flags=re.IGNORECASE).strip()

                if not medicine_name or quantity < 1:
                    return Response({"detail": "Each prescribed medicine must have a valid name and quantity."}, status=status.HTTP_400_BAD_REQUEST)

                medicine = Medicine.objects.select_for_update().filter(status=Medicine.Status.ACTIVE).filter(
                    Q(name__icontains=medicine_name) | Q(generic_name__icontains=medicine_name)
                ).first()
                if not medicine:
                    return Response({"detail": f"Medicine not found in inventory: {medicine_name}."}, status=status.HTTP_400_BAD_REQUEST)
                if medicine.expiry_date < date.today():
                    return Response({"detail": f"Medicine has expired: {medicine.name}."}, status=status.HTTP_400_BAD_REQUEST)
                if medicine.quantity < quantity:
                    return Response({"detail": f"Insufficient stock for {medicine.name}. Available: {medicine.quantity}."}, status=status.HTTP_400_BAD_REQUEST)

                medicine.quantity -= quantity
                medicine.save(update_fields=["quantity", "updated_at"])
                dispensed.append({
                    "medicine_id": medicine.medicine_id,
                    "medicine_name": medicine.name,
                    "quantity": quantity,
                    "price_per_unit": str(medicine.unit_price),
                    "total": str(medicine.unit_price * quantity),
                })

        return Response({"prescription_id": prescription.id, "medicines": dispensed}, status=status.HTTP_200_OK)


class PharmacyBillListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        bills = PharmacyBill.objects.select_related("patient", "prescription")
        return Response(PharmacyBillSerializer(bills, many=True).data)

    def post(self, request):
        if request.user.role != CustomUser.Role.PHARMACIST:
            return Response({"detail": "Only pharmacists can create pharmacy bills."}, status=status.HTTP_403_FORBIDDEN)

        try:
            patient = Patient.objects.get(patient_id=request.data.get("patient_id"))
        except Patient.DoesNotExist:
            return Response({"detail": "Patient not found."}, status=status.HTTP_400_BAD_REQUEST)

        prescription = None
        prescription_id = request.data.get("prescription_id")
        if prescription_id:
            try:
                prescription = Prescription.objects.get(pk=prescription_id)
            except Prescription.DoesNotExist:
                return Response({"detail": "Prescription not found."}, status=status.HTTP_400_BAD_REQUEST)

        medicines = request.data.get("medicines") or []
        if isinstance(medicines, str):
            medicines = [{"medicine_name": medicines, "quantity": 1, "price_per_unit": "0.00", "total": "0.00"}]
        total = sum(Decimal(str(item.get("total", 0))) for item in medicines if isinstance(item, dict))
        gst = (total * Decimal("0.05")).quantize(Decimal("0.01"))
        bill = PharmacyBill.objects.create(
            patient=patient,
            prescription=prescription,
            medicines=medicines,
            payment_mode=request.data.get("payment_mode", "Cash"),
            grand_total=total,
            gst=gst,
            amount_payable=total + gst,
            created_by=request.user,
        )
        return Response(PharmacyBillSerializer(bill).data, status=status.HTTP_201_CREATED)


class PharmacyBillDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return PharmacyBill.objects.select_related("patient", "prescription").get(pk=pk)
        except PharmacyBill.DoesNotExist:
            return None

    def get(self, request, pk):
        bill = self.get_object(pk)
        if not bill:
            return Response({"detail": "Bill not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(PharmacyBillSerializer(bill).data)

    def patch(self, request, pk):
        bill = self.get_object(pk)
        if not bill:
            return Response({"detail": "Bill not found."}, status=status.HTTP_404_NOT_FOUND)
        if "paid_status" in request.data:
            bill.paid_status = bool(request.data["paid_status"])
            bill.save(update_fields=["paid_status"])
        return Response(PharmacyBillSerializer(bill).data)
