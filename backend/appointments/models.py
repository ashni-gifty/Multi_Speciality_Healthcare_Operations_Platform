from django.core.exceptions import ValidationError
from django.db import models

from patients.models import Patient
from staff.models import StaffProfile


class Appointment(models.Model):

    class Status(models.TextChoices):
        SCHEDULED = "SCHEDULED", "Scheduled"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"

    patient = models.ForeignKey(
        Patient,
        on_delete=models.PROTECT,
        related_name="appointments",
    )

    doctor = models.ForeignKey(
        StaffProfile,
        on_delete=models.PROTECT,
        related_name="appointments",
        limit_choices_to={"user__role": "DOCTOR"},
    )

    appointment_date = models.DateField()

    appointment_time = models.TimeField()

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.SCHEDULED,
    )

    reason = models.TextField(
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = [
            "appointment_date",
            "appointment_time",
        ]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "doctor",
                    "appointment_date",
                    "appointment_time",
                ],
                name="unique_doctor_appointment_slot",
            )
        ]

        indexes = [
            models.Index(
                fields=[
                    "appointment_date",
                    "doctor",
                ]
            ),
            models.Index(
                fields=[
                    "appointment_date",
                    "patient",
                ]
            ),
        ]

    def clean(self):
        errors = {}

        if not self.patient.is_active:
            errors["patient"] = "Patient is inactive."

        if self.doctor.user.role != "DOCTOR":
            errors["doctor"] = "Selected staff member is not a doctor."

        if self.doctor.status != StaffProfile.Status.ACTIVE:
            errors["doctor"] = "Doctor is inactive."

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return (
            f"{self.patient.first_name} "
            f"{self.patient.last_name} - "
            f"Dr. {self.doctor.first_name} "
            f"{self.doctor.last_name} - "
            f"{self.appointment_date} "
            f"{self.appointment_time}"
        )