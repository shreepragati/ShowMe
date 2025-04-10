# search/signals.py

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from userProfile.models import Profile
from .documents.profile_document import ProfileDocument

@receiver(post_save, sender=Profile)
def update_profile_document(sender, instance, **kwargs):
    ProfileDocument().update(instance)

@receiver(post_delete, sender=Profile)
def delete_profile_document(sender, instance, **kwargs):
    ProfileDocument().delete(instance)
