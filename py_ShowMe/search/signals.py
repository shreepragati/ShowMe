# search/signals.py

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from userProfile.models import Profile
from .documents.profile_document import ProfileDocument
from elasticsearch import NotFoundError

@receiver(post_save, sender=Profile)
def update_profile_document(sender, instance, **kwargs):
    ProfileDocument().update(instance)

@receiver(post_delete, sender=Profile)
def delete_profile_document(sender, instance, **kwargs):
    try:
        document = ProfileDocument.get(id=instance.pk)
        document.delete()
    except NotFoundError:
        # The document might not exist in Elasticsearch, which is okay when deleting
        pass
    except Exception as e:
        print(f"Error deleting ProfileDocument for ID {instance.pk}: {e}")
        # Optionally log the error
