from django.urls import path

app_name = 'posts'

from .views import PostListCreateView,PostDetailView

urlpatterns = [
    path('posts/', PostListCreateView.as_view(), name='post-list-create'),
    path('posts/<int:pk>/', PostDetailView.as_view(), name='post-detail'),
]