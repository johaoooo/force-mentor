from django.contrib import admin
from .models import (
    Matiere, CompetenceMentor, DemandeMentorat, DisponibiliteMentor,
    Notification, Conversation, Message, AvisMentor
)

class CompetenceMentorInline(admin.TabularInline):
    model = CompetenceMentor
    extra = 1

@admin.register(Matiere)
class MatiereAdmin(admin.ModelAdmin):
    list_display = ('nom', 'description')
    search_fields = ('nom',)

@admin.register(CompetenceMentor)
class CompetenceMentorAdmin(admin.ModelAdmin):
    list_display = ('mentor', 'matiere', 'niveau_expertise')
    list_filter = ('matiere', 'niveau_expertise')

@admin.register(DisponibiliteMentor)
class DisponibiliteMentorAdmin(admin.ModelAdmin):
    list_display = ('id', 'mentor', 'jour_semaine', 'heure_debut', 'heure_fin', 'est_actif')
    list_filter = ('jour_semaine', 'est_actif')
    search_fields = ('mentor__user__username', 'mentor__user__first_name')

@admin.register(DemandeMentorat)
class DemandeMentoratAdmin(admin.ModelAdmin):
    list_display = ('id', 'mentore', 'mentor', 'matiere', 'date_heure_souhaitee', 'statut', 'date_creation')
    list_filter = ('statut', 'matiere', 'date_creation')
    search_fields = ('mentore__user__username', 'mentor__user__username', 'message')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('id', 'destinataire', 'titre', 'type_notif', 'est_lu', 'date_creation')
    list_filter = ('type_notif', 'est_lu', 'date_creation')
    search_fields = ('destinataire__user__username', 'titre', 'message')

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'date_creation', 'date_mise_a_jour')
    filter_horizontal = ('participants',)

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation', 'expediteur', 'est_lu', 'date_envoi')
    list_filter = ('est_lu', 'date_envoi')
    search_fields = ('expediteur__user__username', 'contenu')

@admin.register(AvisMentor)
class AvisMentorAdmin(admin.ModelAdmin):
    list_display = ('id', 'demande', 'mentor', 'auteur', 'note', 'date_creation')
    list_filter = ('note', 'date_creation')
    search_fields = ('mentor__user__username', 'auteur__user__username', 'commentaire')
