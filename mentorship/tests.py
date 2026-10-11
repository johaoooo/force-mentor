from django.test import TestCase
from django.contrib.auth.models import User
from accounts.models import Profile
from mentorship.models import Matiere, CompetenceMentor, DemandeMentorat

class MentorshipWorkflowTests(TestCase):
    def setUp(self):
        # Création d'un mentor
        self.mentor_user = User.objects.create_user(username='mentor_test', password='password123')
        self.mentor_profile = self.mentor_user.profile
        self.mentor_profile.role = 'MENTOR'
        self.mentor_profile.save()

        # Création d'un mentoré
        self.mentore_user = User.objects.create_user(username='mentore_test', password='password123')
        self.mentore_profile = self.mentore_user.profile
        self.mentore_profile.role = 'MENTORE'
        self.mentore_profile.save()

        # Matière
        self.matiere = Matiere.objects.create(nom='Python Avancé', description='POO et design patterns')

        # Compétence du mentor
        CompetenceMentor.objects.create(
            mentor=self.mentor_profile,
            matiere=self.matiere,
            niveau_expertise='EXPERT'
        )

    def test_mentor_has_correct_role(self):
        self.assertTrue(self.mentor_profile.est_mentor)
        self.assertFalse(self.mentor_profile.est_mentore)

    def test_demande_creation_and_acceptance(self):
        demande = DemandeMentorat.objects.create(
            mentore=self.mentore_profile,
            mentor=self.mentor_profile,
            matiere=self.matiere,
            message="Besoin d'aide pour mon projet Python"
        )
        self.assertEqual(demande.statut, 'EN_ATTENTE')

        # Accepter la demande
        demande.statut = 'ACCEPTEE'
        demande.save()
        self.assertEqual(demande.statut, 'ACCEPTEE')

    def test_home_page_status_code(self):
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Trouvez le mentor idéal")
