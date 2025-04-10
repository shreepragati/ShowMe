# profileview/serializers.py

from rest_framework import serializers
from posts.models import Post
from userProfile.models import Profile
from django.contrib.auth.models import User

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')

    class Meta:
        model = Profile
        fields = ['username', 'bio', 'dob', 'privacy', 'profile_pic']

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'post_type', 'text_content', 'image', 'video', 'created_at']
