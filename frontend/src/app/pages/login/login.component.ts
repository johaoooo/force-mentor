import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="cnib-bg-wrapper">
      <div class="cnib-bg-glow-1"></div>
      <div class="cnib-bg-glow-2"></div>

      <!-- Toast Feedback Démo -->
      <div *ngIf="showToast" class="cnib-mini-toast show">
        <i class="bi bi-check-circle-fill text-success fs-5"></i>
        <span>{{ toastMessage }}</span>
      </div>

      <!-- Bouton Retour Accueil -->
      <a routerLink="/" class="cnib-home-btn" title="Retour à l'accueil">
        <i class="bi bi-arrow-left"></i>
        <span>Accueil</span>
      </a>

      <div class="container position-relative" style="z-index: 10;">
        <div class="row justify-content-center">
          <div class="col-12 col-md-10 col-lg-10 col-xl-9">
            <div class="cnib-split-container">
              <div class="row g-0 align-items-stretch">
                <!-- Colonne Formulaire Connexion -->
                <div class="col-12 col-lg-7 cnib-form-panel d-flex flex-column justify-content-center">
                  <div class="mb-4 text-start">
                    <a routerLink="/">
                      <img src="/Logo_Force_Mentor.png" alt="Force Mentor" height="42" style="max-height: 42px; width: auto;">
                    </a>
                  </div>

                  <h2 class="cnib-form-title">Connexion</h2>
                  <p class="cnib-form-subtitle">Accédez à votre espace de mentorat et d'apprentissage.</p>

                  <!-- Erreur de connexion -->
                  <div *ngIf="errorMessage" class="cnib-alert-danger mb-3">
                    <i class="bi bi-exclamation-triangle-fill fs-5 me-2 flex-shrink-0"></i>
                    <div>
                      <strong>Échec de connexion :</strong>
                      <div>{{ errorMessage }}</div>
                    </div>
                  </div>

                  <!-- Accès rapide Démo 1-clic -->
                  <div class="p-2 mb-4 rounded-3" style="background-color: var(--cnib-blue-rgba-10); border: 1px dashed var(--blue);">
                    <div class="d-flex align-items-center justify-content-between mb-2 px-1">
                      <span class="small fw-bold" style="color: var(--blue-dark); font-size: 0.78rem;">
                        <i class="bi bi-lightning-charge-fill text-warning me-1"></i>Accès rapide Démo (1 clic) :
                      </span>
                      <span class="badge bg-white text-primary border rounded-1 px-2 py-1" style="font-size: 0.75rem;">Prêt à tester</span>
                    </div>
                    <div class="d-flex flex-wrap gap-2">
                      <button type="button" class="cnib-quick-btn flex-fill" (click)="fillDemo('moussa_diop', 'passer123', 'Moussa Diop (Mentor)')">
                        <i class="bi bi-award me-1"></i>Mentor (Moussa)
                      </button>
                      <button type="button" class="cnib-quick-btn flex-fill" (click)="fillDemo('awa_sow', 'passer123', 'Awa Sow (Mentorée)')">
                        <i class="bi bi-mortarboard me-1"></i>Mentorée (Awa)
                      </button>
                      <button type="button" class="cnib-quick-btn flex-fill" (click)="fillDemo('admin', 'admin123', 'Administrateur')">
                        <i class="bi bi-shield-lock me-1"></i>Admin
                      </button>
                    </div>
                  </div>

                  <form (ngSubmit)="onSubmit()">
                    <div class="mb-3">
                      <label class="cnib-label">Nom d'utilisateur ou Email *</label>
                      <div class="cnib-input-wrap">
                        <i class="bi bi-person cnib-input-icon"></i>
                        <input type="text" [(ngModel)]="username" name="username" class="cnib-input-field" placeholder="Votre nom d'utilisateur" required autofocus>
                      </div>
                    </div>

                    <div class="mb-3">
                      <div class="d-flex justify-content-between align-items-center mb-1">
                        <label class="cnib-label mb-0">Mot de passe *</label>
                        <a href="javascript:void(0)" class="small text-muted" style="font-size: 11.5px;">Mot de passe oublié ?</a>
                      </div>
                      <div class="cnib-input-wrap">
                        <i class="bi bi-lock cnib-input-icon"></i>
                        <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" name="password" class="cnib-input-field" placeholder="••••••••" required>
                        <button type="button" class="cnib-eye-btn" (click)="showPassword = !showPassword" title="Afficher/Masquer">
                          <i class="bi" [ngClass]="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
                        </button>
                      </div>
                    </div>

                    <button type="submit" [disabled]="loading" class="cnib-submit-btn mb-3">
                      <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
                      <i *ngIf="!loading" class="bi bi-box-arrow-in-right me-2"></i>Se connecter
                    </button>

                    <div class="text-center d-block d-lg-none pt-2">
                      <span class="small text-muted">Pas encore de compte ?</span>
                      <a routerLink="/inscription" class="small fw-bold text-primary ms-1">Créer un compte</a>
                    </div>
                  </form>
                </div>

                <!-- Colonne Overlay Dégradé Bleu Royal CNIB -->
                <div class="col-lg-5 d-none d-lg-flex flex-column align-self-stretch">
                  <div class="cnib-overlay-panel flex-grow-1 w-100">
                    <div class="p-2 px-3 rounded-3 mb-4" style="background: rgba(255, 255, 255, 0.95); display: inline-block;">
                      <img src="/Logo_Force_Mentor.png" alt="Force Mentor" height="38" style="max-height: 38px; width: auto; display: block;">
                    </div>
                    <h3 class="cnib-overlay-title">Ravi de vous revoir !</h3>
                    <p class="cnib-overlay-text">
                      Retrouvez vos échanges, vos demandes d'accompagnement et vos sessions de mentorat en direct.
                    </p>

                    <div class="d-flex flex-column gap-2 mb-4 w-100" style="max-width: 300px;">
                      <div class="p-2 rounded-3 text-start d-flex align-items-center gap-2" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15);">
                        <i class="bi bi-mortarboard-fill text-warning fs-5"></i>
                        <div>
                          <strong class="d-block text-white" style="font-size: 13px;">Mentorat personnalisé</strong>
                          <small style="font-size: 11px; color: rgba(255,255,255,0.75);">Guidé par des aînés d'expérience</small>
                        </div>
                      </div>
                      <div class="p-2 rounded-3 text-start d-flex align-items-center gap-2" style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15);">
                        <i class="bi bi-chat-heart-fill text-info fs-5"></i>
                        <div>
                          <strong class="d-block text-white" style="font-size: 13px;">Entraide & Partage</strong>
                          <small style="font-size: 11px; color: rgba(255,255,255,0.75);">Revue de code, entraide</small>
                        </div>
                      </div>
                    </div>

                    <a routerLink="/inscription" class="cnib-ghost-btn">Créer un compte</a>
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
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  showPassword = false;
  loading = false;
  errorMessage = '';

  showToast = false;
  toastMessage = '';

  fillDemo(u: string, p: string, label: string): void {
    this.username = u;
    this.password = p;
    this.toastMessage = `Identifiants remplis : ${label}`;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
    }, 2200);
  }

  onSubmit(): void {
    if (!this.username || !this.password) {
      this.errorMessage = 'Veuillez saisir votre nom d\'utilisateur et votre mot de passe.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/tableau-de-bord']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err?.error?.error || 'Nom d\'utilisateur ou mot de passe incorrect.';
      }
    });
  }
}
