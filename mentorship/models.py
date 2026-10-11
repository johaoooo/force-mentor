from django.db import models
from accounts.models import Profile

class Matiere(models.Model):
    """Matières ou technologies faisant l'objet de mentorat (Python, Django, etc.)."""
    nom = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    icone = models.CharField(max_length=50, default='bi-journal-code', blank=True, help_text="Classe d'icône Bootstrap Icons")

    class Meta:
        verbose_name = "Matière"
        verbose_name_plural = "Matières"
        ordering = ['nom']

    def __str__(self):
        return self.nom


class CompetenceMentor(models.Model):
    """Associe un profil mentor à une matière avec un niveau de maîtrise."""
    NIVEAU_EXPERTISE_CHOICES = [
        ('INTERMEDIAIRE', 'Intermédiaire'),
        ('AVANCE', 'Avancé'),
        ('EXPERT', 'Expert'),
    ]

    mentor = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='competences')
    matiere = models.ForeignKey(Matiere, on_delete=models.CASCADE, related_name='mentors_associes')
    niveau_expertise = models.CharField(max_length=20, choices=NIVEAU_EXPERTISE_CHOICES, default='AVANCE')

    class Meta:
        unique_together = ('mentor', 'matiere')
        verbose_name = "Compétence Mentor"
        verbose_name_plural = "Compétences Mentors"

    def __str__(self):
        return f"{self.mentor.user.username} - {self.matiere.nom} ({self.get_niveau_expertise_display()})"


class DemandeMentorat(models.Model):
    """Demande de mise en relation envoyée par un mentoré à un mentor."""
    STATUT_CHOICES = [
        ('EN_ATTENTE', 'En attente'),
        ('ACCEPTEE', 'Acceptée'),
        ('REFUSEE', 'Refusée'),
        ('TERMINEE', 'Terminée'),
    ]

    mentore = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='demandes_envoyees')
    mentor = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='demandes_recues')
    matiere = models.ForeignKey(Matiere, on_delete=models.CASCADE, related_name='demandes')
    message = models.TextField(help_text="Précisez votre besoin, vos blocages ou vos objectifs")
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='EN_ATTENTE')
    date_creation = models.DateTimeField(auto_now_add=True)
    date_mise_a_jour = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Demande de mentorat"
        verbose_name_plural = "Demandes de mentorat"
        ordering = ['-date_creation']

    def __str__(self):
        return f"Demande #{self.id} : {self.mentore.user.username} -> {self.mentor.user.username} [{self.matiere.nom}] ({self.statut})"
