import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from channels.layers import get_channel_layer


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user_id = self.scope['url_route']['kwargs']['user_id']
        self.group_name = f'user_notifications_{self.user_id}'

        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()
        print(f"✅ [Connected to Notification WebSocket] User: {self.user_id}, Group: {self.group_name}")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
        print(f"❌ [Disconnected from Notification WebSocket] User: {self.user_id}, Group: {self.group_name}, Code: {close_code}")

    async def receive(self, text_data):
        # No action needed from frontend messages yet.  Log if needed for debugging.
        print(f"📩 [Received message] User: {self.user_id}, Data: {text_data}")
        pass

    @staticmethod
    @database_sync_to_async
    def create_notification(notification_data):
        """Creates a notification in the database."""
        from .models import Notification  # Import here to avoid AppRegistryNotReady
        notification = Notification.objects.create(
            user_id=notification_data['user_id'],
            type=notification_data['type'],
            sender_id=notification_data['senderId'],  # Use sender_id as foreign key ID
            content=notification_data.get('content', ''),
        )
        notification_id = notification.id  # Get the ID *before* serialization
        print(f"✅ [Notification Created] ID: {notification_id}, Data: {notification_data}")
        return notification_id


    @staticmethod
    @database_sync_to_async
    def get_notification_data(notification_id):
        """Fetch notification data for sending over WebSocket."""
        from .models import Notification  # Import here
        from .serializers import NotificationSerializer  # Import here
        try:
            notification = Notification.objects.get(id=notification_id)
            serializer = NotificationSerializer(notification)
            return serializer.data
        except Notification.DoesNotExist:
            return None

    async def send_notification(self, event):
        """Send a notification over the WebSocket."""
        notification_id = event['notification_id']
        notification_data = await self.get_notification_data(notification_id)  # Await here

        if notification_data:
            await self.send(text_data=json.dumps(notification_data))
            print(f"📢 [Sent notification] User: {self.user_id}, Notification ID: {notification_id}, Data: {notification_data}")  # Log the sending

    @staticmethod
    async def send_notification_to_user(user_id, notification_data):
        """
        Static method to be called from views or signals.
        Creates notification + pushes it over WebSocket.
        """
        channel_layer = get_channel_layer()

        # Create notification and get its ID
        notification_id = await NotificationConsumer.create_notification(
            notification_data
        )  # Await here
        print(f"📣 [Creating and sending notification]  Notification ID: {notification_id} to user {user_id}")

        # Send event to group
        await channel_layer.group_send(
            f'user_notifications_{user_id}',
            {
                'type': 'send_notification',
                'notification_id': notification_id,
            },
        )
        print(f"📣 [Sending notification] Notification ID: {notification_id} to user {user_id}")

