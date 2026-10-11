# 🗺️ Feuille de Route & Suite Logique — Projet Force Mentor

## 📌 Situation actuelle
- **Étape franchie :** Analyse des besoins et rédaction du **Cahier des charges**.
- **Prochaine étape :** Conception technique, modélisation des données et initialisation du projet.

---

## 🚀 La suite logique pas à pas

### Étape 1 : Conception & Modélisation (À faire dès maintenant)
1. **Modélisation de la base de données (Schéma relationnel)** :
   - `User` / `Profil` : rôle (mentor, mentoré ou les deux), nom, prénom, email, filière, niveau, biographie, photo.
   - `Matiere` : nom de la matière (ex: Algorithmique, Python, Réseaux, Mathématiques), description.
   - `MentorCompetence` : association entre un mentor, une matière et son niveau de maîtrise.
   - `DemandeMentorat` : émetteur (mentoré), destinataire (mentor), matière concernée, message, date de demande, statut (`EN_ATTENTE`, `ACCEPTEE`, `REFUSEE`).
2. **Wireframing / Maquettage simple (Papier ou Figma)** :
   - Accueil / Landing page
   - Inscription & Connexion
   - Tableau de bord mentoré / mentor
   - Liste des mentors avec filtre par matière
   - Page de profil / envoi de demande
3. **Découpage des tâches dans le binôme** :
   - Qui développe quel module ?

---

### Étape 2 : Initialisation de l'environnement de développement
1. **Dépôt Git & GitHub** :
   - Créer le dépôt commun sur GitHub.
   - Configurer le `.gitignore` (exclure `__pycache__`, `db.sqlite3`, `env/`).
2. **Environnement virtuel Python** :
   - Création de l'environnement virtuel (`python3 -m venv env`).
   - Installation de Django (`pip install django`).
   - Fichier de dépendances `requirements.txt`.
3. **Création du projet Django** :
   - `django-admin startproject force_mentor_project .`
   - Création des applications : `accounts` (utilisateurs/profils), `mentorship` (matières et demandes).

---

### Étape 3 : Développement itératif (Sprints)
* **Sprint 1 : Authentification & Profils**
  * Inscription / Connexion / Déconnexion.
  * Création et modification du profil utilisateur avec choix des rôles et matières.
* **Sprint 2 : Annuaire & Recherche des Mentors**
  * Affichage de la liste des mentors.
  * Filtre interactif par matière (en moins de 3 clics comme exigé dans le cahier des charges).
* **Sprint 3 : Gestion des Demandes de Mise en Relation**
  * Formulaire d'envoi d'une demande par un mentoré.
  * Actions pour le mentor : Accepter / Refuser.
* **Sprint 4 : Tableaux de Bord & Finitions UI**
  * Espace mentor : suivi des demandes reçues.
  * Espace mentoré : suivi des demandes envoyées.
  * Amélioration du design (CSS sobre, clair et responsive).

---

### Étape 4 : Tests, Documentation & Déploiement
* Tests unitaires des modèles et des vues (`pytest` ou `python manage.py test`).
* Préparation du déploiement (hébergement gratuit sur Render ou Railway).
* Rédaction de la documentation finale et préparation de la soutenance.
