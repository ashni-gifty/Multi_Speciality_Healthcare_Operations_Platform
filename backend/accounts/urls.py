from django.urls import path

from .views import LoginView


urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
<<<<<<< HEAD
    path("auth/login/", LoginView.as_view(), name="auth-login"),
=======
>>>>>>> 542af1449569d94938888abbe2cb0526e80c41ba
]
