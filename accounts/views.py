from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from mentorship.models import Matiere, CompetenceMentor
from .forms import CustomUserCreationForm, ProfileUpdateForm

def register_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f"Bienvenue {user.first_name} ! Votre compte a été créé avec succès.")
            return redirect('dashboard')
        else:
            messages.error(request, "Veuillez corriger les erreurs ci-dessous.")
    else:
        form = CustomUserCreationForm()
        
    return render(request, 'accounts/register.html', {'form': form})

@login_required
def profile_view(request):
    profile = request.user.profile
    all_matieres = Matiere.objects.all()
    user_competences = profile.competences.all()
    user_matiere_ids = list(user_competences.values_list('matiere_id', flat=True))

    if request.method == 'POST':
        form = ProfileUpdateForm(request.POST, instance=profile)
        if form.is_valid():
            form.save()
            # Si le profil est mentor, gestion de ses matières
            if profile.est_mentor:
                selected_matieres = request.POST.getlist('matieres')
                CompetenceMentor.objects.filter(mentor=profile).exclude(matiere_id__in=selected_matieres).delete()
                for mid in selected_matieres:
                    if mid.isdigit():
                        CompetenceMentor.objects.get_or_create(
                            mentor=profile,
                            matiere_id=int(mid),
                            defaults={'niveau_expertise': 'AVANCE'}
                        )
            messages.success(request, "Votre profil a été mis à jour avec succès !")
            return redirect('profile')
    else:
        form = ProfileUpdateForm(instance=profile)
        
    return render(request, 'accounts/profile.html', {
        'form': form,
        'profile': profile,
        'all_matieres': all_matieres,
        'user_matiere_ids': user_matiere_ids,
    })
