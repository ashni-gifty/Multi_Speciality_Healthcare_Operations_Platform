from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("patients", "0002_alter_patient_patient_id"),
        ("prescriptions", "0001_initial"),
        ("pharmacy", "0002_medicine_supplier"),
    ]

    operations = [
        migrations.CreateModel(
            name="PharmacyBill",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("serial_number", models.CharField(blank=True, max_length=30, unique=True)),
                ("medicines", models.JSONField(default=list)),
                ("payment_mode", models.CharField(default="Cash", max_length=30)),
                ("grand_total", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("gst", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("amount_payable", models.DecimalField(decimal_places=2, default=0, max_digits=12)),
                ("paid_status", models.BooleanField(default=False)),
                ("issued_date", models.DateTimeField(auto_now_add=True)),
                ("created_by", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="pharmacy_bills", to=settings.AUTH_USER_MODEL)),
                ("patient", models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name="pharmacy_bills", to="patients.patient")),
                ("prescription", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name="pharmacy_bills", to="prescriptions.prescription")),
            ],
            options={"ordering": ["-issued_date"]},
        ),
    ]