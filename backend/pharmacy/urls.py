from django.urls import path
from .views import (
    MedicineDetailView,
    MedicineListCreateView,
)

urlpatterns = [
    path("medicines/", MedicineListCreateView.as_view(), name="medicine-list-create"),
    path("medicines/<int:pk>/", MedicineDetailView.as_view(), name="medicine-detail"),
]
