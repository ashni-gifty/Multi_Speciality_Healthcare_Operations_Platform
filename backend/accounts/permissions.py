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
    Allows access to Admin users, Superusers, and staff.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                str(getattr(request.user, "role", "")).upper() == CustomUser.Role.ADMIN
                or request.user.is_superuser
                or request.user.is_staff
            )
        )


class IsDoctorRole(BasePermission):
    """
    Allows access to Doctor users and Admins.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                str(getattr(request.user, "role", "")).upper() in [
                    CustomUser.Role.DOCTOR,
                    CustomUser.Role.ADMIN,
                ]
                or request.user.is_superuser
                or request.user.is_staff
            )
        )


class IsReceptionistRole(BasePermission):
    """
    Allows access to Receptionist users and Admins.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                str(getattr(request.user, "role", "")).upper() in [
                    CustomUser.Role.RECEPTIONIST,
                    CustomUser.Role.ADMIN,
                ]
                or request.user.is_superuser
                or request.user.is_staff
            )
        )


class IsLabTechnicianRole(BasePermission):
    """
    Allows access to Lab Technician users and Admins.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                str(getattr(request.user, "role", "")).upper() in [
                    CustomUser.Role.LAB_TECHNICIAN,
                    CustomUser.Role.ADMIN,
                ]
                or request.user.is_superuser
                or request.user.is_staff
            )
        )


class IsAdminOrLabTechnicianRole(BasePermission):
    """Allows laboratory work to Admins, Lab Technicians, and Superusers."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                str(getattr(request.user, "role", "")).upper() in [
                    CustomUser.Role.ADMIN,
                    CustomUser.Role.LAB_TECHNICIAN,
                ]
                or request.user.is_superuser
                or request.user.is_staff
            )
        )


class IsPharmacistRole(BasePermission):
    """
    Allows access to Pharmacist users and Admins.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                str(getattr(request.user, "role", "")).upper() in [
                    CustomUser.Role.PHARMACIST,
                    CustomUser.Role.ADMIN,
                ]
                or request.user.is_superuser
                or request.user.is_staff
            )
        )


class IsAdminOrDoctorRole(BasePermission):
    """
    Allows access to Admin or Doctor.
    """

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and (
                str(getattr(request.user, "role", "")).upper() in [
                    CustomUser.Role.ADMIN,
                    CustomUser.Role.DOCTOR,
                ]
                or request.user.is_superuser
                or request.user.is_staff
            )
        )
    
