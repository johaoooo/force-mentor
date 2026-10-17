import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DemandeMentorat } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class MentorshipService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8001/api';

  getDemandes(): Observable<{ recues: DemandeMentorat[]; envoyees: DemandeMentorat[] }> {
    return this.http.get<{ recues: DemandeMentorat[]; envoyees: DemandeMentorat[] }>(
      `${this.apiUrl}/demandes/`, 
      { withCredentials: true }
    );
  }

  createDemande(mentorId: number, matiereId: number, message: string): Observable<{ message: string; demande: DemandeMentorat }> {
    return this.http.post<{ message: string; demande: DemandeMentorat }>(
      `${this.apiUrl}/demandes/`,
      { mentor_id: mentorId, matiere_id: matiereId, message },
      { withCredentials: true }
    );
  }

  updateDemandeStatus(demandeId: number, action: 'accepter' | 'refuser' | 'terminer'): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/demandes/${demandeId}/action/`,
      { action },
      { withCredentials: true }
    );
  }
}
