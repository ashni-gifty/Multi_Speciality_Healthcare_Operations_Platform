<<<<<<< HEAD
from decimal import Decimal
from datetime import date
=======
import re
from datetime import date
from decimal import Decimal
>>>>>>> origin/feature/pharmacist

from django.db import transaction
from django.db.models import Q
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import CustomUser
<<<<<<< HEAD
from prescriptions.models import Prescription
=======
from patients.models import Patient
from prescriptions.models import Prescription
from .bill_serializers import PharmacyBillSerializer
from .models import Medicine, PharmacyBill
from .serializers import MedicineSerializer
>>>>>>> origin/feature/pharmacist

from .models import (
    Medicine,
    MedicineStock,
    PharmacyBill,
    PharmacyBillItem,
)

from .serializers import (
    MedicineSerializer,
    MedicineStockSerializer,
    PharmacyBillSerializer,
)


class MedicineListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        medicines = (
            Medicine.objects
            .filter(is_active=True)
            .prefetch_related("stocks")
        )

        search = request.query_params.get("search")

        if search:
            medicines = medicines.filter(
                Q(name__icontains=search)
                | Q(generic_name__icontains=search)
                | Q(medicine_id__icontains=search)
                | Q(manufacturer__icontains=search)
                | Q(supplier__icontains=search)
            )

        category = request.query_params.get("category")

        if category:
            medicines = medicines.filter(
                category=category
            )

        serializer = MedicineSerializer(
            medicines,
            many=True
        )

        data = serializer.data

        stock_status = request.query_params.get(
            "stock_status"
        )

        if stock_status:
            data = [
                medicine
                for medicine in data
                if medicine["stock_status"] == stock_status
            ]

        return Response(data)

    def post(self, request):

        if request.user.role not in [
            CustomUser.Role.ADMIN,
            CustomUser.Role.PHARMACIST,
        ]:
            return Response(
                {"detail": "Only admin or pharmacist can create medicines."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = MedicineSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        medicine = serializer.save()

        return Response(
            MedicineSerializer(medicine).data,
            status=status.HTTP_201_CREATED
        )


class MedicineDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get_object(self, pk):

        return (
            Medicine.objects
            .prefetch_related("stocks")
            .get(pk=pk)
        )

    def get(self, request, pk):

        try:
            medicine = self.get_object(pk)
        except Medicine.DoesNotExist:
            return Response(
                {"detail": "Medicine not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(
            MedicineSerializer(medicine).data
        )

    def put(self, request, pk):

        return self.update(request, pk)

    def patch(self, request, pk):

        return self.update(request, pk, partial=True)

    def update(self, request, pk, partial=False):

        if request.user.role not in [
            CustomUser.Role.ADMIN,
            CustomUser.Role.PHARMACIST,
        ]:
            return Response(
                {"detail": "Only admin or pharmacist can update medicines."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            medicine = self.get_object(pk)
        except Medicine.DoesNotExist:
            return Response(
                {"detail": "Medicine not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = MedicineSerializer(
            medicine,
            data=request.data,
            partial=partial
        )

        serializer.is_valid(raise_exception=True)

        medicine = serializer.save()

        return Response(
            MedicineSerializer(medicine).data
        )

    def delete(self, request, pk):

        if request.user.role != CustomUser.Role.ADMIN:
            return Response(
                {"detail": "Only admin can discontinue medicines."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            medicine = Medicine.objects.get(pk=pk)
        except Medicine.DoesNotExist:
            return Response(
                {"detail": "Medicine not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        medicine.is_active = False
        medicine.save(update_fields=["is_active"])

        return Response(
            {"detail": "Medicine discontinued successfully."}
        )


<<<<<<< HEAD
class MedicineStockListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        stocks = MedicineStock.objects.select_related(
            "medicine"
        )

        medicine_id = request.query_params.get(
            "medicine_id"
        )

        if medicine_id:
            stocks = stocks.filter(
                medicine__medicine_id=medicine_id
            )

        serializer = MedicineStockSerializer(
            stocks,
            many=True
        )

        data = serializer.data

        stock_status = request.query_params.get(
            "stock_status"
        )

        if stock_status:
            data = [
                stock
                for stock in data
                if stock["stock_status"] == stock_status
            ]

        return Response(data)

    def post(self, request):

        if request.user.role not in [
            CustomUser.Role.ADMIN,
            CustomUser.Role.PHARMACIST,
        ]:
            return Response(
                {"detail": "Only admin or pharmacist can add stock."},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = MedicineStockSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        stock = serializer.save()

        return Response(
            MedicineStockSerializer(stock).data,
            status=status.HTTP_201_CREATED
        )


class DispensePrescriptionView(APIView):

    permission_classes = [IsAuthenticated]

    GST_RATE = Decimal("0.05")

    @transaction.atomic
    def post(self, request, prescription_id):

        if request.user.role != CustomUser.Role.PHARMACIST:
            return Response(
                {"detail": "Only pharmacist can dispense medicines."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            prescription = (
                Prescription.objects
                .prefetch_related("prescription_medicines__medicine")
                .get(pk=prescription_id)
            )
        except Prescription.DoesNotExist:
            return Response(
                {"detail": "Prescription not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if PharmacyBill.objects.filter(
            prescription_id=prescription.id
        ).exists():
            return Response(
                {"detail": "This prescription has already been dispensed."},
                status=status.HTTP_400_BAD_REQUEST
            )

        prescribed_items = prescription.prescription_medicines.all()

        if not prescribed_items.exists():
            return Response(
                {"detail": "No medicines found in this prescription."},
                status=status.HTTP_400_BAD_REQUEST
            )

        bill = PharmacyBill.objects.create(
            prescription_id=prescription.id,
            patient=prescription.patient,
        )

        subtotal = Decimal("0.00")

        today = date.today()

        try:

            for prescribed in prescribed_items:

                required_quantity = prescribed.quantity

                if required_quantity <= 0:
                    raise ValueError(
                        f"Invalid quantity for {prescribed.medicine.name}."
                    )

                stocks = list(
                    MedicineStock.objects
                    .select_for_update()
                    .filter(
                        medicine=prescribed.medicine,
                        expiry_date__gte=today,
                        units__gt=0,
                    )
                    .order_by("expiry_date", "id")
                )

                available = sum(
                    stock.units
                    for stock in stocks
                )

                if available < required_quantity:
                    raise ValueError(
                        f"Insufficient stock for {prescribed.medicine.name}. "
                        f"Available: {available}, Required: {required_quantity}."
                    )

                remaining = required_quantity

                for stock in stocks:

                    if remaining <= 0:
                        break

                    take = min(
                        stock.units,
                        remaining
                    )

                    amount = (
                        stock.price_per_unit
                        * Decimal(take)
                    )

                    PharmacyBillItem.objects.create(
                        bill=bill,
                        medicine=prescribed.medicine,
                        stock=stock,
                        quantity=take,
                        price_per_unit=stock.price_per_unit,
                        amount=amount,
                    )

                    stock.units -= take
                    stock.save(update_fields=["units", "updated_at"])

                    subtotal += amount
                    remaining -= take

        except ValueError as exc:

            transaction.set_rollback(True)

            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST
            )

        gst = subtotal * self.GST_RATE
        total = subtotal + gst

        bill.subtotal = subtotal
        bill.gst = gst
        bill.total_amount = total
        bill.payment_method = request.data.get(
            "payment_method",
            PharmacyBill.PaymentMethod.CASH
        )

        bill.save()

        return Response(
            PharmacyBillSerializer(bill).data,
            status=status.HTTP_201_CREATED
        )


class PharmacyBillListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        bills = (
            PharmacyBill.objects
            .select_related("patient")
            .prefetch_related("items__medicine", "items__stock")
            .order_by("-created_at")
        )

        patient_id = request.query_params.get("patient_id")

        if patient_id:
            bills = bills.filter(
                patient_id=patient_id
            )

        paid = request.query_params.get("paid")

        if paid in ["true", "false"]:
            bills = bills.filter(
                paid=(paid == "true")
            )

        return Response(
            PharmacyBillSerializer(
                bills,
                many=True
            ).data
        )


class PharmacyBillDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):

        try:
            bill = (
                PharmacyBill.objects
                .select_related("patient")
                .prefetch_related(
                    "items__medicine",
                    "items__stock"
                )
                .get(pk=pk)
            )
        except PharmacyBill.DoesNotExist:
            return Response(
                {"detail": "Pharmacy bill not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(
            PharmacyBillSerializer(bill).data
        )


class PayPharmacyBillView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        if request.user.role != CustomUser.Role.PHARMACIST:
            return Response(
                {"detail": "Only pharmacist can process pharmacy payment."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            bill = PharmacyBill.objects.get(pk=pk)
        except PharmacyBill.DoesNotExist:
            return Response(
                {"detail": "Pharmacy bill not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if bill.paid:
            return Response(
                {"detail": "This pharmacy bill is already paid."},
                status=status.HTTP_400_BAD_REQUEST
            )

        payment_method = request.data.get(
            "payment_method"
        )

        if payment_method not in [
            PharmacyBill.PaymentMethod.CASH,
            PharmacyBill.PaymentMethod.GPAY,
        ]:
            return Response(
                {"detail": "Payment method must be CASH or GPAY."},
                status=status.HTTP_400_BAD_REQUEST
            )

        bill.payment_method = payment_method
        bill.paid = True
        bill.save(
            update_fields=[
                "payment_method",
                "paid",
            ]
        )

        return Response(
            PharmacyBillSerializer(bill).data
        )


class PharmacySalesReportView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        from django.db.models import Sum

        period = request.query_params.get(
            "period",
            "daily"
        )

        from django.utils import timezone

        today = timezone.localdate()

        if period == "daily":
            start_date = today

        elif period == "weekly":
            start_date = today - __import__("datetime").timedelta(
                days=6
            )

        elif period == "monthly":
            start_date = today.replace(day=1)

        else:
            return Response(
                {
                    "detail": (
                        "Period must be daily, weekly, or monthly."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        bills = PharmacyBill.objects.filter(
            paid=True,
            created_at__date__gte=start_date,
            created_at__date__lte=today,
        )

        total_sales = bills.aggregate(
            total=Sum("total_amount")
        )["total"] or Decimal("0.00")

        total_bills = bills.count()

        return Response(
            {
                "period": period,
                "start_date": start_date,
                "end_date": today,
                "total_bills": total_bills,
                "total_sales": total_sales,
            }
        )
=======
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
>>>>>>> origin/feature/pharmacist
