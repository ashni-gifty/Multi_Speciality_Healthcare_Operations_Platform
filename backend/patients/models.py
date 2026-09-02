import re
import calendar
from datetime import date

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db import models


User = get_user_model()


name_validator = RegexValidator(
    regex=r"^[A-Za-z]{3,40}$",
    message="Only letters are allowed. Minimum 3 and maximum 40 characters."
)

phone_validator = RegexValidator(
    regex=r"^[6-9][0-9]{9}$",
    message="Phone number must contain 10 digits and start with 6, 7, 8, or 9."
)

email_validator = RegexValidator(
    regex=r"^[A-Za-z0-9._%+-]+@(gmail|email|yahoo)\.(com|in)$",
    message="Enter a valid email such as name@gmail.com, name@email.com, or name@yahoo.com."
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
        AB_NEGATIVE = "AB-", "AB-"

    patient_id = models.CharField(
        max_length=20,
        unique=True,
        editable=False
    )

    first_name = models.CharField(
        max_length=40,
        validators=[name_validator]
    )

    last_name = models.CharField(
        max_length=40,
        validators=[name_validator]
    )

    date_of_birth = models.DateField()

    gender = models.CharField(
        max_length=10,
        choices=Gender.choices
    )

    blood_group = models.CharField(
        max_length=3,
        choices=BloodGroup.choices
    )

    address = models.CharField(
        max_length=255
    )

    phone = models.CharField(
        max_length=10,
        validators=[phone_validator]
    )

    email = models.EmailField(
        max_length=254,
        validators=[email_validator]
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="created_patients"
    )

    registered_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    is_active = models.BooleanField(
        default=True
    )

    @property
    def age(self):
        """
        Calculate current age from date of birth.
        Age is not stored in the database.
        """
        today = date.today()

        years = today.year - self.date_of_birth.year

        if (today.month, today.day) < (
            self.date_of_birth.month,
            self.date_of_birth.day
        ):
            years -= 1

        return years

    def clean(self):
        errors = {}
        today = date.today()

        # -----------------------------
        # Date of Birth Validation
        # -----------------------------

        if not self.date_of_birth:
            errors["date_of_birth"] = (
                "Date of birth is required."
            )

        else:

            # Future DOB
            if self.date_of_birth > today:
                errors["date_of_birth"] = (
                    "Date of birth cannot be in the future."
                )

            else:
                # --------------------------------
                # Minimum age: 3 months
                # --------------------------------
                month = today.month - 3
                year = today.year

                if month <= 0:
                    month += 12
                    year -= 1

                last_day = calendar.monthrange(year, month)[1]

                three_months_ago = date(
                    year,
                    month,
                    min(today.day, last_day)
                )

                if self.date_of_birth > three_months_ago:
                    errors["date_of_birth"] = (
                        "Patient must be at least 3 months old."
                    )

                # --------------------------------
                # Maximum age: 110 years
                # --------------------------------
                else:
                    age = today.year - self.date_of_birth.year

                    if (today.month, today.day) < (
                        self.date_of_birth.month,
                        self.date_of_birth.day
                    ):
                        age -= 1

                    if age > 110:
                        errors["date_of_birth"] = (
                            "Patient age cannot be above 110 years."
                        )

                # --------------------------------
                # Date before 1909
                # --------------------------------
                if self.date_of_birth.year < 1909:
                    errors["date_of_birth"] = (
                        "Date of birth cannot be before 1909."
                    )

        if errors:
            raise ValidationError(errors)
    def __str__(self):
        return f"{self.patient_id} - {self.first_name} {self.last_name}"