from rest_framework.routers import DefaultRouter

from .views import LabReportViewSet, LabTestViewSet


router = DefaultRouter()

router.register(
    r"reports",
    LabReportViewSet,
    basename="laboratory-report"
)

router.register(
    r"tests",
    LabTestViewSet,
    basename="laboratory-test"
)

urlpatterns = router.urls