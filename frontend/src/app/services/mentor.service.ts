import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Profile, Matiere, Stats } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class MentorService {
  private http = inject(HttpClient);
  private apiUrl = 'http://127.0.0.1:8001/api';

  getMentors(matiereId?: number | null, niveau?: string | null, search?: string | null): Observable<Profile[]> {
    let params = new HttpParams();
    if (matiereId) {
      params = params.set('matiere', matiereId.toString());
    }
    if (niveau) {
      params = params.set('niveau', niveau);
    }
    if (search) {
      params = params.set('q', search.trim());
    }
    return this.http.get<Profile[]>(`${this.apiUrl}/mentors/`, { params });
  }

  getMentorById(id: number): Observable<Profile> {
    return this.http.get<Profile>(`${this.apiUrl}/mentors/${id}/`);
  }

  getMatieres(): Observable<Matiere[]> {
    return this.http.get<Matiere[]>(`${this.apiUrl}/matieres/`);
  }

  getStats(): Observable<Stats> {
    return this.http.get<Stats>(`${this.apiUrl}/stats/`);
  }
}
