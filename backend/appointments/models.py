from django.core.exceptions import ValidationError
from django.db import models

from patients.models import Patient
from staff.models import StaffProfile


class Appointment(models.Model):

    class Status(models.TextChoices):
        BOOKED = "BOOKED", "Booked"
        CHECKED_IN = "CHECKED_IN", "Checked In"
        IN_CONSULTATION = "IN_CONSULTATION", "In Consultation"
        COMPLETED = "COMPLETED", "Completed"
        CANCELLED = "CANCELLED", "Cancelled"
        NO_SHOW = "NO_SHOW", "No Show"

    class TokenStatus(models.TextChoices):
        NOT_ISSUED = "NOT_ISSUED", "Not Issued"
        ISSUED = "ISSUED", "Issued"

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
        max_length=25,
        choices=Status.choices,
        default=Status.BOOKED,
    )

    token_status = models.CharField(
        max_length=20,
        choices=TokenStatus.choices,
        default=TokenStatus.NOT_ISSUED,
    )

    token_number = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    reason = models.TextField(
        blank=True,
        null=True,
    )

    booked_by = models.ForeignKey(
        StaffProfile,
        on_delete=models.PROTECT,
        related_name="booked_appointments",
        null=True,
        blank=True,
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
            models.Index(
                fields=[
                    "appointment_date",
                    "doctor",
                    "status",
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