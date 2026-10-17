import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MentorService } from '../../services/mentor.service';
import { MentorshipService } from '../../services/mentorship.service';
import { AuthService } from '../../services/auth.service';
import { Profile, Matiere } from '../../models/models';

@Component({
  selector: 'app-mentor-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="py-5" style="background: var(--bg); min-height: 85vh;">
      <div class="container-custom">
        <!-- Navigation retour -->
        <div class="mb-4">
          <a routerLink="/mentors" class="text-muted text-decoration-none small fw-bold">
            <i class="bi bi-arrow-left me-1"></i>Retour à l'annuaire des mentors
          </a>
        </div>

        <div *ngIf="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
        </div>

        <div *ngIf="error" class="alert alert-danger rounded-3 p-4">
          <i class="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
          {{ error }}
        </div>

        <div *ngIf="!loading && mentor" class="row g-4">
          <!-- Colonne gauche : Profil et compétences -->
          <div class="col-12 col-lg-7">
            <div class="card p-4 border-0 shadow-sm rounded-4 bg-white mb-4">
              <div class="d-flex align-items-center gap-3 mb-4 flex-wrap">
                <img *ngIf="mentor.photo_url" [src]="mentor.photo_url" [alt]="mentor.user.first_name" class="rounded-circle object-fit-cover shadow-sm" style="width: 72px; height: 72px;">
                <div *ngIf="!mentor.photo_url" class="avatar-initials" style="width: 72px; height: 72px; font-size: 1.6rem;">
                  {{ mentor.user.first_name ? mentor.user.first_name[0].toUpperCase() : 'M' }}{{ mentor.user.last_name ? mentor.user.last_name[0].toUpperCase() : '' }}
                </div>
                <div>
                  <h1 class="fw-bold fs-4 text-dark mb-1">
                    {{ mentor.user.first_name }} {{ mentor.user.last_name }}
                  </h1>
                  <p class="text-muted small mb-1">
                    <i class="bi bi-mortarboard me-1 text-primary"></i>
                    {{ mentor.filiere || 'Programme Informatique' }} &bull; {{ mentor.niveau_display }}
                  </p>
                  <div class="d-flex align-items-center gap-2 flex-wrap mt-2">
                    <span class="badge-status-accepted">
                      <i class="bi bi-circle-fill" style="font-size: 6px;"></i> Disponible pour mentorat
                    </span>
                    <a [routerLink]="['/messages']" [queryParams]="{ destinataireId: mentor.id }" class="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 fw-medium d-inline-flex align-items-center gap-1 shadow-sm">
                      <i class="bi bi-chat-dots-fill"></i> Contacter / Messagerie
                    </a>
                  </div>
                </div>
              </div>

              <!-- Biographie -->
              <div class="mb-4">
                <h2 class="fw-bold text-dark fs-6 mb-2">À propos du mentor</h2>
                <p class="text-muted" style="font-size: 14.5px; line-height: 1.65; white-space: pre-line;">
                  {{ getBio() }}
                </p>
              </div>

              <!-- Compétences & expertises -->
              <div class="mb-4">
                <h2 class="fw-bold text-dark fs-6 mb-3">Matières & Niveaux d'expertise</h2>
                <div class="row g-2">
                  <div *ngFor="let comp of mentor.competences" class="col-12 col-sm-6">
                    <div class="p-3 rounded-3 border bg-light d-flex align-items-center justify-content-between">
                      <div class="d-flex align-items-center gap-2">
                        <i class="bi" [ngClass]="comp.matiere.icone || 'bi-journal-code'" style="color: var(--blue); font-size: 1.2rem;"></i>
                        <div>
                          <strong class="d-block text-dark" style="font-size: 13.5px;">{{ comp.matiere.nom }}</strong>
                          <small class="text-muted" style="font-size: 11px;">Matière validée</small>
                        </div>
                      </div>
                      <span class="badge bg-white text-primary border rounded-1 px-2 py-1" style="font-size: 13px;">
                        {{ comp.niveau_display }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Créneaux de disponibilité hebdomadaire -->
              <div>
                <h2 class="fw-bold text-dark fs-6 mb-2">
                  <i class="bi bi-calendar-week-fill text-primary me-2"></i>Horaires de disponibilité habituels
                </h2>
                <p class="text-muted small mb-3">Le mentor a défini ces plages horaires pour ses séances d'accompagnement :</p>

                <div *ngIf="mentor.disponibilites && mentor.disponibilites.length > 0; else noDispos" class="d-flex flex-wrap gap-2">
                  <div *ngFor="let dispo of mentor.disponibilites" class="badge-dispo-card p-2 px-3 rounded-3 border bg-white shadow-sm d-flex align-items-center gap-2">
                    <span class="badge bg-primary-subtle text-primary fw-bold" style="font-size: 11.5px;">
                      {{ dispo.jour_display }}
                    </span>
                    <span class="text-dark fw-bold" style="font-size: 13px;">
                      {{ dispo.heure_debut }} - {{ dispo.heure_fin }}
                    </span>
                  </div>
                </div>
                <ng-template #noDispos>
                  <div class="p-3 bg-light rounded-3 text-muted small border">
                    <i class="bi bi-info-circle me-1"></i>Ce mentor n'a pas encore fixé d'horaires hebdomadaires stricts. Vous pouvez proposer l'horaire de votre choix ci-contre.
                  </div>
                </ng-template>
              </div>

            </div>
          </div>

          <!-- Colonne droite : Formulaire de demande et réservation de créneau -->
          <div class="col-12 col-lg-5">
            <div class="card p-4 border-0 shadow-sm rounded-4 bg-white sticky-top" style="top: 90px;">
              <h2 class="fw-bold fs-5 text-dark mb-1">
                <i class="bi bi-calendar-check-fill text-primary me-2"></i>Réserver une séance
              </h2>
              <p class="text-muted small mb-3">
                Sélectionnez un créneau ou proposez un moment pour votre session.
              </p>

              <!-- Succès -->
              <div *ngIf="requestSuccess" class="alert alert-success rounded-3 p-3 mb-3">
                <i class="bi bi-check-circle-fill me-2 fs-5 text-success"></i>
                <strong>Demande & Réservation envoyées !</strong>
                <p class="small mb-2 mt-1">
                  Le mentor recevra votre proposition. Dès validation, le lien automatique de visioconférence (Jitsi Meet) sera disponible dans votre tableau de bord.
                </p>
                <a routerLink="/tableau-de-bord" class="btn btn-sm btn-outline-success">
                  Accéder à mon tableau de bord <i class="bi bi-arrow-right ms-1"></i>
                </a>
              </div>

              <!-- Erreur formulaire -->
              <div *ngIf="requestError" class="alert alert-danger rounded-3 p-3 mb-3">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ requestError }}
              </div>

              <!-- Utilisateur non connecté -->
              <div *ngIf="!authService.currentUser" class="p-3 rounded-3 text-center" style="background: rgba(43, 114, 187, 0.08); border: 1px dashed var(--blue);">
                <i class="bi bi-shield-lock text-primary fs-3 d-block mb-2"></i>
                <p class="small text-muted mb-3">Vous devez être connecté avec votre compte étudiant pour réserver une séance.</p>
                <a routerLink="/connexion" class="btn-fm-primary w-100 justify-content-center py-2">
                  Se connecter pour réserver
                </a>
              </div>

              <!-- Utilisateur connecté qui est le mentor lui-même -->
              <div *ngIf="authService.currentUser && authService.currentUser.id === mentor.id" class="p-3 rounded-3 text-center bg-light">
                <i class="bi bi-person-check text-muted fs-3 d-block mb-2"></i>
                <p class="small text-muted mb-0">Il s'agit de votre propre profil de mentor.</p>
              </div>

              <!-- Formulaire de réservation -->
              <form *ngIf="authService.currentUser && authService.currentUser.id !== mentor.id && !requestSuccess" (ngSubmit)="sendDemande()">
                <!-- 1. Matière -->
                <div class="mb-3">
                  <label class="small text-muted fw-bold mb-1 d-block">Matière concernée *</label>
                  <select [(ngModel)]="selectedMatiereId" name="matiere" class="form-select" style="font-size: 13.5px;" required>
                    <option [ngValue]="null" disabled selected>-- Sélectionnez une matière --</option>
                    <option *ngFor="let comp of mentor.competences" [ngValue]="comp.matiere.id">
                      {{ comp.matiere.nom }} (Expertise: {{ comp.niveau_display }})
                    </option>
                  </select>
                </div>

                <!-- 2. Choix du créneau -->
                <div class="mb-3" *ngIf="mentor.disponibilites && mentor.disponibilites.length > 0">
                  <label class="small text-muted fw-bold mb-1 d-block">Créneau du mentor recommandé</label>
                  <select [(ngModel)]="selectedDispoId" (ngModelChange)="onDispoChange($event)" name="disponibilite" class="form-select" style="font-size: 13.5px;">
                    <option [ngValue]="null">-- Choisir un créneau prédéfini --</option>
                    <option *ngFor="let d of mentor.disponibilites" [ngValue]="d.id">
                      {{ d.jour_display }} de {{ d.heure_debut }} à {{ d.heure_fin }}
                    </option>
                  </select>
                </div>

                <!-- 3. Date et Heure précises -->
                <div class="row g-2 mb-3">
                  <div class="col-7">
                    <label class="small text-muted fw-bold mb-1 d-block">Date de séance souhaitée</label>
                    <input type="date" [(ngModel)]="sessionDate" (ngModelChange)="updateFullDateTime()" name="sessionDate" class="form-control" style="font-size: 13.5px;" [min]="todayDate">
                  </div>
                  <div class="col-5">
                    <label class="small text-muted fw-bold mb-1 d-block">Heure début</label>
                    <input type="time" [(ngModel)]="sessionTime" (ngModelChange)="updateFullDateTime()" name="sessionTime" class="form-control" style="font-size: 13.5px;">
                  </div>
                </div>

                <!-- 4. Durée -->
                <div class="mb-3">
                  <label class="small text-muted fw-bold mb-1 d-block">Durée estimée</label>
                  <select [(ngModel)]="durationMinutes" name="duration" class="form-select" style="font-size: 13.5px;">
                    <option [ngValue]="30">30 minutes</option>
                    <option [ngValue]="45">45 minutes</option>
                    <option [ngValue]="60">1 heure (recommandé)</option>
                    <option [ngValue]="90">1 heure 30</option>
                  </select>
                </div>

                <!-- 5. Message -->
                <div class="mb-3">
                  <label class="small text-muted fw-bold mb-1 d-block">Votre message / Besoin précis *</label>
                  <textarea 
                    [(ngModel)]="requestMessage" 
                    name="message" 
                    rows="3" 
                    class="form-control" 
                    placeholder="Bonjour {{ mentor.user.first_name }}, je bloque sur les exercices en séance pratique. Pouvons-nous revoir ce point ?"
                    style="font-size: 13.5px;"
                    required
                  ></textarea>
                </div>

                <button type="submit" [disabled]="submitting" class="btn-fm-green w-100 justify-content-center py-2.5">
                  <span *ngIf="submitting" class="spinner-border spinner-border-sm me-2"></span>
                  <i *ngIf="!submitting" class="bi bi-calendar-plus-fill me-2"></i>Confirmer la réservation
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MentorDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private mentorService = inject(MentorService);
  private mentorshipService = inject(MentorshipService);
  authService = inject(AuthService);

  mentor: Profile | null = null;
  loading = true;
  error = '';

  selectedMatiereId: number | null = null;
  selectedDispoId: number | null = null;
  sessionDate: string = '';
  sessionTime: string = '18:00';
  durationMinutes: number = 60;
  todayDate: string = new Date().toISOString().split('T')[0];

  requestMessage = '';
  submitting = false;
  requestSuccess = false;
  requestError = '';

  getBio(): string {
    return this.mentor?.bio || "Ce mentor n'a pas encore rédigé de biographie détaillée, mais est activement disponible pour accompagner les étudiants du programme Force-N.";
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadMentor(+idParam);
    } else {
      this.error = 'Identifiant du mentor manquant.';
      this.loading = false;
    }
  }

  loadMentor(id: number): void {
    this.loading = true;
    this.mentorService.getMentorById(id).subscribe({
      next: (data) => {
        this.mentor = data;
        if (data.competences && data.competences.length > 0) {
          this.selectedMatiereId = data.competences[0].matiere.id;
        }
        // Pré-sélectionner le premier créneau s'il existe
        if (data.disponibilites && data.disponibilites.length > 0) {
          const first = data.disponibilites[0];
          this.selectedDispoId = first.id;
          this.sessionTime = first.heure_debut;
          this.initSuggestedDateForSlot(first.jour_semaine);
        } else {
          // Date par défaut à demain
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          this.sessionDate = tomorrow.toISOString().split('T')[0];
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Impossible de charger la fiche de ce mentor.';
        this.loading = false;
      }
    });
  }

  initSuggestedDateForSlot(dayOfWeek: number): void {
    // dayOfWeek : 0 = Lundi, ..., 6 = Dimanche
    // JavaScript : 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
    const targetJsDay = (dayOfWeek + 1) % 7;
    const now = new Date();
    let daysUntil = (targetJsDay - now.getDay() + 7) % 7;
    if (daysUntil === 0) daysUntil = 7; // Prochaine occurrence
    const targetDate = new Date();
    targetDate.setDate(now.getDate() + daysUntil);
    this.sessionDate = targetDate.toISOString().split('T')[0];
  }

  onDispoChange(dispoId: number | null): void {
    if (!dispoId || !this.mentor?.disponibilites) return;
    const dispo = this.mentor.disponibilites.find(d => d.id === dispoId);
    if (dispo) {
      this.sessionTime = dispo.heure_debut;
      this.initSuggestedDateForSlot(dispo.jour_semaine);
    }
  }

  updateFullDateTime(): void {
    // Valide et synchronise
  }

  sendDemande(): void {
    if (!this.mentor || !this.selectedMatiereId || !this.requestMessage.trim()) {
      this.requestError = 'Veuillez sélectionner une matière et renseigner votre message.';
      return;
    }

    this.submitting = true;
    this.requestError = '';

    let date_heure_souhaitee: string | undefined = undefined;
    if (this.sessionDate && this.sessionTime) {
      date_heure_souhaitee = `${this.sessionDate}T${this.sessionTime}:00`;
    }

    this.mentorshipService.createDemande({
      mentor_id: this.mentor.id,
      matiere_id: this.selectedMatiereId,
      message: this.requestMessage.trim(),
      date_heure_souhaitee: date_heure_souhaitee,
      disponibilite_id: this.selectedDispoId,
      duree_minutes: this.durationMinutes
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.requestSuccess = true;
      },
      error: (err) => {
        this.submitting = false;
        this.requestError = err?.error?.error || 'Erreur lors de l\'envoi de la demande.';
      }
    });
  }
}
