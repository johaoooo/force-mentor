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


class DisponibiliteMentor(models.Model):
    """Créneau récurrent de disponibilité hebdomadaire défini par le mentor."""
    JOURS_SEMAINE = [
        (0, 'Lundi'),
        (1, 'Mardi'),
        (2, 'Mercredi'),
        (3, 'Jeudi'),
        (4, 'Vendredi'),
        (5, 'Samedi'),
        (6, 'Dimanche'),
    ]

    mentor = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='disponibilites')
    jour_semaine = models.PositiveSmallIntegerField(choices=JOURS_SEMAINE, help_text="0=Lundi, ..., 6=Dimanche")
    heure_debut = models.TimeField(help_text="Format HH:MM (ex: 18:00)")
    heure_fin = models.TimeField(help_text="Format HH:MM (ex: 19:30)")
    est_actif = models.BooleanField(default=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Disponibilité Mentor"
        verbose_name_plural = "Disponibilités Mentors"
        ordering = ['jour_semaine', 'heure_debut']

    def __str__(self):
        return f"{self.mentor.user.username} - {self.get_jour_semaine_display()} {self.heure_debut.strftime('%H:%M')} à {self.heure_fin.strftime('%H:%M')}"


class DemandeMentorat(models.Model):
    """Demande de mise en relation et réservation de séance de mentorat."""
    STATUT_CHOICES = [
        ('EN_ATTENTE', 'En attente'),
        ('ACCEPTEE', 'Acceptée'),
        ('REFUSEE', 'Refusée'),
        ('TERMINEE', 'Terminée'),
        ('ANNULEE', 'Annulée'),
    ]

    mentore = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='demandes_envoyees')
    mentor = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='demandes_recues')
    matiere = models.ForeignKey(Matiere, on_delete=models.CASCADE, related_name='demandes')
    message = models.TextField(help_text="Précisez votre besoin, vos blocages ou vos objectifs")
    statut = models.CharField(max_length=20, choices=STATUT_CHOICES, default='EN_ATTENTE')
    
    # Planification & créneau de séance
    date_heure_souhaitee = models.DateTimeField(null=True, blank=True, help_text="Date et heure prévues de la séance")
    duree_minutes = models.PositiveIntegerField(default=60, help_text="Durée prévue en minutes (ex: 45, 60)")
    disponibilite = models.ForeignKey(DisponibiliteMentor, null=True, blank=True, on_delete=models.SET_NULL, related_name='reservations')
    lien_visio = models.URLField(max_length=300, blank=True, help_text="Lien automatique de visio (Jitsi Meet)")
    commentaire_mentor = models.TextField(blank=True, help_text="Notes ou compte-rendu du mentor post-séance")

    date_creation = models.DateTimeField(auto_now_add=True)
    date_mise_a_jour = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Demande de mentorat"
        verbose_name_plural = "Demandes de mentorat"
        ordering = ['-date_creation']

    def __str__(self):
        return f"Demande #{self.id} : {self.mentore.user.username} -> {self.mentor.user.username} [{self.matiere.nom}] ({self.statut})"


class Notification(models.Model):
    """Notification in-app pour les étudiants et mentors."""
    TYPE_CHOICES = [
        ('DEMANDE', 'Demande de séance'),
        ('CONFIRMATION', 'Séance confirmée'),
        ('RAPPEL', 'Rappel de séance'),
        ('ANNULATION', 'Séance annulée'),
        ('MESSAGE', 'Nouveau message'),
        ('SYSTEME', 'Information système'),
    ]

    destinataire = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='notifications')
    titre = models.CharField(max_length=150)
    message = models.TextField()
    lien = models.CharField(max_length=200, blank=True, default='/tableau-de-bord')
    type_notif = models.CharField(max_length=20, choices=TYPE_CHOICES, default='DEMANDE')
    est_lu = models.BooleanField(default=False)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"
        ordering = ['-date_creation']

    def __str__(self):
        return f"Notif [{self.type_notif}] pour {self.destinataire.user.username} : {self.titre}"


class Conversation(models.Model):
    """Fil de discussion entre mentor et mentoré."""
    participants = models.ManyToManyField(Profile, related_name='conversations')
    demande = models.ForeignKey(DemandeMentorat, null=True, blank=True, on_delete=models.SET_NULL, related_name='conversations')
    date_creation = models.DateTimeField(auto_now_add=True)
    date_mise_a_jour = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Conversation"
        verbose_name_plural = "Conversations"
        ordering = ['-date_mise_a_jour']

    def __str__(self):
        return f"Conversation #{self.id}"


class Message(models.Model):
    """Message individuel au sein d'une conversation."""
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    expediteur = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='messages_envoyes')
    contenu = models.TextField()
    est_lu = models.BooleanField(default=False)
    date_envoi = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Message"
        verbose_name_plural = "Messages"
        ordering = ['date_envoi']

    def __str__(self):
        return f"Message #{self.id} de {self.expediteur.user.username} : {self.contenu[:30]}"
