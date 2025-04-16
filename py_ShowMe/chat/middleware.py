from urllib.parse import parse_qs
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from django.conf import settings

import jwt
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        from django.contrib.auth.models import AnonymousUser  # Import here
        from django.contrib.auth import get_user_model  # Import here

        User = get_user_model()

        try:
            query_string = scope["query_string"].decode()
            token = parse_qs(query_string).get("token")
            if token:
                token_value = token[0]
                try:
                    payload = jwt.decode(token_value, settings.SECRET_KEY, algorithms=["HS256"])
                    user_id = payload.get("user_id")
                    scope["user"] = await self.get_user(user_id)
                except (jwt.DecodeError, InvalidToken, TokenError) as e:
                    print(f"JWT Decode Error: {e}")  # Log the error
                    scope["user"] = AnonymousUser()
            else:
                scope["user"] = AnonymousUser()
        except Exception as e:
            print(f"Exception in JWTAuthMiddleware: {e}")
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def get_user(self, user_id):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None  # Or raise an exception, depending on your needs
