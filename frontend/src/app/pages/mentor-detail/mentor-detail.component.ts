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
                <div class="avatar-initials" style="width: 72px; height: 72px; font-size: 1.6rem;">
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
                  <div>
                    <span class="badge-status-accepted">
                      <i class="bi bi-circle-fill" style="font-size: 6px;"></i> Disponible pour mentorat
                    </span>
                  </div>
                </div>
              </div>

              <!-- Biographie -->
              <div class="mb-4">
                <h2 class="fw-bold text-dark fs-6 mb-2">À propos du mentor</h2>
                <p class="text-muted" style="font-size: 14.5px; line-height: 1.65; white-space: pre-line;">
                  {{ mentor.bio || 'Ce mentor n\'a pas encore rédigé de biographie détaillée, mais est activement disponible pour accompagner les étudiants du programme Force-N.' }}
                </p>
              </div>

              <!-- Compétences & expertises -->
              <div>
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
            </div>
          </div>

          <!-- Colonne droite : Formulaire de demande de mentorat -->
          <div class="col-12 col-lg-5">
            <div class="card p-4 border-0 shadow-sm rounded-4 bg-white sticky-top" style="top: 90px;">
              <h2 class="fw-bold fs-5 text-dark mb-1">
                <i class="bi bi-send-fill text-primary me-2"></i>Demander un mentorat
              </h2>
              <p class="text-muted small mb-3">
                Envoyez un message pour solliciter une session d'accompagnement.
              </p>

              <!-- Succès -->
              <div *ngIf="requestSuccess" class="alert alert-success rounded-3 p-3 mb-3">
                <i class="bi bi-check-circle-fill me-2 fs-5 text-success"></i>
                <strong>Demande envoyée !</strong>
                <p class="small mb-2 mt-1">Le mentor recevra votre message et pourra vous répondre.</p>
                <a routerLink="/tableau-de-bord" class="btn btn-sm btn-outline-success">
                  Voir mon tableau de bord <i class="bi bi-arrow-right ms-1"></i>
                </a>
              </div>

              <!-- Erreur formulaire -->
              <div *ngIf="requestError" class="alert alert-danger rounded-3 p-3 mb-3">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ requestError }}
              </div>

              <!-- Utilisateur non connecté -->
              <div *ngIf="!authService.currentUser" class="p-3 rounded-3 text-center" style="background: rgba(43, 114, 187, 0.08); border: 1px dashed var(--blue);">
                <i class="bi bi-shield-lock text-primary fs-3 d-block mb-2"></i>
                <p class="small text-muted mb-3">Vous devez être connecté avec votre compte étudiant pour solliciter ce mentor.</p>
                <a routerLink="/connexion" class="btn-fm-primary w-100 justify-content-center py-2">
                  Se connecter pour faire une demande
                </a>
              </div>

              <!-- Utilisateur connecté qui est le mentor lui-même -->
              <div *ngIf="authService.currentUser && authService.currentUser.id === mentor.id" class="p-3 rounded-3 text-center bg-light">
                <i class="bi bi-person-check text-muted fs-3 d-block mb-2"></i>
                <p class="small text-muted mb-0">Il s'agit de votre propre profil de mentor.</p>
              </div>

              <!-- Formulaire d'envoi -->
              <form *ngIf="authService.currentUser && authService.currentUser.id !== mentor.id && !requestSuccess" (ngSubmit)="sendDemande()">
                <div class="mb-3">
                  <label class="small text-muted fw-bold mb-1 d-block">Matière concernée *</label>
                  <select [(ngModel)]="selectedMatiereId" name="matiere" class="form-select" style="font-size: 13.5px;" required>
                    <option [ngValue]="null" disabled selected>-- Sélectionnez une matière --</option>
                    <option *ngFor="let comp of mentor.competences" [ngValue]="comp.matiere.id">
                      {{ comp.matiere.nom }} (Expertise: {{ comp.niveau_display }})
                    </option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="small text-muted fw-bold mb-1 d-block">Votre message / Besoin précis *</label>
                  <textarea 
                    [(ngModel)]="requestMessage" 
                    name="message" 
                    rows="4" 
                    class="form-control" 
                    placeholder="Bonjour {{ mentor.user.first_name }}, je rencontre des difficultés sur les boucles et les fonctions en Python. Auriez-vous un créneau pour m'éclairer ?"
                    style="font-size: 13.5px;"
                    required
                  ></textarea>
                  <small class="text-muted" style="font-size: 11px;">Décrivez brièvement le problème pour aider le mentor à préparer la session.</small>
                </div>

                <button type="submit" [disabled]="submitting" class="btn-fm-green w-100 justify-content-center py-2">
                  <span *ngIf="submitting" class="spinner-border spinner-border-sm me-2"></span>
                  <i *ngIf="!submitting" class="bi bi-paperplane-fill me-2"></i>Envoyer la demande
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
  requestMessage = '';
  submitting = false;
  requestSuccess = false;
  requestError = '';

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
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Impossible de charger la fiche de ce mentor.';
        this.loading = false;
      }
    });
  }

  sendDemande(): void {
    if (!this.mentor || !this.selectedMatiereId || !this.requestMessage.trim()) {
      this.requestError = 'Veuillez sélectionner une matière et renseigner votre message.';
      return;
    }

    this.submitting = true;
    this.requestError = '';

    this.mentorshipService.createDemande(this.mentor.id, this.selectedMatiereId, this.requestMessage.trim()).subscribe({
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
