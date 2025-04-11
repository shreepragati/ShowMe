# follows/urls.py
from django.urls import path
from .views import FollowUser, AcceptFollowRequest, CancelFollowRequest, UnfollowUser, MyFollows

urlpatterns = [
    path('follow/<int:user_id>/', FollowUser.as_view(), name='follow-user'),
    path('accept/<int:follow_id>/', AcceptFollowRequest.as_view(), name='accept-follow'),
    path('cancel/<int:user_id>/', CancelFollowRequest.as_view(), name='cancel-follow'),
    path('unfollow/<int:user_id>/', UnfollowUser.as_view(), name='unfollow-user'),
    path('my-follows/', MyFollows.as_view(), name='my-follows'),
]
