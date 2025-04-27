# profileview/serializers.py

from rest_framework import serializers
from posts.models import Post
from userProfile.models import Profile
from django.contrib.auth.models import User
from userProfile.models import Profile
import os

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    email = serializers.EmailField(source='user.email')
    first_name = serializers.CharField(source='user.first_name')
    last_name = serializers.CharField(source='user.last_name')
    profile_pic = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['username', 'email', 'first_name', 'last_name', 'bio', 'dob', 'profile_pic', 'privacy']

    def get_profile_pic(self, obj):
        if obj.profile_pic:
            url = obj.profile_pic.url
            # Fix malformed URL (common if colon is missed)
            if url.startswith("https//"):
                url = url.replace("https//", "https://")
            elif url.startswith("http//"):
                url = url.replace("http//", "http://")
            return url
        return None

    def update(self, instance, validated_data):
        # Update User model fields
        user_data = validated_data.pop('user', {})
        for attr, value in user_data.items():
            setattr(instance.user, attr, value)
        instance.user.save()

        # Handle profile picture replacement
        new_picture = validated_data.get("profile_pic", None)
        if new_picture:
            if instance.profile_pic:
                instance.profile_pic.delete(save=False)
            instance.profile_pic = new_picture

        # Update other Profile model fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance



class PostSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    user_id = serializers.ReadOnlyField(source='user.id')
    profile_pic = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    video = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'user', 'user_id', 'text_content', 'image', 'video', 'created_at', 'profile_pic']

    def get_profile_pic(self, obj):
        if hasattr(obj.user, 'profile') and obj.user.profile.profile_pic:
            url = obj.user.profile.profile_pic.url
            if url.startswith("https//"):
                url = url.replace("https//", "https://")
            elif url.startswith("http//"):
                url = url.replace("http//", "http://")
            return url
        return None

    def get_image(self, obj):
        if obj.image:
            url = obj.image.url
            if url.startswith("https//"):
                url = url.replace("https//", "https://")
            elif url.startswith("http//"):
                url = url.replace("http//", "http://")
            return url
        return None

    def get_video(self, obj):
        if obj.video:
            url = obj.video.url
            if url.startswith("https//"):
                url = url.replace("https//", "https://")
            elif url.startswith("http//"):
                url = url.replace("http//", "http://")
            return url
        return None
