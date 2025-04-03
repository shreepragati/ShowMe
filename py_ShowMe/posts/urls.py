from django.urls import path

app_name = 'posts'

from .views import PostListCreateView

urlpatterns = [
    path('posts/', PostListCreateView.as_view(), name='post-list-create'),
]