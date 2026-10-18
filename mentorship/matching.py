"""
Service de Matching Intelligent pour Force Mentor.
Associe les étudiants (mentorés) aux mentors les plus pertinents
selon la matière, la filière, le niveau d'études et les disponibilités communes.
"""
from accounts.models import Profile

LEVEL_RANKS = {
    'L1': 1,
    'L2': 2,
    'L3': 3,
    'M1': 4,
    'M2': 5,
    'CERTIF': 3,
    'AUTRE': 2,
}

TECH_KEYWORDS = [
    'info', 'informatique', 'logiciel', 'software', 'dev', 'web', 'reseau', 'réseau',
    'systeme', 'système', 'data', 'ia', 'intelligence', 'cyber', 'securite', 'sécurité',
    'telecom', 'télécom', 'mobile', 'cloud'
]

JOURS_NOMS = {
    0: 'Lundi',
    1: 'Mardi',
    2: 'Mercredi',
    3: 'Jeudi',
    4: 'Vendredi',
    5: 'Samedi',
    6: 'Dimanche',
}

def calculate_mentor_match(mentor, student_filiere=None, student_niveau=None, matiere_id=None, jour_semaine=None):
    """
    Calcule un score de compatibilité (0 à 100) et liste les points forts d'un mentor
    par rapport au profil de l'étudiant et aux critères recherchés.
    """
    score = 0
    raisons = []
    
    # 1. MATIÈRE & EXPERTISE (Max 40 points)
    matiere_pts = 0
    if matiere_id:
        try:
            m_id = int(matiere_id)
        except (ValueError, TypeError):
            m_id = None

        comp_match = None
        if m_id:
            comp_match = mentor.competences.filter(matiere_id=m_id).first()

        if comp_match:
            exp = comp_match.niveau_expertise
            mat_nom = comp_match.matiere.nom
            if exp == 'EXPERT':
                matiere_pts = 40
                raisons.append(f"Expertise maximale en {mat_nom} (Niveau Expert)")
            elif exp == 'AVANCE':
                matiere_pts = 35
                raisons.append(f"Solide maîtrise en {mat_nom} (Niveau Avancé)")
            else:
                matiere_pts = 28
                raisons.append(f"Compétence validée en {mat_nom} (Intermédiaire)")
        else:
            # Matière non listée dans ses compétences clés
            matiere_pts = 8
    else:
        # Pas de matière spécifique : valoriser le bagage de compétences
        nb_comps = mentor.competences.count()
        if nb_comps >= 3:
            matiere_pts = 35
            noms = ", ".join([c.matiere.nom for c in mentor.competences.all()[:3]])
            raisons.append(f"Expertises diversifiées : {noms}")
        elif nb_comps >= 1:
            matiere_pts = 28
            noms = ", ".join([c.matiere.nom for c in mentor.competences.all()[:2]])
            raisons.append(f"Compétence(s) validée(s) : {noms}")
        else:
            matiere_pts = 15

    score += matiere_pts

    # 2. FILIÈRE & DOMAINE D'ÉTUDES (Max 25 points)
    filiere_pts = 0
    s_fil = (student_filiere or '').strip().lower()
    m_fil = (mentor.filiere or '').strip().lower()

    if s_fil and m_fil:
        if s_fil == m_fil or s_fil in m_fil or m_fil in s_fil:
            filiere_pts = 25
            raisons.append(f"Même filière : {mentor.filiere}")
        else:
            # Vérification de mots-clés communs
            s_tech = any(k in s_fil for k in TECH_KEYWORDS)
            m_tech = any(k in m_fil for k in TECH_KEYWORDS)
            if s_tech and m_tech:
                filiere_pts = 20
                raisons.append("Domaine technologique & informatique similaire")
            else:
                filiere_pts = 10
    else:
        filiere_pts = 15

    score += filiere_pts

    # 3. NIVEAU D'ÉTUDES & SÉNIORITÉ (Max 20 points)
    niveau_pts = 0
    s_rank = LEVEL_RANKS.get(student_niveau, 1)
    m_rank = LEVEL_RANKS.get(mentor.niveau, 3)
    diff = m_rank - s_rank

    if diff >= 2:
        niveau_pts = 20
        raisons.append(f"Niveau {mentor.get_niveau_display()} (recul de {diff} promotions, idéal pour encadrer)")
    elif diff == 1:
        niveau_pts = 18
        raisons.append(f"Niveau {mentor.get_niveau_display()} (proche de votre cursus actuel)")
    elif diff == 0:
        niveau_pts = 14
        raisons.append("Même promotion (entraide directe entre pairs)")
    else:
        niveau_pts = 8

    score += niveau_pts

    # 4. DISPONIBILITÉS HEBDOMADAIRES (Max 15 points)
    dispo_pts = 0
    active_dispos = mentor.disponibilites.filter(est_actif=True)

    if jour_semaine is not None and str(jour_semaine).strip() != '':
        try:
            j_int = int(jour_semaine)
        except (ValueError, TypeError):
            j_int = None

        if j_int is not None:
            day_match = active_dispos.filter(jour_semaine=j_int).first()
            if day_match:
                dispo_pts = 15
                j_nom = JOURS_NOMS.get(j_int, 'ce jour')
                h_debut = day_match.heure_debut.strftime('%H:%M')
                raisons.append(f"Disponible le {j_nom} à partir de {h_debut}")
            elif active_dispos.exists():
                dispo_pts = 8
                raisons.append("Créneaux disponibles sur d'autres jours")
            else:
                dispo_pts = 4
        else:
            dispo_pts = 10
    else:
        count = active_dispos.count()
        if count >= 3:
            dispo_pts = 15
            raisons.append(f"{count} créneaux de disponibilité cette semaine")
        elif count >= 1:
            dispo_pts = 12
            raisons.append(f"{count} créneau(x) de disponibilité")
        else:
            dispo_pts = 5

    score += dispo_pts

    # Calcul final
    final_score = min(99, max(45, score))

    if final_score >= 90:
        label = "Compatibilité exceptionnelle"
        color = "success"
    elif final_score >= 80:
        label = "Très forte compatibilité"
        color = "primary"
    elif final_score >= 70:
        label = "Bonne compatibilité"
        color = "info"
    else:
        label = "Profil adapté"
        color = "secondary"

    return {
        'score': final_score,
        'label': label,
        'color': color,
        'raisons': raisons[:4]
    }
