from django.db import models
from django.contrib.auth import get_user_model
from patients.models import Patient

User = get_user_model()


class Prescription(models.Model):
    rx_id = models.CharField(max_length=30, unique=True, editable=False)
    patient = models.ForeignKey(
        Patient, on_delete=models.CASCADE, related_name="prescriptions"
    )
    doctor = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="prescribed_recipes"
    )
    doctor_name = models.CharField(max_length=100, default="Dr. Robert Smith")
    diagnosis = models.CharField(max_length=255)
    blood_pressure = models.CharField(max_length=20, default="120/80")
    pulse = models.CharField(max_length=10, default="76")
    temperature = models.CharField(max_length=10, default="98.6")
    medicines = models.TextField(help_text="Prescribed medicine lines with dosage instructions")
    lab_tests = models.CharField(max_length=255, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if not self.rx_id:
            import random
            self.rx_id = f"RX-{random.randint(1000, 9999)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.rx_id} - {self.patient.first_name} ({self.diagnosis})"
