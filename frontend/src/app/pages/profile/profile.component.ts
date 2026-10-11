import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MentorService } from '../../services/mentor.service';
import { Profile, Matiere } from '../../models/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="py-5" style="background: var(--bg); min-height: 85vh;">
      <div class="container-custom" style="max-width: 860px;">
        <div class="card border-0 shadow-sm rounded-4 p-4 p-md-5 bg-white">
          <!-- En-tête -->
          <div class="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom flex-wrap">
            <div class="avatar-initials" style="width: 68px; height: 68px; font-size: 1.6rem;">
              {{ profile?.user?.first_name ? profile!.user.first_name[0].toUpperCase() : 'U' }}{{ profile?.user?.last_name ? profile!.user.last_name[0].toUpperCase() : '' }}
            </div>
            <div>
              <h1 class="fw-bold fs-4 text-dark mb-1">Mon Profil</h1>
              <p class="text-muted small mb-0">Gérez vos informations personnelles et vos paramètres de mentorat</p>
            </div>
          </div>

          <!-- Alertes -->
          <div *ngIf="successMessage" class="alert alert-success alert-dismissible fade show rounded-3 mb-4">
            <i class="bi bi-check-circle-fill me-2"></i>{{ successMessage }}
            <button type="button" class="btn-close" (click)="successMessage = ''"></button>
          </div>

          <div *ngIf="errorMessage" class="alert alert-danger alert-dismissible fade show rounded-3 mb-4">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ errorMessage }}
            <button type="button" class="btn-close" (click)="errorMessage = ''"></button>
          </div>

          <form (ngSubmit)="onSubmit()">
            <!-- Section Identité -->
            <h2 class="fw-bold fs-6 text-dark mb-3">Informations de base</h2>
            <div class="row g-3 mb-4">
              <div class="col-12 col-sm-6">
                <label class="small text-muted fw-bold mb-1">Prénom *</label>
                <input type="text" [(ngModel)]="firstName" name="firstName" class="form-control" style="font-size: 13.5px;" required>
              </div>
              <div class="col-12 col-sm-6">
                <label class="small text-muted fw-bold mb-1">Nom *</label>
                <input type="text" [(ngModel)]="lastName" name="lastName" class="form-control" style="font-size: 13.5px;" required>
              </div>
              <div class="col-12 col-sm-6">
                <label class="small text-muted fw-bold mb-1">Adresse Email *</label>
                <input type="email" [(ngModel)]="email" name="email" class="form-control" style="font-size: 13.5px;" required>
              </div>
              <div class="col-12 col-sm-6">
                <label class="small text-muted fw-bold mb-1">Téléphone / WhatsApp</label>
                <input type="tel" [(ngModel)]="telephone" name="telephone" class="form-control" placeholder="+221 77 000 00 00" style="font-size: 13.5px;">
              </div>
            </div>

            <!-- Section Académique & Rôle -->
            <h2 class="fw-bold fs-6 text-dark mb-3">Profil Académique</h2>
            <div class="row g-3 mb-4">
              <div class="col-12 col-sm-4">
                <label class="small text-muted fw-bold mb-1">Rôle sur la plateforme</label>
                <select [(ngModel)]="role" name="role" class="form-select" style="font-size: 13.5px;">
                  <option value="MENTORE">Étudiant (mentoré)</option>
                  <option value="MENTOR">Mentor</option>
                  <option value="LES_DEUX">Les deux (Étudiant & Mentor)</option>
                </select>
              </div>
              <div class="col-12 col-sm-4">
                <label class="small text-muted fw-bold mb-1">Filière / Spécialité</label>
                <input type="text" [(ngModel)]="filiere" name="filiere" class="form-control" placeholder="ex: Génie Logiciel" style="font-size: 13.5px;">
              </div>
              <div class="col-12 col-sm-4">
                <label class="small text-muted fw-bold mb-1">Niveau d'études</label>
                <select [(ngModel)]="niveau" name="niveau" class="form-select" style="font-size: 13.5px;">
                  <option value="L1">Licence 1</option>
                  <option value="L2">Licence 2</option>
                  <option value="L3">Licence 3</option>
                  <option value="M1">Master 1</option>
                  <option value="M2">Master 2</option>
                </select>
              </div>
            </div>

            <!-- Biographie -->
            <div class="mb-4">
              <label class="small text-muted fw-bold mb-1">Biographie / Présentation</label>
              <textarea [(ngModel)]="bio" name="bio" rows="4" class="form-control" placeholder="Partagez vos motivations, vos projets et vos centres d'intérêt..." style="font-size: 13.5px;"></textarea>
            </div>

            <!-- Section Spécifique Mentor : Disponibilité & Matières -->
            <div *ngIf="role === 'MENTOR' || role === 'LES_DEUX'" class="p-4 rounded-4 bg-light border mb-4">
              <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                <div>
                  <h3 class="fw-bold fs-6 text-dark mb-1">Paramètres du mentor</h3>
                  <p class="text-muted small mb-0">Définissez vos matières enseignées et votre visibilité dans l'annuaire</p>
                </div>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" role="switch" id="dispoSwitch" [(ngModel)]="estDisponible" name="estDisponible" style="width: 2.4em; height: 1.2em;">
                  <label class="form-check-label small fw-bold ms-2" for="dispoSwitch">
                    {{ estDisponible ? 'Disponible pour demandes' : 'Indisponible' }}
                  </label>
                </div>
              </div>

              <label class="small text-muted fw-bold mb-2 d-block">Matières où vous proposez votre mentorat :</label>
              <div class="row g-2">
                <div *ngFor="let mat of allMatieres" class="col-12 col-sm-6">
                  <div class="p-2 px-3 rounded-3 bg-white border d-flex align-items-center gap-2">
                    <input class="form-check-input mt-0" type="checkbox" [id]="'mat_' + mat.id" [checked]="isMatiereSelected(mat.id)" (change)="toggleMatiere(mat.id)">
                    <label class="form-check-label small text-dark fw-bold mb-0 flex-grow-1 cursor-pointer" [for]="'mat_' + mat.id" style="cursor: pointer;">
                      <i class="bi" [ngClass]="mat.icone || 'bi-journal-code'" style="color: var(--blue);"></i>
                      {{ mat.nom }}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Boutons de soumission -->
            <div class="d-flex justify-content-end gap-3 pt-3 border-top">
              <a routerLink="/tableau-de-bord" class="btn btn-light border py-2 px-4" style="font-size: 13.5px; font-weight: 600;">
                Annuler
              </a>
              <button type="submit" [disabled]="saving" class="btn-fm-primary py-2 px-4" style="font-size: 13.5px;">
                <span *ngIf="saving" class="spinner-border spinner-border-sm me-2"></span>
                <i *ngIf="!saving" class="bi bi-save2 me-2"></i>Enregistrer les modifications
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private mentorService = inject(MentorService);
  private router = inject(Router);

  profile: Profile | null = null;
  allMatieres: Matiere[] = [];
  selectedMatiereIds: number[] = [];

  firstName = '';
  lastName = '';
  email = '';
  telephone = '';
  role: 'MENTORE' | 'MENTOR' | 'LES_DEUX' = 'MENTORE';
  filiere = '';
  niveau = 'L1';
  bio = '';
  estDisponible = true;

  saving = false;
  successMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/connexion']);
      return;
    }

    this.profile = this.authService.currentUser;
    if (this.profile) {
      this.populateForm(this.profile);
    }

    this.mentorService.getMatieres().subscribe(mats => {
      this.allMatieres = mats;
    });
  }

  populateForm(p: Profile): void {
    this.firstName = p.user.first_name || '';
    this.lastName = p.user.last_name || '';
    this.email = p.user.email || '';
    this.telephone = p.telephone || '';
    this.role = p.role || 'MENTORE';
    this.filiere = p.filiere || '';
    this.niveau = p.niveau || 'L1';
    this.bio = p.bio || '';
    this.estDisponible = p.est_disponible ?? true;
    this.selectedMatiereIds = (p.competences || []).map(c => c.matiere.id);
  }

  isMatiereSelected(id: number): boolean {
    return this.selectedMatiereIds.includes(id);
  }

  toggleMatiere(id: number): void {
    const idx = this.selectedMatiereIds.indexOf(id);
    if (idx > -1) {
      this.selectedMatiereIds.splice(idx, 1);
    } else {
      this.selectedMatiereIds.push(id);
    }
  }

  onSubmit(): void {
    this.saving = true;
    this.successMessage = '';
    this.errorMessage = '';

    const payload = {
      first_name: this.firstName,
      last_name: this.lastName,
      email: this.email,
      telephone: this.telephone,
      role: this.role,
      filiere: this.filiere,
      niveau: this.niveau,
      bio: this.bio,
      est_disponible: this.estDisponible,
      matieres: this.selectedMatiereIds
    };

    this.authService.updateProfile(payload).subscribe({
      next: (res) => {
        this.saving = false;
        this.profile = res.user;
        this.successMessage = 'Votre profil a été mis à jour avec succès.';
      },
      error: (err) => {
        this.saving = false;
        this.errorMessage = err?.error?.error || 'Erreur lors de la mise à jour du profil.';
      }
    });
  }
}
