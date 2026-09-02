from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers

User = get_user_model()


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=False)
    username_or_email = serializers.CharField(required=False)
    password = serializers.CharField(
        write_only=True,
        style={"input_type": "password"}
    )

    def validate(self, attrs):
        username = attrs.get("username") or attrs.get("username_or_email")
        password = attrs.get("password")

        if not username:
            raise serializers.ValidationError(
                {"username_or_email": "Please provide a username or email."}
            )

        # Check if email was provided instead of username
        if "@" in username:
            user_obj = User.objects.filter(email__iexact=username).first()
            if user_obj:
                username = user_obj.username

        user = authenticate(
            username=username,
            password=password
        )

        if user is None:
            raise serializers.ValidationError(
                "Invalid username or password."
            )

        if not user.is_active:
            raise serializers.ValidationError(
                "This account is inactive."
            )

        attrs["user"] = user
        return attrs