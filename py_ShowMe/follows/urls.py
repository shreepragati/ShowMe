from django.urls import path
from .views import (
    FollowUser, AcceptFollowRequest, CancelFollowRequest,
    UnfollowUser, MyFollows,
    FollowUserByUsername, CancelFollowRequestByUsername, UnfollowUserByUsername,UserFollows
)

urlpatterns = [
    path('follow/<int:user_id>/', FollowUser.as_view(), name='follow-user'),
    path('follow/<str:username>/', FollowUserByUsername.as_view(), name='follow-user-by-username'),

    path('accept/<int:follow_id>/', AcceptFollowRequest.as_view(), name='accept-follow'),

    path('cancel/<int:user_id>/', CancelFollowRequest.as_view(), name='cancel-follow'),
    path('cancel/<str:username>/', CancelFollowRequestByUsername.as_view(), name='cancel-follow-by-username'),

    path('unfollow/<int:user_id>/', UnfollowUser.as_view(), name='unfollow-user'),
    path('unfollow/<str:username>/', UnfollowUserByUsername.as_view(), name='unfollow-user-by-username'),

    path('my-follows/', MyFollows.as_view(), name='my-follows'),
    path('<str:username>/follows/', UserFollows.as_view(), name='user-follows'),

]
