from django.contrib import admin
from .models import Matiere, CompetenceMentor, DemandeMentorat

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

@admin.register(DemandeMentorat)
class DemandeMentoratAdmin(admin.ModelAdmin):
    list_display = ('id', 'mentore', 'mentor', 'matiere', 'statut', 'date_creation')
    list_filter = ('statut', 'matiere', 'date_creation')
    search_fields = ('mentore__user__username', 'mentor__user__username', 'message')
