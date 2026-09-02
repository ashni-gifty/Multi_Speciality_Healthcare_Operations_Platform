from rest_framework.permissions import BasePermission

from accounts.models import CustomUser


class IsReceptionistOrReadOnly(BasePermission):

    def has_permission(self, request, view):

        if not request.user or not request.user.is_authenticated:
            return False

        # Anyone with a valid staff login can view patients.
        if request.method in ["GET", "HEAD", "OPTIONS"]:
            return True

        # Only Receptionist can create, edit or deactivate patients.
        return (
            request.user.role
            == CustomUser.Role.RECEPTIONIST
        )