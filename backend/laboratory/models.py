from django.db import models
from patients.models import Patient
import random


class LabTest(models.Model):
    class SampleType(models.TextChoices):
        BLOOD = "BLOOD", "Blood"
        SERUM = "SERUM", "Serum"
        URINE = "URINE", "Urine"
        SWAB = "SWAB", "Swab"
        OTHER = "OTHER", "Other"

    test_code = models.CharField(max_length=20, unique=True)
    test_name = models.CharField(max_length=150)
    category = models.CharField(max_length=100, default="General Pathology")
    sample_type = models.CharField(
        max_length=20, choices=SampleType.choices, default=SampleType.BLOOD
    )
    price = models.DecimalField(max_digits=10, decimal_places=2, default=300.00)
    normal_range = models.CharField(max_length=100, default="Normal")
    unit = models.CharField(max_length=30, blank=True, default="")
    turnaround_time = models.CharField(max_length=50, default="2-4 Hours")
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.test_code} - {self.test_name}"


class LabReport(models.Model):
    class Status(models.TextChoices):
        PENDING_SAMPLE = "PENDING_SAMPLE", "Pending Sample"
        PROCESSING = "PROCESSING", "In Processing"
        COMPLETED = "COMPLETED", "Completed"

    report_id = models.CharField(max_length=30, unique=True, editable=False)
    patient = models.ForeignKey(
        Patient, on_delete=models.CASCADE, related_name="lab_reports"
    )
    test_name = models.CharField(max_length=150)
    sample_type = models.CharField(max_length=50, default="Blood")
    ordered_by_doctor = models.CharField(max_length=100, default="Dr. Robert Smith")
    technician_name = models.CharField(max_length=100, default="Mark Vance")
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING_SAMPLE
    )
    result_value = models.CharField(max_length=100, blank=True, default="")
    reference_range = models.CharField(max_length=100, blank=True, default="")
    finding_notes = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.report_id:
            self.report_id = f"LAB-{random.randint(1000, 9999)}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.report_id} - {self.test_name} for {self.patient.first_name}"
