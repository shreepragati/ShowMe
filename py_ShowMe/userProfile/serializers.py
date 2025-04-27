from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Profile
import os
from django.conf import settings

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    privacy = serializers.ChoiceField(choices=Profile.PRIVACY_CHOICES, write_only=True, required=False)
    print("📋 Privacy received in serializer:", privacy)  # DEBUG

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'privacy']

    def create(self, validated_data):
        privacy = validated_data.pop('privacy', 'public')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        Profile.objects.create(user=user, privacy=privacy)
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
        # 1. Update User model fields
        user_data = validated_data.pop('user', {})
        for attr, value in user_data.items():
            setattr(instance.user, attr, value)
        instance.user.save()

        # 2. Handle profile_pic update (S3 and local storage)
        if 'profile_pic' in validated_data:
            new_picture = validated_data.pop("profile_pic")

            if new_picture:  # Only if a new picture is provided
                # Delete old picture
                if instance.profile_pic:
                    instance.profile_pic.delete(save=False)

                instance.profile_pic = new_picture  # Assign the new picture

        # 3. Update other Profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if instance.profile_pic:
            url = instance.profile_pic.url
            if url.startswith("https//"):
                url = url.replace("https//", "https://")
            elif url.startswith("http//"):
                url = url.replace("http//", "http://")
            rep['profile_pic'] = url
        return rep




class CurrentUserSerializer(serializers.ModelSerializer):
    profile_pic = serializers.SerializerMethodField()


    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'profile_pic']

    def get_profile_pic(self, obj):
        if hasattr(obj, 'profile') and obj.profile and obj.profile.profile_pic:
            url = obj.profile.profile_pic.url
            # Fix common typo if present
            if url.startswith("https//"):
                url = url.replace("https//", "https://")
            elif url.startswith("http//"):
                url = url.replace("http//", "http://")
            return url
        return None



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
