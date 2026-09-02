from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

# from .permissions import IsAdminRole

from .serializers import LoginSerializer


class LoginView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():

            user = serializer.validated_data["user"]

            token, created = Token.objects.get_or_create(
                user=user
            )

            return Response({
                "message": "Login successful",
                "token": token.key,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role,
<<<<<<< HEAD
                    "first_name": user.first_name,
                    "last_name": user.last_name,
=======
>>>>>>> 542af1449569d94938888abbe2cb0526e80c41ba
                }
            })

        return Response(
            serializer.errors,
            status=400
        )

# class AdminTestView(APIView):

#     permission_classes = [
#         IsAuthenticated,
#         IsAdminRole,
#     ]

#     def get(self, request):
#         return Response({
#             "message": "Admin access granted",
#             "username": request.user.username,
#             "role": request.user.role,
#         })