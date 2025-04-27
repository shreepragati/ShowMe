# follows/serializers.py
from rest_framework import serializers
from .models import Follow
from django.contrib.auth import get_user_model

User = get_user_model()

class SimpleUserSerializer(serializers.ModelSerializer):
    profile_pic = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'profile_pic']

    def get_profile_pic(self, obj):
        if hasattr(obj, 'profile') and obj.profile and obj.profile.profile_pic:
            url = obj.profile.profile_pic.url
            # Fix malformed URL if needed
            if url.startswith("https//"):
                url = url.replace("https//", "https://")
            elif url.startswith("http//"):
                url = url.replace("http//", "http://")
            return url
        return None



class FollowSerializer(serializers.ModelSerializer):
    follower = SimpleUserSerializer(read_only=True)
    following = SimpleUserSerializer(read_only=True)

    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'accepted', 'created_at']
