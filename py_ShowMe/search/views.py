# search/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .documents.profile_document import ProfileDocument

class UserSearchView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        query = request.GET.get('q', '')
        results = ProfileDocument.search().query("match", username=query)
        data = [
            {
                "username": hit.username,
                "bio": hit.bio,
                "privacy": hit.privacy,
            }
            for hit in results
        ]
        return Response(data)
