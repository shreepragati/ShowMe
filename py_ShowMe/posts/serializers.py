from rest_framework import serializers
from .models import Post

class PostSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username')
    user_id = serializers.ReadOnlyField(source='user.id')
    profile_pic = serializers.ImageField(source='user.profile.profile_pic', read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'user','user_id', 'text_content', 'image', 'video', 'created_at','profile_pic']
