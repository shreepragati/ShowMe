import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Message
from django.contrib.auth.models import User
from follows.models import Follow

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        self.target_user_id = self.scope['url_route']['kwargs']['user_id']
        self.target_user = await database_sync_to_async(User.objects.get)(id=self.target_user_id)

        if await self.is_mutual_follow(self.user, self.target_user):
            self.room_name = f"chat_{min(self.user.id, self.target_user.id)}_{max(self.user.id, self.target_user.id)}"
            self.room_group_name = f"chat_{self.room_name}"

            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()
        else:
            await self.close()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']

        msg = await self.save_message(self.user, self.target_user, message)

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message': msg.content,
                'sender': self.user.username,
                'timestamp': msg.timestamp.strftime('%Y-%m-%d %H:%M:%S')
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    @database_sync_to_async
    def save_message(self, sender, receiver, message):
        return Message.objects.create(sender=sender, receiver=receiver, content=message)

    @database_sync_to_async
    def is_mutual_follow(self, user1, user2):
        return Follow.objects.filter(follower=user1, following=user2, accepted=True).exists() and \
               Follow.objects.filter(follower=user2, following=user1, accepted=True).exists()
