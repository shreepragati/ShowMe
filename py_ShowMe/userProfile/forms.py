from django import forms
from django.contrib.auth.models import User
from .models import Profile

class UserRegistrationForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput)
    privacy = forms.ChoiceField(choices=Profile.PRIVACY_CHOICES, widget=forms.Select())

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'privacy']

    def save(self, commit=True):
        user = super().save(commit=False)
        user.set_password(self.cleaned_data['password'])
        if commit:
            user.save()
            Profile.objects.create(user=user, privacy=self.cleaned_data['privacy'])
        return user
