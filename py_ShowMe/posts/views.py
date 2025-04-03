from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import Post
from .serializers import PostSerializer
from userProfile.models import Profile
from friends.models import Friendship

class PostListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Fetch public users
        public_users = Profile.objects.filter(privacy=Profile.PUBLIC).values_list('user', flat=True)

        # Fetch private users who are friends with the logged-in user
        friends = Friendship.objects.filter(
            Q(sender=request.user) | Q(receiver=request.user), accepted=True
        ).values_list('sender', 'receiver')

        # Extract unique friend IDs
        friend_ids = set()
        for sender, receiver in friends:
            if sender != request.user.id:
                friend_ids.add(sender)
            if receiver != request.user.id:
                friend_ids.add(receiver)

        # Fetch posts from public users + friends who are private
        posts = Post.objects.filter(
            Q(user__in=public_users) | Q(user__in=friend_ids)
        ).order_by('-created_at')

        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = PostSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
