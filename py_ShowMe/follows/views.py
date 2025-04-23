from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from userProfile.models import Profile
from .models import Follow
from django.contrib.auth import get_user_model
from .serializers import FollowSerializer, SimpleUserSerializer
from notifications.models import Notification,NotificationType


User = get_user_model()

class FollowUser(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        follower = request.user
        following = get_object_or_404(User, id=user_id)

        if follower == following:
            return Response({"message": "You can't follow yourself."}, status=status.HTTP_400_BAD_REQUEST)

        existing_follow = Follow.objects.filter(follower=follower, following=following).first()
        if existing_follow:
            if existing_follow.accepted:
                return Response({"message": f"You already follow {following.username}."}, status=status.HTTP_200_OK)
            else:
                return Response({"message": f"Follow request to {following.username} already sent. Awaiting approval."}, status=status.HTTP_200_OK)

        profile = following.profile
        if profile.privacy == 'public':
            Follow.objects.create(follower=follower, following=following, accepted=True)
            Notification.objects.create(
                user=following,
                sender=follower,  # The user performing the action (follower)
                type=NotificationType.FOLLOW,
                content=f"{follower.username} started following you."
            )
            return Response({"message": f"Followed {following.username} successfully!"})
        else:
            Follow.objects.create(follower=follower, following=following, accepted=False)
            Notification.objects.create(
                user=following,
                sender=follower,  # The user performing the action (follower)
                type=NotificationType.FOLLOW_REQUEST,
                content=f"{follower.username} sent you a follow request."
            )
            return Response({"message": f"Follow request sent to {following.username}."})


class AcceptFollowRequest(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, follow_id):
        follow = get_object_or_404(Follow, id=follow_id, following=request.user, accepted=False)
        follow.accepted = True
        follow.save()
        Notification.objects.create(
            user=follow.follower,
            content=f"{request.user.username} accepted your follow request."
        )
        return Response({"message": "Follow request accepted."})

class CancelFollowRequest(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id):
        follow = Follow.objects.filter(follower=request.user, following__id=user_id, accepted=False).first()
        if follow:
            follow.delete()
            return Response({"message": "Follow request cancelled."})
        return Response({"message": "No pending follow request found."}, status=status.HTTP_404_NOT_FOUND)

class UnfollowUser(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, user_id):
        follow = Follow.objects.filter(follower=request.user, following__id=user_id, accepted=True).first()
        if follow:
            follow.delete()
            Notification.objects.create(
                user=follow.following,
                content=f"{request.user.username} unfollowed you."
            )
            return Response({"message": "Unfollowed successfully."})
        return Response({"message": "Follow relationship not found."}, status=status.HTTP_404_NOT_FOUND)

class MyFollows(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Accepted followers and following
        followers_qs = Follow.objects.filter(following=user, accepted=True)
        following_qs = Follow.objects.filter(follower=user, accepted=True)

        # Pending requests
        requests_sent_qs = Follow.objects.filter(follower=user, accepted=False)
        requests_received_qs = Follow.objects.filter(following=user, accepted=False)

        # Convert to sets for mutual follow check
        followers_set = set(f.follower.id for f in followers_qs)
        following_set = set(f.following.id for f in following_qs)
        mutual_ids = followers_set & following_set

        return Response({
            "followers": [
                SimpleUserSerializer(f.follower).data
                for f in followers_qs
            ],
            "following": [
                SimpleUserSerializer(f.following).data
                for f in following_qs
            ],
            "mutual_follows": SimpleUserSerializer(
                User.objects.filter(id__in=mutual_ids), many=True
            ).data,
            "requests_sent": [
                {
                    "id": f.id,
                    "to_user": SimpleUserSerializer(f.following).data
                }
                for f in requests_sent_qs
            ],
            "requests_received": [
                {
                    "id": f.id,
                    "from_user": SimpleUserSerializer(f.follower).data
                }
                for f in requests_received_qs
            ]
        })



class FollowUserByUsername(FollowUser):
    def post(self, request, username):
        user = get_object_or_404(User, username=username)
        return super().post(request, user_id=user.id)


class CancelFollowRequestByUsername(CancelFollowRequest):
    def delete(self, request, username):
        user = get_object_or_404(User, username=username)
        return super().delete(request, user_id=user.id)


class UnfollowUserByUsername(UnfollowUser):
    def delete(self, request, username):
        user = get_object_or_404(User, username=username)
        return super().delete(request, user_id=user.id)
