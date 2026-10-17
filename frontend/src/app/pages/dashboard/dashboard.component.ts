import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MentorshipService } from '../../services/mentorship.service';
import { AuthService } from '../../services/auth.service';
import { DemandeMentorat, Profile } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="dashboard-app-layout">
      
      <!-- 1. SIDEBAR FIGMA GAUCHE -->
      <aside class="dashboard-sidebar">
        <!-- Logo Brand -->
        <div class="sidebar-brand">
          <a routerLink="/" class="logo-brand">
            <img src="/logo_force_mentor.svg" width="46" height="34" alt="Force Mentor" class="logo-brand__icon">
          </a>
        </div>

        <!-- Commutateur de Rôle Figma (Mentor / Mentoré) -->
        <div class="role-switch-container">
          <button 
            type="button" 
            class="role-switch-btn" 
            [class.active]="viewMode === 'mentor'" 
            (click)="viewMode = 'mentor'; activeTab = 'recues'"
          >
            Mentor
          </button>
          <button 
            type="button" 
            class="role-switch-btn" 
            [class.active]="viewMode === 'mentore'" 
            (click)="viewMode = 'mentore'; activeTab = 'envoyees'"
          >
            Mentoré
          </button>
        </div>

        <!-- Menu Navigation Sidebar -->
        <nav class="sidebar-nav-menu">
          <a routerLink="/tableau-de-bord" class="sidebar-nav-link active">
            <i class="bi bi-speedometer2"></i>
            <span>Tableau de bord</span>
          </a>
          <a (click)="activeTab = 'recues'" class="sidebar-nav-link" [class.active]="activeTab === 'recues'" style="cursor: pointer;">
            <i class="bi bi-inbox"></i>
            <span>Demandes reçues</span>
            <span *ngIf="demandesRecues.length" class="badge bg-primary rounded-pill ms-auto" style="font-size: 11px;">
              {{ demandesRecues.length }}
            </span>
          </a>
          <a (click)="activeTab = 'envoyees'" class="sidebar-nav-link" [class.active]="activeTab === 'envoyees'" style="cursor: pointer;">
            <i class="bi bi-send"></i>
            <span>Demandes envoyées</span>
          </a>
          <a routerLink="/mentors" class="sidebar-nav-link">
            <i class="bi bi-search"></i>
            <span>Trouver un mentor</span>
          </a>
          <a routerLink="/profil" class="sidebar-nav-link">
            <i class="bi bi-person"></i>
            <span>Mon profil</span>
          </a>
        </nav>

        <!-- Profil utilisateur en bas de sidebar -->
        <div class="sidebar-user-bottom">
          <img *ngIf="currentUser?.photo_url" [src]="currentUser?.photo_url" alt="Avatar" class="avatar me-2" style="width: 40px; height: 40px; object-fit: cover;">
          <div *ngIf="!currentUser?.photo_url" class="avatar avatar--initials" style="width: 40px; height: 40px; font-size: 14px;">
            {{ getUserInitials() }}
          </div>
          <div class="overflow-hidden me-auto">
            <div class="fw-bold text-dark text-truncate" style="font-size: 13.5px;">
              {{ currentUser?.user?.first_name || currentUser?.user?.username }}
            </div>
            <small class="text-muted d-block text-truncate" style="font-size: 11.5px;">
              {{ currentUser?.role_display }}
            </small>
          </div>
          <button type="button" (click)="logout()" class="btn btn-sm btn-link text-danger p-0" title="Déconnexion">
            <i class="bi bi-box-arrow-right fs-5"></i>
          </button>
        </div>
      </aside>

      <!-- 2. CONTENU CENTRAL PRINCIPAL -->
      <main class="dashboard-center">
        <!-- Barre de recherche et notifications en haut -->
        <div class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <div class="d-flex align-items-center gap-2">
            <h1 class="h4 fw-bold text-dark mb-0">Espace {{ viewMode === 'mentor' ? 'Mentor' : 'Mentoré' }}</h1>
            <span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-pill" style="font-size: 11px;">
              <i class="bi bi-circle-fill me-1" style="font-size: 6px;"></i>En ligne
            </span>
          </div>

          <div class="d-flex align-items-center gap-3">
            <a routerLink="/mentors" class="btn btn--primary btn-sm">
              <i class="bi bi-plus-lg me-1"></i>Nouvelle demande
            </a>
          </div>
        </div>

        <!-- Bannière d'accueil -->
        <div class="card border-0 shadow-sm rounded-4 p-4 mb-4" style="background: linear-gradient(135deg, #0b4bc9 0%, #1e5dd8 100%); color: #ffffff;">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <span class="badge bg-white text-primary px-3 py-1 rounded-pill fw-bold mb-2" style="font-size: 12px;">
                {{ currentUser?.filiere || 'Programme Force-N' }} &bull; {{ currentUser?.niveau_display }}
              </span>
              <h2 class="fw-bold mb-1 fs-3">
                Bonjour, {{ currentUser?.user?.first_name || currentUser?.user?.username }} 👋
              </h2>
              <p class="text-light opacity-75 mb-0 small">
                Vous avez {{ getPendingCount() }} demande(s) en attente de traitement aujourd'hui.
              </p>
            </div>
            <a routerLink="/profil" class="btn btn-light rounded-pill px-3 py-2 text-primary fw-bold" style="font-size: 13px;">
              <i class="bi bi-pencil-square me-1"></i>Mon profil
            </a>
          </div>
        </div>

        <!-- Alert Notification -->
        <div *ngIf="actionMessage" class="alert alert-success alert-dismissible fade show rounded-3 mb-4">
          <i class="bi bi-check-circle-fill me-2"></i>{{ actionMessage }}
          <button type="button" class="btn-close" (click)="actionMessage = ''"></button>
        </div>

        <!-- 3 Indicateurs Métriques KPI -->
        <div class="row g-3 mb-4">
          <div class="col-sm-4">
            <div class="card p-3 border-0 shadow-sm rounded-3 bg-white text-center">
              <div class="text-muted small mb-1 fw-bold">DEMANDES REÇUES</div>
              <div class="fs-3 fw-bold text-primary">{{ demandesRecues.length }}</div>
              <small class="text-muted" style="font-size: 11.5px;">En tant que mentor</small>
            </div>
          </div>
          <div class="col-sm-4">
            <div class="card p-3 border-0 shadow-sm rounded-3 bg-white text-center">
              <div class="text-muted small mb-1 fw-bold">DEMANDES ENVOYÉES</div>
              <div class="fs-3 fw-bold text-success">{{ demandesEnvoyees.length }}</div>
              <small class="text-muted" style="font-size: 11.5px;">En tant qu'étudiant</small>
            </div>
          </div>
          <div class="col-sm-4">
            <div class="card p-3 border-0 shadow-sm rounded-3 bg-white text-center">
              <div class="text-muted small mb-1 fw-bold">SESSIONS ACTIVES</div>
              <div class="fs-3 fw-bold text-warning">{{ countSessionsActives() }}</div>
              <small class="text-muted" style="font-size: 11.5px;">Validées & en cours</small>
            </div>
          </div>
        </div>

        <!-- Onglets Demandes Reçues / Envoyées -->
        <div class="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
          <div class="d-flex gap-2 border-bottom mb-4">
            <button 
              class="btn py-2 px-3 border-0 fw-bold" 
              [style.color]="activeTab === 'recues' ? 'var(--blue)' : 'var(--muted)'"
              [style.border-bottom]="activeTab === 'recues' ? '3px solid var(--blue)' : 'none'"
              (click)="activeTab = 'recues'"
            >
              <i class="bi bi-inbox-fill me-2"></i>Demandes reçues ({{ demandesRecues.length }})
            </button>
            <button 
              class="btn py-2 px-3 border-0 fw-bold" 
              [style.color]="activeTab === 'envoyees' ? 'var(--blue)' : 'var(--muted)'"
              [style.border-bottom]="activeTab === 'envoyees' ? '3px solid var(--blue)' : 'none'"
              (click)="activeTab = 'envoyees'"
            >
              <i class="bi bi-send-check-fill me-2"></i>Demandes envoyées ({{ demandesEnvoyees.length }})
            </button>
          </div>

          <!-- Spinner chargement -->
          <div *ngIf="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status"></div>
          </div>

          <!-- LISTE DES DEMANDES REÇUES -->
          <div *ngIf="!loading && activeTab === 'recues'">
            <div *ngIf="demandesRecues.length === 0" class="text-center py-5 text-muted">
              <i class="bi bi-inbox fs-1 text-secondary opacity-50 mb-2 d-block"></i>
              <p class="mb-0">Vous n'avez reçu aucune demande de mentorat pour le moment.</p>
            </div>

            <div *ngFor="let demande of demandesRecues" class="card border mb-3 rounded-3 p-3">
              <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                <div>
                  <h6 class="fw-bold mb-1 text-dark">
                    {{ demande.mentore.user.first_name }} {{ demande.mentore.user.last_name }}
                    <span class="text-muted fw-normal small">({{ demande.mentore.filiere || 'Apprenant' }})</span>
                  </h6>
                  <span class="badge-skill me-2">{{ demande.matiere.nom }}</span>
                  <small class="text-muted">{{ demande.date_creation | date:'dd MMM yyyy à HH:mm' }}</small>
                </div>
                <span class="badge" [ngClass]="getBadgeClass(demande.statut)">
                  {{ demande.statut_display }}
                </span>
              </div>

              <p class="text-secondary small mb-3 p-2 bg-light rounded-2 border">
                « {{ demande.message }} »
              </p>

              <div *ngIf="demande.statut === 'EN_ATTENTE'" class="d-flex gap-2 justify-content-end">
                <button (click)="handleAction(demande.id, 'accepter')" class="btn btn-sm btn-success px-3">
                  <i class="bi bi-check-lg me-1"></i>Accepter
                </button>
                <button (click)="handleAction(demande.id, 'refuser')" class="btn btn-sm btn-outline-danger px-3">
                  <i class="bi bi-x-lg me-1"></i>Refuser
                </button>
              </div>

              <div *ngIf="demande.statut === 'ACCEPTEE'" class="d-flex justify-content-end">
                <button (click)="handleAction(demande.id, 'terminer')" class="btn btn-sm btn-outline-primary">
                  <i class="bi bi-flag-fill me-1"></i>Marquer comme terminée
                </button>
              </div>
            </div>
          </div>

          <!-- LISTE DES DEMANDES ENVOYÉES -->
          <div *ngIf="!loading && activeTab === 'envoyees'">
            <div *ngIf="demandesEnvoyees.length === 0" class="text-center py-5 text-muted">
              <i class="bi bi-send fs-1 text-secondary opacity-50 mb-2 d-block"></i>
              <p class="mb-0">Vous n'avez envoyé aucune demande de mentorat.</p>
              <a routerLink="/mentors" class="btn btn--outline btn-sm mt-3">Trouver un mentor</a>
            </div>

            <div *ngFor="let demande of demandesEnvoyees" class="card border mb-3 rounded-3 p-3">
              <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                <div>
                  <h6 class="fw-bold mb-1 text-dark">
                    Mentor : {{ demande.mentor.user.first_name }} {{ demande.mentor.user.last_name }}
                  </h6>
                  <span class="badge-skill me-2">{{ demande.matiere.nom }}</span>
                  <small class="text-muted">{{ demande.date_creation | date:'dd MMM yyyy à HH:mm' }}</small>
                </div>
                <span class="badge" [ngClass]="getBadgeClass(demande.statut)">
                  {{ demande.statut_display }}
                </span>
              </div>
              <p class="text-secondary small mb-0 p-2 bg-light rounded-2 border">
                « {{ demande.message }} »
              </p>
            </div>
          </div>

        </div>
      </main>

      <!-- 3. VOLET LATÉRAL DROIT : CALENDRIER FIGMA -->
      <aside class="dashboard-right">
        <!-- Mini Calendrier -->
        <div class="calendar-widget">
          <div class="calendar-header">
            <span>Octobre 2026</span>
            <i class="bi bi-calendar3 text-primary"></i>
          </div>
          <div class="calendar-days-grid">
            <div class="calendar-day-head">L</div>
            <div class="calendar-day-head">M</div>
            <div class="calendar-day-head">M</div>
            <div class="calendar-day-head">J</div>
            <div class="calendar-day-head">V</div>
            <div class="calendar-day-head">S</div>
            <div class="calendar-day-head">D</div>

            <div *ngFor="let d of calendarDays" 
                 class="calendar-day-cell" 
                 [class.today]="d.day === 15"
                 [class.has-event]="d.hasEvent">
              {{ d.day }}
            </div>
          </div>
        </div>

        <!-- Prochaines Sessions Programées -->
        <h6 class="fw-bold text-dark mb-3">Sessions à venir</h6>
        <div class="card border rounded-3 p-3 mb-2 bg-white">
          <div class="d-flex align-items-center gap-2 mb-1">
            <i class="bi bi-camera-video-fill text-primary"></i>
            <strong style="font-size: 13px;">Python & Django</strong>
          </div>
          <p class="text-muted small mb-2">Demain &bull; 15:00 - 16:30</p>
          <a href="https://meet.google.com" target="_blank" class="btn btn-sm btn-outline-primary w-100" style="font-size: 12px;">
            Rejoindre Meet
          </a>
        </div>

        <div class="card border rounded-3 p-3 bg-white">
          <div class="d-flex align-items-center gap-2 mb-1">
            <i class="bi bi-journal-code text-success"></i>
            <strong style="font-size: 13px;">SQL & Algorithmique</strong>
          </div>
          <p class="text-muted small mb-2">Vendredi &bull; 10:00 - 11:30</p>
          <span class="badge bg-light text-muted border text-start">En attente de confirmation</span>
        </div>
      </aside>

    </div>
  `
})
export class DashboardComponent implements OnInit {
  private mentorshipService = inject(MentorshipService);
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser: Profile | null = null;
  demandesRecues: DemandeMentorat[] = [];
  demandesEnvoyees: DemandeMentorat[] = [];

  activeTab: 'recues' | 'envoyees' = 'recues';
  viewMode: 'mentor' | 'mentore' = 'mentor';
  loading = true;
  actionMessage = '';

  // Données factices pour le mini calendrier du mois
  calendarDays = [
    { day: 28 }, { day: 29 }, { day: 30 }, { day: 1 }, { day: 2 }, { day: 3 }, { day: 4 },
    { day: 5 }, { day: 6 }, { day: 7 }, { day: 8 }, { day: 9 }, { day: 10 }, { day: 11 },
    { day: 12 }, { day: 13 }, { day: 14 }, { day: 15, hasEvent: true }, { day: 16, hasEvent: true }, { day: 17 }, { day: 18 },
    { day: 19 }, { day: 20 }, { day: 21 }, { day: 22 }, { day: 23 }, { day: 24 }, { day: 25 },
    { day: 26 }, { day: 27 }, { day: 28 }, { day: 29 }, { day: 30 }, { day: 31 }, { day: 1 }
  ];

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    if (this.currentUser?.role === 'MENTORE') {
      this.viewMode = 'mentore';
      this.activeTab = 'envoyees';
    }
    this.loadDemandes();
  }

  loadDemandes(): void {
    this.loading = true;
    this.mentorshipService.getDemandes().subscribe({
      next: (res: { recues: DemandeMentorat[]; envoyees: DemandeMentorat[] }) => {
        this.demandesRecues = res.recues || [];
        this.demandesEnvoyees = res.envoyees || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  getUserInitials(): string {
    const fn = this.currentUser?.user?.first_name ? this.currentUser.user.first_name[0].toUpperCase() : 'U';
    const ln = this.currentUser?.user?.last_name ? this.currentUser.user.last_name[0].toUpperCase() : '';
    return `${fn}${ln}`;
  }

  getPendingCount(): number {
    return this.demandesRecues.filter(d => d.statut === 'EN_ATTENTE').length;
  }

  countSessionsActives(): number {
    return this.demandesRecues.filter(d => d.statut === 'ACCEPTEE').length + 
           this.demandesEnvoyees.filter(d => d.statut === 'ACCEPTEE').length;
  }

  getBadgeClass(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'bg-warning-subtle text-warning border border-warning';
      case 'ACCEPTEE': return 'bg-success-subtle text-success border border-success';
      case 'REFUSEE': return 'bg-danger-subtle text-danger border border-danger';
      case 'TERMINEE': return 'bg-secondary-subtle text-secondary border border-secondary';
      default: return 'bg-light text-dark';
    }
  }

  handleAction(demandeId: number, action: 'accepter' | 'refuser' | 'terminer'): void {
    this.mentorshipService.updateDemandeStatus(demandeId, action).subscribe({
      next: () => {
        const labels: Record<string, string> = {
          accepter: 'Demande acceptée avec succès.',
          refuser: 'Demande refusée.',
          terminer: 'Session marquée comme terminée.'
        };
        this.actionMessage = labels[action];
        this.loadDemandes();
      },
      error: () => {
        this.actionMessage = 'Erreur lors de la mise à jour.';
      }
    });
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/connexion']);
    });
  }
}
