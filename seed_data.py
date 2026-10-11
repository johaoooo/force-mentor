import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'force_mentor_project.settings')
django.setup()

from django.contrib.auth.models import User
from accounts.models import Profile
from mentorship.models import Matiere, CompetenceMentor, DemandeMentorat

def seed():
    print("🌱 Initialisation des données de démonstration Force Mentor...")

    # 1. Création du superutilisateur admin s'il n'existe pas
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@forcen.sn', 'admin123')
        print("✅ Superutilisateur créé : admin / admin123")
    else:
        print("ℹ️ Superutilisateur admin existe déjà.")

    # 2. Création des matières
    matieres_data = [
        {"nom": "Python Fondamentaux", "description": "Bases de Python, structures de données, POO, scripts", "icone": "bi-filetype-py"},
        {"nom": "Développement Web Django", "description": "Architecture MTV, ORM, gabarits, formulaires et authentification", "icone": "bi-code-slash"},
        {"nom": "Algorithmique & Structures de données", "description": "Complexité, tris, listes, arbres, récursivité", "icone": "bi-diagram-3"},
        {"nom": "Bases de Données & SQL", "description": "Modélisation relationnelle, requêtes SQL, intégrité et index", "icone": "bi-database"},
        {"nom": "Réseaux Informatiques & Protocoles", "description": "Modèle OSI, TCP/IP, routage, adressage IPv4/IPv6", "icone": "bi-hdd-network"},
    ]

    matieres_obj = {}
    for data in matieres_data:
        m, created = Matiere.objects.get_or_create(nom=data["nom"], defaults=data)
        matieres_obj[data["nom"]] = m
        if created:
            print(f"✅ Matière ajoutée : {m.nom}")

    # 3. Création des mentors
    mentors_data = [
        {
            "username": "moussa_diop",
            "first_name": "Moussa",
            "last_name": "Diop",
            "email": "moussa.diop@forcen.sn",
            "filiere": "Génie Logiciel",
            "niveau": "L3",
            "role": "MENTOR",
            "bio": "Passionné par l'écosystème Python et le développement d'applications web avec Django. Disponible pour aider sur les projets et les bonnes pratiques.",
            "telephone": "+221 77 123 45 67",
            "competences": [
                ("Python Fondamentaux", "EXPERT"),
                ("Développement Web Django", "AVANCE"),
            ]
        },
        {
            "username": "aminata_diallo",
            "first_name": "Aminata",
            "last_name": "Diallo",
            "email": "aminata.diallo@forcen.sn",
            "filiere": "Informatique de Gestion",
            "niveau": "M1",
            "role": "MENTOR",
            "bio": "Spécialisée en conception de bases de données et optimisation d'algorithmes. J'aime vulgariser les concepts difficiles.",
            "telephone": "+221 78 234 56 78",
            "competences": [
                ("Algorithmique & Structures de données", "EXPERT"),
                ("Bases de Données & SQL", "AVANCE"),
            ]
        },
        {
            "username": "cheikh_fall",
            "first_name": "Cheikh",
            "last_name": "Fall",
            "email": "cheikh.fall@forcen.sn",
            "filiere": "Réseaux & Télécoms",
            "niveau": "L3",
            "role": "LES_DEUX",
            "bio": "Étudiant en réseaux et passionné par l'automatisation avec Python. Je mentore sur les réseaux et je cherche du mentorat sur Django.",
            "telephone": "+221 76 345 67 89",
            "competences": [
                ("Réseaux Informatiques & Protocoles", "AVANCE"),
                ("Python Fondamentaux", "INTERMEDIAIRE"),
            ]
        }
    ]

    for m_info in mentors_data:
        comps = m_info.pop("competences")
        user, u_created = User.objects.get_or_create(
            username=m_info["username"],
            defaults={
                "first_name": m_info["first_name"],
                "last_name": m_info["last_name"],
                "email": m_info["email"],
            }
        )
        if u_created:
            user.set_password("passer123")
            user.save()
            print(f"✅ Utilisateur créé : {user.username} (mot de passe: passer123)")

        profile = user.profile
        profile.role = m_info["role"]
        profile.filiere = m_info["filiere"]
        profile.niveau = m_info["niveau"]
        profile.bio = m_info["bio"]
        profile.telephone = m_info["telephone"]
        profile.est_disponible = True
        profile.save()

        for nom_mat, niveau_exp in comps:
            CompetenceMentor.objects.get_or_create(
                mentor=profile,
                matiere=matieres_obj[nom_mat],
                defaults={"niveau_expertise": niveau_exp}
            )

    # 4. Création d'un compte étudiant mentoré pour les tests
    etudiant_user, e_created = User.objects.get_or_create(
        username="fatou_ndiaye",
        defaults={
            "first_name": "Fatou",
            "last_name": "Ndiaye",
            "email": "fatou.ndiaye@forcen.sn"
        }
    )
    if e_created:
        etudiant_user.set_password("passer123")
        etudiant_user.save()
        print("✅ Étudiante mentorée créée : fatou_ndiaye (mot de passe: passer123)")

    e_profile = etudiant_user.profile
    e_profile.role = 'MENTORE'
    e_profile.filiere = 'Tronc Commun Informatique'
    e_profile.niveau = 'L1'
    e_profile.bio = 'Nouvelle étudiante dans le parcours, très motivée pour apprendre le développement Python et réussir mon premier projet.'
    e_profile.save()

    # 5. Création d'une demande de démonstration
    moussa_profile = User.objects.get(username="moussa_diop").profile
    DemandeMentorat.objects.get_or_create(
        mentore=e_profile,
        mentor=moussa_profile,
        matiere=matieres_obj["Python Fondamentaux"],
        defaults={
            "message": "Bonjour Moussa, je bloque sur la compréhension de la POO et la manipulation des classes en Python pour notre projet d'équipe. Pourrais-tu m'accorder une session d'aide ?",
            "statut": "EN_ATTENTE"
        }
    )
    print("✅ Demande de mentorat de démonstration créée avec succès !")
    print("\n🎉 Données de test prêtes pour la démonstration !")

if __name__ == '__main__':
    seed()
