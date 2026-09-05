from django.urls import path

from .views import (
    MedicineListCreateView,
    MedicineDetailView,
    MedicineStockListCreateView,
    MedicineStockDetailView,
    DispensePrescriptionView,
    PharmacyBillListView,
    PharmacyBillDetailView,
    PayPharmacyBillView,
    PharmacySalesReportView,
)

urlpatterns = [
    # Medicine Master
    path("medicines/", MedicineListCreateView.as_view(), name="medicine-list-create"),
    path("medicines/<int:pk>/", MedicineDetailView.as_view(), name="medicine-detail"),

    # Stock Batches
    path("stocks/", MedicineStockListCreateView.as_view(), name="medicine-stock-list-create"),
    path("stocks/<int:pk>/", MedicineStockDetailView.as_view(), name="medicine-stock-detail"),

    # Prescription -> Dispense
    path("prescriptions/<int:prescription_id>/dispense/", DispensePrescriptionView.as_view(), name="dispense-prescription"),

    # Pharmacy Bills
    path("bills/", PharmacyBillListView.as_view(), name="pharmacy-bill-list"),
    path("bills/<int:pk>/", PharmacyBillDetailView.as_view(), name="pharmacy-bill-detail"),
    path("bills/<int:pk>/pay/", PayPharmacyBillView.as_view(), name="pay-pharmacy-bill"),

    # Sales Reports
    path("reports/sales/", PharmacySalesReportView.as_view(), name="pharmacy-sales-report"),
]
