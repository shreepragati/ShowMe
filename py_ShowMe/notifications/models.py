from django.db import models
from django.conf import settings

class NotificationType(models.TextChoices):
    FOLLOW_REQUEST = 'follow_request', 'Follow Request'
    FOLLOW = 'follow', 'Follow'
    POST = 'post', 'Post'
    MESSAGE = 'message', 'Message'

class Notification(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='notifications',
        on_delete=models.CASCADE
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='sent_notifications',
        on_delete=models.CASCADE,
        null=True,
    )
    type = models.CharField(
        max_length=20,
        choices=NotificationType.choices
    )
    content = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    read = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'read']),
            models.Index(fields=['type']),
        ]

    def __str__(self):
        sender_username = self.sender.username if self.sender else "Unknown Sender"
        user_username = self.user.username if self.user else "Unknown User"
        print(f"Debug: Notification from {sender_username} to {user_username}")  # Debugging line
        return f'{self.type} from {sender_username} to {user_username}'
