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
    <main class="page-mentors">
      <!-- 1. EN-TÊTE DE PAGE -->
      <section class="mentors-hero">
        <div class="container text-center">
          <span class="badge-tag mb-2 d-inline-block">Annuaire officiel Force-N</span>
          <h1 class="mentors-hero__title">Trouvez votre mentor</h1>
          <p class="mentors-hero__sub mx-auto">
            Explorez les profils d'étudiants de niveau supérieur prêts à vous accompagner dans vos cours, vos projets et vos révisions.
          </p>
        </div>
      </section>

      <div class="container py-5">
        <!-- 2. BARRE DE FILTRES STYLE FIGMA -->
        <div class="filters-card mb-5">
          <div class="row g-3 align-items-center">
            <!-- Recherche textuelle -->
            <div class="col-12 col-md-5">
              <label class="filter-label">Recherche</label>
              <div class="input-search-wrapper">
                <i class="bi bi-search search-icon"></i>
                <input 
                  type="text" 
                  [(ngModel)]="searchQuery" 
                  (input)="onFilterChange()" 
                  class="filter-input" 
                  placeholder="Matière, compétence, filière, nom..."
                >
              </div>
            </div>

            <!-- Filtre Matière -->
            <div class="col-12 col-sm-6 col-md-3">
              <label class="filter-label">Matière enseignée</label>
              <select [(ngModel)]="selectedMatiereId" (change)="onFilterChange()" class="filter-select">
                <option [ngValue]="null">Toutes les matières</option>
                <option *ngFor="let mat of matieres" [ngValue]="mat.id">{{ mat.nom }}</option>
              </select>
            </div>

            <!-- Filtre Niveau -->
            <div class="col-12 col-sm-6 col-md-2">
              <label class="filter-label">Niveau d'études</label>
              <select [(ngModel)]="selectedNiveau" (change)="onFilterChange()" class="filter-select">
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
              <button (click)="resetFilters()" class="btn btn--outline w-100 justify-content-center" style="height: 44px; font-size: 13.5px;">
                <i class="bi bi-arrow-counterclockwise me-1"></i>Effacer
              </button>
            </div>
          </div>

          <!-- Tags rapides de matières populaires -->
          <div class="mt-3 pt-3 border-top d-flex align-items-center gap-2 flex-wrap">
            <span class="text-muted small fw-bold me-1" style="font-size: 12px;">Populaires :</span>
            <button 
              *ngFor="let mat of matieres | slice:0:6" 
              type="button"
              (click)="selectQuickMatiere(mat.id)"
              class="badge-pill-filter"
              [class.badge-pill-filter--active]="selectedMatiereId === mat.id"
            >
              {{ mat.nom }}
            </button>
          </div>
        </div>

        <!-- 3. COMPTEUR DE RÉSULTATS -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div class="results-count">
            <span *ngIf="!loading">
              <strong>{{ mentors.length }}</strong> mentor{{ mentors.length > 1 ? 's' : '' }} disponible{{ mentors.length > 1 ? 's' : '' }}
            </span>
            <span *ngIf="loading" class="text-muted">
              Recherche en cours...
            </span>
          </div>
        </div>

        <!-- 4. ÉTAT DE CHARGEMENT -->
        <div *ngIf="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
          <p class="text-muted small mt-3">Chargement des mentors...</p>
        </div>

        <!-- 5. AUCUN RÉSULTAT -->
        <div *ngIf="!loading && mentors.length === 0" class="empty-state text-center py-5">
          <div class="empty-state__icon mx-auto mb-3">
            <i class="bi bi-person-x"></i>
          </div>
          <h3 class="fw-bold mb-2">Aucun mentor trouvé</h3>
          <p class="text-muted mb-4 mx-auto" style="max-width: 440px; font-size: 14.5px;">
            Aucun mentor ne correspond à vos critères de recherche actuels. Essayez d'effacer les filtres ou de chercher une autre compétence.
          </p>
          <button (click)="resetFilters()" class="btn btn--primary">
            Réinitialiser les critères
          </button>
        </div>

        <!-- 6. GRILLE DES MENTORS (DESIGN FIGMA IDENTIQUE) -->
        <div *ngIf="!loading && mentors.length > 0" class="mentors">
          <article *ngFor="let mentor of mentors" class="mentor">
            <div class="mentor__head">
              <img *ngIf="mentor.photo_url" [src]="mentor.photo_url" [alt]="mentor.user.first_name" class="avatar">
              <span *ngIf="!mentor.photo_url" class="avatar avatar--initials">
                {{ getInitials(mentor) }}
              </span>
              <div>
                <strong>{{ mentor.user.first_name }} {{ mentor.user.last_name }}</strong>
                <small>{{ mentor.filiere || 'Génie Logiciel' }} &bull; {{ mentor.niveau_display }}</small>
              </div>
            </div>

            <!-- Badges de compétences -->
            <div class="mentor__tags">
              <span *ngFor="let comp of mentor.competences | slice:0:3" class="badge-skill">
                {{ comp.matiere.nom }}
              </span>
              <span *ngIf="!mentor.competences?.length" class="badge-skill">
                {{ mentor.filiere || 'Informatique' }}
              </span>
            </div>

            <div class="rating">
              <span class="stars" style="--rating: 4.9" aria-label="Note 4.9 sur 5"></span>
              <span>4.9 ({{ (mentor.id * 7 + 12) }} avis)</span>
            </div>

            <p class="mentor__bio">
              {{ mentor.bio || defaultBio }}
            </p>

            <div class="mentor__actions">
              <a [routerLink]="['/mentor', mentor.id]" class="btn btn--outline btn-sm">Voir le profil</a>
              <a [routerLink]="['/mentor', mentor.id]" class="btn btn--primary btn-sm">Demander</a>
            </div>
          </article>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .page-mentors {
      min-height: 85vh;
      background: var(--bg);
    }
    .mentors-hero {
      background: linear-gradient(135deg, #0b4bc9 0%, #083896 100%);
      color: #fff;
      padding: 50px 0 55px;
    }
    .badge-tag {
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
      font-size: 11.5px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 5px 12px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.25);
    }
    .mentors-hero__title {
      font-size: clamp(1.8rem, 3vw, 2.5rem);
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 12px;
    }
    .mentors-hero__sub {
      max-width: 600px;
      font-size: 15px;
      line-height: 1.55;
      opacity: 0.9;
    }
    .filters-card {
      background: #fff;
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 14px rgba(15, 27, 61, 0.04);
    }
    .filter-label {
      font-size: 12px;
      font-weight: 700;
      color: var(--muted);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 6px;
      display: block;
    }
    .input-search-wrapper {
      position: relative;
    }
    .search-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--muted);
      font-size: 14px;
    }
    .filter-input {
      width: 100%;
      height: 44px;
      padding: 8px 14px 8px 38px;
      border: 1.5px solid var(--line);
      border-radius: 8px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.15s ease;
    }
    .filter-input:focus {
      border-color: var(--blue);
    }
    .filter-select {
      width: 100%;
      height: 44px;
      padding: 8px 14px;
      border: 1.5px solid var(--line);
      border-radius: 8px;
      font-size: 14px;
      background-color: #fff;
      outline: none;
      transition: border-color 0.15s ease;
    }
    .filter-select:focus {
      border-color: var(--blue);
    }
    .badge-pill-filter {
      background: #eff6ff;
      color: var(--blue);
      border: 1px solid rgba(43, 114, 187, 0.18);
      font-size: 12px;
      font-weight: 600;
      padding: 4px 12px;
      border-radius: 999px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .badge-pill-filter:hover {
      background: rgba(43, 114, 187, 0.15);
    }
    .badge-pill-filter--active {
      background: var(--blue);
      color: #fff;
      border-color: var(--blue);
    }
    .results-count {
      font-size: 14.5px;
      color: var(--muted);
    }
    .results-count strong {
      color: var(--ink);
    }
    .empty-state__icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #eff6ff;
      color: var(--blue);
      display: grid;
      place-items: center;
      font-size: 28px;
    }
  `]
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

  defaultBio = 'Passionné par le partage de connaissances et l\'accompagnement académique sur les cours Force-N.';

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

  selectQuickMatiere(matiereId: number): void {
    if (this.selectedMatiereId === matiereId) {
      this.selectedMatiereId = null;
    } else {
      this.selectedMatiereId = matiereId;
    }
    this.loadMentors();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedMatiereId = null;
    this.selectedNiveau = null;
    this.router.navigate(['/mentors']);
    this.loadMentors();
  }

  getInitials(mentor: Profile): string {
    const f = mentor.user.first_name ? mentor.user.first_name[0].toUpperCase() : 'M';
    const l = mentor.user.last_name ? mentor.user.last_name[0].toUpperCase() : '';
    return f + l;
  }
}
