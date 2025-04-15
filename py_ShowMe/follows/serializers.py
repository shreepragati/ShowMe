# follows/serializers.py
from rest_framework import serializers
from .models import Follow
from django.contrib.auth import get_user_model

User = get_user_model()

class SimpleUserSerializer(serializers.ModelSerializer):
    profile_pic = serializers.ImageField(source='profile.profile_pic')
    class Meta:
        model = User
        fields = ['id', 'username', 'profile_pic']



class FollowSerializer(serializers.ModelSerializer):
    follower = SimpleUserSerializer(read_only=True)
    following = SimpleUserSerializer(read_only=True)

    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'accepted', 'created_at']
