from datetime import date

from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import CustomUser
from appointments.models import Appointment

from .models import Bill, BillingSettings
from .serializers import BillSerializer


class CreateAppointmentBillView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, appointment_id):

        # --------------------------------
        # Only Receptionist or Admin can create bill
        # --------------------------------
        role = str(getattr(request.user, "role", "")).upper()
        if role not in [CustomUser.Role.RECEPTIONIST, CustomUser.Role.ADMIN] and not request.user.is_superuser:
            return Response(
                {
                    "detail": "Only receptionist or admin can create appointment bills."
                },
                status=status.HTTP_403_FORBIDDEN
            )

        # --------------------------------
        # Get appointment
        # --------------------------------

        try:
            appointment = Appointment.objects.select_related(
                "patient",
                "doctor",
            ).get(id=appointment_id)

        except Appointment.DoesNotExist:
            return Response(
                {
                    "detail": "Appointment not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # --------------------------------
        # Prevent duplicate bill
        # --------------------------------

        existing_bill = Bill.objects.filter(
            appointment=appointment,
            bill_type=Bill.BillType.OPD,
        ).first()

        if existing_bill:
            return Response(
                {
                    "detail": "Bill already exists for this appointment.",
                    "bill": BillSerializer(
                        existing_bill,
                        context={"request": request}
                    ).data
                },
                status=status.HTTP_200_OK
            )

        # --------------------------------
        # Registration fee
        # --------------------------------

        patient = appointment.patient
        today = date.today()

        registration_fee = 0

        if patient.registered_at.date() == today:
            settings = BillingSettings.objects.first()

            if settings:
                registration_fee = settings.registration_fee

        # --------------------------------
        # Doctor consultation fee
        # --------------------------------

        consultation_fee = (
            appointment.doctor.consultation_fee or 0
        )

        # --------------------------------
        # Create bill
        # --------------------------------

        bill = Bill.objects.create(
            patient=patient,
            appointment=appointment,
            bill_type=Bill.BillType.OPD,
            registration_fee=registration_fee,
            consultation_fee=consultation_fee,
            pharmacy_fee=0,
            lab_fee=0,
            payment_method=Bill.PaymentMethod.CASH,
            payment_status=Bill.PaymentStatus.PENDING,
        )

        serializer = BillSerializer(
            bill,
            context={"request": request}
        )

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED
        )


class BillListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        bills = Bill.objects.select_related(
            "patient",
            "appointment",
            "appointment__doctor",
        ).all()

        patient_id = request.query_params.get("patient_id")
        payment_status = request.query_params.get("payment_status")

        if patient_id:
            bills = bills.filter(
                patient__patient_id=patient_id
            )

        if payment_status:
            bills = bills.filter(
                payment_status=payment_status
            )

        serializer = BillSerializer(
            bills,
            many=True,
            context={"request": request}
        )

        return Response(serializer.data)

class PayBillView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, bill_id):
        # Only receptionist or admin can collect payment
        role = str(getattr(request.user, "role", "")).upper()
        if role not in [CustomUser.Role.RECEPTIONIST, CustomUser.Role.ADMIN] and not request.user.is_superuser:
            return Response(
                {"detail": "Only receptionist or admin can process payments."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            bill = Bill.objects.get(id=bill_id)
        except Bill.DoesNotExist:
            return Response(
                {"detail": "Bill not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Prevent duplicate payment
        if bill.payment_status == Bill.PaymentStatus.PAID:
            return Response(
                {"detail": "This bill is already paid."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        payment_method = request.data.get("payment_method")

        if payment_method not in [
            Bill.PaymentMethod.CASH,
            Bill.PaymentMethod.GPAY,
        ]:
            return Response(
                {"detail": "Payment method must be CASH or GPAY."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        bill.payment_method = payment_method
        bill.payment_status = Bill.PaymentStatus.PAID
        bill.paid_at = timezone.now()
        bill.save()

        return Response(
            BillSerializer(
                bill,
                context={"request": request}
            ).data,
            status=status.HTTP_200_OK,
        )  