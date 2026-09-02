from datetime import date
from django.db import models


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

    name = models.CharField(
        max_length=150
    )

    generic_name = models.CharField(
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

    batch_number = models.CharField(
        max_length=50
    )

    manufacturer = models.CharField(
        max_length=150,
        blank=True
    )

    supplier = models.CharField(
        max_length=150,
        blank=True
    )

    quantity = models.PositiveIntegerField(
        default=0,
        help_text="Current stock quantity"
    )

    reorder_level = models.PositiveIntegerField(
        default=20,
        help_text="Stock level below which alert is triggered"
    )

    unit_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Selling price per unit in INR"
    )

    cost_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Purchase cost per unit in INR"
    )

    expiry_date = models.DateField()

    status = models.CharField(
        max_length=15,
        choices=Status.choices,
        default=Status.ACTIVE
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ["name"]

    @property
    def stock_status(self):
        today = date.today()
        if self.expiry_date < today:
            return "EXPIRED"
        if self.quantity == 0:
            return "OUT_OF_STOCK"
        if self.quantity <= self.reorder_level:
            return "LOW_STOCK"
        return "IN_STOCK"

    def save(self, *args, **kwargs):
        if not self.medicine_id:
            last_med = Medicine.objects.order_by("-id").first()
            next_id = (last_med.id + 1) if last_med else 1
            self.medicine_id = f"MED{next_id:04d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.batch_number}) - Stock: {self.quantity}"
