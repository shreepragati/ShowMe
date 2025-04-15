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

    class Meta:
        model = Profile
        fields = ['username', 'email', 'first_name', 'last_name', 'bio', 'dob', 'profile_pic', 'privacy']

    def update(self, instance, validated_data):
        # Update User model fields
        user_data = validated_data.pop('user', {})
        for attr, value in user_data.items():
            setattr(instance.user, attr, value)
        instance.user.save()

        # Handle profile picture replacement
        new_picture = validated_data.get("profile_pic", None)
        if new_picture and instance.profile_pic:
            old_path = instance.profile_pic.path
            if os.path.exists(old_path):
                os.remove(old_path)

        # Update Profile model fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        return instance


class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['id', 'post_type', 'text_content', 'image', 'video', 'created_at']
