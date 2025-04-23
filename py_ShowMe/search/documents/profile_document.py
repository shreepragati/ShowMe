# search/documents/profile_document.py

from django_elasticsearch_dsl import Document, Index, fields
from django_elasticsearch_dsl.registries import registry
from userProfile.models import Profile

profile_index = Index('profiles')
profile_index.settings(
    number_of_shards=1,
    number_of_replicas=0
)

@registry.register_document
class ProfileDocument(Document):
    username = fields.TextField(attr='user.username')  # Search by username
    bio = fields.TextField()  # Make 'bio' searchable as full text

    class Index:
        name = 'profiles'

    class Django:
        model = Profile
        fields = [
            'privacy',
            'profile_pic',
        ]