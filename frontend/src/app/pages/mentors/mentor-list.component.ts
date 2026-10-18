import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MentorService } from '../../services/mentor.service';
import { MentorshipService } from '../../services/mentorship.service';
import { AuthService } from '../../services/auth.service';
import { Profile, Matiere, MatchingResult } from '../../models/models';

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

        <!-- 2. SÉLECTEUR DE MODE : MATCHING INTELLIGENT VS ANNUAIRE COMPLET -->
        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
          <div class="mode-switch-group p-1 bg-white border rounded-pill shadow-sm d-inline-flex">
            <button 
              type="button" 
              (click)="setDisplayMode('matching')" 
              class="btn rounded-pill px-3 px-sm-4 py-2 fw-bold d-flex align-items-center gap-1 gap-sm-2"
              [class.btn-primary]="displayMode === 'matching'"
              [class.btn-light]="displayMode !== 'matching'"
              style="font-size: 13px;"
            >
              <i class="bi bi-stars"></i>
              <span>Matching</span>
              <span *ngIf="matchingResults.length > 0" class="badge bg-white text-primary rounded-pill px-2" style="font-size: 11px;">
                {{ matchingResults.length }}
              </span>
            </button>
            <button 
              type="button" 
              (click)="setDisplayMode('all')" 
              class="btn rounded-pill px-3 px-sm-4 py-2 fw-bold d-flex align-items-center gap-1 gap-sm-2"
              [class.btn-primary]="displayMode === 'all'"
              [class.btn-light]="displayMode !== 'all'"
              style="font-size: 13px;"
            >
              <i class="bi bi-grid-fill"></i>
              <span>Annuaire complet</span>
              <span class="badge bg-secondary-subtle text-secondary rounded-pill px-2" style="font-size: 11px;">
                {{ mentors.length }}
              </span>
            </button>
          </div>

          <div *ngIf="currentUser" class="small text-muted d-flex align-items-center gap-2">
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-2 py-1">
              <i class="bi bi-person-check-fill me-1"></i>Profil actif
            </span>
            <span>{{ currentUser.filiere || 'Informatique' }} &bull; {{ currentUser.niveau_display }}</span>
          </div>
        </div>

        <!-- 3. ASSISTANT DE MATCHING INTELLIGENT (MODE MATCHING) -->
        <div *ngIf="displayMode === 'matching'" class="filters-card mb-4 border-primary shadow-sm" style="border-width: 2px;">
          <div class="d-flex align-items-center gap-3 mb-3">
            <div class="p-2 rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center" style="width: 44px; height: 44px;">
              <i class="bi bi-stars fs-4"></i>
            </div>
            <div>
              <h2 class="h5 fw-bold text-dark mb-0">Assistant de Matching Intelligent</h2>
              <p class="text-muted small mb-0">
                Nos algorithmes croisent votre filière, votre niveau, la matière choisie et les créneaux disponibles pour vous recommander les mentors les plus adaptés.
              </p>
            </div>
          </div>

          <div class="row g-3 align-items-end">
            <!-- Matière recherchée -->
            <div class="col-12 col-md-4">
              <label class="filter-label">Matière où progresser</label>
              <select [(ngModel)]="matchingMatiereId" (change)="loadMatching()" class="filter-select">
                <option [ngValue]="null">Toutes mes matières prioritaires</option>
                <option *ngFor="let mat of matieres" [ngValue]="mat.id">{{ mat.nom }}</option>
              </select>
            </div>

            <!-- Jour préféré -->
            <div class="col-12 col-sm-6 col-md-3">
              <label class="filter-label">Jour de disponibilité préféré</label>
              <select [(ngModel)]="matchingJour" (change)="loadMatching()" class="filter-select">
                <option [ngValue]="null">Peu importe le jour</option>
                <option [ngValue]="0">Lundi</option>
                <option [ngValue]="1">Mardi</option>
                <option [ngValue]="2">Mercredi</option>
                <option [ngValue]="3">Jeudi</option>
                <option [ngValue]="4">Vendredi</option>
                <option [ngValue]="5">Samedi</option>
                <option [ngValue]="6">Dimanche</option>
              </select>
            </div>

            <!-- Score minimum -->
            <div class="col-12 col-sm-6 col-md-3">
              <label class="filter-label">Compatibilité minimale</label>
              <select [(ngModel)]="minScoreFilter" (change)="loadMatching()" class="filter-select">
                <option [ngValue]="null">Tous les scores</option>
                <option [ngValue]="70">&ge; 70% (Bonne compatibilité)</option>
                <option [ngValue]="80">&ge; 80% (Très forte)</option>
                <option [ngValue]="90">&ge; 90% (Excellente)</option>
              </select>
            </div>

            <!-- Bouton Réinitialiser -->
            <div class="col-12 col-md-2">
              <button (click)="resetMatchingFilters()" class="btn btn--outline w-100 justify-content-center" style="height: 44px; font-size: 13.5px;">
                <i class="bi bi-arrow-counterclockwise me-1"></i>Effacer
              </button>
            </div>
          </div>
        </div>

        <!-- 4. BARRE DE FILTRES CLASSIQUE (MODE ANNUAIRE COMPLET) -->
        <div *ngIf="displayMode === 'all'" class="filters-card mb-4">
          <div class="row g-3 align-items-center">
            <!-- Recherche textuelle -->
            <div class="col-12 col-md-5">
              <label class="filter-label">Recherche libre</label>
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

        <!-- 5. COMPTEUR DE RÉSULTATS -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div class="results-count">
            <span *ngIf="displayMode === 'matching' && !matchingLoading">
              <strong>{{ matchingResults.length }}</strong> mentor{{ matchingResults.length > 1 ? 's' : '' }} suggéré{{ matchingResults.length > 1 ? 's' : '' }} par compatibilité
            </span>
            <span *ngIf="displayMode === 'all' && !loading">
              <strong>{{ mentors.length }}</strong> mentor{{ mentors.length > 1 ? 's' : '' }} dans l'annuaire
            </span>
            <span *ngIf="(displayMode === 'matching' && matchingLoading) || (displayMode === 'all' && loading)" class="text-muted">
              Recherche en cours...
            </span>
          </div>
        </div>

        <!-- 6. ÉTAT DE CHARGEMENT -->
        <div *ngIf="(displayMode === 'matching' && matchingLoading) || (displayMode === 'all' && loading)" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
          <p class="text-muted small mt-3">Analyse des mentors et calcul des scores...</p>
        </div>

        <!-- 7. AUCUN RÉSULTAT -->
        <div *ngIf="displayMode === 'matching' && !matchingLoading && matchingResults.length === 0" class="empty-state text-center py-5">
          <div class="empty-state__icon mx-auto mb-3">
            <i class="bi bi-person-x"></i>
          </div>
          <h3 class="fw-bold mb-2">Aucun mentor compatible trouvé</h3>
          <p class="text-muted mb-4 mx-auto" style="max-width: 440px; font-size: 14.5px;">
            Ajustez vos critères de matching (matière ou jour) pour élargir les résultats.
          </p>
          <button (click)="resetMatchingFilters()" class="btn btn--primary">
            Réinitialiser les critères
          </button>
        </div>

        <div *ngIf="displayMode === 'all' && !loading && mentors.length === 0" class="empty-state text-center py-5">
          <div class="empty-state__icon mx-auto mb-3">
            <i class="bi bi-person-x"></i>
          </div>
          <h3 class="fw-bold mb-2">Aucun mentor trouvé</h3>
          <p class="text-muted mb-4 mx-auto" style="max-width: 440px; font-size: 14.5px;">
            Aucun mentor ne correspond à vos filtres actuels.
          </p>
          <button (click)="resetFilters()" class="btn btn--primary">
            Réinitialiser les filtres
          </button>
        </div>

        <!-- 8. GRILLE DE RÉSULTATS DU MATCHING INTELLIGENT -->
        <div *ngIf="displayMode === 'matching' && !matchingLoading && matchingResults.length > 0" class="mentors">
          <article *ngFor="let match of matchingResults" class="mentor border position-relative" [class.border-primary]="match.score >= 85">
            
            <!-- Badge Score de compatibilité -->
            <div class="position-absolute top-0 end-0 m-3">
              <span class="badge rounded-pill px-3 py-2 fw-bold shadow-sm d-inline-flex align-items-center gap-1"
                    [ngClass]="getScoreBadgeClass(match.score)"
                    style="font-size: 12px;">
                <i class="bi bi-stars"></i>
                <span>{{ match.score }}% compatible</span>
              </span>
            </div>

            <div class="mentor__head pe-5">
              <img *ngIf="match.mentor.photo_url" [src]="match.mentor.photo_url" [alt]="match.mentor.user.first_name" class="avatar">
              <span *ngIf="!match.mentor.photo_url" class="avatar avatar--initials">
                {{ getInitials(match.mentor) }}
              </span>
              <div>
                <strong>{{ match.mentor.user.first_name }} {{ match.mentor.user.last_name }}</strong>
                <small>{{ match.mentor.filiere || 'Génie Logiciel' }} &bull; {{ match.mentor.niveau_display }}</small>
              </div>
            </div>

            <!-- Badges de compétences -->
            <div class="mentor__tags">
              <span *ngFor="let comp of match.mentor.competences | slice:0:3" class="badge-skill">
                {{ comp.matiere.nom }}
              </span>
              <span *ngIf="!match.mentor.competences?.length" class="badge-skill">
                {{ match.mentor.filiere || 'Informatique' }}
              </span>
            </div>

            <!-- Note et Avis vérifiés -->
            <div class="rating d-flex align-items-center gap-1 my-1">
              <span class="stars" [style.--rating]="match.mentor.note_moyenne || 5"></span>
              <span *ngIf="match.mentor.nb_avis && match.mentor.nb_avis > 0" class="fw-bold text-dark small">
                {{ match.mentor.note_moyenne | number:'1.1-1' }} <span class="text-muted fw-normal">({{ match.mentor.nb_avis }} avis vérifié{{ match.mentor.nb_avis > 1 ? 's' : '' }})</span>
              </span>
              <span *ngIf="!match.mentor.nb_avis || match.mentor.nb_avis === 0" class="badge bg-light text-muted border" style="font-size: 11px;">
                <i class="bi bi-patch-check me-1 text-primary"></i>Nouveau mentor
              </span>
            </div>

            <!-- Points forts de compatibilité -->
            <div class="matching-reasons-box p-3 rounded-3 bg-light border my-2">
              <div class="fw-bold text-dark small mb-1 d-flex align-items-center gap-1">
                <i class="bi bi-check-circle-fill text-success"></i>
                <span>Points forts de compatibilité :</span>
              </div>
              <ul class="list-unstyled mb-0" style="font-size: 11.5px;">
                <li *ngFor="let raison of match.raisons" class="text-secondary d-flex align-items-start gap-1 mb-1">
                  <i class="bi bi-dot text-primary fs-5 lh-1"></i>
                  <span>{{ raison }}</span>
                </li>
              </ul>
            </div>

            <p class="mentor__bio">
              {{ match.mentor.bio || defaultBio }}
            </p>

            <div class="mentor__actions">
              <a [routerLink]="['/mentor', match.mentor.id]" class="btn btn--outline btn-sm">Voir le profil</a>
              <a [routerLink]="['/mentor', match.mentor.id]" class="btn btn--primary btn-sm">Réserver / Demander</a>
            </div>
          </article>
        </div>

        <!-- 9. GRILLE ANNUAIRE COMPLET -->
        <div *ngIf="displayMode === 'all' && !loading && mentors.length > 0" class="mentors">
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

            <div class="rating d-flex align-items-center gap-1">
              <span class="stars" [style.--rating]="mentor.note_moyenne || 5" [attr.aria-label]="mentor.note_moyenne ? ('Note ' + mentor.note_moyenne + ' sur 5') : 'Nouveau mentor'"></span>
              <span *ngIf="mentor.nb_avis && mentor.nb_avis > 0" class="fw-bold text-dark small">
                {{ mentor.note_moyenne | number:'1.1-1' }} <span class="text-muted fw-normal">({{ mentor.nb_avis }} avis vérifié{{ mentor.nb_avis > 1 ? 's' : '' }})</span>
              </span>
              <span *ngIf="!mentor.nb_avis || mentor.nb_avis === 0" class="badge bg-light text-muted border" style="font-size: 11px;">
                <i class="bi bi-patch-check me-1 text-primary"></i>Nouveau mentor
              </span>
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
  private mentorshipService = inject(MentorshipService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  currentUser: Profile | null = null;
  displayMode: 'matching' | 'all' = 'matching';

  // Annuaire complet
  mentors: Profile[] = [];
  matieres: Matiere[] = [];
  loading = true;
  searchQuery = '';
  selectedMatiereId: number | null = null;
  selectedNiveau: string | null = null;

  // Matching intelligent
  matchingResults: MatchingResult[] = [];
  matchingLoading = true;
  matchingMatiereId: number | null = null;
  matchingJour: number | null = null;
  minScoreFilter: number | null = null;

  defaultBio = 'Passionné par le partage de connaissances et l\'accompagnement académique sur les cours Force-N.';

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;

    this.mentorService.getMatieres().subscribe(mats => {
      this.matieres = mats;
    });

    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchQuery = params['q'];
        this.displayMode = 'all'; // Si recherche par texte, basculer sur l'annuaire complet
      }
      if (params['matiere']) {
        this.selectedMatiereId = +params['matiere'];
        this.matchingMatiereId = +params['matiere'];
      }
      if (params['niveau']) {
        this.selectedNiveau = params['niveau'];
      }
      if (params['mode']) {
        this.displayMode = params['mode'] === 'all' ? 'all' : 'matching';
      }

      this.loadMentors();
      this.loadMatching();
    });
  }

  setDisplayMode(mode: 'matching' | 'all'): void {
    this.displayMode = mode;
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

  loadMatching(): void {
    this.matchingLoading = true;
    this.mentorshipService.getMatching({
      matiere_id: this.matchingMatiereId,
      jour_semaine: this.matchingJour,
      min_score: this.minScoreFilter || undefined
    }).subscribe({
      next: (res) => {
        this.matchingResults = res.results || [];
        this.matchingLoading = false;
      },
      error: () => {
        this.matchingLoading = false;
      }
    });
  }

  resetMatchingFilters(): void {
    this.matchingMatiereId = null;
    this.matchingJour = null;
    this.minScoreFilter = null;
    this.loadMatching();
  }

  getScoreBadgeClass(score: number): string {
    if (score >= 90) return 'bg-success text-white';
    if (score >= 80) return 'bg-primary text-white';
    if (score >= 70) return 'bg-info text-dark';
    return 'bg-secondary text-white';
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
