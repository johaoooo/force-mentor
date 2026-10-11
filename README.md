# 🎓 Force Mentor — Plateforme d'Entraide Étudiante

Application web de mentorat développée avec **Python** et **Django** dans le cadre du programme **Force-N**.

---

## 📖 À propos du Projet

Force Mentor permet de mettre en relation des étudiants de Force-N pour de l'entraide par matière :
* **Recherche et filtre rapide** des mentors par matière (< 3 clics).
* **Gestion des comptes & profils** : rôle Mentor, Mentoré ou les deux, filière, niveau et compétences.
* **Cycle des demandes de mentorat** : envoi de demande, acceptation, refus et suivi via un tableau de bord dédié.

---

## 🛠️ Stack Technique

* **Langage :** Python 3.13+
* **Framework Web :** Django 6.1+
* **Base de données :** SQLite (développement)
* **Frontend :** Templates Django HTML5, CSS3, Bootstrap 5 & Bootstrap Icons

---

## 🚀 Démarrage Rapide

### 1. Activer l'environnement virtuel
```bash
cd /home/joe/Bureau/force-mentor
source env/bin/activate
```

### 2. Lancer le serveur de développement
```bash
python manage.py runserver
```
L'application est alors accessible à l'adresse : **http://127.0.0.1:8000/**

---

## 👥 Comptes de Démonstration (Prêts à l'emploi)

Pour vos tests et votre présentation, plusieurs comptes sont déjà créés :

| Rôle | Identifiant (Username) | Mot de passe | Description |
| :--- | :--- | :--- | :--- |
| **Administrateur** | `admin` | `admin123` | Accès au panneau Django Admin (`/admin/`) |
| **Mentor (Python & Django)** | `moussa_diop` | `passer123` | Étudiant L3, mentor sur Python et Django |
| **Mentor (Algorithmique & SQL)** | `aminata_diallo` | `passer123` | Étudiante M1, mentor sur Algorithmique et SQL |
| **Mentor & Mentoré (Réseaux)** | `cheikh_fall` | `passer123` | Étudiant L3, double rôle |
| **Mentorée (Apprenante L1)** | `fatou_ndiaye` | `passer123` | Étudiante L1, a envoyé une demande à Moussa |

---

## 📁 Organisation du Dossier

```text
force-mentor/
├── docs/                             # Documentation et livrables
│   ├── Cahier_des_charges_Force_Mentor.pdf
│   ├── 01_FEUILLE_DE_ROUTE.md
│   └── 02_CONCEPTION_TECHNIQUE.md
├── accounts/                         # Gestion utilisateurs et profils
│   ├── models.py (Profile)
│   ├── forms.py (Inscription, Profil)
│   └── views.py, urls.py
├── mentorship/                       # Logique de mise en relation
│   ├── models.py (Matiere, CompetenceMentor, DemandeMentorat)
│   ├── views.py, urls.py, forms.py
│   └── templates/
├── force_mentor_project/             # Configuration globale Django
├── templates/                        # Gabarits HTML5 / Bootstrap 5
├── static/                           # Fichiers statiques (CSS, JS)
├── seed_data.py                      # Script pour recharger les données de test
└── requirements.txt                  # Dépendances du projet
```
