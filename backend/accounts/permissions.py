from rest_framework.permissions import BasePermission

from .models import CustomUser


class IsAuthenticatedUser(BasePermission):
    """
    Allows access only to logged-in users.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
        )


class IsAdminRole(BasePermission):
    """
    Allows access only to Admin users.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == CustomUser.Role.ADMIN
        )


class IsDoctorRole(BasePermission):
    """
    Allows access only to Doctor users.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == CustomUser.Role.DOCTOR
        )


class IsReceptionistRole(BasePermission):
    """
    Allows access only to Receptionist users.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == CustomUser.Role.RECEPTIONIST
        )


class IsLabTechnicianRole(BasePermission):
    """
    Allows access only to Lab Technician users.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == CustomUser.Role.LAB_TECHNICIAN
        )


class IsPharmacistRole(BasePermission):
    """
    Allows access only to Pharmacist users.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role == CustomUser.Role.PHARMACIST
        )


class IsAdminOrDoctorRole(BasePermission):
    """
    Allows access to Admin or Doctor.
    """

    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and request.user.role in [
                CustomUser.Role.ADMIN,
                CustomUser.Role.DOCTOR,
            ]
        )
    