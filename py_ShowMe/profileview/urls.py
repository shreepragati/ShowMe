# profileview/urls.py

from django.urls import path
from .views import UserDetailWithPostsView

urlpatterns = [
    path('user/<str:username>/', UserDetailWithPostsView.as_view(), name='user-detail-with-posts'),
]
