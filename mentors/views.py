from django.contrib.auth import get_user_model
from django.db.models import Q
from django.shortcuts import render

from .models import Mentor


def _stats():
    actifs = Mentor.objects.filter(actif=True)
    return {
        "mentors": actifs.count(),
        "domaines": actifs.values("domaine").distinct().count(),
        "utilisateurs": get_user_model().objects.filter(is_staff=False).count(),
    }


def home(request):
    return render(request, "mentors/home.html", {
        "mentors": Mentor.objects.filter(actif=True)[:3],
        "stats": _stats(),
    })


def mentor_list(request):
    q = request.GET.get("q", "").strip()
    domaine_filter = request.GET.get("domaine", "").strip()
    mentors = Mentor.objects.filter(actif=True)
    if q:
        mentors = mentors.filter(
            Q(nom__icontains=q) | Q(domaine__icontains=q) | Q(bio__icontains=q)
        )
    if domaine_filter:
        mentors = mentors.filter(domaine__iexact=domaine_filter)

    domaines = Mentor.objects.filter(actif=True).values_list("domaine", flat=True).distinct()
    return render(request, "mentors/list.html", {
        "mentors": mentors,
        "q": q,
        "domaine_filter": domaine_filter,
        "domaines": domaines,
        "total_count": mentors.count(),
    })

