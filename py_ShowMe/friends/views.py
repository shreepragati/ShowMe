from rest_framework import status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import Friendship
from .serializers import FriendshipSerializer

User = get_user_model()

class SendFriendRequest(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        receiver = get_object_or_404(User, id=user_id)
        
        # Prevent duplicate friend requests
        if request.user == receiver or Friendship.objects.filter(sender=request.user, receiver=receiver).exists():
            return Response({"message": "Friend request already sent or invalid"}, status=status.HTTP_400_BAD_REQUEST)
        
        friendship = Friendship.objects.create(sender=request.user, receiver=receiver)
        return Response({"message": "Friend request sent"}, status=status.HTTP_201_CREATED)


class AcceptFriendRequest(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, request_id):
        friendship = get_object_or_404(Friendship, id=request_id, receiver=request.user)
        friendship.accepted = True
        friendship.save()

        return Response({"message": "Friend request accepted"}, status=status.HTTP_200_OK)


class FriendList(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        friends = User.objects.filter(
            id__in=Friendship.objects.filter(accepted=True, sender=request.user).values_list('receiver', flat=True)
        ) | User.objects.filter(
            id__in=Friendship.objects.filter(accepted=True, receiver=request.user).values_list('sender', flat=True)
        )

        pending_requests = Friendship.objects.filter(receiver=request.user, accepted=False)

        return Response({
            "friends": [{"id": friend.id, "username": friend.username} for friend in friends],
            "pending_requests": [{"id": req.id, "sender": req.sender.username} for req in pending_requests]
        }, status=status.HTTP_200_OK)


#this is a view file