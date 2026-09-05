from django.contrib import admin
from django.urls import include, path


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("accounts.urls")),
    path("api/staff/", include("staff.urls")),
    path("api/", include("patients.urls")),
    path("api/billing/", include("billing.urls")),
    path("api/", include("prescriptions.urls")),
    path("api/laboratory/",include("laboratory.urls")),
    path("api/pharmacy/", include("pharmacy.urls")),
    path("api/", include("appointments.urls")),
    path("api/consultations/",include("consultations.urls"),
),
]
