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
    <!-- Hero Section -->
    <section class="hero-custom">
      <div class="container-custom">
        <div class="hero-inner">
          <div>
            <h1>Trouvez le mentor idéal pour progresser</h1>
            <p>
              Rejoignez la communauté d'entraide des étudiants du programme <strong>Force-N</strong>. Bénéficiez des retours d'expérience et débloquez rapidement vos projets de code.
            </p>
            <form (ngSubmit)="searchMentors()" class="search-bar-custom mb-3">
              <i class="bi bi-search text-muted fs-5"></i>
              <input type="text" [(ngModel)]="searchQuery" name="search" placeholder="Rechercher une matière, un langage ou un mentor..." />
              <button type="submit" class="btn-fm-green">Trouver un mentor</button>
            </form>
            <div class="d-flex align-items-center gap-3 pt-2">
              <span class="small text-white-50">Exemples :</span>
              <div class="d-flex flex-wrap gap-2">
                <span *ngFor="let mat of sampleMatieres" (click)="filterByMatiere(mat.id)" class="badge bg-white text-primary rounded-pill px-2 py-1 cursor-pointer" style="font-size: 11.5px; cursor: pointer;">
                  {{ mat.nom }}
                </span>
              </div>
            </div>
          </div>

          <div class="d-none d-lg-block text-center">
            <div class="p-4 rounded-4" style="background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.2);">
              <div class="row g-3 text-start">
                <div class="col-6">
                  <div class="bg-white p-3 rounded-3 shadow-sm">
                    <i class="bi bi-people-fill text-primary fs-3"></i>
                    <div class="fw-bold fs-4 text-dark mt-1">{{ stats?.total_mentors || 5 }}</div>
                    <small class="text-muted">Mentors actifs</small>
                  </div>
                </div>
                <div class="col-6">
                  <div class="bg-white p-3 rounded-3 shadow-sm">
                    <i class="bi bi-journal-code text-success fs-3"></i>
                    <div class="fw-bold fs-4 text-dark mt-1">{{ stats?.total_matieres || 8 }}</div>
                    <small class="text-muted">Matières tech</small>
                  </div>
                </div>
                <div class="col-6">
                  <div class="bg-white p-3 rounded-3 shadow-sm">
                    <i class="bi bi-award-fill text-warning fs-3"></i>
                    <div class="fw-bold fs-4 text-dark mt-1">+500</div>
                    <small class="text-muted">Étudiants Force-N</small>
                  </div>
                </div>
                <div class="col-6">
                  <div class="bg-white p-3 rounded-3 shadow-sm">
                    <i class="bi bi-shield-check text-info fs-3"></i>
                    <div class="fw-bold fs-4 text-dark mt-1">100%</div>
                    <small class="text-muted">Gratuit & Ouvert</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section Matières Populaires -->
    <section class="py-5" style="background: var(--bg); border-bottom: 1px solid var(--line);">
      <div class="container-custom">
        <div class="text-center mb-4">
          <h2 class="fw-bold text-dark fs-3">Matières & Technologies</h2>
          <p class="text-muted small">Explorez les domaines dans lesquels nos mentors vous accompagnent</p>
        </div>

        <div class="row g-3">
          <div *ngFor="let mat of matieres" class="col-6 col-md-4 col-lg-3">
            <div (click)="filterByMatiere(mat.id)" class="card p-3 h-100 border-0 shadow-sm rounded-3 cursor-pointer" style="cursor: pointer; transition: transform 0.2s;" (mouseover)="$any($event.currentTarget).style.transform='translateY(-3px)'" (mouseout)="$any($event.currentTarget).style.transform='translateY(0)'">
              <div class="d-flex align-items-center gap-3">
                <div class="rounded-3 p-2 d-flex align-items-center justify-content-center" style="background: rgba(43, 114, 187, 0.1); color: var(--blue); width: 42px; height: 42px;">
                  <i class="bi" [ngClass]="mat.icone || 'bi-journal-code'" style="font-size: 1.3rem;"></i>
                </div>
                <div>
                  <strong class="d-block text-dark" style="font-size: 13.5px;">{{ mat.nom }}</strong>
                  <small class="text-muted" style="font-size: 11.5px;">Accompagnement</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Section Mentors Récents -->
    <section class="py-5">
      <div class="container-custom">
        <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h2 class="fw-bold text-dark fs-3 mb-1">Mentors disponibles</h2>
            <p class="text-muted small mb-0">Des apprenants expérimentés prêts à vous aider dès aujourd'hui</p>
          </div>
          <a routerLink="/mentors" class="btn-fm-outline py-2 px-3">
            Voir tous les mentors <i class="bi bi-arrow-right"></i>
          </a>
        </div>

        <div class="row g-4">
          <div *ngFor="let mentor of mentors" class="col-12 col-md-6 col-lg-4">
            <div class="card-mentor">
              <div class="d-flex align-items-center gap-3 mb-3">
                <div class="avatar-initials">
                  {{ mentor.user.first_name ? mentor.user.first_name[0].toUpperCase() : 'M' }}{{ mentor.user.last_name ? mentor.user.last_name[0].toUpperCase() : '' }}
                </div>
                <div>
                  <strong class="d-block text-dark" style="font-size: 15px;">{{ mentor.user.first_name }} {{ mentor.user.last_name }}</strong>
                  <small class="text-muted" style="font-size: 12px;">{{ mentor.filiere || 'Informatique' }} &bull; {{ mentor.niveau_display }}</small>
                </div>
              </div>

              <p class="small text-muted flex-grow-1 mb-3" style="font-size: 13px; line-height: 1.5;">
                {{ mentor.bio ? (mentor.bio | slice:0:110) + '...' : 'Mentor actif sur la plateforme Force Mentor.' }}
              </p>

              <!-- Compétences / Matières -->
              <div class="d-flex flex-wrap gap-1 mb-3">
                <span *ngFor="let comp of mentor.competences" class="badge rounded-pill" style="background: rgba(43, 114, 187, 0.1); color: var(--blue); font-size: 11px;">
                  {{ comp.matiere.nom }}
                </span>
              </div>

              <div class="pt-2 border-top d-flex justify-content-between align-items-center mt-auto">
                <span class="badge-status-accepted">
                  <i class="bi bi-circle-fill" style="font-size: 6px;"></i> Disponible
                </span>
                <a [routerLink]="['/mentor', mentor.id]" class="btn-fm-primary py-1 px-3" style="font-size: 12.5px;">
                  Voir le profil
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Comment ça marche ? -->
    <section class="py-5" style="background: var(--bg); border-top: 1px solid var(--line);">
      <div class="container-custom">
        <div class="text-center mb-5">
          <h2 class="fw-bold text-dark fs-3">Comment ça fonctionne ?</h2>
          <p class="text-muted small">Mise en relation en 3 clics simples</p>
        </div>

        <div class="row g-4 text-center">
          <div class="col-12 col-md-4">
            <div class="p-4 bg-white rounded-4 shadow-sm h-100">
              <div class="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style="width: 56px; height: 56px; background: var(--blue); color: #fff; font-size: 22px; font-weight: 700;">
                1
              </div>
              <h3 class="fw-bold fs-5 text-dark mb-2">Choisissez votre matière</h3>
              <p class="text-muted small mb-0">Recherchez un mentor spécialisé dans le langage ou la compétence où vous rencontrez des difficultés.</p>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="p-4 bg-white rounded-4 shadow-sm h-100">
              <div class="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style="width: 56px; height: 56px; background: var(--orange); color: #fff; font-size: 22px; font-weight: 700;">
                2
              </div>
              <h3 class="fw-bold fs-5 text-dark mb-2">Envoyez votre demande</h3>
              <p class="text-muted small mb-0">Exposez succinctement votre besoin ou votre projet pour lancer la mise en relation avec le mentor.</p>
            </div>
          </div>
          <div class="col-12 col-md-4">
            <div class="p-4 bg-white rounded-4 shadow-sm h-100">
              <div class="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style="width: 56px; height: 56px; background: var(--green); color: #fff; font-size: 22px; font-weight: 700;">
                3
              </div>
              <h3 class="fw-bold fs-5 text-dark mb-2">Progressez ensemble</h3>
              <p class="text-muted small mb-0">Échangez des conseils méthodologiques, résolvez vos bugs et validez vos compétences avec succès.</p>
            </div>
          </div>
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
      this.sampleMatieres = mats.slice(0, 4);
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
