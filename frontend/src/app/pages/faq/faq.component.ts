import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface FaqEntry {
  category: 'general' | 'mentores' | 'mentors' | 'sessions';
  question: string;
  answer: string;
  open?: boolean;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <main class="page-faq">
      <!-- HERO BANNER -->
      <section class="faq-hero">
        <div class="container text-center">
          <span class="badge-tag mb-2 d-inline-block">Centre d'aide & questions</span>
          <h1 class="faq-hero__title">Foire Aux Questions (FAQ)</h1>
          <p class="faq-hero__sub mx-auto">
            Trouvez rapidement toutes les réponses concernant le fonctionnement du mentorat, l'inscription, les séances et votre progression.
          </p>

          <!-- Barre de recherche dans les FAQs -->
          <div class="faq-hero__search mx-auto mt-4">
            <i class="bi bi-search faq-hero__search-icon"></i>
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              placeholder="Rechercher une question (ex: gratuit, sessions, annuler...)"
              class="faq-hero__input"
            >
          </div>
        </div>
      </section>

      <div class="container py-5">
        <!-- Onglets / Filtres par catégorie -->
        <div class="d-flex justify-content-center gap-2 mb-5 flex-wrap">
          <button 
            type="button" 
            class="filter-pill" 
            [class.filter-pill--active]="selectedCategory === 'all'"
            (click)="selectedCategory = 'all'"
          >
            Toutes les questions ({{ faqs.length }})
          </button>
          <button 
            type="button" 
            class="filter-pill" 
            [class.filter-pill--active]="selectedCategory === 'general'"
            (click)="selectedCategory = 'general'"
          >
            Général & Inscription
          </button>
          <button 
            type="button" 
            class="filter-pill" 
            [class.filter-pill--active]="selectedCategory === 'mentores'"
            (click)="selectedCategory = 'mentores'"
          >
            Pour les Mentorés
          </button>
          <button 
            type="button" 
            class="filter-pill" 
            [class.filter-pill--active]="selectedCategory === 'mentors'"
            (click)="selectedCategory = 'mentors'"
          >
            Pour les Mentors
          </button>
          <button 
            type="button" 
            class="filter-pill" 
            [class.filter-pill--active]="selectedCategory === 'sessions'"
            (click)="selectedCategory = 'sessions'"
          >
            Séances & Déroulement
          </button>
        </div>

        <!-- Liste des questions filtrées -->
        <div class="faq-accordion-container mx-auto">
          <div *ngIf="filteredFaqs.length === 0" class="text-center py-5">
            <i class="bi bi-search fs-1 text-muted mb-3 d-block"></i>
            <h4 class="fw-bold">Aucune question trouvée</h4>
            <p class="text-muted small">Essayez avec un autre mot-clé ou sélectionnez une autre catégorie.</p>
            <button (click)="resetSearch()" class="btn btn--outline mt-2">Réinitialiser la recherche</button>
          </div>

          <details 
            *ngFor="let item of filteredFaqs" 
            class="faq-card" 
            [open]="item.open"
          >
            <summary class="faq-card__header">
              <span class="faq-card__question">{{ item.question }}</span>
              <i class="bi bi-chevron-down faq-card__icon"></i>
            </summary>
            <div class="faq-card__body">
              <p [innerHTML]="item.answer"></p>
            </div>
          </details>
        </div>

        <!-- Bloc support / Contact -->
        <div class="faq-support-box mx-auto mt-5 text-center">
          <div class="support-avatar mx-auto mb-3">
            <i class="bi bi-chat-dots-fill"></i>
          </div>
          <h3 class="fw-bold fs-5 mb-2">Vous n'avez pas trouvé votre réponse ?</h3>
          <p class="text-muted small mb-4 mx-auto" style="max-width: 500px;">
            Notre équipe d'accompagnement Force-N est là pour répondre à vos questions spécifiques sur le parcours pédagogique.
          </p>
          <div class="d-flex justify-content-center gap-3 flex-wrap">
            <a routerLink="/inscription" class="btn btn--primary" style="padding: 10px 24px;">
              Créer mon compte
            </a>
            <a routerLink="/mentors" class="btn btn--outline" style="padding: 10px 24px;">
              Explorer les mentors
            </a>
          </div>
        </div>
      </div>
    </main>
  `,
  styles: [`
    .page-faq {
      min-height: 85vh;
      background: var(--bg);
    }
    .faq-hero {
      background: linear-gradient(135deg, #0b4bc9 0%, #083896 100%);
      color: #fff;
      padding: 55px 0 60px;
    }
    .badge-tag {
      background: rgba(255, 255, 255, 0.15);
      color: #fff;
      font-size: 11.5px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 5px 14px;
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.25);
    }
    .faq-hero__title {
      font-size: clamp(2rem, 3.2vw, 2.75rem);
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 12px;
    }
    .faq-hero__sub {
      max-width: 620px;
      font-size: 15.5px;
      line-height: 1.55;
      opacity: 0.9;
    }
    .faq-hero__search {
      max-width: 540px;
      position: relative;
    }
    .faq-hero__search-icon {
      position: absolute;
      left: 18px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--muted);
      font-size: 16px;
    }
    .faq-hero__input {
      width: 100%;
      height: 48px;
      border-radius: 999px;
      border: none;
      padding: 10px 20px 10px 48px;
      font-size: 14.5px;
      outline: none;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }
    .filter-pill {
      background: #fff;
      color: var(--muted);
      border: 1px solid var(--line);
      padding: 8px 18px;
      border-radius: 999px;
      font-size: 13.5px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .filter-pill:hover {
      border-color: var(--blue);
      color: var(--blue);
    }
    .filter-pill--active {
      background: var(--blue);
      color: #fff !important;
      border-color: var(--blue);
    }
    .faq-accordion-container {
      max-width: 820px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .faq-card {
      background: #fff;
      border: 1px solid var(--line);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(15, 27, 61, 0.04);
      transition: all 0.2s ease;
    }
    .faq-card:hover {
      border-color: rgba(43, 114, 187, 0.3);
    }
    .faq-card[open] {
      border-color: var(--blue);
    }
    .faq-card__header {
      padding: 18px 24px;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      list-style: none;
      user-select: none;
      gap: 16px;
    }
    .faq-card__header::-webkit-details-marker {
      display: none;
    }
    .faq-card__question {
      font-size: 15.5px;
      font-weight: 700;
      color: var(--ink);
    }
    .faq-card__icon {
      font-size: 14px;
      color: var(--muted);
      transition: transform 0.2s ease;
      flex: none;
    }
    .faq-card[open] .faq-card__icon {
      transform: rotate(180deg);
      color: var(--blue);
    }
    .faq-card__body {
      padding: 0 24px 20px;
      font-size: 14.5px;
      line-height: 1.6;
      color: var(--muted);
      border-top: 1px solid #f1f4f9;
      padding-top: 16px;
    }
    .faq-card__body p {
      margin: 0;
    }
    .faq-support-box {
      max-width: 820px;
      background: #eff6ff;
      border: 1px dashed rgba(43, 114, 187, 0.35);
      border-radius: 14px;
      padding: 36px 24px;
    }
    .support-avatar {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: var(--blue);
      color: #fff;
      display: grid;
      place-items: center;
      font-size: 22px;
    }
  `]
})
export class FaqComponent {
  searchQuery = '';
  selectedCategory: 'all' | 'general' | 'mentores' | 'mentors' | 'sessions' = 'all';

  faqs: FaqEntry[] = [
    {
      category: 'general',
      question: 'Le service Force Mentor est-il totalement gratuit ?',
      answer: '<strong>Oui, l\'accès à Force Mentor et l\'ensemble des sessions d\'entraide entre apprenants sont 100% gratuits</strong>. La plateforme s\'inscrit dans les initiatives de solidarité et d\'excellence académique du programme Force-N.',
      open: true
    },
    {
      category: 'general',
      question: 'À qui s\'adresse la plateforme Force Mentor ?',
      answer: 'La plateforme s\'adresse à tous les étudiants inscrits dans les cursus et modules de formation dispensés par Force-N, quel que soit leur niveau académique (Licence 1, Licence 2, Licence 3, Master ou formations certifiantes).',
      open: false
    },
    {
      category: 'mentores',
      question: 'Comment trouver et contacter un mentor ?',
      answer: 'Rendez-vous dans la section <strong>« Les Mentors »</strong>, utilisez la barre de recherche ou filtrez par matière (Python, Algorithmique, Web, Réseaux...) et par niveau d\'études. Cliquez sur <strong>« Demander »</strong> sur la fiche du mentor choisi pour lui envoyer votre requête accompagnée d\'un message expliquant vos besoins.',
      open: false
    },
    {
      category: 'mentores',
      question: 'Combien de demandes de mentorat puis-je envoyer ?',
      answer: 'Vous pouvez envoyer jusqu\'à <strong>3 demandes actives simultanément</strong> pour des matières distinctes, afin d\'assurer un suivi de qualité avec vos mentors.',
      open: false
    },
    {
      category: 'mentors',
      question: 'Qui peut devenir mentor sur Force Mentor ?',
      answer: 'Tout étudiant ayant validé avec succès un ou plusieurs modules et souhaitant partager ses connaissances peut postuler comme mentor. Lors de votre inscription ou depuis votre profil, choisissez le rôle <em>« Mentor »</em> ou <em>« Les deux »</em> et sélectionnez vos matières maîtrisées.',
      open: false
    },
    {
      category: 'mentors',
      question: 'Quels sont les avantages pour un mentor étudiant ?',
      answer: 'Enseigner est la meilleure manière de consolider ses propres connaissances ! De plus, votre engagement est valorisé par les retours et évaluations des mentorés, et vous pourrez obtenir une attestation d\'engagement académique Force-N utile pour votre CV.',
      open: false
    },
    {
      category: 'sessions',
      question: 'Où et comment se déroulent les séances d\'accompagnement ?',
      answer: 'Une fois la demande acceptée par le mentor, vous pouvez convenir ensemble du canal le plus adapté : <strong>en visio</strong> (Google Meet, Teams, Discord) ou <strong>en présentiel</strong> sur le campus selon vos emplois du temps respectifs.',
      open: false
    },
    {
      category: 'sessions',
      question: 'Que faire si un mentor ne répond pas à ma demande ?',
      answer: 'Si un mentor n\'a pas répondu sous 5 jours, vous pouvez annuler votre demande depuis votre tableau de bord et contacter un autre mentor disponible dans la même matière.',
      open: false
    },
    {
      category: 'general',
      question: 'Puis-je être à la fois mentor et mentoré ?',
      answer: '<strong>Absolument !</strong> Beaucoup d\'étudiants choisissent le rôle combiné : ils accompagnent des camarades sur des matières où ils excellent tout en sollicitant eux-mêmes un aîné pour des cours plus avancés.',
      open: false
    }
  ];

  get filteredFaqs(): FaqEntry[] {
    return this.faqs.filter(item => {
      const matchCategory = this.selectedCategory === 'all' || item.category === this.selectedCategory;
      const q = this.searchQuery.trim().toLowerCase();
      const matchSearch = !q || item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q);
      return matchCategory && matchSearch;
    });
  }

  resetSearch(): void {
    this.searchQuery = '';
    this.selectedCategory = 'all';
  }
}
