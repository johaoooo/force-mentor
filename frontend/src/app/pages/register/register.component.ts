import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="cnib-bg-wrapper">
      <div class="cnib-bg-glow-1"></div>
      <div class="cnib-bg-glow-2"></div>

      <!-- Bouton Retour Accueil -->
      <a routerLink="/" class="cnib-home-btn" title="Retour à l'accueil">
        <i class="bi bi-arrow-left"></i>
        <span>Accueil</span>
      </a>

      <div class="container position-relative" style="z-index: 10;">
        <div class="row justify-content-center">
          <div class="col-12 col-md-11 col-lg-10 col-xl-9">
            <div class="cnib-split-container">
              <div class="row g-0 align-items-stretch">
                <!-- Colonne Formulaire Inscription -->
                <div class="col-12 col-lg-7 cnib-form-panel d-flex flex-column justify-content-center">
                  <div class="mb-3 text-start">
                    <a routerLink="/">
                      <img src="/Logo_Force_Mentor.png" alt="Force Mentor" height="40" style="max-height: 40px; width: auto;">
                    </a>
                  </div>

                  <h2 class="cnib-form-title">Créer un compte</h2>
                  <p class="cnib-form-subtitle">Rejoignez la communauté d'entraide étudiante Force Mentor.</p>

                  <!-- Erreur -->
                  <div *ngIf="errorMessage" class="cnib-alert-danger mb-3">
                    <i class="bi bi-exclamation-triangle-fill fs-5 me-2 flex-shrink-0"></i>
                    <div>
                      <strong>Erreur d'inscription :</strong>
                      <div>{{ errorMessage }}</div>
                    </div>
                  </div>

                  <form (ngSubmit)="onSubmit()">
                    <!-- Choix du rôle -->
                    <div class="mb-3">
                      <label class="cnib-label">Je m'inscris en tant que *</label>
                      <div class="row g-2">
                        <div class="col-4">
                          <div class="cnib-role-card" [class.active]="role === 'MENTORE'" (click)="role = 'MENTORE'">
                            <span *ngIf="role === 'MENTORE'" class="role-badge-check"><i class="bi bi-check"></i></span>
                            <i class="bi bi-mortarboard cnib-role-icon"></i>
                            <div class="role-card-title">Étudiant</div>
                            <span class="role-card-desc">Accompagné</span>
                          </div>
                        </div>
                        <div class="col-4">
                          <div class="cnib-role-card" [class.active]="role === 'MENTOR'" (click)="role = 'MENTOR'">
                            <span *ngIf="role === 'MENTOR'" class="role-badge-check"><i class="bi bi-check"></i></span>
                            <i class="bi bi-award cnib-role-icon"></i>
                            <div class="role-card-title">Mentor</div>
                            <span class="role-card-desc">Partager</span>
                          </div>
                        </div>
                        <div class="col-4">
                          <div class="cnib-role-card" [class.active]="role === 'LES_DEUX'" (click)="role = 'LES_DEUX'">
                            <span *ngIf="role === 'LES_DEUX'" class="role-badge-check"><i class="bi bi-check"></i></span>
                            <i class="bi bi-people cnib-role-icon"></i>
                            <div class="role-card-title">Les deux</div>
                            <span class="role-card-desc">Mixte</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div class="row g-2 mb-3">
                      <div class="col-6">
                        <label class="cnib-label">Prénom *</label>
                        <div class="cnib-input-wrap">
                          <i class="bi bi-person cnib-input-icon"></i>
                          <input type="text" [(ngModel)]="firstName" name="firstName" class="cnib-input-field" placeholder="Moussa" required>
                        </div>
                      </div>
                      <div class="col-6">
                        <label class="cnib-label">Nom *</label>
                        <div class="cnib-input-wrap">
                          <i class="bi bi-person cnib-input-icon"></i>
                          <input type="text" [(ngModel)]="lastName" name="lastName" class="cnib-input-field" placeholder="Diop" required>
                        </div>
                      </div>
                    </div>

                    <div class="mb-3">
                      <label class="cnib-label">Nom d'utilisateur *</label>
                      <div class="cnib-input-wrap">
                        <i class="bi bi-at cnib-input-icon"></i>
                        <input type="text" [(ngModel)]="username" name="username" class="cnib-input-field" placeholder="moussa.diop" required>
                      </div>
                    </div>

                    <div class="mb-3">
                      <label class="cnib-label">Adresse Email *</label>
                      <div class="cnib-input-wrap">
                        <i class="bi bi-envelope cnib-input-icon"></i>
                        <input type="email" [(ngModel)]="email" name="email" class="cnib-input-field" placeholder="etudiant@force-n.sn" required>
                      </div>
                    </div>

                    <div class="row g-2 mb-3">
                      <div class="col-7">
                        <label class="cnib-label">Filière / Programme *</label>
                        <div class="cnib-input-wrap">
                          <i class="bi bi-book cnib-input-icon"></i>
                          <input type="text" [(ngModel)]="filiere" name="filiere" class="cnib-input-field" placeholder="ex: Informatique / Web" required>
                        </div>
                      </div>
                      <div class="col-5">
                        <label class="cnib-label">Niveau d'études *</label>
                        <select [(ngModel)]="niveau" name="niveau" class="cnib-input-field" style="padding-left: 10px;">
                          <option value="L1">Licence 1</option>
                          <option value="L2">Licence 2</option>
                          <option value="L3">Licence 3</option>
                          <option value="M1">Master 1</option>
                          <option value="M2">Master 2</option>
                        </select>
                      </div>
                    </div>

                    <div class="mb-3">
                      <label class="cnib-label">Mot de passe *</label>
                      <div class="cnib-input-wrap">
                        <i class="bi bi-lock cnib-input-icon"></i>
                        <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" name="password" class="cnib-input-field" placeholder="••••••••" required>
                        <button type="button" class="cnib-eye-btn" (click)="showPassword = !showPassword">
                          <i class="bi" [ngClass]="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                        </button>
                      </div>
                    </div>

                    <div class="mb-4">
                      <label class="cnib-label">Confirmer le mot de passe *</label>
                      <div class="cnib-input-wrap">
                        <i class="bi bi-shield-check cnib-input-icon"></i>
                        <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="confirmPassword" name="confirmPassword" class="cnib-input-field" placeholder="••••••••" required>
                      </div>
                    </div>

                    <button type="submit" [disabled]="loading" class="cnib-submit-btn mb-3">
                      <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                      <i *ngIf="!loading" class="bi bi-check2-circle me-2"></i>Créer mon compte
                    </button>

                    <div class="text-center d-block d-lg-none pt-2">
                      <span class="small text-muted">Déjà un compte ?</span>
                      <a routerLink="/connexion" class="small fw-bold text-primary ms-1">Se connecter</a>
                    </div>
                  </form>
                </div>

                <!-- Colonne Dégradé Bleu Royal -->
                <div class="col-lg-5 d-none d-lg-flex flex-column align-self-stretch">
                  <div class="cnib-overlay-panel flex-grow-1 w-100">
                    <div class="p-2 px-3 rounded-3 mb-4" style="background: rgba(255, 255, 255, 0.95); display: inline-block;">
                      <img src="/Logo_Force_Mentor.png" alt="Force Mentor" height="38" style="max-height: 38px; width: auto; display: block;">
                    </div>
                    <h3 class="cnib-overlay-title">Bienvenue parmi nous !</h3>
                    <p class="cnib-overlay-text">
                      Rejoignez un réseau solidaire d'étudiants, développez vos compétences et bénéficiez de l'aide de mentors investis.
                    </p>

                    <div class="d-flex flex-column gap-2 mb-4 w-100" style="max-width: 300px;">
                      <div class="p-2 rounded-3 text-start d-flex align-items-center gap-2" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15);">
                        <i class="bi bi-patch-check-fill text-warning fs-5"></i>
                        <div>
                          <strong class="d-block text-white" style="font-size: 13px;">100% Gratuit</strong>
                          <small style="font-size: 11px; color: rgba(255,255,255,0.75);">Réservé au programme Force-N</small>
                        </div>
                      </div>
                      <div class="p-2 rounded-3 text-start d-flex align-items-center gap-2" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15);">
                        <i class="bi bi-clock-history text-info fs-5"></i>
                        <div>
                          <strong class="d-block text-white" style="font-size: 13px;">Flexibilité totale</strong>
                          <small style="font-size: 11px; color: rgba(255,255,255,0.75);">Selon vos disponibilités</small>
                        </div>
                      </div>
                    </div>

                    <a routerLink="/connexion" class="cnib-ghost-btn">J'ai déjà un compte</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  role: 'MENTORE' | 'MENTOR' | 'LES_DEUX' = 'MENTORE';
  firstName = '';
  lastName = '';
  username = '';
  email = '';
  filiere = '';
  niveau = 'L1';
  password = '';
  confirmPassword = '';
  showPassword = false;
  loading = false;
  errorMessage = '';

  onSubmit(): void {
    if (!this.username || !this.password || !this.firstName || !this.lastName) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires (*).';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    const payload = {
      username: this.username,
      password: this.password,
      first_name: this.firstName,
      last_name: this.lastName,
      email: this.email,
      role: this.role,
      niveau: this.niveau,
      filiere: this.filiere
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/tableau-de-bord']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.error || 'Une erreur est survenue lors de l\'inscription.';
      }
    });
  }
}
