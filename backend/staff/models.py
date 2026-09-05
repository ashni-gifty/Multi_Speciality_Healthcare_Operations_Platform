from datetime import date

from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db import models


User = get_user_model()


# -----------------------------
# Common Validators
# -----------------------------

name_validator = RegexValidator(
    regex=r"^[A-Za-z]{3,40}$",
    message="Only letters are allowed. Minimum 3 and maximum 40 characters."
)

phone_validator = RegexValidator(
    regex=r"^[6-9][0-9]{9}$",
    message="Phone number must contain 10 digits and start with 6, 7, 8, or 9."
)


# -----------------------------
# Department
# -----------------------------

class Department(models.Model):

    department_id = models.CharField(
        max_length=20,
        unique=True
    )

    name = models.CharField(
        max_length=100,
        unique=True
    )

    description = models.CharField(
        max_length=255,
        blank=True
    )

    status = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.name


# -----------------------------
# Staff Profile
# -----------------------------

class StaffProfile(models.Model):

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

    class Status(models.TextChoices):
        ACTIVE = "ACTIVE", "Active"
        INACTIVE = "INACTIVE", "Inactive"

    staff_id = models.CharField(
        max_length=20,
        unique=True
    )

    user = models.OneToOneField(
        User,
        on_delete=models.PROTECT,
        related_name="staff_profile"
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
        unique=True,
        validators=[phone_validator]
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.PROTECT,
        related_name="staff_members"
    )

    degree = models.CharField(
        max_length=150
    )

    work_experience = models.PositiveIntegerField(
        default=0
    )

    joining_date = models.DateField()

    consultation_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    status = models.CharField(
        max_length=10,
        choices=Status.choices,
        default=Status.ACTIVE
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def clean(self):
        today = date.today()
        errors = {}

        # -----------------------------
        # Date of Birth Validation
        # -----------------------------

        if not self.date_of_birth:
            errors["date_of_birth"] = "Date of birth is required."
        else:
            if self.date_of_birth > today:
                errors["date_of_birth"] = (
                    "Date of birth cannot be in the future."
                )

            if self.date_of_birth.year < 1909:
                errors["date_of_birth"] = (
                    "Date of birth cannot be before 1909."
                )

        # -----------------------------
        # Joining Date Validation
        # -----------------------------

        if not self.joining_date:
            errors["joining_date"] = "Joining date is required."

        elif self.joining_date > today:
            errors["joining_date"] = (
                "Joining date cannot be in the future."
            )

        # -----------------------------
        # Role-based Age Validation
        # -----------------------------

        if self.date_of_birth and self.user:
            age = today.year - self.date_of_birth.year

            if (today.month, today.day) < (
                self.date_of_birth.month,
                self.date_of_birth.day
            ):
                age -= 1

            role = self.user.role

            # Doctor, Pharmacist, Lab Technician
            if role in [
                User.Role.DOCTOR,
                User.Role.PHARMACIST,
                User.Role.LAB_TECHNICIAN,
            ]:
                if age <= 23:
                    errors["date_of_birth"] = (
                        "Doctor, Pharmacist and Lab Technician "
                        "must be above 23 years old."
                    )

            # Receptionist
            elif role == User.Role.RECEPTIONIST:
                if age <= 20:
                    errors["date_of_birth"] = (
                        "Receptionist must be above 20 years old."
                    )

            # Consultation fee only for Doctor
            if role != User.Role.DOCTOR:
                self.consultation_fee = None

        # -----------------------------
        # Raise Validation Errors
        # -----------------------------

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return f"{self.staff_id} -Dr. {self.first_name} {self.last_name}"

# -----------------------------
# Doctor Availability
# -----------------------------

class DoctorAvailability(models.Model):

    class DayOfWeek(models.TextChoices):
        MONDAY = "MONDAY", "Monday"
        TUESDAY = "TUESDAY", "Tuesday"
        WEDNESDAY = "WEDNESDAY", "Wednesday"
        THURSDAY = "THURSDAY", "Thursday"
        FRIDAY = "FRIDAY", "Friday"
        SATURDAY = "SATURDAY", "Saturday"
        SUNDAY = "SUNDAY", "Sunday"

    doctor = models.ForeignKey(
        StaffProfile,
        on_delete=models.CASCADE,
        related_name="availability",
        limit_choices_to={"user__role": "DOCTOR"},
    )

    day_of_week = models.CharField(
        max_length=10,
        choices=DayOfWeek.choices
    )

    available_from = models.TimeField()

    available_to = models.TimeField()

    slot_duration = models.PositiveIntegerField(
        default=15,
        help_text="Appointment slot duration in minutes."
    )

    class Meta:
        ordering = ["doctor", "day_of_week", "available_from"]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "doctor",
                    "day_of_week",
                    "available_from",
                    "available_to",
                ],
                name="unique_doctor_availability"
            )
        ]

    def clean(self):
        errors = {}

        if self.doctor.user.role != "DOCTOR":
            errors["doctor"] = (
                "Availability can only be assigned to doctors."
            )

        if self.doctor.status != StaffProfile.Status.ACTIVE:
            errors["doctor"] = (
                "Availability can only be assigned to active doctors."
            )

        if self.available_from >= self.available_to:
            errors["available_to"] = (
                "Available-to time must be later than available-from time."
            )

        if self.slot_duration <= 0:
            errors["slot_duration"] = (
                "Slot duration must be greater than 0 minutes."
            )

        if errors:
            raise ValidationError(errors)

    def __str__(self):
        return (
            f"Dr. {self.doctor.first_name} "
            f"{self.doctor.last_name} - "
            f"{self.day_of_week} "
            f"({self.available_from} - {self.available_to})"
        )