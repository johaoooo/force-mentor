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
    <div class="onboarding-page">
      <div class="onboarding-card" style="max-width: 480px;">
        
        <!-- Header Figma Brand -->
        <div class="onboarding-header">
          <a routerLink="/" class="logo-brand mb-2">
            <img src="/logo_force_mentor.svg" width="46" height="34" alt="Force Mentor" class="logo-brand__icon">
            <span class="logo-brand__text">FORCE <span>MENTOR</span></span>
          </a>
          <h2>Connexion</h2>
          <p>Accédez à votre espace de mentorat et d'apprentissage</p>
        </div>

        <!-- Notification Toast Démo -->
        <div *ngIf="showToast" class="alert alert-info py-2 px-3 small d-flex align-items-center mb-3 rounded-3">
          <i class="bi bi-info-circle-fill me-2 fs-5"></i>
          <span>{{ toastMessage }}</span>
        </div>

        <!-- Erreur de connexion -->
        <div *ngIf="errorMessage" class="cnib-alert-danger mb-3">
          <i class="bi bi-exclamation-triangle-fill fs-5 me-2 flex-shrink-0"></i>
          <div>{{ errorMessage }}</div>
        </div>

        <!-- Accès Rapide Comptes Démo -->
        <div class="p-2 mb-4 rounded-3" style="background-color: #f1f5f9; border: 1px dashed #cbd5e1;">
          <div class="d-flex align-items-center justify-content-between mb-2 px-1">
            <span class="small fw-bold text-muted" style="font-size: 11.5px;">
              <i class="bi bi-lightning-charge-fill text-warning me-1"></i>COMPTES DE TEST RAPIDE :
            </span>
            <span class="badge bg-white border text-primary" style="font-size: 10px;">1-clic</span>
          </div>
          <div class="d-flex gap-2">
            <button type="button" class="btn btn-sm btn-white bg-white border shadow-xs flex-fill py-1 px-2" (click)="fillDemo('moussa_diop', 'passer123', 'Moussa Diop (Mentor)')" style="font-size: 12px; font-weight: 600;">
              <i class="bi bi-award text-primary me-1"></i>Mentor
            </button>
            <button type="button" class="btn btn-sm btn-white bg-white border shadow-xs flex-fill py-1 px-2" (click)="fillDemo('awa_sow', 'passer123', 'Awa Sow (Mentorée)')" style="font-size: 12px; font-weight: 600;">
              <i class="bi bi-mortarboard text-success me-1"></i>Mentorée
            </button>
            <button type="button" class="btn btn-sm btn-white bg-white border shadow-xs flex-fill py-1 px-2" (click)="fillDemo('admin', 'admin123', 'Administrateur')" style="font-size: 12px; font-weight: 600;">
              <i class="bi bi-shield-lock text-dark me-1"></i>Admin
            </button>
          </div>
        </div>

        <!-- Formulaire de Connexion -->
        <form (ngSubmit)="onSubmit()">
          <div class="mb-3">
            <label class="cnib-label">Identifiant ou Email *</label>
            <div class="cnib-input-wrap">
              <i class="bi bi-person cnib-input-icon"></i>
              <input 
                type="text" 
                [(ngModel)]="username" 
                name="username" 
                class="cnib-input-field" 
                placeholder="Ex: moussa_diop ou email" 
                required 
                autofocus
              >
            </div>
          </div>

          <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <label class="cnib-label mb-0">Mot de passe *</label>
              <a href="javascript:void(0)" class="small text-muted text-decoration-none" style="font-size: 12px;">Mot de passe oublié ?</a>
            </div>
            <div class="cnib-input-wrap">
              <i class="bi bi-lock cnib-input-icon"></i>
              <input 
                [type]="showPassword ? 'text' : 'password'" 
                [(ngModel)]="password" 
                name="password" 
                class="cnib-input-field" 
                placeholder="••••••••" 
                required
              >
              <button type="button" class="cnib-eye-btn" (click)="showPassword = !showPassword" title="Afficher/Masquer">
                <i class="bi" [ngClass]="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
              </button>
            </div>
          </div>

          <div class="form-check mb-4">
            <input class="form-check-input" type="checkbox" id="rememberMe" [(ngModel)]="rememberMe" name="rememberMe" checked>
            <label class="form-check-label small text-muted" for="rememberMe">
              Rester connecté sur cet appareil
            </label>
          </div>

          <button type="submit" [disabled]="loading" class="cnib-submit-btn mb-3">
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
            <i *ngIf="!loading" class="bi bi-box-arrow-in-right me-2"></i>
            <span>Se connecter</span>
          </button>

          <div class="text-center pt-2">
            <span class="small text-muted">Vous n'avez pas encore de compte ?</span>
            <a routerLink="/inscription" class="fw-bold ms-1" style="color: var(--blue);">Créer un compte</a>
          </div>
        </form>

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
  rememberMe = true;
  loading = false;
  errorMessage = '';

  showToast = false;
  toastMessage = '';

  fillDemo(u: string, p: string, label: string): void {
    this.username = u;
    this.password = p;
    this.toastMessage = `Identifiants remplis : ${label}`;
    this.showToast = true;
    setTimeout(() => { this.showToast = false; }, 3000);
  }

  onSubmit(): void {
    if (!this.username.trim() || !this.password) {
      this.errorMessage = 'Veuillez saisir votre identifiant et votre mot de passe.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login({ username: this.username.trim(), password: this.password })
      .subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/tableau-de-bord']);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err.error?.error || 'Nom d\'utilisateur ou mot de passe incorrect.';
        }
      });
  }
}
