import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <main class="page-testimonials">
      <!-- 1. HERO BANNER -->
      <section class="testimonials-hero">
        <div class="container text-center">
          <span class="badge-tag mb-3 d-inline-block">Retours d'expérience</span>
          <h1 class="testimonials-hero__title">Ils progressent avec Force Mentor</h1>
          <p class="testimonials-hero__sub mx-auto">
            Découvrez comment l'accompagnement personnalisé et l'entraide entre apprenants Force-N transforment les parcours académiques et renforcent la réussite de chacun.
          </p>
          <div class="d-flex justify-content-center gap-3 mt-4 flex-wrap">
            <a routerLink="/mentors" class="btn btn--green" style="padding: 12px 24px;">
              <i class="bi bi-search me-2"></i>Trouver mon mentor
            </a>
            <a routerLink="/inscription" class="btn btn--ghost-white" style="padding: 12px 24px;">
              <i class="bi bi-mortarboard-fill me-2"></i>Devenir mentor
            </a>
          </div>
        </div>
      </section>

      <!-- 2. CHIFFRES CLÉS -->
      <section class="section-stats-bar">
        <div class="container stats-bar__inner">
          <div class="stat-item">
            <strong class="stat-number">97%</strong>
            <div class="stat-label">
              <span class="stat-title">TAUX DE SATISFACTION</span>
              <small class="stat-sub">Avis positifs des mentorés</small>
            </div>
          </div>
          <div class="stat-item">
            <strong class="stat-number">+150</strong>
            <div class="stat-label">
              <span class="stat-title">SESSIONS RÉALISÉES</span>
              <small class="stat-sub">Entraide individuelle et en groupe</small>
            </div>
          </div>
          <div class="stat-item">
            <strong class="stat-number">100%</strong>
            <div class="stat-label">
              <span class="stat-title">GRATUIT & ACCESSIBLE</span>
              <small class="stat-sub">Pour tous les apprenants Force-N</small>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. TÉMOIGNAGE EN VEDETTE (AWA SOW) -->
      <section class="section">
        <div class="container">
          <div class="section__header text-center mb-5">
            <h2 class="section__title">TÉMOIGNAGE DU MOIS</h2>
            <p class="section__sub">Le retour inspirant d'une apprenante accompagnée avec succès</p>
          </div>

          <div class="testimonial-card shadow-sm mx-auto" style="max-width: 960px;">
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

      <!-- 4. GRILLE D'EXPÉRIENCES CROISÉES (MENTORS & MENTORÉS) -->
      <section class="section section--bordered" style="background: #fbfcfe;">
        <div class="container">
          <div class="section__header text-center mb-5">
            <h2 class="section__title">PAROLES D'APPRENANTS</h2>
            <p class="section__sub">Mentors et mentorés partagent l'impact de l'entraide sur leur quotidien d'études</p>
          </div>

          <div class="row g-4">
            <!-- Témoignage 2 : Moussa Diop -->
            <div class="col-12 col-md-4">
              <div class="testimonial-mini-card">
                <div class="stars mb-3" style="--rating: 5" aria-label="5 étoiles"></div>
                <p class="testimonial-mini-card__text">
                  « Transmettre mes connaissances en algorithmique et en bases de données à des étudiants de L1 me permet d'ancrer mes propres compétences tout en me rendant utile. »
                </p>
                <div class="testimonial-mini-card__author">
                  <div class="avatar-initials">MD</div>
                  <div>
                    <strong>Moussa Diop</strong>
                    <small>Master 1 Génie Logiciel &bull; Mentor</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Témoignage 3 : Sophie Ndiaye -->
            <div class="col-12 col-md-4">
              <div class="testimonial-mini-card">
                <div class="stars mb-3" style="--rating: 5" aria-label="5 étoiles"></div>
                <p class="testimonial-mini-card__text">
                  « J'avais beaucoup d'appréhension sur les réseaux et l'adressage IP. Mon mentor a pris le temps de m'expliquer pas à pas avec des exemples concrets. Résultat : 17/20 au partiel ! »
                </p>
                <div class="testimonial-mini-card__author">
                  <div class="avatar-initials" style="background:#e0f2fe; color:#0369a1;">SN</div>
                  <div>
                    <strong>Sophie Ndiaye</strong>
                    <small>Licence 2 Réseaux & Télécoms &bull; Mentorée</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Témoignage 4 : Koffi Amegan -->
            <div class="col-12 col-md-4">
              <div class="testimonial-mini-card">
                <div class="stars mb-3" style="--rating: 5" aria-label="5 étoiles"></div>
                <p class="testimonial-mini-card__text">
                  « La flexibilité de la plateforme est géniale. On se cale des séances de 45 minutes en visio quand c'est nécessaire. L'esprit de communauté Force-N est bien là. »
                </p>
                <div class="testimonial-mini-card__author">
                  <div class="avatar-initials" style="background:#fef3c7; color:#92400e;">KA</div>
                  <div>
                    <strong>Koffi Amegan</strong>
                    <small>Licence 3 Systèmes & Réseaux &bull; Les deux</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. BANDEAU D'APPEL À L'ACTION -->
      <section class="section-cta text-center">
        <div class="container">
          <h2>Prêt à booster vos résultats académiques ?</h2>
          <p class="mx-auto mt-2 mb-4" style="max-width: 540px; color: #dbeafe; font-size: 15px;">
            Rejoignez dès aujourd'hui les centaines d'étudiants qui bénéficient de l'accompagnement bénévole et certifié Force-N.
          </p>
          <div class="d-flex justify-content-center gap-3 flex-wrap">
            <a routerLink="/inscription" class="btn btn--white" style="padding: 12px 28px; font-weight: 700;">
              Créer mon compte gratuit
            </a>
            <a routerLink="/mentors" class="btn btn--outline-white" style="padding: 12px 28px;">
              Explorer l'annuaire des mentors
            </a>
          </div>
        </div>
      </section>
    </main>
  `,
  styles: [`
    .testimonials-hero {
      background: var(--blue);
      color: #fff;
      padding: 60px 0 54px;
    }
    .testimonials-hero__title {
      font-size: clamp(28px, 3.2vw, 42px);
      font-weight: 800;
      letter-spacing: -0.8px;
      margin-bottom: 16px;
    }
    .testimonials-hero__sub {
      font-size: 16px;
      line-height: 1.6;
      max-width: 680px;
      opacity: 0.95;
    }
    .badge-tag {
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      padding: 5px 14px;
      border-radius: 20px;
      border: 1px solid rgba(255, 255, 255, 0.25);
    }
    .testimonial-mini-card {
      background: #ffffff;
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 28px 24px;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-shadow: 0 4px 14px rgba(11, 75, 201, 0.04);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .testimonial-mini-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(11, 75, 201, 0.08);
    }
    .testimonial-mini-card__text {
      font-size: 14.5px;
      line-height: 1.6;
      color: var(--ink);
      font-style: italic;
      margin-bottom: 20px;
    }
    .testimonial-mini-card__author {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .avatar-initials {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #eff6ff;
      color: var(--blue);
      font-weight: 800;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .testimonial-mini-card__author strong {
      display: block;
      font-size: 14.5px;
      color: var(--ink);
    }
    .testimonial-mini-card__author small {
      font-size: 12px;
      color: var(--muted);
    }
    .section-cta {
      background: linear-gradient(135deg, #0b4bc9 0%, #1e40af 100%);
      color: #fff;
      padding: 60px 0;
    }
    .section-cta h2 {
      font-size: clamp(24px, 2.5vw, 32px);
      font-weight: 800;
    }
    .btn--white {
      background: #ffffff;
      color: var(--blue);
      border: none;
      border-radius: 8px;
    }
    .btn--white:hover {
      background: #f1f5f9;
      color: var(--blue);
    }
    .btn--outline-white {
      background: transparent;
      color: #ffffff;
      border: 1.5px solid rgba(255, 255, 255, 0.6);
      border-radius: 8px;
    }
    .btn--outline-white:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }
    .btn--ghost-white {
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
    }
    .btn--ghost-white:hover {
      background: rgba(255, 255, 255, 0.25);
      color: #fff;
    }
  `]
})
export class TestimonialsComponent {}
