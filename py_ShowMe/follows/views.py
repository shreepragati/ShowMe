from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from userProfile.models import Profile
from .models import Follow
from django.contrib.auth import get_user_model

User = get_user_model()

class FollowUser(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, user_id):
        follower = request.user
        following = get_object_or_404(User, id=user_id)

        if follower == following:
            return Response({"message": "You can't follow yourself."}, status=status.HTTP_400_BAD_REQUEST)

        if Follow.objects.filter(follower=follower, following=following).exists():
            return Response({"message": "Follow request already sent or you already follow this user."}, status=status.HTTP_400_BAD_REQUEST)

        profile = following.profile
        if profile.privacy == 'public':
            Follow.objects.create(follower=follower, following=following, accepted=True)
            return Response({"message": "Followed successfully!"})
        else:
            Follow.objects.create(follower=follower, following=following, accepted=False)
            return Response({"message": "Follow request sent. Awaiting approval."})

class AcceptFollowRequest(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, follow_id):
        follow = get_object_or_404(Follow, id=follow_id, following=request.user, accepted=False)
        follow.accepted = True
        follow.save()
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
                {"id": f.follower.id, "username": f.follower.username}
                for f in followers_qs
            ],
            "following": [
                {"id": f.following.id, "username": f.following.username}
                for f in following_qs
            ],
            "mutual_follows": [
                {"id": u.id, "username": u.username}
                for u in User.objects.filter(id__in=mutual_ids)
            ],
            "requests_sent": [
                {"id": f.id, "to_user_id": f.following.id, "username": f.following.username}
                for f in requests_sent_qs
            ],
            "requests_received": [
                {"id": f.id, "from_user_id": f.follower.id, "username": f.follower.username}
                for f in requests_received_qs
            ]
        })


