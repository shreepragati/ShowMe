from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from userProfile.models import Profile
from posts.models import Post
from follows.models import Follow  # ✅ Updated
from .serializers import ProfileSerializer, PostSerializer

class UserDetailWithPostsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        target_user = get_object_or_404(User, username=username)
        target_profile = get_object_or_404(Profile, user=target_user)
        requesting_user = request.user

        # Relationship logic
        if requesting_user == target_user:
            follow_status = "self"
            can_view_posts = True
        elif Follow.objects.filter(follower=requesting_user, following=target_user, accepted=True).exists() and \
             Follow.objects.filter(follower=target_user, following=requesting_user, accepted=True).exists():
            follow_status = "mutual"
            can_view_posts = True
        elif Follow.objects.filter(follower=requesting_user, following=target_user, accepted=False).exists():
            follow_status = "requested"
            can_view_posts = False
        elif Follow.objects.filter(follower=target_user, following=requesting_user, accepted=False).exists():
            follow_status = "request_received"
            can_view_posts = False
        elif target_profile.privacy == 'public':
            follow_status = "not_following"
            can_view_posts = True
        else:
            follow_status = "not_following"
            can_view_posts = False

        # Post logic
        posts_qs = Post.objects.filter(user=target_user) if can_view_posts else Post.objects.none()
        post_data = PostSerializer(posts_qs, many=True).data

        # Counts
        followers_count = Follow.objects.filter(following=target_user, accepted=True).count()
        following_count = Follow.objects.filter(follower=target_user, accepted=True).count()
        posts_count = posts_qs.count()

        # Mutual follows
        my_following_ids = Follow.objects.filter(follower=requesting_user, accepted=True).values_list('following_id', flat=True)
        target_following_ids = Follow.objects.filter(follower=target_user, accepted=True).values_list('following_id', flat=True)
        mutual_follow_count = len(set(my_following_ids) & set(target_following_ids))

        profile_data = ProfileSerializer(target_profile).data

        return Response({
            "profile": profile_data,
            "follow_status": follow_status,
            "followers_count": followers_count,
            "following_count": following_count,
            "mutual_follow_count": mutual_follow_count,
            "posts_count": posts_count,
            "posts": post_data
        })
