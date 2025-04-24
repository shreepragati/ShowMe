from django.db import models

# Create your models here.
from django.db import models
from django.conf import settings

class Post(models.Model):
    TEXT = 'text'
    IMAGE = 'image'
    VIDEO = 'video'

    POST_TYPES = [
        (TEXT, 'Text'),
        (IMAGE, 'Image'),
        (VIDEO, 'Video'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    post_type = models.CharField(max_length=10, choices=POST_TYPES, default=TEXT)
    text_content = models.TextField(blank=True, null=True)
    image = models.ImageField(upload_to='post_images/', blank=True, null=True)
    video = models.FileField(upload_to='post_videos/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        if self.video:
            self.post_type = self.VIDEO
        elif self.image:
            self.post_type = self.IMAGE
        elif self.text_content:
            self.post_type = self.TEXT
        else:
            self.post_type = self.TEXT
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.user.username} - {self.post_type} ({self.created_at})"
