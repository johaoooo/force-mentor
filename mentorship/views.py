from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Q
from accounts.models import Profile
from .models import Matiere, DemandeMentorat, CompetenceMentor
from .forms import DemandeMentoratForm

def home(request):
    """Page d'accueil avec présentation, chiffres clés et matières populaires."""
    total_mentors = Profile.objects.filter(role__in=['MENTOR', 'LES_DEUX'], est_disponible=True).count()
    total_matieres = Matiere.objects.count()
    total_demandes = DemandeMentorat.objects.count()
    matieres = Matiere.objects.all()[:6]
    mentors_recents = Profile.objects.filter(role__in=['MENTOR', 'LES_DEUX'], est_disponible=True).select_related('user')[:4]
    
    context = {
        'total_mentors': total_mentors,
        'total_matieres': total_matieres,
        'total_demandes': total_demandes,
        'matieres': matieres,
        'mentors_recents': mentors_recents,
    }
    return render(request, 'mentorship/home.html', context)


def mentor_list(request):
    """
    Annuaire des mentors avec moteur de recherche et filtrage instantané par matière.
    Répond à la contrainte du cahier des charges : trouver un mentor en moins de 3 clics.
    """
    matiere_id = request.GET.get('matiere')
    niveau_filter = request.GET.get('niveau')
    search_query = request.GET.get('q', '').strip()

    mentors = Profile.objects.filter(role__in=['MENTOR', 'LES_DEUX'], est_disponible=True).select_related('user').prefetch_related('competences__matiere')

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

    matieres = Matiere.objects.all()

    context = {
        'mentors': mentors,
        'matieres': matieres,
        'selected_matiere': int(matiere_id) if matiere_id and matiere_id.isdigit() else None,
        'selected_niveau': niveau_filter,
        'search_query': search_query,
        'niveaux': Profile.NIVEAU_CHOICES,
    }
    return render(request, 'mentorship/mentor_list.html', context)


def mentor_detail(request, mentor_id):
    """Fiche détaillée d'un mentor et ses domaines d'expertise."""
    mentor = get_object_or_404(Profile, id=mentor_id, role__in=['MENTOR', 'LES_DEUX'])
    competences = mentor.competences.select_related('matiere')
    
    context = {
        'mentor': mentor,
        'competences': competences,
    }
    return render(request, 'mentorship/mentor_detail.html', context)


@login_required
def create_request(request, mentor_id):
    """Envoyer une demande de mentorat à un mentor ciblé."""
    mentor = get_object_or_404(Profile, id=mentor_id, role__in=['MENTOR', 'LES_DEUX'])
    mentore = request.user.profile

    if mentor == mentore:
        messages.error(request, "Vous ne pouvez pas vous envoyer une demande de mentorat à vous-même !")
        return redirect('mentor_detail', mentor_id=mentor.id)

    if request.method == 'POST':
        form = DemandeMentoratForm(mentor=mentor, data=request.POST)
        if form.is_valid():
            demande = form.save(commit=False)
            demande.mentore = mentore
            demande.mentor = mentor
            demande.save()
            messages.success(request, f"Votre demande de mentorat a bien été transmise à {mentor.user.get_full_name() or mentor.user.username} !")
            return redirect('dashboard')
    else:
        form = DemandeMentoratForm(mentor=mentor)

    return render(request, 'mentorship/create_request.html', {
        'form': form,
        'mentor': mentor,
    })


@login_required
def dashboard(request):
    """
    Tableau de bord centralisé :
    - Pour un mentor : suivi et gestion des demandes reçues (accepter/refuser).
    - Pour un mentoré : suivi de l'état d'avancement de ses demandes envoyées.
    """
    profile = request.user.profile
    demandes_envoyees = DemandeMentorat.objects.filter(mentore=profile).select_related('mentor__user', 'matiere')
    demandes_recues = DemandeMentorat.objects.filter(mentor=profile).select_related('mentore__user', 'matiere')

    context = {
        'profile': profile,
        'demandes_envoyees': demandes_envoyees,
        'demandes_recues': demandes_recues,
    }
    return render(request, 'mentorship/dashboard.html', context)


@login_required
def update_request_status(request, request_id, action):
    """Traiter une demande reçue (Accepter ou Refuser)."""
    demande = get_object_or_404(DemandeMentorat, id=request_id, mentor=request.user.profile)
    
    if action == 'accepter':
        demande.statut = 'ACCEPTEE'
        messages.success(request, f"Vous avez accepté la demande de {demande.mentore.user.get_full_name() or demande.mentore.user.username}.")
    elif action == 'refuser':
        demande.statut = 'REFUSEE'
        messages.info(request, f"Vous avez décliné la demande de {demande.mentore.user.get_full_name() or demande.mentore.user.username}.")
    
    demande.save()
    return redirect('dashboard')
