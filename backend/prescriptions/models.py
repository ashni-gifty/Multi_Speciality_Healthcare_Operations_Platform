from django.db import models
from django.contrib.auth import get_user_model
from patients.models import Patient
from pharmacy.models import Medicine
from laboratory.models import LabTest
from consultations.models import Consultation

User = get_user_model()


class Prescription(models.Model):
    rx_id = models.CharField(
        max_length=30,
        unique=True,
        editable=False
    )

    consultation = models.OneToOneField(
        Consultation,
        on_delete=models.PROTECT,
        related_name="prescription",
        null=True,
        blank=True,
    )

    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name="prescriptions"
    )

    doctor = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="prescriptions"
    )

    doctor_name = models.CharField(
        max_length=100,
        
    )

    diagnosis = models.CharField(max_length=255)

    blood_pressure = models.CharField(
        max_length=20,
        default="120/80"
    )

    pulse = models.CharField(
        max_length=10,
        default="76"
    )

    temperature = models.CharField(
        max_length=10,
        default="98.6"
    )

    notes = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def save(self, *args, **kwargs):
        if not self.rx_id:
            import random
            self.rx_id = f"RX-{random.randint(1000, 9999)}"

        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.rx_id} - {self.patient.first_name}"


class PrescriptionMedicine(models.Model):
    prescription = models.ForeignKey(
        Prescription,
        on_delete=models.CASCADE,
        related_name="prescription_medicines"
    )

    medicine = models.ForeignKey(
        Medicine,
        on_delete=models.PROTECT,
        related_name="prescription_items"
    )

    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    duration = models.CharField(max_length=100)
    quantity = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.prescription.rx_id} - {self.medicine.name}"


class ExternalMedicine(models.Model):
    prescription = models.ForeignKey(
        Prescription,
        on_delete=models.CASCADE,
        related_name="external_medicines"
    )

    medicine_name = models.CharField(max_length=150)
    instructions = models.TextField()

    def __str__(self):
        return f"{self.prescription.rx_id} - {self.medicine_name}"


class PrescriptionLabTest(models.Model):
    prescription = models.ForeignKey(
        Prescription,
        on_delete=models.CASCADE,
        related_name="prescription_lab_tests"
    )

    test = models.ForeignKey(
        LabTest,
        on_delete=models.PROTECT,
        related_name="prescription_tests"
    )

    notes = models.TextField(
        blank=True,
        null=True
    )

    def __str__(self):
        return f"{self.prescription.rx_id} - {self.test.test_name}"


class ExternalLabTest(models.Model):
    prescription = models.ForeignKey(
        Prescription,
        on_delete=models.CASCADE,
        related_name="external_lab_tests"
    )

    test_name = models.CharField(max_length=150)
    instructions = models.TextField()

    def __str__(self):
        return f"{self.prescription.rx_id} - {self.test_name}"