from django.urls import path
from .views import SendMessageView, ConversationView

urlpatterns = [
    path('send/', SendMessageView.as_view(), name='send-message'),  # Endpoint to send a message
    path('conversation/<str:username>/', ConversationView.as_view(), name='conversation'),  # Endpoint to get conversation messages
]
