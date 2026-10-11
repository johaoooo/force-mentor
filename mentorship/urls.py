from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('mentors/', views.mentor_list, name='mentor_list'),
    path('mentors/<int:mentor_id>/', views.mentor_detail, name='mentor_detail'),
    path('demande/creer/<int:mentor_id>/', views.create_request, name='create_request'),
    path('tableau-de-bord/', views.dashboard, name='dashboard'),
    path('demande/<int:request_id>/<str:action>/', views.update_request_status, name='update_request_status'),
]
