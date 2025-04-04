from django.urls import path
from .views import RegisterView, LoginView, LogoutView, ProfileUpdateView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='api_register'),
    path('login/', LoginView.as_view(), name='api_login'),
    path('logout/', LogoutView.as_view(), name='api_logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
     path('profile/edit/', ProfileUpdateView.as_view(), name='edit-profile'),
]
