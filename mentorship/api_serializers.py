from rest_framework import serializers
from django.contrib.auth.models import User
from accounts.models import Profile
from .models import Matiere, CompetenceMentor, DemandeMentorat

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']


class MatiereSerializer(serializers.ModelSerializer):
    class Meta:
        model = Matiere
        fields = ['id', 'nom', 'description', 'icone']


class CompetenceMentorSerializer(serializers.ModelSerializer):
    matiere = MatiereSerializer(read_only=True)
    niveau_display = serializers.CharField(source='get_niveau_expertise_display', read_only=True)

    class Meta:
        model = CompetenceMentor
        fields = ['id', 'matiere', 'niveau_expertise', 'niveau_display']


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    niveau_display = serializers.CharField(source='get_niveau_display', read_only=True)
    competences = CompetenceMentorSerializer(many=True, read_only=True)

    class Meta:
        model = Profile
        fields = [
            'id', 'user', 'role', 'role_display', 'filiere', 'niveau', 
            'niveau_display', 'bio', 'telephone', 'est_disponible', 
            'est_mentor', 'est_mentore', 'competences'
        ]


class DemandeMentoratSerializer(serializers.ModelSerializer):
    mentore = ProfileSerializer(read_only=True)
    mentor = ProfileSerializer(read_only=True)
    matiere = MatiereSerializer(read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)

    class Meta:
        model = DemandeMentorat
        fields = [
            'id', 'mentore', 'mentor', 'matiere', 'message', 
            'statut', 'statut_display', 'date_creation', 'date_mise_a_jour'
        ]
