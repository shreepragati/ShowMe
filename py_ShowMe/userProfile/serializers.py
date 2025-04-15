from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile
import os
from django.conf import settings

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class ProfileUpdateSerializer(serializers.ModelSerializer):
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


class CurrentUserSerializer(serializers.ModelSerializer):
    profile_pic = serializers.ImageField(source='profile.profile_pic')

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile_pic']

# userProfile/serializers.py
from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Profile  # if you have a separate Profile model

User = get_user_model()

class UserListSerializer(serializers.ModelSerializer):
    profile = serializers.StringRelatedField()  # or create a nested serializer if needed

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile']  # Add other fields as required
