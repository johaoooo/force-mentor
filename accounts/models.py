from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Profile(models.Model):
    """
    Profil étendu de l'utilisateur pour Force Mentor.
    Permet à un étudiant d'être mentoré, mentor ou les deux.
    """
    ROLE_CHOICES = [
        ('MENTORE', 'Mentoré (Apprenant)'),
        ('MENTOR', 'Mentor (Accompagnateur)'),
        ('LES_DEUX', 'Mentor & Mentoré'),
    ]

    NIVEAU_CHOICES = [
        ('L1', 'Licence 1'),
        ('L2', 'Licence 2'),
        ('L3', 'Licence 3'),
        ('M1', 'Master 1'),
        ('M2', 'Master 2'),
        ('CERTIF', 'Formation certifiante (Force-N)'),
        ('AUTRE', 'Autre'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='MENTORE')
    filiere = models.CharField(max_length=150, blank=True, help_text="Ex: Génie Logiciel, Réseaux, Web...")
    niveau = models.CharField(max_length=20, choices=NIVEAU_CHOICES, default='L1')
    bio = models.TextField(blank=True, help_text="Présentez-vous, vos objectifs ou vos compétences")
    telephone = models.CharField(max_length=30, blank=True, help_text="Numéro WhatsApp ou contact")
    est_disponible = models.BooleanField(default=True, help_text="Disponible pour du mentorat")

    class Meta:
        verbose_name = "Profil Étudiant"
        verbose_name_plural = "Profils Étudiants"

    def __str__(self):
        nom_complet = self.user.get_full_name() or self.user.username
        return f"{nom_complet} ({self.get_role_display()})"

    @property
    def est_mentor(self):
        return self.role in ['MENTOR', 'LES_DEUX']

    @property
    def est_mentore(self):
        return self.role in ['MENTORE', 'LES_DEUX']


@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    """Crée automatiquement un profil lors de la création d'un utilisateur."""
    if created:
        Profile.objects.create(user=instance)
    else:
        if hasattr(instance, 'profile'):
            instance.profile.save()
