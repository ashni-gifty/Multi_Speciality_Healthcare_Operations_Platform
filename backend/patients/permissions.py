from rest_framework.permissions import BasePermission

from accounts.models import CustomUser


class IsReceptionistOrReadOnly(BasePermission):

    def has_permission(self, request, view):

        if not request.user or not request.user.is_authenticated:
            return False

        # Anyone with a valid staff login can view patients.
        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True

        # Receptionists and Admins/Superusers can create, edit or deactivate patients.
        role = str(getattr(request.user, "role", "")).upper()
        return (
            role in [CustomUser.Role.RECEPTIONIST, CustomUser.Role.ADMIN]
            or request.user.is_superuser
            or request.user.is_staff
        )