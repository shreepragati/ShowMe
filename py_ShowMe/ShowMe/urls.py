from django.contrib import admin
from django.urls import path,include
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('admin/', admin.site.urls),
    path('userProfile/', include('userProfile.urls')),
    path('posts/', include('posts.urls', namespace='posts')),
    path('friends/', include('friends.urls', namespace='friends')),
    path('auth/', include('dj_rest_auth.urls')),  # login/logout
    path('auth/registration/', include('dj_rest_auth.registration.urls')),  # registration
    path('auth/', include('allauth.socialaccount.urls')),  # social login
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
