# search/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .documents.profile_document import ProfileDocument

class UserSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.GET.get('q', '')
        if not query:
            return Response([])  # Return empty list if no query

        s = ProfileDocument.search().query(
            "multi_match",
            query=query,
            fields=['username', 'bio']  # Add other fields you want to search
        )
        results = s.execute()
        data = [
            {
                "username": hit.username,
                "bio": hit.bio,
                "privacy": hit.privacy,
                "profile_pic": hit.profile_pic,
            }
            for hit in results
        ]
        return Response(data)