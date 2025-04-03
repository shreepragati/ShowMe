from django.urls import path
from .views import SendFriendRequest, AcceptFriendRequest, FriendList

app_name = "friends"

urlpatterns = [
    path('send-request/<int:user_id>/', SendFriendRequest.as_view(), name='send_request'),
    path('accept-request/<int:request_id>/', AcceptFriendRequest.as_view(), name='accept_request'),
    path('list/', FriendList.as_view(), name='friend_list'),
]
