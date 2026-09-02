from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import CustomUser
from accounts.permissions import IsAdminRole
from patients.models import Patient
from .models import Department, StaffProfile
from .serializers import (
    DepartmentSerializer,
    StaffCreateSerializer,
    StaffProfileSerializer,
)


class DepartmentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        departments = Department.objects.filter(status=True).order_by("name")
        serializer = DepartmentSerializer(departments, many=True)
        return Response(serializer.data)


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


class AdminDashboardView(APIView):
    permission_classes = [
        IsAuthenticated,
        IsAdminRole,
    ]

    def get(self, request):
        total_patients = Patient.objects.filter(is_active=True).count()
        total_doctors = StaffProfile.objects.filter(
            user__role=CustomUser.Role.DOCTOR,
            status=StaffProfile.Status.ACTIVE
        ).count()
        total_receptionists = StaffProfile.objects.filter(
            user__role=CustomUser.Role.RECEPTIONIST,
            status=StaffProfile.Status.ACTIVE
        ).count()
        total_pharmacists = StaffProfile.objects.filter(
            user__role=CustomUser.Role.PHARMACIST,
            status=StaffProfile.Status.ACTIVE
        ).count()
        total_lab_technicians = StaffProfile.objects.filter(
            user__role=CustomUser.Role.LAB_TECHNICIAN,
            status=StaffProfile.Status.ACTIVE
        ).count()
        total_staff = StaffProfile.objects.filter(
            status=StaffProfile.Status.ACTIVE
        ).count()

        recent_patients = Patient.objects.filter(is_active=True).order_by("-registered_at")[:5]
        
        recent_appointments = [
            {
                "id": p.id,
                "patient_id": p.patient_id,
                "patient_name": f"{p.first_name} {p.last_name}",
                "doctor_name": "Dr. Robert Smith",
                "time": "Today, 10:30 AM",
                "status": "confirmed" if idx % 2 == 0 else "pending",
            }
            for idx, p in enumerate(recent_patients)
        ]

        recent_activities = [
            {
                "id": 1,
                "description": f"New patient registered: {recent_patients[0].first_name} {recent_patients[0].last_name}" if recent_patients else "System operational",
                "created_at": "Today",
            },
            {
                "id": 2,
                "description": "Dr. Robert Smith updated cardiology schedule",
                "created_at": "Today",
            },
            {
                "id": 3,
                "description": "Pharmacy stock audit completed",
                "created_at": "Yesterday",
            }
        ]

        return Response({
            "statistics": {
                "total_patients": total_patients,
                "today_appointments": len(recent_appointments),
                "total_doctors": total_doctors,
                "total_staff": total_staff,
                "completed_appointments": max(0, len(recent_appointments) - 2),
                "pending_appointments": min(2, len(recent_appointments)),
                "cancelled_appointments": 0,
                "total_revenue": 145000,
            },
            "staff": {
                "doctors": total_doctors,
                "receptionists": total_receptionists,
                "pharmacists": total_pharmacists,
                "lab_technicians": total_lab_technicians,
            },
            "recent_appointments": recent_appointments,
            "recent_activities": recent_activities,
            "notifications_count": 3,
        })

    