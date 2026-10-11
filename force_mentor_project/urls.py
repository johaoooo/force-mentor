from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from mentors import views as mentor_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', mentor_views.home, name='home'),
    path('', include('mentors.urls')),
    path('auth/', include('accounts.urls')),
    path('mentorship/', include('mentorship.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

