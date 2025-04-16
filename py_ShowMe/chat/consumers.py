# consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.other_username = self.scope['url_route']['kwargs']['username']
        self.user = self.scope["user"]

        # Close the connection if the user is not authenticated
        if not self.user.is_authenticated:
            await self.close()
            return

        # Define room name based on user and other user's usernames
        self.room_name = self.get_room_name(self.scope["user"].username, self.scope["url_route"]["kwargs"]["username"])
        self.room_group_name = f"chat_{self.room_name}"

        # Add this user to the WebSocket group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        print("WebSocket connection received!")
        print(f"Connecting: user={self.user}, other={self.other_username}, room={self.room_group_name}")

        # Accept the WebSocket connection
        await self.accept()

    async def disconnect(self, close_code):
        # Remove the user from the group when they disconnect
        if hasattr(self, 'room_group_name'):
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        # Receive a message from WebSocket
        print("Received WebSocket data:", text_data)
        try:
            data = json.loads(text_data)
            print("Parsed JSON data in receive:", data)
            content = data.get('content')
            temp_id = data.get('temp_id')  # Handle temp_id if present

            sender = self.user
            receiver = await self.get_user(self.other_username)

            if receiver and content:  # Ensure content exists
                # Save the message to the database
                saved_message = await self.save_message(sender, receiver, content)
                print("Saved message to database:", saved_message)

                # Send the message to the WebSocket group
                event = {
                    'type': 'chat_message',
                    'content': content,
                    'sender': sender.username,
                    'timestamp': saved_message.timestamp.isoformat(),
                    'temp_id': temp_id  # Optional, only used for echo filter
                }
                await self.channel_layer.group_send(
                    self.room_group_name,
                    event
                )
                print("Sent message to group:", event)
            else:
                print("Receiver not found or content is empty.")
        except json.JSONDecodeError:
            print("Invalid JSON received:", text_data)
        except KeyError as e:
            print(f"Missing key in JSON: {e}")

    async def chat_message(self, event):
        # Send a chat message to WebSocket
        print("chat_message event received:", event)
        message_to_send = {
            'sender': event['sender'],
            'content': event['content'],
            'timestamp': event['timestamp'],
            'temp_id': event.get('temp_id')
        }
        await self.send(text_data=json.dumps(message_to_send))
        print("Sent message to WebSocket:", message_to_send)


    def get_room_name(self, username1, username2):
        # Create a unique room name based on the users' usernames
        return '_'.join(sorted([username1, username2]))

    @database_sync_to_async
    def get_user(self, username):
        # Get the user object from the database based on the username
        from django.contrib.auth.models import User
        try:
            user = User.objects.get(username=username)
            print(f"Retrieved user from database: {user}")
            return user
        except User.DoesNotExist:
            print(f"User with username '{username}' not found.")
            return None

    @database_sync_to_async
    def save_message(self, sender, receiver, message):
        from .models import Message, ChatRoom
        room_name = self.get_room_name(sender.username, receiver.username)

        # Get or create the ChatRoom
        room, created = ChatRoom.objects.get_or_create(name=room_name)
        if created:
            print(f"ChatRoom '{room_name}' created.")
        else:
            print(f"ChatRoom '{room_name}' found.")

        # Ensure both users are added to the room
        room.users.add(sender, receiver)
        print(f"Added users '{sender.username}' and '{receiver.username}' to room '{room_name}'.")

        # Save the message to the database with the room
        message_obj = Message.objects.create(room=room, sender=sender, receiver=receiver, content=message)
        print("Message object created:", message_obj)
        return message_obj