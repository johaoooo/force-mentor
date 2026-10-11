from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from mentors import views as mentor_views
from mentorship import views as mentorship_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', mentor_views.home, name='home'),
    path('mentors/', mentor_views.mentor_list, name='mentor_list'),
    path('', include('mentors.urls')),
    path('tableau-de-bord/', mentorship_views.dashboard, name='dashboard'),
    path('mentor/<int:mentor_id>/', mentorship_views.mentor_detail, name='mentor_detail'),
    path('demande/creer/<int:mentor_id>/', mentorship_views.create_request, name='create_request'),
    path('demande/<int:request_id>/<str:action>/', mentorship_views.update_request_status, name='update_request_status'),
    path('auth/', include('accounts.urls')),
    path('mentorship/', include('mentorship.urls')),
    # API REST pour l'application Angular
    path('api/', include('mentorship.api_urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


