from rest_framework.authentication import TokenAuthentication


class BearerOrTokenAuthentication(TokenAuthentication):
    """
    Accepts both 'Bearer <token>' and 'Token <token>' authorization headers.
    """
    keyword = "Token"

    def authenticate(self, request):
        auth = request.headers.get("Authorization", "").split()
        if not auth:
            return None

        if auth[0].lower() in ["token", "bearer"]:
            if len(auth) == 1:
                return None
            elif len(auth) > 2:
                return None
            return self.authenticate_credentials(auth[1])

        return None
