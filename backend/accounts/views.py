from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import LoginSerializer


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.validated_data["user"]

            # Generate JWT Tokens
            refresh = RefreshToken.for_user(user)
            refresh["role"] = user.role
            refresh["username"] = user.username
            refresh["email"] = user.email

            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            # DRF Token for fallback
            token, _ = Token.objects.get_or_create(user=user)

            return Response({
                "message": "Login successful",
                "access": access_token,
                "refresh": refresh_token,
                "token": access_token,
                "token_type": "Bearer",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": user.role,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                }
            }, status=status.HTTP_200_OK)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )