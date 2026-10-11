import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MentorService } from '../../services/mentor.service';
import { Profile, Matiere, Stats } from '../../models/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- SECTION HERO A1 OFFICIELLE -->
    <section class="hero">
      <div class="container-custom hero__inner">
        <!-- Colonne Gauche : Titre, Explication & Moteur de recherche -->
        <div class="hero__text">
          <h1>Trouvez le mentor idéal<br>pour progresser</h1>
          <p>
            Bénéficiez de l'accompagnement de professionnels expérimentés qui vous guideront dans votre parcours, vous aideront à développer vos compétences et à atteindre vos objectifs.
          </p>

          <!-- Barre de Recherche Ronde avec Bouton Vert -->
          <form (ngSubmit)="searchMentors()" class="search">
            <svg class="search__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <circle cx="11" cy="11" r="7"/>
              <path d="m20 20-3.5-3.5"/>
            </svg>
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              name="q" 
              placeholder="Rechercher un mentor, une compétence, un domaine..." 
              aria-label="Rechercher"
            >
            <button type="submit" class="btn btn--green">
              <span>Rechercher</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m9 5 7 7-7 7"/>
              </svg>
            </button>
          </form>

          <!-- Raccourcis Matières sous la recherche -->
          <div class="d-flex align-items-center gap-2 pt-3 flex-wrap">
            <span class="text-white-50" style="font-size: 14px;">Matières populaires :</span>
            <div class="d-flex flex-wrap gap-2">
              <span 
                *ngFor="let mat of sampleMatieres" 
                (click)="filterByMatiere(mat.id)" 
                class="badge bg-white text-primary rounded-pill px-3 py-2 cursor-pointer shadow-sm" 
                style="font-size: 13px; cursor: pointer; transition: transform 0.15s ease;"
              >
                {{ mat.nom }}
              </span>
            </div>
          </div>
        </div>

        <!-- Colonne Droite : Illustration SVG A1 Officielle -->
        <div class="hero__art" aria-hidden="true">
          <svg viewBox="0 0 500 420" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <path id="star" d="m0-9 2.6 5.8 6.4.7-4.8 4.3 1.4 6.2L0 4.6-5.6 8l1.4-6.2L-9-3.5l6.4-.7z"/>
            </defs>
            <!-- arcs pointillés -->
            <g fill="none" stroke="#fff" stroke-width="1.8" stroke-dasharray="5 6" stroke-linecap="round">
              <path d="M55 207C38 150 60 110 100 102C125 98 145 115 158 135"/>
              <path d="M170 125C170 60 200 30 245 24C300 18 330 60 340 95"/>
              <path d="M365 107C420 115 460 150 452 200C448 230 435 245 425 252"/>
            </g>
            <use href="#star" x="244" y="24" fill="#fff" transform="translate(244 24) scale(.5) translate(-244 -24)"/>
            <use href="#star" x="271" y="26" fill="#fff" transform="translate(271 26) scale(.5) translate(-271 -26)"/>
            <!-- nuage -->
            <path fill="#e9f0fb" d="M80 305C72 240 70 190 100 160C125 140 160 150 185 160C200 140 205 95 240 85C265 85 290 130 320 150C370 170 405 200 412 250L415 305Z"/>
            <g fill="#eef3fc">
              <ellipse cx="250" cy="335" rx="205" ry="30"/>
              <ellipse cx="248" cy="362" rx="95" ry="22"/>
              <circle cx="44" cy="304" r="19"/>
              <circle cx="62" cy="292" r="22"/>
              <circle cx="440" cy="308" r="19"/>
              <circle cx="424" cy="294" r="24"/>
            </g>
            <!-- escalier -->
            <path fill="#2079df" d="M82 307L190 310V262L292 266V239L393 242V360L82 350Z"/>
            <!-- personnage du sommet -->
            <circle cx="257" cy="84" r="9" fill="#e08a4a"/>
            <path d="M248 82c2-9 15-9 18-1z" fill="#1b2a5e"/>
            <rect x="268" y="96" width="16" height="12" rx="2" fill="#fff" transform="rotate(25 276 102)"/>
            <use href="#star" x="258" y="56" fill="#f5c518" transform="translate(258 56) scale(.9) translate(-258 -56)"/>
            <use href="#star" x="350" y="103" fill="#f5c518"/>
            <path d="M170 152l8 12-9 3z" fill="#f5c518"/>
            <!-- personnage gauche (jaune) -->
            <path d="M120 238 118 300" stroke="#1e3fae" stroke-width="12" stroke-linecap="round"/>
            <path d="M143 244 165 270 152 296" fill="none" stroke="#1e3fae" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M110 304h16M148 298h14" stroke="#10163a" stroke-width="5" stroke-linecap="round"/>
            <path d="M138 188 168 192 160 242 120 242C112 220 120 200 138 188Z" fill="#f2c72f"/>
            <path d="M162 194 203 176" stroke="#f2c72f" stroke-width="10" stroke-linecap="round"/>
            <circle cx="204" cy="175" r="5" fill="#8b5a3c"/>
            <circle cx="156" cy="168" r="11" fill="#8b5a3c"/>
            <path d="M143 164c2-12 20-12 24-2-2 4-7 3-9 1-5 1-10 4-12 9zM144 170c-5 2-8 8-7 14 5-1 8-5 9-9z" fill="#1b2a5e"/>
            <!-- personnage central (bleu) -->
            <path d="M250 190 236 250" stroke="#1e3fae" stroke-width="13" stroke-linecap="round"/>
            <path d="M268 190 292 202 282 250" fill="none" stroke="#1e3fae" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M228 258h16" stroke="#10163a" stroke-width="5" stroke-linecap="round"/>
            <rect x="276" y="248" width="12" height="14" rx="3" fill="#2d5fd0"/>
            <path d="M242 148 282 156 280 192 248 192Z" fill="#5aa0ee"/>
            <path d="M244 154 206 176" stroke="#5aa0ee" stroke-width="10" stroke-linecap="round"/>
            <path d="M278 158 306 162" stroke="#5aa0ee" stroke-width="10" stroke-linecap="round"/>
            <circle cx="263" cy="132" r="11" fill="#d9dde8"/>
            <circle cx="268" cy="137" r="7" fill="#f0c9a6"/>
            <!-- personnage droit (rouge) -->
            <path d="M349 170 346 236M366 170 378 236" stroke="#1e3fae" stroke-width="12" stroke-linecap="round"/>
            <path d="M338 240h16M372 238h16" stroke="#e3a99b" stroke-width="5" stroke-linecap="round"/>
            <path d="M343 130 376 138 368 172 346 172Z" fill="#f0675a"/>
            <path d="M346 140 306 162" stroke="#f0675a" stroke-width="10" stroke-linecap="round"/>
            <path d="M372 140 384 170" stroke="#f0675a" stroke-width="9" stroke-linecap="round"/>
            <circle cx="305" cy="162" r="4.5" fill="#f0c9a6"/>
            <circle cx="332" cy="118" r="10" fill="#f0c9a6"/>
            <path d="M322 116c2-10 18-10 21-1-4-1-9 0-12 3-3-2-6-2-9-2z" fill="#10163a"/>
          </svg>
        </div>
      </div>
    </section>

    <!-- SECTION COMMENT ÇA MARCHE A1 -->
    <section class="section">
      <div class="container-custom">
        <h2 class="section__title">COMMENT ÇA MARCHE</h2>
        <p class="section__sub">Un processus simple et rapide en 3 étapes pour progresser</p>
        <div class="steps">
          <div class="step">
            <span class="step__num">01</span>
            <h3>Créez votre profil</h3>
            <p>Inscrivez-vous gratuitement et complétez votre profil en quelques minutes.</p>
          </div>
          <div class="step">
            <span class="step__num">02</span>
            <h3>Choisissez un mentor</h3>
            <p>Explorez notre réseau de mentors et trouvez celui qui correspond à vos besoins.</p>
          </div>
          <div class="step">
            <span class="step__num">03</span>
            <h3>Progressez ensemble</h3>
            <p>Échangez, apprenez et atteignez vos objectifs grâce à un accompagnement personnalisé.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION DOMAINES & MATIÈRES -->
    <section class="section section--bordered" style="background: var(--bg);">
      <div class="container-custom">
        <h2 class="section__title">DOMAINES & COMPÉTENCES</h2>
        <p class="section__sub">Découvrez les matières et technologies dans lesquelles nos mentors vous accompagnent</p>
        
        <div class="row g-3">
          <div *ngFor="let mat of matieres" class="col-6 col-md-4 col-lg-3">
            <div 
              (click)="filterByMatiere(mat.id)" 
              class="card p-3 h-100 border-0 shadow-sm rounded-3 cursor-pointer" 
              style="cursor: pointer; transition: transform 0.2s;"
              (mouseover)="$any($event.currentTarget).style.transform='translateY(-3px)'" 
              (mouseout)="$any($event.currentTarget).style.transform='translateY(0)'"
            >
              <div class="d-flex align-items-center gap-3">
                <div class="rounded-3 p-2 d-flex align-items-center justify-content-center" style="background: rgba(43, 114, 187, 0.1); color: var(--blue); width: 48px; height: 48px;">
                  <i class="bi" [ngClass]="mat.icone || 'bi-journal-code'" style="font-size: 1.5rem;"></i>
                </div>
                <div>
                  <strong class="d-block text-dark" style="font-size: 15.5px;">{{ mat.nom }}</strong>
                  <small class="text-muted" style="font-size: 13px;">Accompagnement disponible</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION LES MENTORS (GABARIT A1) -->
    <section class="section section--bordered">
      <div class="container-custom">
        <h2 class="section__title">LES MENTORS</h2>
        <p class="section__sub">
          Découvrez des étudiants avancés et professionnels, prêts à partager leur expertise<br>et leur expérience pour vous aider à avancer.
        </p>

        <div class="row g-4">
          <div *ngFor="let mentor of mentors" class="col-12 col-md-6 col-lg-4">
            <article class="mentor bg-white shadow-sm h-100 d-flex flex-column p-4 rounded-3 border">
              <div class="mentor__head d-flex align-items-center gap-3 mb-3">
                <span class="avatar avatar--initials" style="width: 56px; height: 56px; font-size: 1.25rem;">
                  {{ mentor.user.first_name ? mentor.user.first_name[0].toUpperCase() : 'M' }}{{ mentor.user.last_name ? mentor.user.last_name[0].toUpperCase() : '' }}
                </span>
                <div>
                  <strong style="font-size: 17px; color: var(--ink);">{{ mentor.user.first_name }} {{ mentor.user.last_name }}</strong>
                  <small style="font-size: 13.5px; color: var(--muted); display: block;">{{ mentor.filiere || 'Informatique' }} &bull; {{ mentor.niveau_display }}</small>
                </div>
              </div>

              <div class="rating d-flex align-items-center gap-2 mb-2" style="font-size: 14px; color: var(--muted);">
                <span class="stars" style="--rating: 4.9" aria-label="Note 4.9 sur 5"></span>
                <span class="fw-bold text-dark">4.9</span>
                <span class="badge bg-success-subtle text-success ms-auto rounded-pill px-3 py-1" style="font-size: 12.5px;">Disponible</span>
              </div>

              <p class="flex-grow-1 mb-3" style="font-size: 15px; line-height: 1.6; color: var(--ink);">
                {{ mentor.bio || 'Passionné par le partage de connaissances, je vous accompagne dans vos devoirs et projets de code.' }}
              </p>

              <!-- Compétences du mentor -->
              <div class="d-flex flex-wrap gap-1 mb-3">
                <span *ngFor="let comp of mentor.competences" class="badge rounded-pill" style="background: rgba(43, 114, 187, 0.1); color: var(--blue); font-size: 12.5px; padding: 6px 12px;">
                  {{ comp.matiere.nom }}
                </span>
              </div>

              <div class="pt-3 border-top mt-auto d-flex justify-content-between align-items-center">
                <a [routerLink]="['/mentor', mentor.id]" class="btn btn--outline w-100 justify-content-center" style="font-size: 14.5px; padding: 10px 18px;">
                  Consulter le profil &rarr;
                </a>
              </div>
            </article>
          </div>
        </div>

        <div class="text-center mt-5">
          <a routerLink="/mentors" class="btn btn--primary py-3 px-4" style="font-size: 16px;">
            <i class="bi bi-grid-fill me-2"></i>Explorer tous les mentors
          </a>
        </div>
      </div>
    </section>

    <!-- SECTION STATS CLÉS (GABARIT A1) -->
    <section class="section section--bordered">
      <div class="container-custom stats">
        <div>
          <strong>{{ stats?.total_mentors || 25 }}</strong>
          <span>Mentors disponibles<br><small>dans plusieurs matières</small></span>
        </div>
        <div>
          <strong>{{ stats?.total_matieres || 12 }}</strong>
          <span>Matières clés<br><small>pour tous vos projets</small></span>
        </div>
        <div>
          <strong>{{ stats?.total_demandes || 87 }}</strong>
          <span>Sessions réalisées<br><small>et apprenants satisfaits</small></span>
        </div>
      </div>
    </section>
  `
})
export class HomeComponent implements OnInit {
  private mentorService = inject(MentorService);
  private router = inject(Router);

  searchQuery = '';
  matieres: Matiere[] = [];
  sampleMatieres: Matiere[] = [];
  mentors: Profile[] = [];
  stats: Stats | null = null;

  ngOnInit(): void {
    this.mentorService.getMatieres().subscribe(mats => {
      this.matieres = mats;
      this.sampleMatieres = mats.slice(0, 5);
    });

    this.mentorService.getMentors().subscribe(mentors => {
      this.mentors = mentors.slice(0, 6);
    });

    this.mentorService.getStats().subscribe(stats => {
      this.stats = stats;
    });
  }

  searchMentors(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/mentors'], { queryParams: { q: this.searchQuery.trim() } });
    } else {
      this.router.navigate(['/mentors']);
    }
  }

  filterByMatiere(matiereId: number): void {
    this.router.navigate(['/mentors'], { queryParams: { matiere: matiereId } });
  }
}
