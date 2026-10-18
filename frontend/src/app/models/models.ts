export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface Matiere {
  id: number;
  nom: string;
  description: string;
  icone: string;
}

export interface CompetenceMentor {
  id: number;
  matiere: Matiere;
  niveau_expertise: string;
  niveau_display: string;
}

export interface DisponibiliteMentor {
  id: number;
  jour_semaine: number;
  jour_display: string;
  heure_debut: string;
  heure_fin: string;
  est_actif: boolean;
}

export interface Profile {
  id: number;
  user: User;
  role: 'MENTORE' | 'MENTOR' | 'LES_DEUX';
  role_display: string;
  filiere: string;
  niveau: string;
  niveau_display: string;
  bio: string;
  telephone: string;
  est_disponible: boolean;
  est_mentor: boolean;
  est_mentore: boolean;
  competences: CompetenceMentor[];
  disponibilites?: DisponibiliteMentor[];
  photo_url?: string | null;
}

export interface DemandeMentorat {
  id: number;
  mentore: Profile;
  mentor: Profile;
  matiere: Matiere;
  message: string;
  statut: 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE' | 'TERMINEE' | 'ANNULEE';
  statut_display: string;
  date_heure_souhaitee?: string | null;
  duree_minutes?: number;
  disponibilite?: DisponibiliteMentor | null;
  lien_visio?: string;
  commentaire_mentor?: string;
  date_creation: string;
  date_mise_a_jour: string;
}

export interface Notification {
  id: number;
  titre: string;
  message: string;
  lien: string;
  type_notif: 'DEMANDE' | 'CONFIRMATION' | 'RAPPEL' | 'ANNULATION' | 'MESSAGE' | 'SYSTEME';
  type_display: string;
  est_lu: boolean;
  date_creation: string;
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  expediteur: Profile;
  expediteur_id: number;
  contenu: string;
  est_lu: boolean;
  date_envoi: string;
}

export interface Conversation {
  id: number;
  autre_participant: Profile;
  dernier_message?: {
    id: number;
    contenu: string;
    expediteur_id: number;
    est_lu: boolean;
    date_envoi: string;
  } | null;
  nb_non_lus: number;
  date_mise_a_jour: string;
  date_creation: string;
}

export interface Stats {
  total_mentors: number;
  total_matieres: number;
  total_demandes: number;
  total_utilisateurs: number;
}

export interface MatchingResult {
  mentor: Profile;
  score: number;
  label: string;
  color: string;
  raisons: string[];
}

export interface MatchingResponse {
  criteres: {
    filiere?: string | null;
    niveau?: string | null;
    matiere_id?: string | number | null;
    jour_semaine?: string | number | null;
  };
  total: number;
  results: MatchingResult[];
}
