from rest_framework import serializers
from django.contrib.auth.models import User
from accounts.models import Profile
from .models import Matiere, CompetenceMentor, DemandeMentorat, DisponibiliteMentor, Notification

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


class DisponibiliteMentorSerializer(serializers.ModelSerializer):
    jour_display = serializers.CharField(source='get_jour_semaine_display', read_only=True)
    heure_debut = serializers.TimeField(format='%H:%M')
    heure_fin = serializers.TimeField(format='%H:%M')

    class Meta:
        model = DisponibiliteMentor
        fields = ['id', 'jour_semaine', 'jour_display', 'heure_debut', 'heure_fin', 'est_actif']


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    niveau_display = serializers.CharField(source='get_niveau_display', read_only=True)
    competences = CompetenceMentorSerializer(many=True, read_only=True)
    disponibilites = DisponibiliteMentorSerializer(many=True, read_only=True)
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            'id', 'user', 'role', 'role_display', 'filiere', 'niveau', 
            'niveau_display', 'bio', 'telephone', 'est_disponible', 
            'est_mentor', 'est_mentore', 'competences', 'disponibilites', 'photo_url'
        ]

    def get_photo_url(self, obj):
        if obj.photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return f"http://127.0.0.1:8001{obj.photo.url}"
        return None


class DemandeMentoratSerializer(serializers.ModelSerializer):
    mentore = ProfileSerializer(read_only=True)
    mentor = ProfileSerializer(read_only=True)
    matiere = MatiereSerializer(read_only=True)
    disponibilite = DisponibiliteMentorSerializer(read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)

    class Meta:
        model = DemandeMentorat
        fields = [
            'id', 'mentore', 'mentor', 'matiere', 'message', 
            'statut', 'statut_display', 'date_heure_souhaitee',
            'duree_minutes', 'disponibilite', 'lien_visio',
            'commentaire_mentor', 'date_creation', 'date_mise_a_jour'
        ]


class NotificationSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_notif_display', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id', 'titre', 'message', 'lien', 'type_notif', 
            'type_display', 'est_lu', 'date_creation'
        ]
