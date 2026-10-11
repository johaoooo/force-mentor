import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MentorService } from '../../services/mentor.service';
import { Profile, Matiere } from '../../models/models';

@Component({
  selector: 'app-mentor-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="py-4" style="background: var(--bg); min-height: 80vh;">
      <div class="container-custom">
        <!-- En-tête -->
        <div class="mb-4">
          <h1 class="fw-bold fs-3 text-dark mb-1">Annuaire des Mentors</h1>
          <p class="text-muted small mb-0">Trouvez un mentor d'expérience pour vous guider dans vos cours et projets de code</p>
        </div>

        <!-- Barre de filtres -->
        <div class="card p-3 p-md-4 border-0 shadow-sm rounded-3 mb-4 bg-white">
          <div class="row g-3 align-items-center">
            <!-- Recherche par mot-clé -->
            <div class="col-12 col-md-4">
              <label class="small text-muted fw-bold mb-1 d-block">Recherche</label>
              <div class="input-group">
                <span class="input-group-text bg-white border-end-0 text-muted">
                  <i class="bi bi-search"></i>
                </span>
                <input 
                  type="text" 
                  [(ngModel)]="searchQuery" 
                  (input)="onFilterChange()" 
                  class="form-control border-start-0" 
                  placeholder="Nom, compétence, filière..." 
                  style="font-size: 13.5px;"
                >
              </div>
            </div>

            <!-- Filtre Matière -->
            <div class="col-12 col-sm-6 col-md-3">
              <label class="small text-muted fw-bold mb-1 d-block">Matière / Technologie</label>
              <select [(ngModel)]="selectedMatiereId" (change)="onFilterChange()" class="form-select" style="font-size: 13.5px;">
                <option [ngValue]="null">Toutes les matières</option>
                <option *ngFor="let mat of matieres" [ngValue]="mat.id">{{ mat.nom }}</option>
              </select>
            </div>

            <!-- Filtre Niveau -->
            <div class="col-12 col-sm-6 col-md-3">
              <label class="small text-muted fw-bold mb-1 d-block">Niveau d'études</label>
              <select [(ngModel)]="selectedNiveau" (change)="onFilterChange()" class="form-select" style="font-size: 13.5px;">
                <option [ngValue]="null">Tous les niveaux</option>
                <option value="L1">Licence 1</option>
                <option value="L2">Licence 2</option>
                <option value="L3">Licence 3</option>
                <option value="M1">Master 1</option>
                <option value="M2">Master 2</option>
              </select>
            </div>

            <!-- Réinitialiser -->
            <div class="col-12 col-md-2 d-flex align-items-end">
              <button (click)="resetFilters()" class="btn btn-light border w-100 py-2" style="font-size: 13px; font-weight: 600;">
                <i class="bi bi-arrow-counterclockwise me-1"></i>Effacer
              </button>
            </div>
          </div>
        </div>

        <!-- État de chargement -->
        <div *ngIf="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
          <p class="text-muted small mt-2">Recherche des mentors en cours...</p>
        </div>

        <!-- Aucun résultat -->
        <div *ngIf="!loading && mentors.length === 0" class="card border-0 shadow-sm rounded-4 p-5 text-center bg-white my-4">
          <div class="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3" style="width: 64px; height: 64px; background: rgba(43, 114, 187, 0.1); color: var(--blue);">
            <i class="bi bi-person-x fs-2"></i>
          </div>
          <h4 class="fw-bold text-dark fs-5">Aucun mentor trouvé</h4>
          <p class="text-muted small mb-3">Essayez d'élargir vos critères de recherche ou de réinitialiser les filtres.</p>
          <div>
            <button (click)="resetFilters()" class="btn-fm-primary py-2 px-3">
              Réinitialiser les filtres
            </button>
          </div>
        </div>

        <!-- Liste des Mentors -->
        <div *ngIf="!loading && mentors.length > 0" class="row g-4">
          <div *ngFor="let mentor of mentors" class="col-12 col-md-6 col-lg-4">
            <div class="card-mentor bg-white shadow-sm h-100">
              <!-- En-tête de la carte -->
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="avatar-initials">
                  {{ mentor.user.first_name ? mentor.user.first_name[0].toUpperCase() : 'M' }}{{ mentor.user.last_name ? mentor.user.last_name[0].toUpperCase() : '' }}
                </div>
                <div>
                  <strong class="d-block text-dark fs-6">{{ mentor.user.first_name }} {{ mentor.user.last_name }}</strong>
                  <small class="text-muted" style="font-size: 12px;">{{ mentor.filiere || 'Informatique' }} &bull; {{ mentor.niveau_display }}</small>
                </div>
              </div>

              <!-- Biographie -->
              <p class="small text-muted flex-grow-1 mb-3" style="font-size: 13px; line-height: 1.55;">
                {{ mentor.bio || 'Passionné par le partage de connaissances et l\'accompagnement académique sur les cours Force-N.' }}
              </p>

              <!-- Compétences / Matières -->
              <div class="mb-3">
                <span class="small text-muted d-block mb-1 fw-bold" style="font-size: 13px;">COMPÉTENCES ENSEIGNÉES :</span>
                <div class="d-flex flex-wrap gap-1">
                  <span *ngFor="let comp of mentor.competences" class="badge rounded-1" style="background: rgba(43, 114, 187, 0.1); color: var(--blue); font-size: 13px; padding: 6px 10px;">
                    {{ comp.matiere.nom }} <span class="opacity-75">({{ comp.niveau_display }})</span>
                  </span>
                  <span *ngIf="mentor.competences.length === 0" class="text-muted small" style="font-size: 13px;">Général</span>
                </div>
              </div>

              <!-- Pied de la carte -->
              <div class="pt-3 border-top d-flex justify-content-between align-items-center mt-auto">
                <span class="badge-status-accepted">
                  <i class="bi bi-circle-fill" style="font-size: 6px;"></i> Disponible
                </span>
                <a [routerLink]="['/mentor', mentor.id]" class="btn-fm-primary py-2 px-3" style="font-size: 14px;">
                  Voir le profil &bull; Demander <i class="bi bi-arrow-right ms-1"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class MentorListComponent implements OnInit {
  private mentorService = inject(MentorService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  mentors: Profile[] = [];
  matieres: Matiere[] = [];
  loading = true;

  searchQuery = '';
  selectedMatiereId: number | null = null;
  selectedNiveau: string | null = null;

  ngOnInit(): void {
    this.mentorService.getMatieres().subscribe(mats => {
      this.matieres = mats;
    });

    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchQuery = params['q'];
      }
      if (params['matiere']) {
        this.selectedMatiereId = +params['matiere'];
      }
      if (params['niveau']) {
        this.selectedNiveau = params['niveau'];
      }
      this.loadMentors();
    });
  }

  loadMentors(): void {
    this.loading = true;
    this.mentorService.getMentors(this.selectedMatiereId, this.selectedNiveau, this.searchQuery).subscribe({
      next: (data) => {
        this.mentors = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.loadMentors();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedMatiereId = null;
    this.selectedNiveau = null;
    this.router.navigate(['/mentors']);
    this.loadMentors();
  }
}
