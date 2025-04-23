from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Notification
from .serializers import NotificationSerializer
from .consumers import NotificationConsumer
import asyncio

class NotificationViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def list(self, request):
        """
        Retrieve the current user's notifications with optional filters.
        Supports: ?unread=true&type=message
        """
        notifications = Notification.objects.filter(user=request.user)

        notif_type = request.query_params.get('type')
        unread_only = request.query_params.get('unread') == 'true'

        if notif_type:
            notifications = notifications.filter(type=notif_type)
        if unread_only:
            notifications = notifications.filter(read=False)

        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['POST'])
    def read(self, request, pk=None):
        """
        Mark a specific notification as read.
        """
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
            notification.read = True
            notification.save()
            return Response({'status': 'Notification marked as read.'}, status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response({'status': 'Notification not found.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['POST'])
    def mark_all_read(self, request):
        """
        Mark all of the current user's notifications as read.
        """
        Notification.objects.filter(user=request.user, read=False).update(read=True)
        return Response({'status': 'All notifications marked as read.'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['POST'])
    def create_notification(self, request):
        """
        Create a new notification manually via POST.
        (Optional helper route if you want to trigger notifications outside signals/views)
        """
        data = request.data
        required_fields = ['user_id', 'type', 'sender_id', 'sender_username']

        for field in required_fields:
            if not data.get(field):
                return Response({f'error': f'{field} is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            from django.contrib.auth import get_user_model
            User = get_user_model()
            receiver = User.objects.get(id=data['user_id'])
            sender = User.objects.get(id=data['sender_id'])
        except User.DoesNotExist:
            return Response({'error': 'Sender or receiver not found.'}, status=status.HTTP_404_NOT_FOUND)

        notification = Notification.objects.create(
            user=receiver,
            sender=sender,
            type=data['type'],
            sender_id=str(sender.id),
            sender_username=sender.username,
            content=data.get('content', '')
        )
        notification_data = {
        'user_id': receiver.id,
        'type': data['type'],
        'senderId': sender.id,
        'content': data.get('content', ''),
        }
        asyncio.run(NotificationConsumer.send_notification_to_user(receiver.id, notification_data))
        serializer = NotificationSerializer(notification)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
