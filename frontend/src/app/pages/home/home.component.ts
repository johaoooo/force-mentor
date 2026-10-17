import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MentorService } from '../../services/mentor.service';
import { Profile, Stats } from '../../models/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- 1. HERO BANNER FIGMA -->
    <section class="hero">
      <div class="container hero__inner">
        <div class="hero__text">
          <h1>Trouvez le mentor idéal<br class="d-none d-sm-inline"> pour progresser</h1>
          <p>
            Mettez-vous en relation avec des étudiants de niveau supérieur pour surmonter vos difficultés, et partagez vos compétences dans les matières que vous maîtrisez.
          </p>
          <form class="search" (ngSubmit)="searchMentors()">
            <svg class="search__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <circle cx="11" cy="11" r="7"/>
              <path d="m20 20-3.5-3.5"/>
            </svg>
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              name="q" 
              placeholder="Rechercher par matière, compétence, domaine..." 
              aria-label="Rechercher"
            >
            <button type="submit" class="btn btn--green">
              <span>Rechercher</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="m9 5 7 7-7 7"/>
              </svg>
            </button>
          </form>
        </div>
        <div class="hero__art" aria-hidden="true">
          <img 
            src="/hero_illustration.png" 
            alt="Étudiants qui s'entraident vers la réussite" 
            class="hero__img"
          >
        </div>
      </div>
    </section>

    <!-- 2. BANDEAU DE STATS (FIGMA : SOUS LE HERO) -->
    <section class="section-stats-bar">
      <div class="container stats-bar__inner">
        <div class="stat-item">
          <strong class="stat-number">{{ stats?.total_mentors || 25 }}</strong>
          <div class="stat-label">
            <span class="stat-title">MENTORS ÉTUDIANTS</span>
            <small class="stat-sub">Disponibles dans vos filières</small>
          </div>
        </div>
        <div class="stat-item">
          <strong class="stat-number">{{ stats?.total_matieres || 12 }}</strong>
          <div class="stat-label">
            <span class="stat-title">ÉTUDIANTS ACCOMPAGNÉS</span>
            <small class="stat-sub">Sessions d'entraide actives</small>
          </div>
        </div>
        <div class="stat-item">
          <strong class="stat-number">97%</strong>
          <div class="stat-label">
            <span class="stat-title">TAUX DE RÉUSSITE</span>
            <small class="stat-sub">Satisfaction des mentorés</small>
          </div>
        </div>
      </div>
    </section>

    <!-- 3. SECTION COMMENT ÇA MARCHE -->
    <section class="section" id="comment-ca-marche">
      <div class="container">
        <div class="section__header text-center mb-5">
          <h2 class="section__title">COMMENT ÇA MARCHE</h2>
          <p class="section__sub">Un accompagnement d'entraide étudiante simple, rapide et structuré en 3 étapes</p>
        </div>
        <div class="steps">
          <div class="step">
            <span class="step__num">01</span>
            <h3>Indiquez vos besoins</h3>
            <p>Renseignez votre filière, votre niveau d'études et la matière sur laquelle vous souhaitez progresser ou partager votre savoir.</p>
          </div>
          <div class="step">
            <span class="step__num">02</span>
            <h3>Choisissez votre mentor</h3>
            <p>Explorez les profils d'étudiants certifiés par Force-N et envoyez votre demande de mentorat en moins de 3 clics.</p>
          </div>
          <div class="step">
            <span class="step__num">03</span>
            <h3>Progressez ensemble</h3>
            <p>Planifiez vos séances de travail, échangez en visio ou présentiel et notez l'expérience pour valoriser l'accompagnement.</p>
          </div>
        </div>
        <div class="text-center mt-4 pt-2">
          <a routerLink="/comment-ca-marche" class="btn btn--outline" style="padding: 10px 24px; font-size: 14px; font-weight: 600;">
            <i class="bi bi-info-circle me-2"></i>Découvrir le guide complet & les rôles
          </a>
        </div>
      </div>
    </section>

    <!-- 4. SECTION LES MENTORS -->
    <section class="section section--bordered" id="mentors">
      <div class="container">
        <div class="section__header text-center mb-4">
          <h2 class="section__title">LES MENTORS</h2>
          <p class="section__sub">
            Des étudiants certifiés Force-N, recommandés pour leur excellence et leur pédagogie, prêts à vous guider dans vos cours et projets.
          </p>
        </div>
        <div class="mentors">
          <article *ngFor="let mentor of mentors" class="mentor">
            <div class="mentor__head">
              <span class="avatar avatar--initials">
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

        <div class="text-center mt-5">
          <a routerLink="/mentors" class="btn btn--outline" style="padding: 12px 28px; font-size: 14.5px; font-weight: 700;">
            <i class="bi bi-people-fill me-2"></i>Voir tous les mentors disponibles
          </a>
        </div>
      </div>
    </section>

    <!-- 5. SECTION TÉMOIGNAGE FIGMA -->
    <section class="section section-testimonial" id="temoignages">
      <div class="container">
        <div class="testimonial-card">
          <div class="testimonial-card__image-wrapper">
            <img src="/testimonial_student.png" alt="Awa Sow - Étudiante mentorée" class="testimonial-card__image">
          </div>
          <div class="testimonial-card__content">
            <div class="testimonial-card__quote-icon" aria-hidden="true">“</div>
            <blockquote class="testimonial-card__quote">
              « Grâce à Force Mentor, j'ai pu surmonter mes difficultés et trouver le mentor parfait pour progresser rapidement en Algorithmique et en Python. L'accompagnement personnalisé et bienveillant a fait toute la différence dans ma réussite aux examens. »
            </blockquote>
            <div class="testimonial-card__author">
              <strong>Awa Sow</strong>
              <span>Étudiante en Licence 1 Génie Logiciel — Mentorée</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 6. SECTION FAQ FIGMA -->
    <section class="section section-faq section--bordered" id="faq">
      <div class="container faq__grid">
        <div class="faq__intro">
          <span class="faq__badge">FAQs</span>
          <h2 class="faq__title">Questions fréquentes</h2>
          <p class="faq__desc">Toutes les réponses pour bien comprendre le fonctionnement de l'entraide sur Force Mentor.</p>
          <div class="faq__help-box">
            <i class="bi bi-question-circle-fill"></i>
            <div>
              <strong>Une autre question ?</strong>
              <p>L'équipe pédagogique et le support Force-N sont disponibles pour vous orienter.</p>
            </div>
          </div>
        </div>

        <div class="faq__accordion">
          <details class="faq-item" open>
            <summary class="faq-item__question">
              <span>Le service est-il gratuit ?</span>
              <i class="bi bi-chevron-down faq-item__icon"></i>
            </summary>
            <div class="faq-item__answer">
              <p>Oui, l'accès à Force Mentor et l'ensemble des sessions d'entraide entre apprenants sont <strong>100% gratuits</strong> dans le cadre du programme Force-N.</p>
            </div>
          </details>

          <details class="faq-item">
            <summary class="faq-item__question">
              <span>À qui s'adresse la plateforme Force Mentor ?</span>
              <i class="bi bi-chevron-down faq-item__icon"></i>
            </summary>
            <div class="faq-item__answer">
              <p>La plateforme s'adresse à tous les apprenants et étudiants inscrits dans les cursus et formations Force-N, du niveau débutant aux niveaux avancés.</p>
            </div>
          </details>

          <details class="faq-item">
            <summary class="faq-item__question">
              <span>Comment puis-je devenir mentor à mon tour ?</span>
              <i class="bi bi-chevron-down faq-item__icon"></i>
            </summary>
            <div class="faq-item__answer">
              <p>Dès que vous maîtrisez une matière ou validez un module avec succès, vous pouvez activer le rôle « Mentor » ou « Les deux » dans votre profil et y ajouter vos compétences.</p>
            </div>
          </details>

          <details class="faq-item">
            <summary class="faq-item__question">
              <span>Comment se déroulent les sessions d'accompagnement ?</span>
              <i class="bi bi-chevron-down faq-item__icon"></i>
            </summary>
            <div class="faq-item__answer">
              <p>Les sessions peuvent se dérouler en ligne (Google Meet, Microsoft Teams, Discord) ou en présentiel selon les disponibilités convenues entre vous et votre mentor.</p>
            </div>
          </details>

          <details class="faq-item">
            <summary class="faq-item__question">
              <span>Combien de demandes de mentorat puis-je envoyer ?</span>
              <i class="bi bi-chevron-down faq-item__icon"></i>
            </summary>
            <div class="faq-item__answer">
              <p>Vous pouvez solliciter plusieurs mentors, mais nous vous recommandons de vous concentrer sur 1 ou 2 demandes actives à la fois pour un meilleur suivi.</p>
            </div>
          </details>

          <div class="text-center mt-4 pt-2">
            <a routerLink="/faq" class="btn btn--outline" style="padding: 10px 24px; font-size: 14px; font-weight: 600;">
              <i class="bi bi-question-circle me-2"></i>Consulter toutes les questions fréquentes (FAQ)
            </a>
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
  mentors: Profile[] = [];
  stats: Stats | null = null;
  defaultBio = "Passionné par ma discipline, j'accompagne les apprenants avec écoute et bienveillance pour surmonter leurs difficultés.";

  ngOnInit(): void {
    this.mentorService.getMentors().subscribe(mentors => {
      this.mentors = mentors.slice(0, 3);
    });

    this.mentorService.getStats().subscribe(stats => {
      this.stats = stats;
    });
  }

  getInitials(mentor: Profile): string {
    const fn = mentor.user.first_name ? mentor.user.first_name[0].toUpperCase() : 'M';
    const ln = mentor.user.last_name ? mentor.user.last_name[0].toUpperCase() : '';
    return `${fn}${ln}`;
  }

  searchMentors(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/mentors'], { queryParams: { q: this.searchQuery.trim() } });
    } else {
      this.router.navigate(['/mentors']);
    }
  }
}
