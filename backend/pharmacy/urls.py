from django.urls import path

from .views import (
<<<<<<< HEAD
    MedicineListCreateView,
    MedicineDetailView,
    MedicineStockListCreateView,
    DispensePrescriptionView,
    PharmacyBillListView,
    PharmacyBillDetailView,
    PayPharmacyBillView,
    PharmacySalesReportView,
=======
    DispenseMedicineView,
    MedicineDetailView,
    MedicineListCreateView,
    PharmacyBillDetailView,
    PharmacyBillListCreateView,
>>>>>>> origin/feature/pharmacist
)


urlpatterns = [
<<<<<<< HEAD

    # Medicine Master
    path(
        "medicines/",
        MedicineListCreateView.as_view(),
        name="medicine-list-create"
    ),

    path(
        "medicines/<int:pk>/",
        MedicineDetailView.as_view(),
        name="medicine-detail"
    ),

    # Stock
    path(
        "stocks/",
        MedicineStockListCreateView.as_view(),
        name="medicine-stock-list-create"
    ),

    # Prescription -> Pharmacy
    path(
        "prescriptions/<int:prescription_id>/dispense/",
        DispensePrescriptionView.as_view(),
        name="dispense-prescription"
    ),

    # Pharmacy Bills
    path(
        "bills/",
        PharmacyBillListView.as_view(),
        name="pharmacy-bill-list"
    ),

    path(
        "bills/<int:pk>/",
        PharmacyBillDetailView.as_view(),
        name="pharmacy-bill-detail"
    ),

    path(
        "bills/<int:pk>/pay/",
        PayPharmacyBillView.as_view(),
        name="pay-pharmacy-bill"
    ),

    # Reports
    path(
        "reports/sales/",
        PharmacySalesReportView.as_view(),
        name="pharmacy-sales-report"
    ),
]
=======
    path("medicines/", MedicineListCreateView.as_view(), name="medicine-list-create"),
    path("medicines/<int:pk>/", MedicineDetailView.as_view(), name="medicine-detail"),
    path("dispense/", DispenseMedicineView.as_view(), name="dispense-medicine"),
    path("pharmacy-bills/", PharmacyBillListCreateView.as_view(), name="pharmacy-bill-list-create"),
    path("pharmacy-bills/<int:pk>/", PharmacyBillDetailView.as_view(), name="pharmacy-bill-detail"),
]
>>>>>>> origin/feature/pharmacist
