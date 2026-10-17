import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DemandeMentorat, DisponibiliteMentor, Notification, Conversation, ChatMessage } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class MentorshipService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8001/api';

  // --- Demandes & Réservations ---
  getDemandes(): Observable<{ recues: DemandeMentorat[]; envoyees: DemandeMentorat[] }> {
    return this.http.get<{ recues: DemandeMentorat[]; envoyees: DemandeMentorat[] }>(
      `${this.apiUrl}/demandes/`, 
      { withCredentials: true }
    );
  }

  createDemande(payload: {
    mentor_id: number;
    matiere_id: number;
    message: string;
    date_heure_souhaitee?: string;
    disponibilite_id?: number | null;
    duree_minutes?: number;
  }): Observable<{ message: string; demande: DemandeMentorat }> {
    return this.http.post<{ message: string; demande: DemandeMentorat }>(
      `${this.apiUrl}/demandes/`,
      payload,
      { withCredentials: true }
    );
  }

  updateDemandeStatus(
    demandeId: number, 
    action: 'accepter' | 'refuser' | 'terminer' | 'annuler',
    commentaire_mentor?: string
  ): Observable<{ message: string; demande: DemandeMentorat }> {
    return this.http.post<{ message: string; demande: DemandeMentorat }>(
      `${this.apiUrl}/demandes/${demandeId}/action/`,
      { action, commentaire_mentor },
      { withCredentials: true }
    );
  }

  // --- Disponibilités Mentor & Calendrier ---
  getMentorDisponibilites(mentorId: number): Observable<DisponibiliteMentor[]> {
    return this.http.get<DisponibiliteMentor[]>(
      `${this.apiUrl}/mentors/${mentorId}/disponibilites/`,
      { withCredentials: true }
    );
  }

  getMyDisponibilites(): Observable<DisponibiliteMentor[]> {
    return this.http.get<DisponibiliteMentor[]>(
      `${this.apiUrl}/mes-disponibilites/`,
      { withCredentials: true }
    );
  }

  addDisponibilite(data: { jour_semaine: number; heure_debut: string; heure_fin: string }): Observable<{ message: string; disponibilite: DisponibiliteMentor }> {
    return this.http.post<{ message: string; disponibilite: DisponibiliteMentor }>(
      `${this.apiUrl}/mes-disponibilites/`,
      data,
      { withCredentials: true }
    );
  }

  deleteDisponibilite(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(
      `${this.apiUrl}/mes-disponibilites/${id}/`,
      { withCredentials: true }
    );
  }

  // --- Notifications In-App ---
  getNotifications(): Observable<{ unread_count: number; notifications: Notification[] }> {
    return this.http.get<{ unread_count: number; notifications: Notification[] }>(
      `${this.apiUrl}/notifications/`,
      { withCredentials: true }
    );
  }

  markNotificationRead(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/notifications/${id}/lire/`,
      {},
      { withCredentials: true }
    );
  }

  markAllNotificationsRead(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/notifications/marquer-lues/`,
      {},
      { withCredentials: true }
    );
  }

  // --- Messagerie Intégrée (Chat Direct) ---
  getConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(
      `${this.apiUrl}/conversations/`,
      { withCredentials: true }
    );
  }

  startConversation(destinataireId: number, messageInitial?: string): Observable<Conversation> {
    return this.http.post<Conversation>(
      `${this.apiUrl}/conversations/demarrer/`,
      { destinataire_id: destinataireId, message_initial: messageInitial },
      { withCredentials: true }
    );
  }

  getMessages(conversationId: number): Observable<ChatMessage[]> {
    return this.http.get<ChatMessage[]>(
      `${this.apiUrl}/conversations/${conversationId}/messages/`,
      { withCredentials: true }
    );
  }

  sendMessage(conversationId: number, contenu: string): Observable<ChatMessage> {
    return this.http.post<ChatMessage>(
      `${this.apiUrl}/conversations/${conversationId}/messages/`,
      { contenu },
      { withCredentials: true }
    );
  }
}
