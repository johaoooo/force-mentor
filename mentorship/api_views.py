from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db.models import Q
from accounts.models import Profile
from .models import Matiere, CompetenceMentor, DemandeMentorat
from .api_serializers import (
    MatiereSerializer, ProfileSerializer, DemandeMentoratSerializer
)

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
                'user': ProfileSerializer(profile).data
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
        profile.save()

        login(request, user)
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
                'user': ProfileSerializer(request.user.profile).data
            })
        return Response({'authenticated': False, 'user': None})


class ProfileUpdateAPIView(APIView):
    """PUT /api/auth/profile/"""
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
            profile.est_disponible = bool(data['est_disponible'])
        profile.save()

        # Si le profil est mentor, gestion des matières
        if profile.est_mentor and 'matieres' in data:
            selected_matieres = data.get('matieres', [])
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
            'user': ProfileSerializer(profile).data
        })


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

        demande = DemandeMentorat.objects.create(
            mentore=mentore,
            mentor=mentor,
            matiere=matiere,
            message=message,
            statut='EN_ATTENTE'
        )
        return Response({
            'message': 'Demande envoyée avec succès',
            'demande': DemandeMentoratSerializer(demande).data
        }, status=status.HTTP_201_CREATED)


class DemandeActionAPIView(APIView):
    """POST /api/demandes/<int:pk>/action/ avec {action: 'accepter' | 'refuser' | 'terminer'}"""
    def post(self, request, pk):
        if not request.user.is_authenticated:
            return Response({'error': 'Non authentifié'}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            demande = DemandeMentorat.objects.get(id=pk)
        except DemandeMentorat.DoesNotExist:
            return Response({'error': 'Demande introuvable'}, status=status.HTTP_404_NOT_FOUND)

        action = request.data.get('action')
        profile = request.user.profile

        if demande.mentor != profile:
            return Response({'error': 'Action non autorisée sur cette demande'}, status=status.HTTP_403_FORBIDDEN)

        if action == 'accepter':
            demande.statut = 'ACCEPTEE'
        elif action == 'refuser':
            demande.statut = 'REFUSEE'
        elif action == 'terminer':
            demande.statut = 'TERMINEE'
        else:
            return Response({'error': 'Action non reconnue'}, status=status.HTTP_400_BAD_REQUEST)

        demande.save()
        return Response({
            'message': f'Demande mise à jour ({demande.get_statut_display()})',
            'demande': DemandeMentoratSerializer(demande).data
        })
