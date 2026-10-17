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
    <div class="onboarding-page">
      <div class="onboarding-card">
        
        <!-- Header Brand Figma -->
        <div class="onboarding-header">
          <a routerLink="/" class="logo-brand mb-2">
            <img src="/logo_force_mentor.svg" width="46" height="34" alt="Force Mentor" class="logo-brand__icon">
            <span class="logo-brand__text">FORCE <span>MENTOR</span></span>
          </a>
          <h2>Bienvenue</h2>
          <p>Créez votre compte pour commencer l'entraide</p>
        </div>

        <!-- Multi-step Progress Bar -->
        <div class="wizard-progress">
          <div class="wizard-step-bar" [class.active]="currentStep >= 1"></div>
          <div class="wizard-step-bar" [class.active]="currentStep >= 2"></div>
          <div class="wizard-step-bar" [class.active]="currentStep >= 3"></div>
        </div>

        <!-- Alert Erreur -->
        <div *ngIf="errorMessage" class="cnib-alert-danger mb-3">
          <i class="bi bi-exclamation-triangle-fill fs-5 me-2 flex-shrink-0"></i>
          <div>{{ errorMessage }}</div>
        </div>

        <!-- ÉTAPE 1 : IDENTITÉ & MOT DE PASSE -->
        <div *ngIf="currentStep === 1">
          <div class="row g-2 mb-3">
            <div class="col-6">
              <label class="cnib-label">Prénom *</label>
              <div class="cnib-input-wrap">
                <input type="text" [(ngModel)]="firstName" placeholder="Prénom" class="cnib-input-field" required>
              </div>
            </div>
            <div class="col-6">
              <label class="cnib-label">Nom *</label>
              <div class="cnib-input-wrap">
                <input type="text" [(ngModel)]="lastName" placeholder="Nom" class="cnib-input-field" required>
              </div>
            </div>
          </div>

          <div class="mb-3">
            <label class="cnib-label">Adresse email *</label>
            <div class="cnib-input-wrap">
              <i class="bi bi-envelope cnib-input-icon"></i>
              <input type="email" [(ngModel)]="email" placeholder="etudiant@forcen.sn" class="cnib-input-field" required>
            </div>
          </div>

          <div class="mb-4">
            <label class="cnib-label">Mot de passe *</label>
            <div class="cnib-input-wrap">
              <i class="bi bi-lock cnib-input-icon"></i>
              <input [type]="showPassword ? 'text' : 'password'" [(ngModel)]="password" placeholder="••••••••" class="cnib-input-field" required>
              <button type="button" class="cnib-eye-btn" (click)="showPassword = !showPassword">
                <i class="bi" [ngClass]="showPassword ? 'bi-eye-slash' : 'bi-eye'"></i>
              </button>
            </div>
          </div>

          <button type="button" class="cnib-submit-btn mb-3" (click)="goToStep2()">
            <span>Continuer</span>
            <i class="bi bi-arrow-right ms-2"></i>
          </button>

          <div class="text-center pt-2">
            <span class="small text-muted">Vous avez déjà un compte ?</span>
            <a routerLink="/connexion" class="fw-bold ms-1" style="color: var(--blue);">Se connecter</a>
          </div>
        </div>

        <!-- ÉTAPE 2 : RÔLE & PARCOURS ACADÉMIQUE -->
        <div *ngIf="currentStep === 2">
          <button type="button" class="btn btn-sm btn-link text-muted p-0 mb-3 text-decoration-none" (click)="currentStep = 1">
            <i class="bi bi-arrow-left me-1"></i>Retour
          </button>

          <label class="cnib-label mb-2">Votre rôle sur la plateforme *</label>
          <div class="role-pills">
            <button type="button" class="role-pill-btn" [class.active]="role === 'MENTORE'" (click)="role = 'MENTORE'">
              <i class="bi bi-mortarboard fs-5"></i>
              <span>Mentoré</span>
            </button>
            <button type="button" class="role-pill-btn" [class.active]="role === 'MENTOR'" (click)="role = 'MENTOR'">
              <i class="bi bi-award fs-5"></i>
              <span>Mentor</span>
            </button>
            <button type="button" class="role-pill-btn" [class.active]="role === 'LES_DEUX'" (click)="role = 'LES_DEUX'">
              <i class="bi bi-people fs-5"></i>
              <span>Les deux</span>
            </button>
          </div>

          <div class="mb-3">
            <label class="cnib-label">Filière / Spécialité *</label>
            <select [(ngModel)]="filiere" class="cnib-input-field">
              <option value="Génie Logiciel & Dev Web">Génie Logiciel & Dev Web</option>
              <option value="Réseaux & Télécommunications">Réseaux & Télécommunications</option>
              <option value="Data Science & Intelligence Artificielle">Data Science & Intelligence Artificielle</option>
              <option value="Cybersécurité & Systèmes">Cybersécurité & Systèmes</option>
              <option value="Marketing Digital & Entrepreneuriat">Marketing Digital & Entrepreneuriat</option>
            </select>
          </div>

          <div class="mb-4">
            <label class="cnib-label">Niveau d'études *</label>
            <select [(ngModel)]="niveau" class="cnib-input-field">
              <option value="L1">Licence 1 (Débutant)</option>
              <option value="L2">Licence 2 (Intermédiaire)</option>
              <option value="L3">Licence 3 (Avancé)</option>
              <option value="M1">Master 1</option>
              <option value="M2">Master 2 (Expert)</option>
            </select>
          </div>

          <button type="button" class="cnib-submit-btn mb-3" (click)="goToStep3()">
            <span>Continuer</span>
            <i class="bi bi-arrow-right ms-2"></i>
          </button>

          <div class="text-center pt-2">
            <span class="small text-muted">Vous avez déjà un compte ?</span>
            <a routerLink="/connexion" class="fw-bold ms-1" style="color: var(--blue);">Se connecter</a>
          </div>
        </div>

        <!-- ÉTAPE 3 : MATIÈRES & COMPÉTENCES (NUAGE DE TAGS FIGMA) -->
        <div *ngIf="currentStep === 3">
          <button type="button" class="btn btn-sm btn-link text-muted p-0 mb-3 text-decoration-none" (click)="currentStep = 2">
            <i class="bi bi-arrow-left me-1"></i>Retour
          </button>

          <h5 class="fw-bold text-dark mb-1" style="font-size: 16px;">Matières de prédilection</h5>
          <p class="text-muted small mb-2">Sélectionnez les matières où vous souhaitez recevoir ou apporter de l'aide :</p>

          <div class="skills-cloud">
            <div 
              *ngFor="let s of availableSkills" 
              class="skill-chip" 
              [class.selected]="selectedSkills.includes(s)"
              (click)="toggleSkill(s)"
            >
              <i class="bi" [ngClass]="selectedSkills.includes(s) ? 'bi-check-circle-fill' : 'bi-plus'"></i>
              <span>{{ s }}</span>
            </div>
          </div>

          <div class="form-check mb-4">
            <input class="form-check-input" type="checkbox" id="termsCheck" [(ngModel)]="acceptedTerms">
            <label class="form-check-label small text-muted" for="termsCheck">
              J'accepte la charte d'entraide et les conditions de Force Mentor.
            </label>
          </div>

          <button 
            type="button" 
            class="cnib-submit-btn mb-3" 
            [disabled]="loading || !acceptedTerms"
            (click)="submitRegistration()"
          >
            <span *ngIf="loading" class="spinner-border spinner-border-sm me-2"></span>
            <i *ngIf="!loading" class="bi bi-check-circle-fill me-2"></i>
            <span>Créer mon compte</span>
          </button>

          <div class="text-center pt-2">
            <span class="small text-muted">Vous avez déjà un compte ?</span>
            <a routerLink="/connexion" class="fw-bold ms-1" style="color: var(--blue);">Se connecter</a>
          </div>
        </div>

      </div>
    </div>
  `
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  currentStep = 1;
  loading = false;
  errorMessage = '';
  showPassword = false;

  // Step 1
  firstName = '';
  lastName = '';
  email = '';
  password = '';

  // Step 2
  role = 'MENTORE';
  filiere = 'Génie Logiciel & Dev Web';
  niveau = 'L1';

  // Step 3
  availableSkills = [
    'Python Fondamentaux',
    'Développement Web Django',
    'Algorithmique & Structures de données',
    'Bases de Données & SQL',
    'Réseaux Informatiques',
    'JavaScript & TypeScript',
    'Sécurité & Cryptographie',
    'Marketing Digital',
    'Intelligence Artificielle',
    'Architecture Logicielle',
    'Systèmes Linux',
    'Anglais Technique'
  ];
  selectedSkills: string[] = ['Python Fondamentaux', 'Algorithmique & Structures de données'];
  acceptedTerms = true;

  goToStep2(): void {
    if (!this.firstName.trim() || !this.lastName.trim() || !this.email.trim() || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs obligatoires.';
      return;
    }
    this.errorMessage = '';
    this.currentStep = 2;
  }

  goToStep3(): void {
    this.errorMessage = '';
    this.currentStep = 3;
  }

  toggleSkill(skill: string): void {
    const idx = this.selectedSkills.indexOf(skill);
    if (idx > -1) {
      this.selectedSkills.splice(idx, 1);
    } else {
      this.selectedSkills.push(skill);
    }
  }

  submitRegistration(): void {
    if (!this.acceptedTerms) {
      this.errorMessage = 'Veuillez accepter les conditions pour continuer.';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    // Génération automatique d'un username basé sur prénom et nom
    const baseUsername = `${this.firstName.toLowerCase().replace(/[^a-z0-9]/g, '')}.${this.lastName.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const username = baseUsername || `user_${Date.now().toString().slice(-4)}`;

    const registrationData = {
      username: username,
      first_name: this.firstName.trim(),
      last_name: this.lastName.trim(),
      email: this.email.trim(),
      password: this.password,
      role: this.role,
      filiere: this.filiere,
      niveau: this.niveau,
      competences: this.selectedSkills
    };

    this.authService.register(registrationData).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/tableau-de-bord']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.error || 'Une erreur est survenue lors de l\'inscription.';
      }
    });
  }
}
