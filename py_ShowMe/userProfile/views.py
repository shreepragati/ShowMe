import requests
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.decorators import api_view, permission_classes
from .serializers import UserRegistrationSerializer,ProfileUpdateSerializer,CurrentUserSerializer
from django.utils.text import slugify


# ✅ Register API
class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User registered successfully!"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# ✅ Login API (Returns JWT Tokens)
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(username=username, password=password)

        if user is not None:
            refresh = RefreshToken.for_user(user)
            user_data = CurrentUserSerializer(user).data  # Serialize user data

            return Response({
                "message": "Login successful!",
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": user_data
            })

        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

# ✅ Logout API (Blacklist the refresh token)
class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()  # Blacklist the token so it cannot be reused
            return Response({"message": "Logged out successfully!"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
        
# ✅ Profile Update API
class ProfileUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = request.user.profile
        serializer = ProfileUpdateSerializer(profile)
        return Response(serializer.data)

    def put(self, request):
        profile = request.user.profile
        serializer = ProfileUpdateSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated successfully", "data": serializer.data})
        return Response(serializer.errors, status=400)

GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo"

def generate_unique_username(base_name):
    username = slugify(base_name)
    counter = 1
    while User.objects.filter(username=username).exists():
        username = f"{slugify(base_name)}{counter}"
        counter += 1
    return username


@api_view(['POST'])
@permission_classes([AllowAny])
def google_login(request):
    token = request.data.get('token')
    if token is None:
        return Response({'error': 'Token is required'}, status=400)

    print("🔐 Token received from frontend:", token)

    # Verify token with Google
    response = requests.get("https://oauth2.googleapis.com/tokeninfo", params={'id_token': token})
    print("🌐 Google response status:", response.status_code)
    print("🌐 Google response content:", response.text)

    if response.status_code != 200:
        return Response({'error': 'Invalid token'}, status=400)

    data = response.json()
    email = data.get('email')
    name = data.get('name')

    if not email:
        return Response({'error': 'Email not available'}, status=400)

    # Check if user exists by email
    user = User.objects.filter(email=email).first()

    if not user:
        username = generate_unique_username(name)
        user = User.objects.create(
            username=username,
            email=email,
            first_name=name.split(' ')[0],
            last_name=' '.join(name.split(' ')[1:])
        )

    refresh = RefreshToken.for_user(user)
    user_data = CurrentUserSerializer(user).data

    return Response({
        'refresh': str(refresh),
        'access': str(refresh.access_token),
        'user': user_data
    })

# userProfile/views.py
from rest_framework.generics import ListAPIView
from .serializers import UserListSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class UserListView(ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserListSerializer
