from django.contrib import admin
from .models import Profile

@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'filiere', 'niveau', 'est_disponible')
    list_filter = ('role', 'niveau', 'est_disponible')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'filiere')
