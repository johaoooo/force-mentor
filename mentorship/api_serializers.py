from rest_framework import serializers
from django.db import models
from django.contrib.auth.models import User
from accounts.models import Profile
from .models import (
    Matiere, CompetenceMentor, DemandeMentorat, DisponibiliteMentor,
    Notification, Conversation, Message, AvisMentor
)

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


class AvisMentorSerializer(serializers.ModelSerializer):
    auteur = serializers.SerializerMethodField()
    matiere_nom = serializers.CharField(source='demande.matiere.nom', read_only=True)
    date_creation_formatee = serializers.SerializerMethodField()

    class Meta:
        model = AvisMentor
        fields = [
            'id', 'demande_id', 'mentor_id', 'auteur', 
            'note', 'commentaire', 'matiere_nom',
            'date_creation', 'date_creation_formatee'
        ]

    def get_auteur(self, obj):
        first_name = obj.auteur.user.first_name or obj.auteur.user.username
        last_name = obj.auteur.user.last_name or ''
        initial = f"{last_name[0]}." if last_name else ''
        nom_affiche = f"{first_name} {initial}".strip()
        photo_url = None
        if obj.auteur.photo:
            request = self.context.get('request')
            if request:
                photo_url = request.build_absolute_uri(obj.auteur.photo.url)
            else:
                photo_url = f"http://127.0.0.1:8001{obj.auteur.photo.url}"
        return {
            'id': obj.auteur.id,
            'nom_affiche': nom_affiche,
            'filiere': obj.auteur.filiere,
            'niveau_display': obj.auteur.get_niveau_display(),
            'photo_url': photo_url
        }

    def get_date_creation_formatee(self, obj):
        return obj.date_creation.strftime('%d/%m/%Y')


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    niveau_display = serializers.CharField(source='get_niveau_display', read_only=True)
    competences = CompetenceMentorSerializer(many=True, read_only=True)
    disponibilites = DisponibiliteMentorSerializer(many=True, read_only=True)
    photo_url = serializers.SerializerMethodField()
    note_moyenne = serializers.SerializerMethodField()
    nb_avis = serializers.SerializerMethodField()
    avis_recus = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = [
            'id', 'user', 'role', 'role_display', 'filiere', 'niveau', 
            'niveau_display', 'bio', 'telephone', 'est_disponible', 
            'est_mentor', 'est_mentore', 'competences', 'disponibilites', 
            'photo_url', 'note_moyenne', 'nb_avis', 'avis_recus'
        ]

    def get_photo_url(self, obj):
        if obj.photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.photo.url)
            return f"http://127.0.0.1:8001{obj.photo.url}"
        return None

    def get_note_moyenne(self, obj):
        if not obj.est_mentor:
            return None
        res = obj.avis_recus.aggregate(models.Avg('note'))['note__avg']
        return round(res, 1) if res is not None else None

    def get_nb_avis(self, obj):
        if not obj.est_mentor:
            return 0
        return obj.avis_recus.count()

    def get_avis_recus(self, obj):
        if not obj.est_mentor:
            return []
        avis = obj.avis_recus.select_related('auteur__user', 'demande__matiere')[:10]
        return AvisMentorSerializer(avis, many=True, context=self.context).data


class DemandeMentoratSerializer(serializers.ModelSerializer):
    mentore = ProfileSerializer(read_only=True)
    mentor = ProfileSerializer(read_only=True)
    matiere = MatiereSerializer(read_only=True)
    disponibilite = DisponibiliteMentorSerializer(read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    avis = serializers.SerializerMethodField()
    peut_noter = serializers.SerializerMethodField()

    class Meta:
        model = DemandeMentorat
        fields = [
            'id', 'mentore', 'mentor', 'matiere', 'message', 
            'statut', 'statut_display', 'date_heure_souhaitee',
            'duree_minutes', 'disponibilite', 'lien_visio',
            'commentaire_mentor', 'date_creation', 'date_mise_a_jour',
            'avis', 'peut_noter'
        ]

    def get_avis(self, obj):
        if hasattr(obj, 'avis'):
            return AvisMentorSerializer(obj.avis, context=self.context).data
        return None

    def get_peut_noter(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return (
            obj.statut == 'TERMINEE' and 
            request.user.profile.id == obj.mentore_id and 
            not hasattr(obj, 'avis')
        )


class NotificationSerializer(serializers.ModelSerializer):
    type_display = serializers.CharField(source='get_type_notif_display', read_only=True)

    class Meta:
        model = Notification
        fields = [
            'id', 'titre', 'message', 'lien', 'type_notif', 
            'type_display', 'est_lu', 'date_creation'
        ]


class MessageSerializer(serializers.ModelSerializer):
    expediteur = ProfileSerializer(read_only=True)
    expediteur_id = serializers.IntegerField(source='expediteur.id', read_only=True)

    class Meta:
        model = Message
        fields = [
            'id', 'conversation_id', 'expediteur', 'expediteur_id',
            'contenu', 'est_lu', 'date_envoi'
        ]


class ConversationSerializer(serializers.ModelSerializer):
    autre_participant = serializers.SerializerMethodField()
    dernier_message = serializers.SerializerMethodField()
    nb_non_lus = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id', 'autre_participant', 'dernier_message', 
            'nb_non_lus', 'date_mise_a_jour', 'date_creation'
        ]

    def get_autre_participant(self, obj):
        request = self.context.get('request')
        current_profile = request.user.profile if request and request.user.is_authenticated else None
        if current_profile:
            autre = obj.participants.exclude(id=current_profile.id).first()
        else:
            autre = obj.participants.first()
        if autre:
            return ProfileSerializer(autre, context=self.context).data
        return None

    def get_dernier_message(self, obj):
        msg = obj.messages.order_by('-date_envoi').first()
        if msg:
            return {
                'id': msg.id,
                'contenu': msg.contenu,
                'expediteur_id': msg.expediteur_id,
                'est_lu': msg.est_lu,
                'date_envoi': msg.date_envoi
            }
        return None

    def get_nb_non_lus(self, obj):
        request = self.context.get('request')
        current_profile = request.user.profile if request and request.user.is_authenticated else None
        if current_profile:
            return obj.messages.filter(est_lu=False).exclude(expediteur=current_profile).count()
        return 0

