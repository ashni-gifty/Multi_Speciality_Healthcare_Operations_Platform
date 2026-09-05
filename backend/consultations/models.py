from django.core.exceptions import ValidationError
from django.db import models

from appointments.models import Appointment
from patients.models import Patient
from staff.models import StaffProfile


class Consultation(models.Model):

    appointment = models.OneToOneField(
        Appointment,
        on_delete=models.PROTECT,
        related_name="consultation",
    )

    patient = models.ForeignKey(
        Patient,
        on_delete=models.PROTECT,
        related_name="consultations",
    )

    doctor = models.ForeignKey(
        StaffProfile,
        on_delete=models.PROTECT,
        related_name="consultations",
        limit_choices_to={"user__role": "DOCTOR"},
    )

    chief_complaint = models.TextField()
    symptoms = models.TextField(blank=True)
    diagnosis = models.TextField(blank=True)
    clinical_notes = models.TextField(blank=True)
    follow_up_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def clean(self):
        errors = {}

        if self.appointment:
            if self.appointment.patient_id != self.patient_id:
                errors["patient"] = (
                    "Patient must match the appointment patient."
                )

            if self.appointment.doctor_id != self.doctor_id:
                errors["doctor"] = (
                    "Doctor must match the appointment doctor."
                )

        if self.doctor and self.doctor.user.role != "DOCTOR":
            errors["doctor"] = "Selected staff member is not a doctor."

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return (
            f"Consultation - "
            f"{self.patient.first_name} {self.patient.last_name} - "
            f"Dr. {self.doctor.first_name} {self.doctor.last_name}"
        )

    