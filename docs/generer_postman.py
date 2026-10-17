import json

collection = {
    "info": {
        "_postman_id": "force-mentor-api-v1",
        "name": "Force Mentor — API REST",
        "description": "Collection Postman officielle pour tester et documenter l'API REST Django (DRF) du projet Force Mentor.",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "item": [
        {
            "name": "1. Authentification & Comptes",
            "item": [
                {
                    "name": "Inscription (Register)",
                    "request": {
                        "method": "POST",
                        "header": [
                            {"key": "Content-Type", "value": "application/json"}
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({
                                "username": "apprenant_test",
                                "password": "Password123!",
                                "first_name": "Joseph",
                                "last_name": "Dehazounde",
                                "email": "joseph.test@example.com",
                                "role": "MENTORE",
                                "niveau": "L2",
                                "filiere": "Génie Logiciel",
                                "bio": "Apprenant motivé dans le parcours Python Force-N"
                            }, indent=2)
                        },
                        "url": {
                            "raw": "{{base_url}}/api/auth/register/",
                            "host": ["{{base_url}}"],
                            "path": ["api", "auth", "register", ""]
                        },
                        "description": "Crée un nouvel utilisateur et son profil associé (Mentoré ou Mentor)."
                    }
                },
                {
                    "name": "Connexion (Login)",
                    "request": {
                        "method": "POST",
                        "header": [
                            {"key": "Content-Type", "value": "application/json"}
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({
                                "username": "apprenant_test",
                                "password": "Password123!"
                            }, indent=2)
                        },
                        "url": {
                            "raw": "{{base_url}}/api/auth/login/",
                            "host": ["{{base_url}}"],
                            "path": ["api", "auth", "login", ""]
                        },
                        "description": "Authentifie l'utilisateur et initialise la session Django (cookies de session)."
                    }
                },
                {
                    "name": "Utilisateur connecté (Me)",
                    "request": {
                        "method": "GET",
                        "header": [],
                        "url": {
                            "raw": "{{base_url}}/api/auth/me/",
                            "host": ["{{base_url}}"],
                            "path": ["api", "auth", "me", ""]
                        },
                        "description": "Retourne les informations du profil de l'utilisateur actuellement connecté."
                    }
                },
                {
                    "name": "Mise à jour du profil",
                    "request": {
                        "method": "PUT",
                        "header": [
                            {"key": "Content-Type", "value": "application/json"}
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({
                                "first_name": "Joseph",
                                "last_name": "Dehazounde",
                                "email": "joseph.maj@example.com",
                                "bio": "Spécialisation en cours sur Django et Angular",
                                "telephone": "+2290162108694",
                                "est_disponible": True,
                                "matieres": [1, 2]
                            }, indent=2)
                        },
                        "url": {
                            "raw": "{{base_url}}/api/auth/profile/",
                            "host": ["{{base_url}}"],
                            "path": ["api", "auth", "profile", ""]
                        },
                        "description": "Met à jour les données personnelles, disponibilités et compétences du profil."
                    }
                },
                {
                    "name": "Déconnexion (Logout)",
                    "request": {
                        "method": "POST",
                        "header": [],
                        "url": {
                            "raw": "{{base_url}}/api/auth/logout/",
                            "host": ["{{base_url}}"],
                            "path": ["api", "auth", "logout", ""]
                        },
                        "description": "Ferme la session utilisateur active."
                    }
                }
            ]
        },
        {
            "name": "2. Matières",
            "item": [
                {
                    "name": "Liste des matières",
                    "request": {
                        "method": "GET",
                        "header": [],
                        "url": {
                            "raw": "{{base_url}}/api/matieres/",
                            "host": ["{{base_url}}"],
                            "path": ["api", "matieres", ""]
                        },
                        "description": "Récupère le catalogue des matières disponibles pour le mentorat (Python, Django, etc.)."
                    }
                }
            ]
        },
        {
            "name": "3. Mentors & Recherche",
            "item": [
                {
                    "name": "Liste de tous les mentors disponibles",
                    "request": {
                        "method": "GET",
                        "header": [],
                        "url": {
                            "raw": "{{base_url}}/api/mentors/",
                            "host": ["{{base_url}}"],
                            "path": ["api", "mentors", ""]
                        },
                        "description": "Retourne la liste des mentors actifs avec leurs matières et expertises."
                    }
                },
                {
                    "name": "Filtrer les mentors par matière",
                    "request": {
                        "method": "GET",
                        "header": [],
                        "url": {
                            "raw": "{{base_url}}/api/mentors/?matiere=1",
                            "host": ["{{base_url}}"],
                            "path": ["api", "mentors", ""],
                            "query": [
                                {"key": "matiere", "value": "1", "description": "ID de la matière recherchée"}
                            ]
                        },
                        "description": "Filtre les profils mentors en fonction d'une matière spécifique (règle des < 3 clics)."
                    }
                },
                {
                    "name": "Recherche textuelle de mentors",
                    "request": {
                        "method": "GET",
                        "header": [],
                        "url": {
                            "raw": "{{base_url}}/api/mentors/?q=python",
                            "host": ["{{base_url}}"],
                            "path": ["api", "mentors", ""],
                            "query": [
                                {"key": "q", "value": "python", "description": "Mot clé (nom, bio, matière)"}
                            ]
                        },
                        "description": "Recherche par mot-clé dans les compétences, noms et filières des mentors."
                    }
                },
                {
                    "name": "Fiche détaillée d'un mentor",
                    "request": {
                        "method": "GET",
                        "header": [],
                        "url": {
                            "raw": "{{base_url}}/api/mentors/1/",
                            "host": ["{{base_url}}"],
                            "path": ["api", "mentors", "1", ""]
                        },
                        "description": "Récupère le profil complet d'un mentor avec biographie, notes et compétences."
                    }
                }
            ]
        },
        {
            "name": "4. Demandes de Mentorat",
            "item": [
                {
                    "name": "Consulter mes demandes (Dashboard)",
                    "request": {
                        "method": "GET",
                        "header": [],
                        "url": {
                            "raw": "{{base_url}}/api/demandes/",
                            "host": ["{{base_url}}"],
                            "path": ["api", "demandes", ""]
                        },
                        "description": "Retourne les demandes envoyées (si mentoré) et reçues (si mentor)."
                    }
                },
                {
                    "name": "Créer une demande de mentorat",
                    "request": {
                        "method": "POST",
                        "header": [
                            {"key": "Content-Type", "value": "application/json"}
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({
                                "mentor_id": 1,
                                "matiere_id": 1,
                                "message": "Bonjour, j'ai besoin d'aide pour comprendre les relations ManyToMany et les signaux dans Django."
                            }, indent=2)
                        },
                        "url": {
                            "raw": "{{base_url}}/api/demandes/",
                            "host": ["{{base_url}}"],
                            "path": ["api", "demandes", ""]
                        },
                        "description": "Envoie une nouvelle demande de mise en relation à un mentor."
                    }
                },
                {
                    "name": "Traiter une demande (Accepter)",
                    "request": {
                        "method": "POST",
                        "header": [
                            {"key": "Content-Type", "value": "application/json"}
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({
                                "action": "accepter"
                            }, indent=2)
                        },
                        "url": {
                            "raw": "{{base_url}}/api/demandes/1/action/",
                            "host": ["{{base_url}}"],
                            "path": ["api", "demandes", "1", "action", ""]
                        },
                        "description": "Permet au mentor de valider et accepter la demande reçue."
                    }
                },
                {
                    "name": "Traiter une demande (Refuser)",
                    "request": {
                        "method": "POST",
                        "header": [
                            {"key": "Content-Type", "value": "application/json"}
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({
                                "action": "refuser"
                            }, indent=2)
                        },
                        "url": {
                            "raw": "{{base_url}}/api/demandes/1/action/",
                            "host": ["{{base_url}}"],
                            "path": ["api", "demandes", "1", "action", ""]
                        },
                        "description": "Permet au mentor de décliner une demande."
                    }
                }
            ]
        },
        {
            "name": "5. Statistiques Générales",
            "item": [
                {
                    "name": "Statistiques de la plateforme",
                    "request": {
                        "method": "GET",
                        "header": [],
                        "url": {
                            "raw": "{{base_url}}/api/stats/",
                            "host": ["{{base_url}}"],
                            "path": ["api", "stats", ""]
                        },
                        "description": "Compteurs globaux : nombre de mentors, matières couvertes, demandes traitées."
                    }
                }
            ]
        }
    ]
}

environment = {
    "id": "force-mentor-env-local",
    "name": "Force Mentor — Environnement Local",
    "values": [
        {
            "key": "base_url",
            "value": "http://127.0.0.1:8000",
            "type": "default",
            "enabled": True
        }
    ]
}

with open('/home/joe/Bureau/force-mentor/docs/Force_Mentor_API.postman_collection.json', 'w', encoding='utf-8') as f:
    json.dump(collection, f, indent=2, ensure_ascii=False)

with open('/home/joe/Bureau/force-mentor/docs/Force_Mentor_Environment.postman_environment.json', 'w', encoding='utf-8') as f:
    json.dump(environment, f, indent=2, ensure_ascii=False)

print("Collection et Environnement Postman générés avec succès !")
