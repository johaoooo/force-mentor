from django.db import models


class Mentor(models.Model):
    nom = models.CharField(max_length=120)
    domaine = models.CharField(max_length=120)
    bio = models.TextField()
    photo = models.ImageField(upload_to="mentors/", blank=True)
    note = models.DecimalField(max_digits=2, decimal_places=1, default=5.0)
    nb_avis = models.PositiveIntegerField(default=0)
    actif = models.BooleanField(default=True)

    class Meta:
        ordering = ["-note", "nom"]

    def __str__(self):
        return self.nom

    @property
    def initiales(self):
        return "".join(p[0] for p in self.nom.split()[:2]).upper()

    @property
    def profile(self):
        from accounts.models import Profile
        parts = self.nom.split(maxsplit=1)
        if len(parts) == 2:
            p = Profile.objects.filter(user__first_name__iexact=parts[0], user__last_name__iexact=parts[1]).first()
            if p:
                return p
        if parts:
            p = Profile.objects.filter(user__first_name__icontains=parts[0]).first()
            if p:
                return p
        return Profile.objects.filter(role__in=['MENTOR', 'LES_DEUX']).first()
