from django import forms
from .models import Post

class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ['post_type', 'text_content', 'image', 'video']

    def clean(self):
        cleaned_data = super().clean()
        post_type = cleaned_data.get("post_type")
        text = cleaned_data.get("text_content")
        image = cleaned_data.get("image")
        video = cleaned_data.get("video")

        if post_type == 'text' and not text:
            raise forms.ValidationError("Text posts must have content.")
        if post_type == 'image' and not image:
            raise forms.ValidationError("Image posts must include an image.")
        if post_type == 'video' and not video:
            raise forms.ValidationError("Video posts must include a video.")

        return cleaned_data