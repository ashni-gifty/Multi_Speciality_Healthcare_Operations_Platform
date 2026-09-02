from django import forms

from .models import Appointment


class AppointmentAdminForm(forms.ModelForm):

    appointment_time = forms.TimeField(
        widget=forms.TimeInput(
            format="%I:%M %p",
            attrs={
                "placeholder": "HH:MM AM/PM",
            },
        ),
        input_formats=[
            "%I:%M %p",
            "%I:%M:%S %p",
            "%H:%M",
            "%H:%M:%S",
        ],
    )

    class Meta:
        model = Appointment

        fields = [
            "patient",
            "doctor",
            "appointment_date",
            "appointment_time",
            "reason",
            "status",
        ]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields["patient"].label_from_instance = (
            lambda patient:
                f"{patient.first_name} {patient.last_name}"
        )

        self.fields["doctor"].label_from_instance = (
            lambda doctor:
                f"Dr. {doctor.first_name} {doctor.last_name}"
        )