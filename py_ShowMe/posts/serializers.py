from rest_framework import serializers
from .models import Post

class PostSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    user_id = serializers.ReadOnlyField(source='user.id')
    profile_pic = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = ['id', 'user','user_id', 'text_content', 'image', 'video', 'created_at','profile_pic']
    def get_profile_pic(self, obj):
        if hasattr(obj.user, 'profile') and obj.user.profile.profile_pic:
            return self._clean_url(obj.user.profile.profile_pic.url)
        return None

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.image:
            representation['image'] = self._clean_url(instance.image.url)
        if instance.video:
            representation['video'] = self._clean_url(instance.video.url)
        return representation

    def _clean_url(self, url):
        if url.startswith("https//"):
            return url.replace("https//", "https://")
        elif url.startswith("http//"):
            return url.replace("http//", "http://")
        return url