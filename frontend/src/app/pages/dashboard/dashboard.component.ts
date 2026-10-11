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
    <div class="py-4" style="background: var(--bg); min-height: 85vh;">
      <div class="container-custom">
        <!-- En-tête profil utilisateur -->
        <div class="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
          <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
            <div class="d-flex align-items-center gap-3">
              <div class="avatar-initials" style="width: 64px; height: 64px; font-size: 1.5rem;">
                {{ currentUser?.user?.first_name ? currentUser!.user.first_name[0].toUpperCase() : 'U' }}{{ currentUser?.user?.last_name ? currentUser!.user.last_name[0].toUpperCase() : '' }}
              </div>
              <div>
                <h1 class="fw-bold fs-4 text-dark mb-1">
                  Bienvenue, {{ currentUser?.user?.first_name }} {{ currentUser?.user?.last_name }} !
                </h1>
                <p class="text-muted small mb-0">
                  <span class="badge bg-light text-primary border me-2">{{ currentUser?.role_display }}</span>
                  <span>{{ currentUser?.filiere || 'Programme Force-N' }} &bull; {{ currentUser?.niveau_display }}</span>
                </p>
              </div>
            </div>

            <div class="d-flex gap-2">
              <a routerLink="/profil" class="btn-fm-outline py-2 px-3" style="font-size: 13.5px;">
                <i class="bi bi-gear me-1"></i>Modifier mon profil
              </a>
              <a routerLink="/mentors" class="btn-fm-primary py-2 px-3" style="font-size: 13.5px;">
                <i class="bi bi-search me-1"></i>Chercher un mentor
              </a>
            </div>
          </div>
        </div>

        <!-- Notification Toast Action -->
        <div *ngIf="actionMessage" class="alert alert-success alert-dismissible fade show rounded-3 mb-4">
          <i class="bi bi-check-circle-fill me-2"></i>{{ actionMessage }}
          <button type="button" class="btn-close" (click)="actionMessage = ''"></button>
        </div>

        <!-- Métriques / Statistiques rapides -->
        <div class="row g-3 mb-4">
          <div class="col-12 col-sm-4">
            <div class="card p-3 border-0 shadow-sm rounded-3 bg-white text-center">
              <div class="text-muted small mb-1 fw-bold">DEMANDES ENVOYÉES</div>
              <div class="fs-3 fw-bold text-primary">{{ demandesEnvoyees.length }}</div>
              <small class="text-muted" style="font-size: 11.5px;">En tant qu'étudiant</small>
            </div>
          </div>
          <div class="col-12 col-sm-4">
            <div class="card p-3 border-0 shadow-sm rounded-3 bg-white text-center">
              <div class="text-muted small mb-1 fw-bold">DEMANDES REÇUES</div>
              <div class="fs-3 fw-bold text-success">{{ demandesRecues.length }}</div>
              <small class="text-muted" style="font-size: 11.5px;">En tant que mentor</small>
            </div>
          </div>
          <div class="col-12 col-sm-4">
            <div class="card p-3 border-0 shadow-sm rounded-3 bg-white text-center">
              <div class="text-muted small mb-1 fw-bold">SESSIONS ACTIVES</div>
              <div class="fs-3 fw-bold text-warning">{{ countSessionsActives() }}</div>
              <small class="text-muted" style="font-size: 11.5px;">Statut "Acceptée"</small>
            </div>
          </div>
        </div>

        <!-- Onglets Navigation -->
        <div class="d-flex gap-2 border-bottom mb-4">
          <button 
            class="btn py-2 px-3 border-0 fw-bold" 
            [class.border-bottom]="activeTab === 'recues'"
            [style.color]="activeTab === 'recues' ? 'var(--blue)' : 'var(--muted)'"
            [style.border-bottom]="activeTab === 'recues' ? '3px solid var(--blue) !important' : 'none'"
            (click)="activeTab = 'recues'"
          >
            <i class="bi bi-inbox-fill me-2"></i>Demandes reçues ({{ demandesRecues.length }})
          </button>
          <button 
            class="btn py-2 px-3 border-0 fw-bold" 
            [class.border-bottom]="activeTab === 'envoyees'"
            [style.color]="activeTab === 'envoyees' ? 'var(--blue)' : 'var(--muted)'"
            [style.border-bottom]="activeTab === 'envoyees' ? '3px solid var(--blue) !important' : 'none'"
            (click)="activeTab = 'envoyees'"
          >
            <i class="bi bi-send-check-fill me-2"></i>Demandes envoyées ({{ demandesEnvoyees.length }})
          </button>
        </div>

        <!-- Chargement -->
        <div *ngIf="loading" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Chargement...</span>
          </div>
        </div>

        <!-- CONTENU ONGLET 1 : Demandes Reçues (Mentor) -->
        <div *ngIf="!loading && activeTab === 'recues'">
          <div *ngIf="demandesRecues.length === 0" class="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
            <i class="bi bi-mailbox2 fs-1 text-muted mb-2"></i>
            <h5 class="fw-bold text-dark">Aucune demande reçue pour le moment</h5>
            <p class="text-muted small mb-0">Lorsque des étudiants solliciteront votre aide, leurs demandes apparaîtront ici.</p>
          </div>

          <div *ngIf="demandesRecues.length > 0" class="d-flex flex-column gap-3">
            <div *ngFor="let req of demandesRecues" class="card p-3 p-md-4 border-0 shadow-sm rounded-3 bg-white">
              <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                <div class="d-flex align-items-center gap-3">
                  <div class="avatar-initials" style="width: 44px; height: 44px; font-size: 1rem;">
                    {{ req.mentore.user.first_name ? req.mentore.user.first_name[0].toUpperCase() : 'E' }}
                  </div>
                  <div>
                    <strong class="d-block text-dark">{{ req.mentore.user.first_name }} {{ req.mentore.user.last_name }}</strong>
                    <small class="text-muted">{{ req.mentore.filiere }} &bull; {{ req.mentore.niveau_display }} &bull; {{ req.mentore.user.email }}</small>
                  </div>
                </div>

                <div class="d-flex align-items-center gap-2">
                  <span class="badge rounded-pill px-3 py-2" [ngClass]="getBadgeClass(req.statut)">
                    {{ req.statut_display }}
                  </span>
                  <small class="text-muted" style="font-size: 11.5px;">{{ req.date_creation | date:'dd/MM/yyyy HH:mm' }}</small>
                </div>
              </div>

              <!-- Matière & message -->
              <div class="p-3 rounded-3 bg-light mb-3">
                <div class="d-flex align-items-center gap-2 mb-2">
                  <span class="badge bg-primary text-white" style="font-size: 11.5px;">
                    <i class="bi bi-tag-fill me-1"></i>{{ req.matiere.nom }}
                  </span>
                </div>
                <p class="small text-dark mb-0" style="white-space: pre-line; line-height: 1.6;">
                  {{ req.message }}
                </p>
              </div>

              <!-- Actions pour le mentor -->
              <div class="d-flex justify-content-end align-items-center gap-2 pt-2 border-top">
                <ng-container *ngIf="req.statut === 'EN_ATTENTE'">
                  <button (click)="handleAction(req.id, 'accepter')" class="btn btn-sm btn-success px-3">
                    <i class="bi bi-check-lg me-1"></i>Accepter la demande
                  </button>
                  <button (click)="handleAction(req.id, 'refuser')" class="btn btn-sm btn-outline-danger px-3">
                    <i class="bi bi-x-lg me-1"></i>Décliner
                  </button>
                </ng-container>

                <ng-container *ngIf="req.statut === 'ACCEPTEE'">
                  <span class="text-success small fw-bold me-auto">
                    <i class="bi bi-telephone-fill me-1"></i>Contact étudiant : {{ req.mentore.telephone || req.mentore.user.email }}
                  </span>
                  <button (click)="handleAction(req.id, 'terminer')" class="btn btn-sm btn-outline-primary px-3">
                    <i class="bi bi-check2-all me-1"></i>Marquer comme terminée
                  </button>
                </ng-container>

                <ng-container *ngIf="req.statut === 'TERMINEE'">
                  <span class="text-muted small">
                    <i class="bi bi-check2-circle text-success me-1"></i>Session de mentorat achevée avec succès.
                  </span>
                </ng-container>
              </div>
            </div>
          </div>
        </div>

        <!-- CONTENU ONGLET 2 : Demandes Envoyées (Étudiant) -->
        <div *ngIf="!loading && activeTab === 'envoyees'">
          <div *ngIf="demandesEnvoyees.length === 0" class="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
            <i class="bi bi-send fs-1 text-muted mb-2"></i>
            <h5 class="fw-bold text-dark">Vous n'avez envoyé aucune demande de mentorat</h5>
            <p class="text-muted small mb-3">Parcourez notre annuaire pour trouver le mentor adapté à vos besoins.</p>
            <div>
              <a routerLink="/mentors" class="btn-fm-primary py-2 px-3">
                Parcourir les mentors
              </a>
            </div>
          </div>

          <div *ngIf="demandesEnvoyees.length > 0" class="d-flex flex-column gap-3">
            <div *ngFor="let req of demandesEnvoyees" class="card p-3 p-md-4 border-0 shadow-sm rounded-3 bg-white">
              <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                <div class="d-flex align-items-center gap-3">
                  <div class="avatar-initials" style="width: 44px; height: 44px; font-size: 1rem;">
                    {{ req.mentor.user.first_name ? req.mentor.user.first_name[0].toUpperCase() : 'M' }}
                  </div>
                  <div>
                    <strong class="d-block text-dark">Mentor : {{ req.mentor.user.first_name }} {{ req.mentor.user.last_name }}</strong>
                    <small class="text-muted">{{ req.mentor.filiere }} &bull; {{ req.mentor.niveau_display }}</small>
                  </div>
                </div>

                <div class="d-flex align-items-center gap-2">
                  <span class="badge rounded-pill px-3 py-2" [ngClass]="getBadgeClass(req.statut)">
                    {{ req.statut_display }}
                  </span>
                  <small class="text-muted" style="font-size: 11.5px;">{{ req.date_creation | date:'dd/MM/yyyy HH:mm' }}</small>
                </div>
              </div>

              <!-- Matière & message envoyé -->
              <div class="p-3 rounded-3 bg-light mb-2">
                <div class="d-flex align-items-center gap-2 mb-2">
                  <span class="badge bg-primary text-white" style="font-size: 11.5px;">
                    <i class="bi bi-tag-fill me-1"></i>{{ req.matiere.nom }}
                  </span>
                </div>
                <p class="small text-dark mb-0" style="white-space: pre-line; line-height: 1.6;">
                  {{ req.message }}
                </p>
              </div>

              <!-- Coordonnées si acceptée -->
              <div *ngIf="req.statut === 'ACCEPTEE'" class="p-2 px-3 rounded-3 mt-2 bg-success bg-opacity-10 text-success small d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div>
                  <i class="bi bi-check-circle-fill me-1"></i>
                  <strong>Demande acceptée !</strong> Vous pouvez contacter votre mentor : {{ req.mentor.telephone || req.mentor.user.email }}
                </div>
                <a [routerLink]="['/mentor', req.mentor.id]" class="btn btn-sm btn-outline-success">
                  Fiche du mentor
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private mentorshipService = inject(MentorshipService);
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser: Profile | null = null;
  loading = true;
  activeTab: 'recues' | 'envoyees' = 'recues';
  actionMessage = '';

  demandesRecues: DemandeMentorat[] = [];
  demandesEnvoyees: DemandeMentorat[] = [];

  ngOnInit(): void {
    if (!this.authService.isAuthenticated) {
      this.router.navigate(['/connexion']);
      return;
    }
    this.currentUser = this.authService.currentUser;
    if (this.currentUser && !this.currentUser.est_mentor) {
      this.activeTab = 'envoyees';
    }
    this.loadDemandes();
  }

  loadDemandes(): void {
    this.loading = true;
    this.mentorshipService.getDemandes().subscribe({
      next: (data) => {
        this.demandesRecues = data.recues || [];
        this.demandesEnvoyees = data.envoyees || [];
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  handleAction(id: number, action: 'accepter' | 'refuser' | 'terminer'): void {
    this.mentorshipService.updateDemandeStatus(id, action).subscribe({
      next: (res) => {
        this.actionMessage = res.message || 'Statut mis à jour avec succès.';
        this.loadDemandes();
      },
      error: (err) => {
        alert(err?.error?.error || 'Erreur lors de la mise à jour.');
      }
    });
  }

  countSessionsActives(): number {
    return this.demandesRecues.filter(d => d.statut === 'ACCEPTEE').length + 
           this.demandesEnvoyees.filter(d => d.statut === 'ACCEPTEE').length;
  }

  getBadgeClass(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'badge-status-pending';
      case 'ACCEPTEE': return 'badge-status-accepted';
      case 'REFUSEE': return 'badge-status-rejected';
      case 'TERMINEE': return 'bg-secondary text-white';
      default: return 'bg-light text-dark';
    }
  }
}
