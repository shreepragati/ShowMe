from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Post
from .serializers import PostSerializer
from userProfile.models import Profile
from rest_framework import status

from follows.models import Follow  

class PostListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # Get all public users
        public_users = Profile.objects.filter(privacy=Profile.PUBLIC).values_list('user', flat=True)

        # Get private users that the current user follows AND the follow is accepted
        private_following = Follow.objects.filter(
            follower=user,
            accepted=True,
            following__profile__privacy=Profile.PRIVATE
        ).values_list('following', flat=True)

        # Combine both sets
        visible_user_ids = set(public_users) | set(private_following) | {user.id}

        # Fetch posts
        posts = Post.objects.filter(user__in=visible_user_ids).order_by('-created_at')

        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PostSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


class PostDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            post = Post.objects.get(pk=pk)
        except Post.DoesNotExist:
            return Response({"error": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

        if post.user != request.user:
            return Response({"error": "You do not have permission to delete this post."}, status=status.HTTP_403_FORBIDDEN)

        post.delete()
        return Response({"message": "Post deleted successfully."}, status=status.HTTP_204_NO_CONTENT)