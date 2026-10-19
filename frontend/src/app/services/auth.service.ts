import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { Profile } from '../models/models';
import { getApiUrl } from './api.config';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = getApiUrl();

  private currentUserSubject = new BehaviorSubject<Profile | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.checkCurrentSession();
  }

  private getStoredUser(): Profile | null {
    const raw = localStorage.getItem('force_mentor_user');
    return raw ? JSON.parse(raw) : null;
  }

  public get currentUser(): Profile | null {
    return this.currentUserSubject.value;
  }

  public get isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  checkCurrentSession(): void {
    this.http.get<{ authenticated: boolean; user: Profile }>(`${this.apiUrl}/auth/me/`, { withCredentials: true })
      .subscribe({
        next: (res) => {
          if (res.authenticated && res.user) {
            this.setSessionUser(res.user);
          } else if (!this.getStoredUser()) {
            this.clearSession();
          }
        },
        error: () => {}
      });
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post<{ message: string; user: Profile }>(`${this.apiUrl}/auth/login/`, credentials, { withCredentials: true })
      .pipe(
        tap((res) => {
          if (res && res.user) {
            this.setSessionUser(res.user);
          }
        })
      );
  }

  register(data: any): Observable<any> {
    return this.http.post<{ message: string; user: Profile }>(`${this.apiUrl}/auth/register/`, data, { withCredentials: true })
      .pipe(
        tap((res) => {
          if (res && res.user) {
            this.setSessionUser(res.user);
          }
        })
      );
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/logout/`, {}, { withCredentials: true })
      .pipe(
        tap(() => this.clearSession()),
        catchError(() => {
          this.clearSession();
          return of(null);
        })
      );
  }

  updateProfile(profileData: any): Observable<any> {
    return this.http.put<{ message: string; user: Profile }>(`${this.apiUrl}/auth/profile/`, profileData, { withCredentials: true })
      .pipe(
        tap((res) => {
          if (res && res.user) {
            this.setSessionUser(res.user);
          }
        })
      );
  }

  private setSessionUser(user: Profile): void {
    localStorage.setItem('force_mentor_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private clearSession(): void {
    localStorage.removeItem('force_mentor_user');
    this.currentUserSubject.next(null);
  }
}
