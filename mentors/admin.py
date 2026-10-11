from django.contrib import admin
from .models import Mentor

@admin.register(Mentor)
class MentorAdmin(admin.ModelAdmin):
    list_display = ("nom", "domaine", "note", "nb_avis", "actif")
    list_filter = ("domaine", "actif")
    search_fields = ("nom", "domaine", "bio")
