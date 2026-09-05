import calendar
import re
from datetime import date

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db import models


User = get_user_model()


name_validator = RegexValidator(
    regex=r"^[A-Za-z\s.]{2,40}$",
    message="Only letters and spaces are allowed. Minimum 2 and maximum 40 characters."
)

phone_validator = RegexValidator(
    regex=r"^[0-9\+\-\s]{7,15}$",
    message="Enter a valid phone number (7 to 15 digits)."
)

email_validator = RegexValidator(
    regex=r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$",
    message="Enter a valid email address."
)


class Patient(models.Model):

    class Gender(models.TextChoices):
        MALE = "MALE", "Male"
        FEMALE = "FEMALE", "Female"
        OTHER = "OTHER", "Other"

    class BloodGroup(models.TextChoices):
        A_POSITIVE = "A+", "A+"
        A_NEGATIVE = "A-", "A-"
        B_POSITIVE = "B+", "B+"
        B_NEGATIVE = "B-", "B-"
        O_POSITIVE = "O+", "O+"
        O_NEGATIVE = "O-", "O-"
        AB_POSITIVE = "AB+", "AB+"
        AB_NEGATIVE = "AB-"

    patient_id = models.CharField(
        max_length=30,
        unique=True,
        editable=False,
        null=True,
        blank=True
    )

    first_name = models.CharField(
        max_length=40,
        validators=[name_validator]
    )

    last_name = models.CharField(
        max_length=40,
        blank=True,
        default="",
    )

    date_of_birth = models.DateField(
        null=True,
        blank=True,
    )

    gender = models.CharField(
        max_length=10,
        choices=Gender.choices,
        default=Gender.MALE,
    )

    blood_group = models.CharField(
        max_length=3,
        choices=BloodGroup.choices,
        default=BloodGroup.O_POSITIVE,
    )

    address = models.CharField(
        max_length=255,
        blank=True,
        default="",
    )

    phone = models.CharField(
        max_length=15,
        validators=[phone_validator]
    )

    email = models.EmailField(
        max_length=254,
        blank=True,
        null=True,
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="created_patients"
    )

    registered_at = models.DateTimeField(
        auto_now_add=True
    )

    next_visit_date = models.DateField(
        null=True,
        blank=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    is_active = models.BooleanField(
        default=True
    )

    def save(self, *args, **kwargs):
        if not self.patient_id:
            last_patient = (
                Patient.objects
                .exclude(patient_id__isnull=True)
                .exclude(patient_id="")
                .order_by("-id")
                .first()
            )

            if last_patient and last_patient.patient_id:
                digits = re.findall(r"\d+", str(last_patient.patient_id))
                last_number = int(digits[-1]) if digits else last_patient.id
                new_number = last_number + 1
            else:
                new_number = 1

            self.patient_id = f"PAT{new_number:03d}"

        super().save(*args, **kwargs)

    @property
    def age(self):
        if not self.date_of_birth:
            return None
        today = date.today()
        years = today.year - self.date_of_birth.year
        if (today.month, today.day) < (
            self.date_of_birth.month,
            self.date_of_birth.day
        ):
            years -= 1
        return max(0, years)

    def clean(self):
        errors = {}
        today = date.today()

        if self.date_of_birth:
            if self.date_of_birth > today:
                errors["date_of_birth"] = "Date of birth cannot be in the future."
            elif self.date_of_birth.year < 1900:
                errors["date_of_birth"] = "Date of birth cannot be before 1900."

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return f"{self.patient_id} - {self.first_name} {self.last_name}"