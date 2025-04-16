from django.contrib import admin
from django.urls import path,include
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('userProfile.urls')),
    path('posts/', include('posts.urls', namespace='posts')),
    path('auth/', include('allauth.socialaccount.urls')),  # social login
    path('search/', include('search.urls')),
    path('profileview/', include('profileview.urls')),
    path('follows/',include('follows.urls'))
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
