from django.urls import path
from .views import CreateAppointmentBillView, BillListView, PayBillView

urlpatterns = [
    path(
        "appointments/<int:appointment_id>/create/",
        CreateAppointmentBillView.as_view(),
        name="create-appointment-bill",
    ),

    path(
        "bills/",
        BillListView.as_view(),
        name="bill-list",
    ),

    path(
        "bills/<int:bill_id>/pay/",
        PayBillView.as_view(),
        name="pay-bill",
    ),
]