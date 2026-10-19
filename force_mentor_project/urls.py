from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse

def serve_angular(request):
    index_file = settings.BASE_DIR / 'frontend/dist/frontend/browser/index.html'
    if not index_file.exists():
        index_file = settings.BASE_DIR / 'staticfiles/index.html'
    if index_file.exists():
        with open(index_file, 'r', encoding='utf-8') as f:
            return HttpResponse(f.read(), content_type='text/html')
    from mentors import views as mentor_views
    return mentor_views.home(request)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('mentorship.api_urls')),
    path('auth/', include('accounts.urls')),
    path('mentorship/', include('mentorship.urls')),
    # Route toutes les pages de l'application vers Angular SPA
    re_path(r'^(?!api/|admin/|static/|media/).*$', serve_angular, name='angular_app'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


