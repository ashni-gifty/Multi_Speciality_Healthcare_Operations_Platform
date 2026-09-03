from datetime import date
from django.db import models
from patients.models import Patient

class Medicine(models.Model):

    class Category(models.TextChoices):
        TABLET = "TABLET", "Tablet"
        CAPSULE = "CAPSULE", "Capsule"
        SYRUP = "SYRUP", "Syrup"
        INJECTION = "INJECTION", "Injection"
        OINTMENT = "OINTMENT", "Ointment"
        DROPS = "DROPS", "Drops"
        INHALER = "INHALER", "Inhaler"
        OTHER = "OTHER", "Other"

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        DISCONTINUED = "DISCONTINUED", "Discontinued"

    medicine_id = models.CharField(
        max_length=20,
        unique=True,
        blank=True
    )

    name = models.CharField(max_length=150)

    generic_name = models.CharField(
        max_length=150,
        blank=True
    )

    manufacturer = models.CharField(
        max_length=150,
        blank=True
    )

    supplier = models.CharField(
        max_length=150,
        blank=True
    )

    category = models.CharField(
        max_length=20,
        choices=Category.choices,
        default=Category.TABLET
    )

    dosage_form = models.CharField(
        max_length=50,
        blank=True,
        help_text="e.g. 500mg, 10ml, 250mg/5ml"
    )

    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.medicine_id:
            last_med = Medicine.objects.order_by("-id").first()
            next_id = (last_med.id + 1) if last_med else 1
            self.medicine_id = f"MED{next_id:04d}"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.medicine_id} - {self.name}"


class MedicineStock(models.Model):

    medicine = models.ForeignKey(
        Medicine,
        on_delete=models.PROTECT,
        related_name="stocks"
    )

    batch_number = models.CharField(
        max_length=50
    )

    manufacturing_date = models.DateField()

    expiry_date = models.DateField()

    price_per_unit = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    units = models.PositiveIntegerField(
        default=0
    )

    reorder_level = models.PositiveIntegerField(
        default=20
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    @property
    def stock_status(self):
        today = date.today()

        if self.expiry_date < today:
            return "EXPIRED"

        if self.units == 0:
            return "OUT_OF_STOCK"

        if self.units <= self.reorder_level:
            return "LOW_STOCK"

        return "IN_STOCK"

    def __str__(self):
        return f"{self.medicine.name} - {self.batch_number}"
    

class PharmacyBill(models.Model):
    class PaymentMethod(models.TextChoices):
        CASH = "CASH", "Cash"
        GPAY = "GPAY", "GPay"

    bill_number = models.CharField(max_length=30, unique=True)
    patient = models.ForeignKey(
        Patient,
        on_delete=models.PROTECT,
        related_name="pharmacy_bills",
    )
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    gst = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    payment_method = models.CharField(
        max_length=10,
        choices=PaymentMethod.choices,
        default=PaymentMethod.CASH,
    )
    paid = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.bill_number


class PharmacyBillItem(models.Model):

    bill = models.ForeignKey(
        PharmacyBill,
        on_delete=models.CASCADE,
        related_name="items"
    )

    medicine = models.ForeignKey(
        Medicine,
        on_delete=models.PROTECT
    )

    quantity = models.PositiveIntegerField()

    price_per_unit = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    amount = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    def __str__(self):
        return f"{self.bill.bill_number} - {self.medicine.name}"