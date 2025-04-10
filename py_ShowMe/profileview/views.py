# profileview/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from userProfile.models import Profile
from posts.models import Post
from friends.models import Friendship
from django.contrib.auth.models import User
from .serializers import ProfileSerializer, PostSerializer


class UserDetailWithPostsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        target_user = get_object_or_404(User, username=username)
        target_profile = get_object_or_404(Profile, user=target_user)
        requesting_user = request.user

        # Determine relationship
        if requesting_user == target_user:
            friend_status = "self"
            can_view_posts = True
        elif Friendship.objects.filter(sender=requesting_user, receiver=target_user, accepted=True).exists() or \
             Friendship.objects.filter(sender=target_user, receiver=requesting_user, accepted=True).exists():
            friend_status = "friend"
            can_view_posts = True
        elif Friendship.objects.filter(sender=requesting_user, receiver=target_user, accepted=False).exists():
            friend_status = "requested"
            can_view_posts = False
        else:
            friend_status = "not_friend"
            can_view_posts = target_profile.privacy == 'public'

        profile_data = ProfileSerializer(target_profile).data

        if can_view_posts:
            posts = Post.objects.filter(user=target_user)
            post_data = PostSerializer(posts, many=True).data
        else:
            post_data = []

        return Response({
            "profile": profile_data,
            "posts": post_data,
            "friend_status": friend_status
        })
