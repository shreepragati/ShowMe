from django.urls import path
from .views import SendMessageView, ConversationView

urlpatterns = [
    path('send/', SendMessageView.as_view(), name='send-message'),
    path('conversation/<str:username>/', ConversationView.as_view(), name='conversation'),
]
