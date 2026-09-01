from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.permissions import IsAdminRole
from .models import StaffProfile
from .serializers import (
    StaffCreateSerializer,
    StaffProfileSerializer,
)


class StaffListCreateView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdminRole,
    ]

    def get(self, request):

        staff_members = (
            StaffProfile.objects
            .select_related("user", "department")
            .all()
            .order_by("staff_id")
        )

        serializer = StaffProfileSerializer(
            staff_members,
            many=True
        )

        return Response(serializer.data)

    def post(self, request):

        serializer = StaffCreateSerializer(
            data=request.data
        )

        if serializer.is_valid():

            staff_profile = serializer.save()

            response_serializer = StaffProfileSerializer(
                staff_profile
            )

            return Response(
                response_serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class StaffDetailView(APIView):

    permission_classes = [
        IsAuthenticated,
        IsAdminRole,
    ]

    def get_object(self, staff_id):

        try:
            return (
                StaffProfile.objects
                .select_related("user", "department")
                .get(staff_id=staff_id)
            )

        except StaffProfile.DoesNotExist:

            return None

    def get(self, request, staff_id):

        staff_profile = self.get_object(staff_id)

        if staff_profile is None:
            return Response(
                {"detail": "Staff member not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = StaffProfileSerializer(
            staff_profile
        )

        return Response(serializer.data)

    def put(self, request, staff_id):

        staff_profile = self.get_object(staff_id)

        if staff_profile is None:
            return Response(
                {"detail": "Staff member not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = StaffProfileSerializer(
            staff_profile,
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                serializer.data
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, staff_id):

        staff_profile = self.get_object(staff_id)

        if staff_profile is None:
            return Response(
                {"detail": "Staff member not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        staff_profile.status = (
            StaffProfile.Status.INACTIVE
        )

        staff_profile.user.is_active = False
        staff_profile.user.save(
            update_fields=["is_active"]
        )

        staff_profile.save(
            update_fields=["status", "updated_at"]
        )

        return Response({
            "message":
            "Staff member deactivated successfully."
        })
    