from decimal import Decimal
from datetime import date
from django.db import transaction
from django.db.models import Q, Sum
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import CustomUser
from prescriptions.models import Prescription
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
            medicines = medicines.filter(category=category)

        serializer = MedicineSerializer(medicines, many=True)
        data = serializer.data

        stock_status = request.query_params.get("stock_status")
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

        serializer = MedicineSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        medicine = serializer.save()

        return Response(
            MedicineSerializer(medicine).data,
            status=status.HTTP_201_CREATED
        )


class MedicineDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            medicine = (
                Medicine.objects
                .prefetch_related("stocks")
                .get(pk=pk)
            )
        except Medicine.DoesNotExist:
            return Response(
                {"detail": "Medicine not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(MedicineSerializer(medicine).data)

    def put(self, request, pk):
        if request.user.role not in [
            CustomUser.Role.ADMIN,
            CustomUser.Role.PHARMACIST,
        ]:
            return Response(
                {"detail": "Only admin or pharmacist can update medicines."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            medicine = Medicine.objects.get(pk=pk)
        except Medicine.DoesNotExist:
            return Response(
                {"detail": "Medicine not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = MedicineSerializer(
            medicine,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        medicine = serializer.save()

        return Response(MedicineSerializer(medicine).data)

    def delete(self, request, pk):
        if request.user.role not in [
            CustomUser.Role.ADMIN,
            CustomUser.Role.PHARMACIST,
        ]:
            return Response(
                {"detail": "Only admin or pharmacist can delete medicines."},
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


class MedicineStockListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        stocks = MedicineStock.objects.select_related("medicine")

        medicine_id = request.query_params.get("medicine_id")
        if medicine_id:
            stocks = stocks.filter(
                Q(medicine__id=medicine_id) | Q(medicine__medicine_id=medicine_id)
            )

        serializer = MedicineStockSerializer(stocks, many=True)
        data = serializer.data

        stock_status = request.query_params.get("stock_status")
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

        serializer = MedicineStockSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        stock = serializer.save()

        return Response(
            MedicineStockSerializer(stock).data,
            status=status.HTTP_201_CREATED
        )


class MedicineStockDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            stock = MedicineStock.objects.select_related("medicine").get(pk=pk)
        except MedicineStock.DoesNotExist:
            return Response(
                {"detail": "Stock batch not found."},
                status=status.HTTP_404_NOT_FOUND
            )
        return Response(MedicineStockSerializer(stock).data)

    def put(self, request, pk):
        if request.user.role not in [
            CustomUser.Role.ADMIN,
            CustomUser.Role.PHARMACIST,
        ]:
            return Response(
                {"detail": "Only admin or pharmacist can update stock."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            stock = MedicineStock.objects.get(pk=pk)
        except MedicineStock.DoesNotExist:
            return Response(
                {"detail": "Stock batch not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = MedicineStockSerializer(
            stock,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        stock = serializer.save()

        return Response(MedicineStockSerializer(stock).data)

    def delete(self, request, pk):
        if request.user.role not in [
            CustomUser.Role.ADMIN,
            CustomUser.Role.PHARMACIST,
        ]:
            return Response(
                {"detail": "Only admin or pharmacist can delete stock."},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            stock = MedicineStock.objects.get(pk=pk)
        except MedicineStock.DoesNotExist:
            return Response(
                {"detail": "Stock batch not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        stock.delete()
        return Response({"detail": "Stock batch deleted successfully."}, status=status.HTTP_204_NO_CONTENT)



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

        if PharmacyBill.objects.filter(prescription_id=prescription.id).exists():
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
                    raise ValueError(f"Invalid quantity for {prescribed.medicine.name}.")

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

                available = sum(stock.units for stock in stocks)
                if available < required_quantity:
                    raise ValueError(
                        f"Insufficient stock for {prescribed.medicine.name}. Available: {available}, Required: {required_quantity}."
                    )

                remaining = required_quantity
                for stock in stocks:
                    if remaining <= 0:
                        break

                    take = min(stock.units, remaining)
                    amount = stock.price_per_unit * Decimal(take)

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
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        gst = (subtotal * self.GST_RATE).quantize(Decimal("0.01"))
        total = subtotal + gst

        bill.subtotal = subtotal
        bill.gst = gst
        bill.total_amount = total
        bill.payment_method = request.data.get("payment_method", PharmacyBill.PaymentMethod.CASH)
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
                Q(patient__id=patient_id) | Q(patient__patient_id=patient_id)
            )

        paid = request.query_params.get("paid")
        if paid in ["true", "false"]:
            bills = bills.filter(paid=(paid == "true"))

        return Response(PharmacyBillSerializer(bills, many=True).data)


class PharmacyBillDetailView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            bill = (
                PharmacyBill.objects
                .select_related("patient")
                .prefetch_related("items__medicine", "items__stock")
                .get(pk=pk)
            )
        except PharmacyBill.DoesNotExist:
            return Response(
                {"detail": "Pharmacy bill not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response(PharmacyBillSerializer(bill).data)


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

        payment_method = request.data.get("payment_method", "CASH")
        bill.payment_method = payment_method
        bill.paid = True
        bill.save(update_fields=["payment_method", "paid"])

        return Response(PharmacyBillSerializer(bill).data)


class PharmacySalesReportView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.utils import timezone
        import datetime

        period = request.query_params.get("period", "daily")
        today = timezone.localdate()

        if period == "daily":
            start_date = today
        elif period == "weekly":
            start_date = today - datetime.timedelta(days=6)
        elif period == "monthly":
            start_date = today.replace(day=1)
        else:
            return Response(
                {"detail": "Period must be daily, weekly, or monthly."},
                status=status.HTTP_400_BAD_REQUEST
            )

        bills = PharmacyBill.objects.filter(
            paid=True,
            created_at__date__gte=start_date,
            created_at__date__lte=today,
        )

        total_sales = bills.aggregate(total=Sum("total_amount"))["total"] or Decimal("0.00")
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
