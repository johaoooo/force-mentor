import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <main class="page-how-it-works">
      <!-- 1. HERO BANNER -->
      <section class="how-hero">
        <div class="container text-center">
          <span class="badge-tag mb-3 d-inline-block">Guide de la plateforme</span>
          <h1 class="how-hero__title">Comment fonctionne Force Mentor ?</h1>
          <p class="how-hero__sub mx-auto">
            Force Mentor met en relation les apprenants du programme Force-N avec des étudiants de niveau supérieur pour surmonter les blocages, réviser ensemble et réussir ses examens.
          </p>
          <div class="d-flex justify-content-center gap-3 mt-4 flex-wrap">
            <a routerLink="/mentors" class="btn btn--green" style="padding: 12px 24px;">
              <i class="bi bi-search me-2"></i>Trouver un mentor
            </a>
            <a routerLink="/inscription" class="btn btn--ghost-white" style="padding: 12px 24px;">
              <i class="bi bi-person-plus-fill me-2"></i>Créer un compte
            </a>
          </div>
        </div>
      </section>

      <!-- 2. LES 3 ÉTAPES CLÉS (FIGMA) -->
      <section class="section">
        <div class="container">
          <div class="section__header text-center mb-5">
            <h2 class="section__title">UN PARCOURS SIMPLE EN 3 ÉTAPES</h2>
            <p class="section__sub">De l'inscription à la première session d'entraide, tout est conçu pour aller vite et efficacement.</p>
          </div>

          <div class="steps mb-5">
            <div class="step">
              <span class="step__num">01</span>
              <h3>Indiquez vos besoins</h3>
              <p>
                Renseignez votre filière, votre niveau d'études (Licence 1, 2, 3...) et la matière sur laquelle vous avez besoin d'aide ou souhaitez mentorer.
              </p>
            </div>
            <div class="step">
              <span class="step__num">02</span>
              <h3>Choisissez votre mentor</h3>
              <p>
                Consultez les profils détaillés de nos mentors certifiés, leurs compétences validées, leurs avis d'autres étudiants et leurs disponibilités.
              </p>
            </div>
            <div class="step">
              <span class="step__num">03</span>
              <h3>Progressez ensemble</h3>
              <p>
                Envoyez votre demande en 1 clic. Une fois acceptée, organisez votre session de travail en visio ou présentiel et notez l'échange.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. RÔLES : MENTORÉ VS MENTOR -->
      <section class="section section--bordered bg-light-soft">
        <div class="container">
          <div class="section__header text-center mb-5">
            <h2 class="section__title">DEUX MANIÈRES DE S'ENGAGER</h2>
            <p class="section__sub">Que vous cherchiez du soutien ou souhaitiez transmettre vos compétences, Force Mentor est fait pour vous.</p>
          </div>

          <div class="row g-4">
            <!-- Carte Mentoré -->
            <div class="col-12 col-md-6">
              <div class="role-card h-100">
                <div class="role-card__header">
                  <div class="role-card__icon role-card__icon--blue">
                    <i class="bi bi-mortarboard-fill"></i>
                  </div>
                  <div>
                    <h3 class="role-card__title">Pour les Étudiants accompagnés</h3>
                    <span class="role-card__badge">Mentorés</span>
                  </div>
                </div>
                <ul class="role-card__list">
                  <li>
                    <i class="bi bi-check-circle-fill text-success"></i>
                    <span><strong>Accès direct aux aînés :</strong> Posez vos questions à des étudiants qui ont déjà réussi les matières où vous rencontrez des difficultés.</span>
                  </li>
                  <li>
                    <i class="bi bi-check-circle-fill text-success"></i>
                    <span><strong>Apprentissage personnalisé :</strong> Révisez le code, les algorithmes, les bases de données ou les réseaux à votre propre rythme.</span>
                  </li>
                  <li>
                    <i class="bi bi-check-circle-fill text-success"></i>
                    <span><strong>100% Gratuit :</strong> L'entraide étudiante au sein de Force-N est solidaire et totalement gratuite.</span>
                  </li>
                  <li>
                    <i class="bi bi-check-circle-fill text-success"></i>
                    <span><strong>Suivi en temps réel :</strong> Retrouvez l'historique de vos demandes et sessions sur votre tableau de bord.</span>
                  </li>
                </ul>
                <div class="mt-4 pt-3 border-top">
                  <a routerLink="/mentors" class="btn btn--outline w-100 justify-content-center">
                    Explorer les mentors disponibles
                  </a>
                </div>
              </div>
            </div>

            <!-- Carte Mentor -->
            <div class="col-12 col-md-6">
              <div class="role-card h-100">
                <div class="role-card__header">
                  <div class="role-card__icon role-card__icon--green">
                    <i class="bi bi-award-fill"></i>
                  </div>
                  <div>
                    <h3 class="role-card__title">Pour les Étudiants guides</h3>
                    <span class="role-card__badge role-card__badge--green">Mentors</span>
                  </div>
                </div>
                <ul class="role-card__list">
                  <li>
                    <i class="bi bi-check-circle-fill text-success"></i>
                    <span><strong>Consolidez vos acquis :</strong> Enseigner et expliquer une notion technique est la meilleure façon de la maîtriser en profondeur.</span>
                  </li>
                  <li>
                    <i class="bi bi-check-circle-fill text-success"></i>
                    <span><strong>Reconnaissance académique :</strong> Valorisez votre investissement sur votre CV grâce aux badges et avis certifiés Force-N.</span>
                  </li>
                  <li>
                    <i class="bi bi-check-circle-fill text-success"></i>
                    <span><strong>Flexibilité totale :</strong> Vous décidez d'accepter ou décliner les demandes selon votre emploi du temps et vos examens.</span>
                  </li>
                  <li>
                    <i class="bi bi-check-circle-fill text-success"></i>
                    <span><strong>Impact positif direct :</strong> Contribuez concrètement à la réussite de votre communauté d'étudiants.</span>
                  </li>
                </ul>
                <div class="mt-4 pt-3 border-top">
                  <a routerLink="/inscription" class="btn btn--primary w-100 justify-content-center">
                    Devenir mentor sur la plateforme
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. FAQ ACCORDÉON -->
      <section class="section">
        <div class="container faq__grid">
          <div class="faq__intro">
            <span class="faq__badge">FAQs</span>
            <h2 class="section__title">QUESTIONS FRÉQUENTES</h2>
            <p class="section__sub">Toutes les réponses pour bien débuter sur Force Mentor.</p>
            <div class="mt-4">
              <a routerLink="/inscription" class="btn btn--primary">Créer mon profil</a>
            </div>
          </div>

          <div class="faq__list">
            <details class="faq-item" open>
              <summary>
                <span>Qui peut devenir mentor sur Force Mentor ?</span>
                <span class="faq-item__chevron" aria-hidden="true">›</span>
              </summary>
              <div class="faq-item__body">
                <p>
                  Tout étudiant du programme Force-N inscrit en Licence 2, Licence 3 ou Master et ayant validé avec de bonnes notes les matières d'informatique, mathématiques ou technologies web peut postuler comme mentor.
                </p>
              </div>
            </details>

            <details class="faq-item">
              <summary>
                <span>Les sessions de mentorat sont-elles payantes ?</span>
                <span class="faq-item__chevron" aria-hidden="true">›</span>
              </summary>
              <div class="faq-item__body">
                <p>
                  Non, le service est totalement gratuit pour l'ensemble des étudiants de Force-N. Il repose sur un principe fort d'entraide et de compagnonnage étudiant.
                </p>
              </div>
            </details>

            <details class="faq-item">
              <summary>
                <span>Comment se déroulent concrètement les séances ?</span>
                <span class="faq-item__chevron" aria-hidden="true">›</span>
              </summary>
              <div class="faq-item__body">
                <p>
                  Une fois la demande acceptée, le mentor et le mentoré s'accordent sur le mode qui leur convient le mieux : visio (Google Meet, Teams, Discord) ou en présentiel dans les locaux de l'université.
                </p>
              </div>
            </details>

            <details class="faq-item">
              <summary>
                <span>Puis-je être à la fois mentor et mentoré ?</span>
                <span class="faq-item__chevron" aria-hidden="true">›</span>
              </summary>
              <div class="faq-item__body">
                <p>
                  Absolument ! Vous pouvez mentorer des étudiants de Licence 1 en Algorithmique tout en sollicitant vous-même un mentor de Master pour un projet avancé en Intelligence Artificielle.
                </p>
              </div>
            </details>
          </div>
        </div>
      </section>

      <!-- 5. BANDEAU D'APPEL À L'ACTION -->
      <section class="how-cta text-center">
        <div class="container">
          <h2 class="text-white fw-bold mb-3">Rejoignez dès aujourd'hui la communauté Force Mentor</h2>
          <p class="text-white opacity-75 mb-4 mx-auto" style="max-width: 600px; font-size: 15.5px;">
            Plus de 25 mentors actifs et des dizaines d'étudiants accompagnés avec succès chaque semestre.
          </p>
          <div class="d-flex justify-content-center gap-3 flex-wrap">
            <a routerLink="/inscription" class="btn btn--green" style="padding: 12px 28px; font-size: 15px;">
              Créer mon compte gratuitement
            </a>
            <a routerLink="/mentors" class="btn btn--white" style="padding: 12px 28px; font-size: 15px;">
              Voir les mentors disponibles
            </a>
          </div>
        </div>
      </section>
    </main>
  `,
  styles: [`
    .page-how-it-works {
      min-height: 80vh;
      background: var(--bg);
    }
    .how-hero {
      background: linear-gradient(135deg, #0b4bc9 0%, #083896 100%);
      color: #fff;
      padding: 60px 0 65px;
    }
    .badge-tag {
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 6px 14px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.25);
    }
    .how-hero__title {
      font-size: clamp(2rem, 3.5vw, 2.75rem);
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 16px;
    }
    .how-hero__sub {
      max-width: 680px;
      font-size: 16px;
      line-height: 1.6;
      opacity: 0.9;
    }
    .bg-light-soft {
      background: #f7f9fd;
    }
    .role-card {
      background: #fff;
      border: 1px solid var(--line);
      border-radius: 14px;
      padding: 32px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 14px rgba(15, 27, 61, 0.04);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .role-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(15, 27, 61, 0.08);
    }
    .role-card__header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }
    .role-card__icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
    }
    .role-card__icon--blue {
      background: #eff6ff;
      color: var(--blue);
    }
    .role-card__icon--green {
      background: #edfbf3;
      color: var(--green);
    }
    .role-card__title {
      font-size: 18px;
      font-weight: 700;
      color: var(--ink);
      margin: 0 0 4px;
    }
    .role-card__badge {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      background: #eff6ff;
      color: var(--blue);
      padding: 3px 8px;
      border-radius: 4px;
    }
    .role-card__badge--green {
      background: #edfbf3;
      color: var(--green);
    }
    .role-card__list {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
      flex-grow: 1;
    }
    .role-card__list li {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      font-size: 14px;
      color: var(--muted);
      line-height: 1.5;
    }
    .role-card__list li i {
      font-size: 16px;
      flex: none;
      margin-top: 2px;
    }
    .role-card__list li strong {
      color: var(--ink);
    }
    .how-cta {
      background: #0f1b3d;
      padding: 60px 0;
    }
  `]
})
export class HowItWorksComponent {}
