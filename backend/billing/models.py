from django.db import models
from patients.models import Patient
from appointments.models import Appointment


class Bill(models.Model):

    class BillType(models.TextChoices):
        OPD = "OPD", "OPD"
        PHARMACY = "PHARMACY", "Pharmacy"
        LABORATORY = "LABORATORY", "Laboratory"

    class PaymentMethod(models.TextChoices):
        CASH = "CASH", "Cash"
        GPAY = "GPAY", "GPay"

    class PaymentStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PAID = "PAID", "Paid"
        CANCELLED = "CANCELLED", "Cancelled"

    bill_number = models.CharField(
        max_length=30,
        unique=True,
        blank=True
    )

    patient = models.ForeignKey(
        Patient,
        on_delete=models.PROTECT,
        related_name="bills"
    )

    appointment = models.ForeignKey(
        Appointment,
        on_delete=models.PROTECT,
        related_name="bills",
        null=True,
        blank=True
    )

    bill_type = models.CharField(
        max_length=20,
        choices=BillType.choices,
        default=BillType.OPD
    )

    registration_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    consultation_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    pharmacy_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    lab_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    total_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0
    )

    payment_method = models.CharField(
        max_length=10,
        choices=PaymentMethod.choices,
        default=PaymentMethod.CASH
    )

    payment_status = models.CharField(
        max_length=15,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING
    )

    paid_at = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):

        self.subtotal = (
            self.registration_fee
            + self.consultation_fee
            + self.pharmacy_fee
            + self.lab_fee
        )

        self.total_amount = self.subtotal

        if not self.bill_number:
            last_bill = Bill.objects.order_by("-id").first()

            next_id = (
                last_bill.id + 1
                if last_bill
                else 1
            )

            self.bill_number = f"BILL{next_id:05d}"

        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"{self.bill_number} - "
            f"{self.patient.first_name} "
            f"{self.patient.last_name}"
        )

class BillingSettings(models.Model):

    registration_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=100.00
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return f"Registration Fee: ₹{self.registration_fee}"
    