from django.urls import path
from .views import (
    DispenseMedicineView,
    MedicineDetailView,
    MedicineListCreateView,
    PharmacyBillDetailView,
    PharmacyBillListCreateView,
)

urlpatterns = [
    path("medicines/", MedicineListCreateView.as_view(), name="medicine-list-create"),
    path("medicines/<int:pk>/", MedicineDetailView.as_view(), name="medicine-detail"),
    path("dispense/", DispenseMedicineView.as_view(), name="dispense-medicine"),
    path("pharmacy-bills/", PharmacyBillListCreateView.as_view(), name="pharmacy-bill-list-create"),
    path("pharmacy-bills/<int:pk>/", PharmacyBillDetailView.as_view(), name="pharmacy-bill-detail"),
]
