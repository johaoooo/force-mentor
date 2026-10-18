from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.authentication import SessionAuthentication
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db import models
from django.db.models import Q
from django.core.files.base import ContentFile
from django.utils.dateparse import parse_datetime
from django.utils import timezone
import base64
import json
import uuid
from accounts.models import Profile
from .models import (
    Matiere, CompetenceMentor, DemandeMentorat, DisponibiliteMentor,
    Notification, Conversation, Message, AvisMentor
)
from .api_serializers import (
    MatiereSerializer, ProfileSerializer, DemandeMentoratSerializer,
    DisponibiliteMentorSerializer, NotificationSerializer,
    ConversationSerializer, MessageSerializer, AvisMentorSerializer
)

from .authentication import CsrfExemptSessionAuthentication


class MatiereListAPIView(APIView):
    """GET /api/matieres/"""
    def get(self, request):
        matieres = Matiere.objects.all()
        serializer = MatiereSerializer(matieres, many=True)
        return Response(serializer.data)


class MentorListAPIView(APIView):
    """GET /api/mentors/?matiere=...&niveau=...&q=..."""
    def get(self, request):
        matiere_id = request.GET.get('matiere')
        niveau_filter = request.GET.get('niveau')
        search_query = request.GET.get('q', '').strip()

        mentors = Profile.objects.filter(
            role__in=['MENTOR', 'LES_DEUX'], 
            est_disponible=True
        ).select_related('user').prefetch_related('competences__matiere')

        if matiere_id and matiere_id.isdigit():
            mentors = mentors.filter(competences__matiere_id=matiere_id)

        if niveau_filter:
            mentors = mentors.filter(niveau=niveau_filter)

        if search_query:
            mentors = mentors.filter(
                Q(user__first_name__icontains=search_query) |
                Q(user__last_name__icontains=search_query) |
                Q(filiere__icontains=search_query) |
                Q(bio__icontains=search_query) |
                Q(competences__matiere__nom__icontains=search_query)
            ).distinct()

        serializer = ProfileSerializer(mentors, many=True)
        return Response(serializer.data)


class MentorDetailAPIView(APIView):
    """GET /api/mentors/<int:pk>/"""
    def get(self, request, pk):
        try:
            mentor = Profile.objects.select_related('user').prefetch_related('competences__matiere').get(
                id=pk, role__in=['MENTOR', 'LES_DEUX']
            )
            serializer = ProfileSerializer(mentor)
            return Response(serializer.data)
        except Profile.DoesNotExist:
            return Response({'error': 'Mentor introuvable'}, status=status.HTTP_404_NOT_FOUND)


class StatsAPIView(APIView):
    """GET /api/stats/"""
    def get(self, request):
        total_mentors = Profile.objects.filter(role__in=['MENTOR', 'LES_DEUX'], est_disponible=True).count()
        total_matieres = Matiere.objects.count()
        total_demandes = DemandeMentorat.objects.count()
        total_utilisateurs = User.objects.count()
        return Response({
            'total_mentors': total_mentors,
            'total_matieres': total_matieres,
            'total_demandes': total_demandes,
            'total_utilisateurs': total_utilisateurs
        })


class AuthLoginAPIView(APIView):
    """POST /api/auth/login/"""
    def post(self, request):
        username = request.data.get('username', '').strip()
        password = request.data.get('password', '').strip()
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            profile = user.profile
            return Response({
                'message': 'Connexion réussie',
                'user': ProfileSerializer(profile, context={'request': request}).data
            })
        return Response({'error': 'Nom d\'utilisateur ou mot de passe incorrect'}, status=status.HTTP_400_BAD_REQUEST)


class AuthRegisterAPIView(APIView):
    """POST /api/auth/register/"""
    def post(self, request):
        data = request.data
        username = data.get('username', '').strip()
        password = data.get('password', '').strip()
        first_name = data.get('first_name', '').strip()
        last_name = data.get('last_name', '').strip()
        email = data.get('email', '').strip()
        role = data.get('role', 'MENTORE')
        niveau = data.get('niveau', 'L1')
        filiere = data.get('filiere', '').strip()
        bio = data.get('bio', '').strip()

        if not username or not password:
            return Response({'error': 'Le nom d\'utilisateur et le mot de passe sont requis'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Ce nom d\'utilisateur est déjà pris'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name,
            email=email
        )
        profile = user.profile
        profile.role = role
        profile.niveau = niveau
        profile.filiere = filiere
        profile.bio = bio
        login(request, user)

        competences_data = data.get('competences', [])
        if competences_data:
            for item in competences_data:
                try:
                    if isinstance(item, int) or (isinstance(item, str) and item.isdigit()):
                        mat = Matiere.objects.get(id=int(item))
                    else:
                        mat, _ = Matiere.objects.get_or_create(nom=str(item))
                    CompetenceMentor.objects.get_or_create(mentor=profile, matiere=mat)
                except Exception:
                    pass

        return Response({
            'message': 'Inscription réussie',
            'user': ProfileSerializer(profile).data
        }, status=status.HTTP_201_CREATED)


class AuthLogoutAPIView(APIView):
    """POST /api/auth/logout/"""
    def post(self, request):
        logout(request)
        return Response({'message': 'Déconnexion réussie'})


class AuthMeAPIView(APIView):
    """GET /api/auth/me/"""
    def get(self, request):
        if request.user.is_authenticated:
            return Response({
                'authenticated': True,
                'user': ProfileSerializer(request.user.profile, context={'request': request}).data
            })
        return Response({'authenticated': False, 'user': None})


class ProfileUpdateAPIView(APIView):
    """PUT or POST /api/auth/profile/"""
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def post(self, request):
        return self.put(request)

    def put(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Non authentifié'}, status=status.HTTP_401_UNAUTHORIZED)

        user = request.user
        profile = user.profile
        data = request.data

        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.email = data.get('email', user.email)
        user.save()

        profile.role = data.get('role', profile.role)
        profile.filiere = data.get('filiere', profile.filiere)
        profile.niveau = data.get('niveau', profile.niveau)
        profile.bio = data.get('bio', profile.bio)
        profile.telephone = data.get('telephone', profile.telephone)
        if 'est_disponible' in data:
            val = data['est_disponible']
            if isinstance(val, str):
                profile.est_disponible = val.lower() in ['true', '1']
            else:
                profile.est_disponible = bool(val)

        # Gestion de la photo de profil (upload fichier ou base64)
        if 'photo' in request.FILES:
            profile.photo = request.FILES['photo']
        elif 'photo_base64' in data and data['photo_base64']:
            raw_b64 = str(data['photo_base64'])
            try:
                if ';base64,' in raw_b64:
                    header, imgstr = raw_b64.split(';base64,')
                    ext = header.split('/')[-1] if '/' in header else 'png'
                else:
                    imgstr = raw_b64
                    ext = 'png'
                profile.photo.save(f"avatar_{user.id}.{ext}", ContentFile(base64.b64decode(imgstr)), save=False)
            except Exception:
                pass

        profile.save()

        # Si le profil est mentor, gestion des matières
        if profile.est_mentor and 'matieres' in data:
            raw_mats = data.get('matieres', [])
            if isinstance(raw_mats, str):
                try:
                    selected_matieres = json.loads(raw_mats)
                except Exception:
                    selected_matieres = [int(x) for x in raw_mats.split(',') if x.strip().isdigit()]
            else:
                selected_matieres = raw_mats

            CompetenceMentor.objects.filter(mentor=profile).exclude(matiere_id__in=selected_matieres).delete()
            for mid in selected_matieres:
                try:
                    CompetenceMentor.objects.get_or_create(
                        mentor=profile,
                        matiere_id=int(mid),
                        defaults={'niveau_expertise': 'AVANCE'}
                    )
                except (ValueError, TypeError):
                    pass

        return Response({
            'message': 'Profil mis à jour avec succès',
            'user': ProfileSerializer(profile, context={'request': request}).data
        })


class MentorDisponibilitesAPIView(APIView):
    """GET /api/mentors/<int:mentor_id>/disponibilites/"""
    def get(self, request, mentor_id):
        try:
            mentor = Profile.objects.get(id=mentor_id, role__in=['MENTOR', 'LES_DEUX'])
        except Profile.DoesNotExist:
            return Response({'error': 'Mentor introuvable'}, status=status.HTTP_404_NOT_FOUND)
        dispos = DisponibiliteMentor.objects.filter(mentor=mentor, est_actif=True).order_by('jour_semaine', 'heure_debut')
        serializer = DisponibiliteMentorSerializer(dispos, many=True)
        return Response(serializer.data)


class MesDisponibilitesAPIView(APIView):
    """GET & POST /api/mes-disponibilites/ et DELETE /api/mes-disponibilites/<int:pk>/"""
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Non authentifié'}, status=status.HTTP_401_UNAUTHORIZED)
        profile = request.user.profile
        if not profile.est_mentor:
            return Response({'error': 'Seuls les mentors peuvent gérer des disponibilités'}, status=status.HTTP_403_FORBIDDEN)
        dispos = DisponibiliteMentor.objects.filter(mentor=profile).order_by('jour_semaine', 'heure_debut')
        serializer = DisponibiliteMentorSerializer(dispos, many=True)
        return Response(serializer.data)

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Non authentifié'}, status=status.HTTP_401_UNAUTHORIZED)
        profile = request.user.profile
        if not profile.est_mentor:
            return Response({'error': 'Seuls les mentors peuvent gérer des disponibilités'}, status=status.HTTP_403_FORBIDDEN)
        
        data = request.data
        jour_semaine = data.get('jour_semaine')
        heure_debut = data.get('heure_debut')
        heure_fin = data.get('heure_fin')

        if jour_semaine is None or not heure_debut or not heure_fin:
            return Response({'error': 'Jour de la semaine, heure de début et heure de fin requis.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            jour_semaine = int(jour_semaine)
            if not (0 <= jour_semaine <= 6):
                raise ValueError()
        except ValueError:
            return Response({'error': 'Jour de semaine invalide (0=Lundi, ..., 6=Dimanche).'}, status=status.HTTP_400_BAD_REQUEST)

        dispo = DisponibiliteMentor.objects.create(
            mentor=profile,
            jour_semaine=jour_semaine,
            heure_debut=heure_debut,
            heure_fin=heure_fin,
            est_actif=True
        )
        return Response({
            'message': 'Créneau de disponibilité ajouté avec succès',
            'disponibilite': DisponibiliteMentorSerializer(dispo).data
        }, status=status.HTTP_201_CREATED)

    def delete(self, request, pk=None):
        if not request.user.is_authenticated:
            return Response({'error': 'Non authentifié'}, status=status.HTTP_401_UNAUTHORIZED)
        profile = request.user.profile
        try:
            dispo = DisponibiliteMentor.objects.get(id=pk, mentor=profile)
            dispo.delete()
            return Response({'message': 'Créneau supprimé avec succès'})
        except DisponibiliteMentor.DoesNotExist:
            return Response({'error': 'Créneau introuvable'}, status=status.HTTP_404_NOT_FOUND)


class DemandesAPIView(APIView):
    """GET ou POST /api/demandes/"""
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Non authentifié'}, status=status.HTTP_401_UNAUTHORIZED)
        profile = request.user.profile
        recues = DemandeMentorat.objects.filter(mentor=profile)
        envoyees = DemandeMentorat.objects.filter(mentore=profile)
        return Response({
            'recues': DemandeMentoratSerializer(recues, many=True).data,
            'envoyees': DemandeMentoratSerializer(envoyees, many=True).data
        })

    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Non authentifié'}, status=status.HTTP_401_UNAUTHORIZED)
        mentore = request.user.profile
        mentor_id = request.data.get('mentor_id')
        matiere_id = request.data.get('matiere_id')
        message = request.data.get('message', '').strip()
        date_heure_souhaitee_str = request.data.get('date_heure_souhaitee')
        disponibilite_id = request.data.get('disponibilite_id')
        duree_minutes = request.data.get('duree_minutes', 60)

        if not mentor_id or not matiere_id or not message:
            return Response({'error': 'Mentor, matière et message requis'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            mentor = Profile.objects.get(id=mentor_id, role__in=['MENTOR', 'LES_DEUX'])
        except Profile.DoesNotExist:
            return Response({'error': 'Mentor introuvable'}, status=status.HTTP_404_NOT_FOUND)

        if mentor == mentore:
            return Response({'error': 'Vous ne pouvez pas vous envoyer une demande à vous-même'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            matiere = Matiere.objects.get(id=matiere_id)
        except Matiere.DoesNotExist:
            return Response({'error': 'Matière introuvable'}, status=status.HTTP_404_NOT_FOUND)

        disponibilite = None
        if disponibilite_id:
            try:
                disponibilite = DisponibiliteMentor.objects.get(id=disponibilite_id, mentor=mentor)
            except DisponibiliteMentor.DoesNotExist:
                pass

        date_heure_souhaitee = None
        if date_heure_souhaitee_str:
            try:
                date_heure_souhaitee = parse_datetime(date_heure_souhaitee_str)
            except Exception:
                pass

        demande = DemandeMentorat.objects.create(
            mentore=mentore,
            mentor=mentor,
            matiere=matiere,
            message=message,
            disponibilite=disponibilite,
            date_heure_souhaitee=date_heure_souhaitee,
            duree_minutes=int(duree_minutes) if str(duree_minutes).isdigit() else 60,
            statut='EN_ATTENTE'
        )

        # Notification in-app pour le mentor
        student_name = mentore.user.get_full_name() or mentore.user.username
        notif_msg = f"{student_name} a sollicité une séance de mentorat en {matiere.nom}."
        if date_heure_souhaitee:
            notif_msg += f" Créneau proposé : {date_heure_souhaitee.strftime('%d/%m/%Y à %H:%M')}."
        Notification.objects.create(
            destinataire=mentor,
            titre="Nouvelle réservation de séance",
            message=notif_msg,
            lien="/tableau-de-bord",
            type_notif="DEMANDE"
        )

        return Response({
            'message': 'Demande et réservation envoyées avec succès',
            'demande': DemandeMentoratSerializer(demande).data
        }, status=status.HTTP_201_CREATED)


class DemandeActionAPIView(APIView):
    """POST /api/demandes/<int:pk>/action/ avec {action: 'accepter' | 'refuser' | 'terminer' | 'annuler'}"""
    def post(self, request, pk):
        if not request.user.is_authenticated:
            return Response({'error': 'Non authentifié'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            demande = DemandeMentorat.objects.get(id=pk)
        except DemandeMentorat.DoesNotExist:
            return Response({'error': 'Demande introuvable'}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action')
        profile = request.user.profile

        if profile != demande.mentor and profile != demande.mentore:
            return Response({'error': 'Action non autorisée sur cette demande'}, status=status.HTTP_403_FORBIDDEN)

        if action == 'accepter':
            if profile != demande.mentor:
                return Response({'error': 'Seul le mentor peut accepter cette demande'}, status=status.HTTP_403_FORBIDDEN)
            demande.statut = 'ACCEPTEE'
            if not demande.lien_visio:
                demande.lien_visio = f"https://meet.jit.si/ForceMentor-Seance-{demande.id}-{uuid.uuid4().hex[:8]}"
            
            mentor_name = profile.user.get_full_name() or profile.user.username
            date_info = f" pour le {demande.date_heure_souhaitee.strftime('%d/%m/%Y à %H:%M')}" if demande.date_heure_souhaitee else ""
            Notification.objects.create(
                destinataire=demande.mentore,
                titre="Séance confirmée !",
                message=f"{mentor_name} a accepté votre séance en {demande.matiere.nom}{date_info}. Le lien de visio est prêt !",
                lien="/tableau-de-bord",
                type_notif="CONFIRMATION"
            )

        elif action == 'refuser':
            if profile != demande.mentor:
                return Response({'error': 'Seul le mentor peut refuser cette demande'}, status=status.HTTP_403_FORBIDDEN)
            demande.statut = 'REFUSEE'
            mentor_name = profile.user.get_full_name() or profile.user.username
            Notification.objects.create(
                destinataire=demande.mentore,
                titre="Demande de séance déclinée",
                message=f"{mentor_name} n'est malheureusement pas disponible pour cette séance en {demande.matiere.nom}.",
                lien="/tableau-de-bord",
                type_notif="ANNULATION"
            )

        elif action == 'annuler':
            demande.statut = 'ANNULEE'
            dest = demande.mentore if profile == demande.mentor else demande.mentor
            actor_name = profile.user.get_full_name() or profile.user.username
            Notification.objects.create(
                destinataire=dest,
                titre="Séance annulée",
                message=f"La séance de mentorat en {demande.matiere.nom} a été annulée par {actor_name}.",
                lien="/tableau-de-bord",
                type_notif="ANNULATION"
            )

        elif action == 'terminer':
            demande.statut = 'TERMINEE'
            if 'commentaire_mentor' in request.data:
                demande.commentaire_mentor = request.data['commentaire_mentor']
            
            mentor_name = demande.mentor.user.get_full_name() or demande.mentor.user.username
            Notification.objects.create(
                destinataire=demande.mentore,
                titre="Séance terminée - Donnez votre avis vérifié !",
                message=f"Votre séance avec {mentor_name} en {demande.matiere.nom} est terminée. Laissez votre note et avis vérifié sur votre tableau de bord !",
                lien="/tableau-de-bord",
                type_notif="AVIS"
            )
        else:
            return Response({'error': 'Action non reconnue'}, status=status.HTTP_400_BAD_REQUEST)

        demande.save()
        return Response({
            'message': f'Demande mise à jour ({demande.get_statut_display()})',
            'demande': DemandeMentoratSerializer(demande).data
        })


class NotificationsAPIView(APIView):
    """GET /api/notifications/"""
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Non authentifié'}, status=status.HTTP_401_UNAUTHORIZED)
        profile = request.user.profile
        notifs = Notification.objects.filter(destinataire=profile)[:30]
        unread_count = Notification.objects.filter(destinataire=profile, est_lu=False).count()
        return Response({
            'unread_count': unread_count,
            'notifications': NotificationSerializer(notifs, many=True).data
        })


class NotificationActionAPIView(APIView):
    """POST /api/notifications/marquer-lues/ ou POST /api/notifications/<int:pk>/lire/"""
    def post(self, request, pk=None):
        if not request.user.is_authenticated:
            return Response({'error': 'Non authentifié'}, status=status.HTTP_401_UNAUTHORIZED)
        profile = request.user.profile
        if pk:
            Notification.objects.filter(id=pk, destinataire=profile).update(est_lu=True)
        else:
            Notification.objects.filter(destinataire=profile, est_lu=False).update(est_lu=True)
        return Response({'message': 'Notifications mises à jour'})


class ConversationsAPIView(APIView):
    """GET /api/conversations/"""
    def get(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Non authentifié'}, status=status.HTTP_401_UNAUTHORIZED)
        profile = request.user.profile
        convs = Conversation.objects.filter(participants=profile).prefetch_related('participants', 'messages').order_by('-date_mise_a_jour')
        serializer = ConversationSerializer(convs, many=True, context={'request': request})
        return Response(serializer.data)


class ConversationDemarrerAPIView(APIView):
    """POST /api/conversations/demarrer/"""
    def post(self, request):
        if not request.user.is_authenticated:
            return Response({'error': 'Non authentifié'}, status=status.HTTP_401_UNAUTHORIZED)
        profile = request.user.profile
        destinataire_id = request.data.get('destinataire_id')
        message_initial = request.data.get('message_initial', '').strip()

        if not destinataire_id:
            return Response({'error': 'Destinataire requis'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            destinataire = Profile.objects.get(id=destinataire_id)
        except Profile.DoesNotExist:
            return Response({'error': 'Destinataire introuvable'}, status=status.HTTP_404_NOT_FOUND)

        if destinataire == profile:
            return Response({'error': 'Impossible de démarrer une discussion avec vous-même'}, status=status.HTTP_400_BAD_REQUEST)

        conv = Conversation.objects.filter(participants=profile).filter(participants=destinataire).first()
        if not conv:
            conv = Conversation.objects.create()
            conv.participants.add(profile, destinataire)

        if message_initial:
            msg = Message.objects.create(
                conversation=conv,
                expediteur=profile,
                contenu=message_initial
            )
            conv.save()
            # Notification destinataire
            exp_name = profile.user.get_full_name() or profile.user.username
            Notification.objects.create(
                destinataire=destinataire,
                titre=f"Nouveau message de {exp_name}",
                message=message_initial[:90],
                lien="/messages",
                type_notif="MESSAGE"
            )

        serializer = ConversationSerializer(conv, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ConversationMessagesAPIView(APIView):
    """GET & POST /api/conversations/<int:pk>/messages/"""
    def get(self, request, pk):
        if not request.user.is_authenticated:
            return Response({'error': 'Non authentifié'}, status=status.HTTP_401_UNAUTHORIZED)
        profile = request.user.profile
        try:
            conv = Conversation.objects.get(id=pk, participants=profile)
        except Conversation.DoesNotExist:
            return Response({'error': 'Conversation introuvable'}, status=status.HTTP_404_NOT_FOUND)

        # Marquer comme lus les messages reçus
        conv.messages.filter(est_lu=False).exclude(expediteur=profile).update(est_lu=True)

        messages = conv.messages.select_related('expediteur__user').order_by('date_envoi')
        serializer = MessageSerializer(messages, many=True, context={'request': request})
        return Response(serializer.data)

    def post(self, request, pk):
        if not request.user.is_authenticated:
            return Response({'error': 'Non authentifié'}, status=status.HTTP_401_UNAUTHORIZED)
        profile = request.user.profile
        try:
            conv = Conversation.objects.get(id=pk, participants=profile)
        except Conversation.DoesNotExist:
            return Response({'error': 'Conversation introuvable'}, status=status.HTTP_404_NOT_FOUND)

        contenu = request.data.get('contenu', '').strip()
        if not contenu:
            return Response({'error': 'Le message ne peut pas être vide'}, status=status.HTTP_400_BAD_REQUEST)

        msg = Message.objects.create(
            conversation=conv,
            expediteur=profile,
            contenu=contenu
        )
        conv.save() # actualise date_mise_a_jour

        # Notification pour l'autre participant
        destinataire = conv.participants.exclude(id=profile.id).first()
        if destinataire:
            exp_name = profile.user.get_full_name() or profile.user.username
            Notification.objects.create(
                destinataire=destinataire,
                titre=f"Message de {exp_name}",
                message=contenu[:90],
                lien="/messages",
                type_notif="MESSAGE"
            )

        serializer = MessageSerializer(msg, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class MatchingMentorsAPIView(APIView):
    """
    GET /api/matching/
    Suggère intelligemment les mentors selon la filière, le niveau, la matière
    et les disponibilités hebdomadaires communes.
    """
    def get(self, request):
        from .matching import calculate_mentor_match

        matiere_id = request.query_params.get('matiere_id')
        jour_semaine = request.query_params.get('jour_semaine')
        filiere = request.query_params.get('filiere')
        niveau = request.query_params.get('niveau')
        min_score = request.query_params.get('min_score')

        current_profile = None
        if request.user.is_authenticated and hasattr(request.user, 'profile'):
            current_profile = request.user.profile
            if not filiere:
                filiere = current_profile.filiere
            if not niveau:
                niveau = current_profile.niveau

        mentors = Profile.objects.filter(
            role__in=['MENTOR', 'LES_DEUX'],
            est_disponible=True
        ).select_related('user').prefetch_related('competences__matiere', 'disponibilites')

        if current_profile:
            mentors = mentors.exclude(id=current_profile.id)

        results = []
        for m in mentors:
            match_res = calculate_mentor_match(
                m,
                student_filiere=filiere,
                student_niveau=niveau,
                matiere_id=matiere_id,
                jour_semaine=jour_semaine
            )
            
            score = match_res['score']
            if min_score:
                try:
                    if score < int(min_score):
                        continue
                except ValueError:
                    pass

            results.append({
                'mentor': ProfileSerializer(m, context={'request': request}).data,
                'score': score,
                'label': match_res['label'],
                'color': match_res['color'],
                'raisons': match_res['raisons']
            })

        # Trier par score de compatibilité décroissant
        results.sort(key=lambda x: x['score'], reverse=True)

        return Response({
            'criteres': {
                'filiere': filiere,
                'niveau': niveau,
                'matiere_id': matiere_id,
                'jour_semaine': jour_semaine,
            },
            'total': len(results),
            'results': results
        })


class AvisCreateAPIView(APIView):
    """
    POST /api/demandes/<int:pk>/avis/ ou POST /api/avis/
    Crée ou met à jour un avis vérifié après une séance terminée.
    """
    authentication_classes = [CsrfExemptSessionAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk=None):
        profile = request.user.profile
        demande_id = pk or request.data.get('demande_id')
        
        if not demande_id:
            return Response({'error': 'demande_id requis'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            demande = DemandeMentorat.objects.select_related('mentore', 'mentor', 'matiere').get(id=demande_id)
        except DemandeMentorat.DoesNotExist:
            return Response({'error': 'Séance de mentorat introuvable'}, status=status.HTTP_404_NOT_FOUND)

        # Vérification 1 : Seul le mentoré ayant participé à cette séance peut noter
        if demande.mentore != profile:
            return Response(
                {'error': 'Seul l\'étudiant mentoré ayant participé à cette séance peut laisser un avis.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Vérification 2 : La séance doit obligatoirement être TERMINEE
        if demande.statut != 'TERMINEE':
            return Response(
                {'error': 'Un avis vérifié ne peut être déposé que pour une séance réellement terminée.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validation de la note
        note_val = request.data.get('note')
        try:
            note_int = int(note_val)
            if note_int < 1 or note_int > 5:
                raise ValueError()
        except (ValueError, TypeError):
            return Response(
                {'error': 'La note doit être un entier compris entre 1 et 5 étoiles.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        commentaire = str(request.data.get('commentaire', '')).strip()

        # Création ou mise à jour de l'avis vérifié
        avis, created = AvisMentor.objects.update_or_create(
            demande=demande,
            defaults={
                'mentor': demande.mentor,
                'auteur': profile,
                'note': note_int,
                'commentaire': commentaire
            }
        )

        # Notification in-app pour le mentor
        student_name = profile.user.get_full_name() or profile.user.username
        stars_str = "⭐" * note_int
        Notification.objects.create(
            destinataire=demande.mentor,
            titre=f"Nouvel avis vérifié reçu ({note_int}/5) !",
            message=f"{student_name} a noté votre séance en {demande.matiere.nom} : {stars_str} ({note_int}/5).",
            lien=f"/mentor/{demande.mentor.id}",
            type_notif="AVIS"
        )

        return Response({
            'message': 'Votre avis vérifié a été enregistré avec succès !',
            'created': created,
            'avis': AvisMentorSerializer(avis, context={'request': request}).data
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class MentorAvisListAPIView(APIView):
    """
    GET /api/mentors/<int:pk>/avis/
    Liste les avis vérifiés pour un mentor donné avec note moyenne.
    """
    def get(self, request, pk):
        try:
            mentor = Profile.objects.get(id=pk, role__in=['MENTOR', 'LES_DEUX'])
        except Profile.DoesNotExist:
            return Response({'error': 'Mentor introuvable'}, status=status.HTTP_404_NOT_FOUND)

        avis_qs = mentor.avis_recus.select_related('auteur__user', 'demande__matiere').order_by('-date_creation')
        total = avis_qs.count()
        avg_note = avis_qs.aggregate(models.Avg('note'))['note__avg']

        return Response({
            'mentor_id': mentor.id,
            'total_avis': total,
            'note_moyenne': round(avg_note, 1) if avg_note is not None else None,
            'avis': AvisMentorSerializer(avis_qs, many=True, context={'request': request}).data
        })


