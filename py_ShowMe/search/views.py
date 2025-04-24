from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from elasticsearch_dsl import Q
from .documents.profile_document import ProfileDocument


class UserSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.GET.get('q', '')
        if not query:
            return Response([])

        # wildcard query for partial matches
        q = Q("wildcard", username={"value": f"*{query.lower()}*"}) | \
            Q("wildcard", bio={"value": f"*{query.lower()}*"})

        s = ProfileDocument.search().query(q)
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
