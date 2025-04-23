# views.py

from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.contrib.auth.models import User
from .models import Message
from notifications.models import Notification,NotificationType # Assuming you have a Notification model
from .serializers import MessageSerializer

class SendMessageView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        print("📩 SendMessageView called")
        receiver_username = request.data.get("receiver_username")
        content = request.data.get("content")

        # Ensure both receiver and content are provided
        if not receiver_username or not content:
            return Response({"error": "receiver_username and content are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            receiver = User.objects.get(username=receiver_username)
        except User.DoesNotExist:
            return Response({"error": "Receiver not found."}, status=status.HTTP_404_NOT_FOUND)

        # Save the message
        message = Message.objects.create(sender=request.user, receiver=receiver, content=content)
        # Inside SendMessageView (after Notification.objects.create)
        print(f"Creating message notification: from {request.user.username} to {receiver.username}")
        print(f"Message created: {message.content}")


        # Create a notification for the recipient
        try:
            Notification.objects.create(
                user=receiver,
                content=f"You have a new message from {request.user.username}",
                sender=request.user,
                type=NotificationType.MESSAGE,
            )
            print(f"✅ Notification created for message from {request.user.username} to {receiver.username}")
        except Exception as e:
            print(f"❌ Failed to create message notification: {e}")


        # Serialize the message to return in the response
        serializer = MessageSerializer(message)

        # Return the serialized message in the response
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class ConversationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        try:
            # Fetch the other user by username
            other_user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        # Fetch messages between the current user and the other user
        messages = Message.objects.filter(
            sender__in=[request.user, other_user],
            receiver__in=[request.user, other_user]
        ).order_by("timestamp")

        # Serialize the messages
        serializer = MessageSerializer(messages, many=True)
        return Response(serializer.data)
