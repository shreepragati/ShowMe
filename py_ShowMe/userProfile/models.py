# Create your models here.
from django.contrib.auth.models import User
from django.db import models

class Profile(models.Model):
    PUBLIC = 'public'
    PRIVATE = 'private'
    PRIVACY_CHOICES = [
        ('public', 'Public'),
        ('private', 'Private'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    bio = models.TextField(blank=True)
    dob = models.DateField(null=True, blank=True)
    profile_pic = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    privacy = models.CharField(max_length=10, choices=PRIVACY_CHOICES, default='public')

    def __str__(self):
        return f"{self.user.username} - {self.privacy}"
