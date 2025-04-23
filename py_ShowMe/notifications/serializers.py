from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Notification

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class NotificationSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)  # Add this only if you want detailed sender info
    sender_id = serializers.IntegerField(source='sender.id', read_only=True)
    sender_username = serializers.CharField(source='sender.username', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id',
            'type',
            'sender',          # optional nested field
            'sender_id',
            'sender_username',
            'content',
            'created_at',
            'read',
        ]
