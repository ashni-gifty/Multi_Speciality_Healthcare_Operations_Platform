from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers

User = get_user_model()


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=False, allow_blank=True)
    username_or_email = serializers.CharField(
        required=False,
        allow_blank=True
    )
    password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"}
    )

    def validate(self, attrs):
        username = (
            attrs.get("username")
            or attrs.get("username_or_email")
        )
        password = attrs.get("password")

        if not username:
            raise serializers.ValidationError({
                "detail": "Please provide a username or email."
            })

        if not password:
            raise serializers.ValidationError({
                "detail": "Please provide a password."
            })

        # Allow login using email
        if "@" in username:
            user_obj = User.objects.filter(
                email__iexact=username
            ).first()

            if user_obj:
                username = user_obj.username

        user = authenticate(
            username=username,
            password=password
        )

        if user is None:
            raise serializers.ValidationError({
                "detail": "Invalid username or password."
            })

        if not user.is_active:
            raise serializers.ValidationError({
                "detail": "This account is inactive."
            })

        attrs["user"] = user
        return attrs