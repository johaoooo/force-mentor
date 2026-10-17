from django.urls import path
from . import api_views

urlpatterns = [
    # Matières & Mentors
    path('matieres/', api_views.MatiereListAPIView.as_view(), name='api_matieres'),
    path('mentors/', api_views.MentorListAPIView.as_view(), name='api_mentors'),
    path('mentors/<int:pk>/', api_views.MentorDetailAPIView.as_view(), name='api_mentor_detail'),
    path('stats/', api_views.StatsAPIView.as_view(), name='api_stats'),

    # Authentification & Profil
    path('auth/login/', api_views.AuthLoginAPIView.as_view(), name='api_login'),
    path('auth/register/', api_views.AuthRegisterAPIView.as_view(), name='api_register'),
    path('auth/logout/', api_views.AuthLogoutAPIView.as_view(), name='api_logout'),
    path('auth/me/', api_views.AuthMeAPIView.as_view(), name='api_me'),
    path('auth/profile/', api_views.ProfileUpdateAPIView.as_view(), name='api_profile_update'),

    # Demandes & Réservations de séances
    path('demandes/', api_views.DemandesAPIView.as_view(), name='api_demandes'),
    path('demandes/<int:pk>/action/', api_views.DemandeActionAPIView.as_view(), name='api_demande_action'),

    # Disponibilités & Calendrier
    path('mentors/<int:mentor_id>/disponibilites/', api_views.MentorDisponibilitesAPIView.as_view(), name='api_mentor_disponibilites'),
    path('mes-disponibilites/', api_views.MesDisponibilitesAPIView.as_view(), name='api_mes_disponibilites'),
    path('mes-disponibilites/<int:pk>/', api_views.MesDisponibilitesAPIView.as_view(), name='api_mes_disponibilites_detail'),

    # Notifications in-app
    path('notifications/', api_views.NotificationsAPIView.as_view(), name='api_notifications'),
    path('notifications/marquer-lues/', api_views.NotificationActionAPIView.as_view(), name='api_notifications_marquer_toutes_lues'),
    path('notifications/<int:pk>/lire/', api_views.NotificationActionAPIView.as_view(), name='api_notification_lire'),

    # Messagerie intégrée (Chat direct)
    path('conversations/', api_views.ConversationsAPIView.as_view(), name='api_conversations'),
    path('conversations/demarrer/', api_views.ConversationDemarrerAPIView.as_view(), name='api_conversation_demarrer'),
    path('conversations/<int:pk>/messages/', api_views.ConversationMessagesAPIView.as_view(), name='api_conversation_messages'),
]
