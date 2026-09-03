from rest_framework.authentication import TokenAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


class BearerOrTokenAuthentication(JWTAuthentication):
    """
    Accepts both JWT 'Bearer <jwt_token>' and standard Token 'Token <token>' / 'Bearer <token>'.
    """

    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            return None

        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None

        # 1. Try JWT authentication first
        try:
            validated_token = self.get_validated_token(raw_token)
            return self.get_user(validated_token), validated_token
        except (InvalidToken, TokenError):
            pass

        # 2. Fallback to standard TokenAuthentication
        try:
            token_auth = TokenAuthentication()
            auth_str = raw_token.decode("utf-8") if isinstance(raw_token, bytes) else str(raw_token)
            return token_auth.authenticate_credentials(auth_str)
        except Exception:
            return None
