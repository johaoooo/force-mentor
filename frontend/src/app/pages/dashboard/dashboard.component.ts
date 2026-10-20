import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MentorshipService } from '../../services/mentorship.service';
import { AuthService } from '../../services/auth.service';
import { DemandeMentorat, Profile, DisponibiliteMentor, Notification, MatchingResult } from '../../models/models';

export interface MatiereProgression {
  id: number;
  nom: string;
  icone: string;
  totalSessions: number;
  terminees: number;
  acceptees: number;
  enAttente: number;
  heuresRealisees: number;
  pourcentage: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="dashboard-app-layout">
      
      <!-- 1. SIDEBAR DESKTOP (VISIBLE >= 820px) -->
      <aside class="dashboard-sidebar">
        <!-- Logo Brand -->
        <div class="sidebar-brand">
          <a routerLink="/" class="logo-brand">
            <img src="/logo_force_mentor.svg" width="46" height="34" alt="Force Mentor" class="logo-brand__icon">
          </a>
        </div>

        <!-- Commutateur de Rôle (si l'utilisateur est LES_DEUX) -->
        <div *ngIf="currentUser?.role === 'LES_DEUX'" class="role-switch-container">
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
          <a (click)="activeTab = viewMode === 'mentor' ? 'recues' : 'envoyees'" class="sidebar-nav-link" [class.active]="activeTab === 'recues' || activeTab === 'envoyees'" style="cursor: pointer;">
            <i class="bi bi-speedometer2"></i>
            <span>{{ viewMode === 'mentor' ? 'Demandes reçues' : 'Mes demandes' }}</span>
            <span *ngIf="viewMode === 'mentor' && demandesRecues.length" class="badge bg-primary rounded-pill ms-auto" style="font-size: 11px;">
              {{ demandesRecues.length }}
            </span>
            <span *ngIf="viewMode === 'mentore' && demandesEnvoyees.length" class="badge bg-primary rounded-pill ms-auto" style="font-size: 11px;">
              {{ demandesEnvoyees.length }}
            </span>
          </a>

          <!-- Onglet Progression par matière -->
          <a (click)="activeTab = 'progression'" class="sidebar-nav-link" [class.active]="activeTab === 'progression'" style="cursor: pointer;">
            <i class="bi bi-graph-up-arrow"></i>
            <span>Progression</span>
            <span *ngIf="getMatiereProgressions().length" class="badge bg-primary-subtle text-primary rounded-pill ms-auto" style="font-size: 11px;">
              {{ getMatiereProgressions().length }}
            </span>
          </a>

          <!-- Onglet Historique complet -->
          <a (click)="activeTab = 'historique'" class="sidebar-nav-link" [class.active]="activeTab === 'historique'" style="cursor: pointer;">
            <i class="bi bi-clock-history"></i>
            <span>Historique</span>
            <span *ngIf="getDemandesCourantes().length" class="badge bg-secondary-subtle text-secondary rounded-pill ms-auto" style="font-size: 11px;">
              {{ getDemandesCourantes().length }}
            </span>
          </a>

          <a *ngIf="currentUser?.est_mentor" (click)="activeTab = 'disponibilites'" class="sidebar-nav-link" [class.active]="activeTab === 'disponibilites'" style="cursor: pointer;">
            <i class="bi bi-calendar-week"></i>
            <span>Mes créneaux</span>
            <span *ngIf="mesDispos.length" class="badge bg-secondary rounded-pill ms-auto" style="font-size: 11px;">
              {{ mesDispos.length }}
            </span>
          </a>

          <a (click)="activeTab = 'sessions'" class="sidebar-nav-link" [class.active]="activeTab === 'sessions'" style="cursor: pointer;">
            <i class="bi bi-camera-video"></i>
            <span>Séances Visio</span>
            <span *ngIf="getProchainesSessions().length" class="badge bg-success rounded-pill ms-auto" style="font-size: 11px;">
              {{ getProchainesSessions().length }}
            </span>
          </a>

          <a *ngIf="viewMode === 'mentore'" (click)="activeTab = 'matching'" class="sidebar-nav-link" [class.active]="activeTab === 'matching'" style="cursor: pointer;">
            <i class="bi bi-stars"></i>
            <span>Recommandations</span>
            <span *ngIf="matchingMentors.length" class="badge bg-info text-dark rounded-pill ms-auto" style="font-size: 11px;">
              {{ matchingMentors.length }}
            </span>
          </a>

          <a routerLink="/messages" class="sidebar-nav-link">
            <i class="bi bi-chat-dots"></i>
            <span>Messagerie</span>
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
            <div class="fw-bold text-dark text-truncate" style="font-size: 13px;">
              {{ currentUser?.user?.first_name || currentUser?.user?.username }}
            </div>
            <small class="text-muted d-block text-truncate" style="font-size: 11px;">
              {{ currentUser?.role_display }}
            </small>
          </div>
          <button type="button" (click)="logout()" class="btn btn-sm btn-link text-danger p-0" title="Déconnexion">
            <i class="bi bi-box-arrow-right fs-5"></i>
          </button>
        </div>
      </aside>

      <!-- 2. DRAWER DE NAVIGATION MOBILE (OFFCANVAS) -->
      <div *ngIf="isMobileDrawerOpen" class="mobile-drawer-overlay" (click)="isMobileDrawerOpen = false"></div>
      <div class="mobile-drawer" [class.open]="isMobileDrawerOpen">
        <div class="d-flex justify-content-between align-items-center p-3 border-bottom">
          <div class="d-flex align-items-center gap-2">
            <img src="/logo_force_mentor.svg" width="36" height="28" alt="Logo">
            <strong class="text-dark small">Force Mentor</strong>
          </div>
          <button type="button" (click)="isMobileDrawerOpen = false" class="btn btn-sm btn-light border p-1 px-2">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- Profil utilisateur mobile -->
        <div class="p-3 bg-light border-bottom d-flex align-items-center gap-2">
          <img *ngIf="currentUser?.photo_url" [src]="currentUser?.photo_url" class="rounded-circle object-fit-cover" style="width: 40px; height: 40px;">
          <div *ngIf="!currentUser?.photo_url" class="avatar avatar--initials" style="width: 40px; height: 40px; font-size: 14px;">
            {{ getUserInitials() }}
          </div>
          <div class="overflow-hidden">
            <div class="fw-bold text-dark text-truncate small">{{ currentUser?.user?.first_name || currentUser?.user?.username }}</div>
            <span class="badge bg-primary-subtle text-primary" style="font-size: 10.5px;">{{ currentUser?.role_display }}</span>
          </div>
        </div>

        <!-- Liens mobiles -->
        <div class="p-2 d-flex flex-column gap-1 flex-grow-1 overflow-auto">
          <a routerLink="/" (click)="isMobileDrawerOpen = false" class="sidebar-nav-link">
            <i class="bi bi-house"></i>
            <span>Accueil</span>
          </a>
          <a (click)="activeTab = viewMode === 'mentor' ? 'recues' : 'envoyees'; isMobileDrawerOpen = false" class="sidebar-nav-link" [class.active]="activeTab === 'recues' || activeTab === 'envoyees'">
            <i class="bi bi-speedometer2"></i>
            <span>Tableau de bord</span>
          </a>
          <a (click)="activeTab = 'progression'; isMobileDrawerOpen = false" class="sidebar-nav-link" [class.active]="activeTab === 'progression'">
            <i class="bi bi-graph-up-arrow"></i>
            <span>Progression par matière</span>
          </a>
          <a (click)="activeTab = 'historique'; isMobileDrawerOpen = false" class="sidebar-nav-link" [class.active]="activeTab === 'historique'">
            <i class="bi bi-clock-history"></i>
            <span>Historique des séances</span>
          </a>
          <a *ngIf="currentUser?.est_mentor" (click)="activeTab = 'disponibilites'; isMobileDrawerOpen = false" class="sidebar-nav-link" [class.active]="activeTab === 'disponibilites'">
            <i class="bi bi-calendar2-week"></i>
            <span>Mes créneaux</span>
          </a>
          <a (click)="activeTab = 'sessions'; isMobileDrawerOpen = false" class="sidebar-nav-link" [class.active]="activeTab === 'sessions'">
            <i class="bi bi-camera-video"></i>
            <span>Séances Visio</span>
          </a>
          <a *ngIf="viewMode === 'mentore'" (click)="activeTab = 'matching'; isMobileDrawerOpen = false" class="sidebar-nav-link" [class.active]="activeTab === 'matching'">
            <i class="bi bi-stars"></i>
            <span>Recommandations</span>
          </a>
          <a routerLink="/messages" (click)="isMobileDrawerOpen = false" class="sidebar-nav-link">
            <i class="bi bi-chat-dots"></i>
            <span>Messagerie</span>
          </a>
          <a routerLink="/mentors" (click)="isMobileDrawerOpen = false" class="sidebar-nav-link">
            <i class="bi bi-search"></i>
            <span>Trouver un mentor</span>
          </a>
          <a routerLink="/profil" (click)="isMobileDrawerOpen = false" class="sidebar-nav-link">
            <i class="bi bi-person"></i>
            <span>Mon profil</span>
          </a>
        </div>

        <div class="p-3 border-top">
          <button (click)="logout(); isMobileDrawerOpen = false" class="btn btn-sm btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2">
            <i class="bi bi-box-arrow-right"></i>
            <span>Déconnexion</span>
          </button>
        </div>
      </div>

      <!-- 3. CONTENU CENTRAL PRINCIPAL -->
      <main class="dashboard-center">
        <!-- Barre supérieure responsive -->
        <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom flex-wrap gap-2">
          
          <div class="d-flex align-items-center gap-2">
            <!-- Bouton Menu Hamburger (Mobile) -->
            <button 
              type="button" 
              (click)="isMobileDrawerOpen = true" 
              class="btn btn-light d-md-none border p-1 px-2 rounded-3 shadow-sm" 
              title="Menu navigation"
            >
              <i class="bi bi-list fs-5"></i>
            </button>

            <div>
              <div class="d-flex align-items-center gap-2">
                <h1 class="h5 fw-bold text-dark mb-0">Espace {{ viewMode === 'mentor' ? 'Mentor' : 'Mentoré' }}</h1>
                <span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-pill" style="font-size: 10.5px;">
                  <i class="bi bi-circle-fill me-1" style="font-size: 6px;"></i>En ligne
                </span>
              </div>
            </div>
          </div>

          <!-- Raccourcis et Actions -->
          <div class="d-flex align-items-center gap-2">
            <!-- Sélecteur rôle si LES_DEUX -->
            <div *ngIf="currentUser?.role === 'LES_DEUX'" class="btn-group btn-group-sm rounded-pill p-1 bg-light border me-1">
              <button 
                type="button" 
                (click)="viewMode = 'mentor'; activeTab = 'recues'" 
                class="btn btn-sm rounded-pill px-2 py-1 fw-bold"
                [class.btn-primary]="viewMode === 'mentor'"
                [class.btn-light]="viewMode !== 'mentor'"
                style="font-size: 11px;"
              >
                Mentor
              </button>
              <button 
                type="button" 
                (click)="viewMode = 'mentore'; activeTab = 'envoyees'" 
                class="btn btn-sm rounded-pill px-2 py-1 fw-bold"
                [class.btn-primary]="viewMode === 'mentore'"
                [class.btn-light]="viewMode !== 'mentore'"
                style="font-size: 11px;"
              >
                Mentoré
              </button>
            </div>

            <!-- Raccourci Messagerie -->
            <a routerLink="/messages" class="btn btn-light position-relative p-0 rounded-circle d-flex align-items-center justify-content-center border" style="width: 36px; height: 36px;" title="Messagerie">
              <i class="bi bi-chat-dots text-secondary"></i>
            </a>

            <!-- Cloche Notifications -->
            <div class="position-relative">
              <button 
                type="button" 
                (click)="toggleNotifications()" 
                class="btn btn-light position-relative p-0 rounded-circle d-flex align-items-center justify-content-center border" 
                style="width: 36px; height: 36px;"
                title="Notifications"
              >
                <i class="bi bi-bell text-secondary"></i>
                <span *ngIf="unreadCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 10px;">
                  {{ unreadCount }}
                </span>
              </button>

              <!-- Dropdown Notifications -->
              <div *ngIf="isNotifOpen" class="card shadow-lg border-0 rounded-3 position-absolute end-0 mt-2 p-2" style="width: 300px; max-width: 90vw; z-index: 1050;">
                <div class="d-flex justify-content-between align-items-center px-2 py-1 border-bottom mb-2">
                  <strong class="text-dark small"><i class="bi bi-bell-fill text-primary me-1"></i>Notifications</strong>
                  <button *ngIf="unreadCount > 0" (click)="markAllRead()" class="btn btn-link btn-sm p-0 text-primary small text-decoration-none" style="font-size: 11px;">
                    Tout marquer lu
                  </button>
                </div>

                <div *ngIf="notifications.length === 0" class="text-center py-3 text-muted small">
                  Aucune notification.
                </div>

                <div style="max-height: 250px; overflow-y: auto;">
                  <div 
                    *ngFor="let notif of notifications" 
                    (click)="openNotif(notif)" 
                    class="p-2 mb-1 rounded-2 cursor-pointer border-bottom"
                    [style.background]="notif.est_lu ? '#ffffff' : '#f0f7ff'"
                    style="cursor: pointer;"
                  >
                    <div class="d-flex align-items-center gap-1 mb-1">
                      <span class="badge" [ngClass]="getNotifBadge(notif.type_notif)" style="font-size: 9.5px;">
                        {{ notif.type_display }}
                      </span>
                      <small class="text-muted ms-auto" style="font-size: 10px;">{{ notif.date_creation | date:'dd/MM HH:mm' }}</small>
                    </div>
                    <div class="fw-bold text-dark small mb-0" style="font-size: 12px;">{{ notif.titre }}</div>
                    <small class="text-muted text-truncate d-block" style="font-size: 11px;">{{ notif.message }}</small>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Bannière d'accueil simplifiée -->
        <div class="card border-0 shadow-sm rounded-4 p-3 p-md-4 mb-3" style="background: linear-gradient(135deg, #0b4bc9 0%, #1754c7 100%); color: #ffffff;">
          <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div>
              <span class="badge bg-white text-primary px-3 py-1 rounded-pill fw-bold mb-2 d-inline-block" style="font-size: 11.5px;">
                {{ currentUser?.filiere || 'Programme Force-N' }} &bull; {{ currentUser?.niveau_display }}
              </span>
              <h2 class="fw-bold mb-1 fs-4 text-white">
                Bonjour, {{ currentUser?.user?.first_name || currentUser?.user?.username }} 👋
              </h2>
              <p class="text-light opacity-90 mb-0 small" *ngIf="viewMode === 'mentor'">
                {{ getPendingCount() > 0 ? getPendingCount() + ' demande(s) en attente de réponse.' : 'Toutes vos demandes sont traitées.' }}
                {{ getProchainesSessions().length }} séance(s) programmée(s).
              </p>
              <p class="text-light opacity-90 mb-0 small" *ngIf="viewMode === 'mentore'">
                {{ getProchainesSessions().length }} séance(s) confirmée(s) &bull; {{ demandesEnvoyees.length }} demande(s) enregistrée(s).
              </p>
            </div>

            <div class="d-flex gap-2 flex-wrap">
              <a *ngIf="viewMode === 'mentore'" routerLink="/mentors" class="btn btn-light rounded-pill px-3 py-2 text-primary fw-bold" style="font-size: 12.5px;">
                <i class="bi bi-search me-1"></i>Trouver un mentor
              </a>
              <button *ngIf="viewMode === 'mentor'" (click)="activeTab = 'disponibilites'" class="btn btn-light rounded-pill px-3 py-2 text-primary fw-bold" style="font-size: 12.5px;">
                <i class="bi bi-calendar-plus me-1"></i>Ajouter un créneau
              </button>
              <a routerLink="/profil" class="btn btn-outline-light rounded-pill px-3 py-2 fw-medium" style="font-size: 12.5px;">
                <i class="bi bi-person me-1"></i>Profil
              </a>
            </div>
          </div>
        </div>

        <!-- Message d'alerte / feedback -->
        <div *ngIf="actionMessage" class="alert alert-success alert-dismissible fade show rounded-3 p-2 px-3 mb-3 small">
          <i class="bi bi-check-circle-fill me-1"></i>{{ actionMessage }}
          <button type="button" class="btn-close p-2" (click)="actionMessage = ''"></button>
        </div>

        <!-- 4 KPIs Structurés & Enrichis -->
        <div class="row g-2 mb-3">
          <!-- KPI MENTOR -->
          <ng-container *ngIf="viewMode === 'mentor'">
            <div class="col-6 col-md-3">
              <div class="card p-2 p-md-3 border-0 shadow-sm rounded-3 bg-white text-center h-100">
                <div class="text-muted fw-bold text-uppercase" style="font-size: 10px;">Séances</div>
                <div class="fs-4 fw-bold text-primary my-1">{{ demandesRecues.length }}</div>
                <small class="text-muted text-truncate d-block" style="font-size: 10px;">
                  {{ getTermineesCount() }} terminée(s)
                </small>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="card p-2 p-md-3 border-0 shadow-sm rounded-3 bg-white text-center h-100">
                <div class="text-muted fw-bold text-uppercase" style="font-size: 10px;">Heures dispensées</div>
                <div class="fs-4 fw-bold text-success my-1">{{ getHeuresEffectuees() }}h</div>
                <small class="text-muted text-truncate d-block" style="font-size: 10px;">+{{ getHeuresPlanifiees() }}h prévues</small>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="card p-2 p-md-3 border-0 shadow-sm rounded-3 bg-white text-center h-100">
                <div class="text-muted fw-bold text-uppercase" style="font-size: 10px;">En attente</div>
                <div class="fs-4 fw-bold text-warning my-1">{{ getPendingCount() }}</div>
                <small class="text-muted text-truncate d-block" style="font-size: 10px;">À traiter</small>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="card p-2 p-md-3 border-0 shadow-sm rounded-3 bg-white text-center h-100">
                <div class="text-muted fw-bold text-uppercase" style="font-size: 10px;">Matières</div>
                <div class="fs-4 fw-bold text-info my-1">{{ getNbMatieres() }}</div>
                <small class="text-muted text-truncate d-block" style="font-size: 10px;">Enseignées</small>
              </div>
            </div>
          </ng-container>

          <!-- KPI MENTORÉ -->
          <ng-container *ngIf="viewMode === 'mentore'">
            <div class="col-6 col-md-3">
              <div class="card p-2 p-md-3 border-0 shadow-sm rounded-3 bg-white text-center h-100">
                <div class="text-muted fw-bold text-uppercase" style="font-size: 10px;">Séances</div>
                <div class="fs-4 fw-bold text-primary my-1">{{ demandesEnvoyees.length }}</div>
                <small class="text-muted text-truncate d-block" style="font-size: 10px;">{{ getTermineesCount() }} effectuée(s)</small>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="card p-2 p-md-3 border-0 shadow-sm rounded-3 bg-white text-center h-100">
                <div class="text-muted fw-bold text-uppercase" style="font-size: 10px;">Volume suivi</div>
                <div class="fs-4 fw-bold text-success my-1">{{ getHeuresEffectuees() }}h</div>
                <small class="text-muted text-truncate d-block" style="font-size: 10px;">+{{ getHeuresPlanifiees() }}h à venir</small>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="card p-2 p-md-3 border-0 shadow-sm rounded-3 bg-white text-center h-100">
                <div class="text-muted fw-bold text-uppercase" style="font-size: 10px;">En cours</div>
                <div class="fs-4 fw-bold text-warning my-1">{{ getProchainesSessions().length }}</div>
                <small class="text-muted text-truncate d-block" style="font-size: 10px;">Confirmée(s)</small>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="card p-2 p-md-3 border-0 shadow-sm rounded-3 bg-white text-center h-100">
                <div class="text-muted fw-bold text-uppercase" style="font-size: 10px;">Matières</div>
                <div class="fs-4 fw-bold text-info my-1">{{ getNbMatieres() }}</div>
                <small class="text-muted text-truncate d-block" style="font-size: 10px;">Accompagnées</small>
              </div>
            </div>
          </ng-container>
        </div>

        <!-- Onglets Fluides (Segmented Pills Control) -->
        <div class="d-flex gap-2 overflow-auto pb-2 mb-3" style="-webkit-overflow-scrolling: touch; white-space: nowrap;">
          <button 
            *ngIf="viewMode === 'mentor'"
            type="button"
            (click)="activeTab = 'recues'"
            class="btn btn-sm rounded-pill px-3 py-2 fw-bold"
            [class.btn-primary]="activeTab === 'recues'"
            [class.btn-light]="activeTab !== 'recues'"
            style="font-size: 12.5px;"
          >
            <i class="bi bi-inbox me-1"></i>Demandes reçues ({{ demandesRecues.length }})
          </button>

          <button 
            *ngIf="viewMode === 'mentore'"
            type="button"
            (click)="activeTab = 'envoyees'"
            class="btn btn-sm rounded-pill px-3 py-2 fw-bold"
            [class.btn-primary]="activeTab === 'envoyees'"
            [class.btn-light]="activeTab !== 'envoyees'"
            style="font-size: 12.5px;"
          >
            <i class="bi bi-send me-1"></i>Mes demandes ({{ demandesEnvoyees.length }})
          </button>

          <!-- Onglet Progression par matière -->
          <button 
            type="button"
            (click)="activeTab = 'progression'"
            class="btn btn-sm rounded-pill px-3 py-2 fw-bold"
            [class.btn-primary]="activeTab === 'progression'"
            [class.btn-light]="activeTab !== 'progression'"
            style="font-size: 12.5px;"
          >
            <i class="bi bi-graph-up-arrow me-1"></i>Progression par matière ({{ getMatiereProgressions().length }})
          </button>

          <!-- Onglet Historique complet -->
          <button 
            type="button"
            (click)="activeTab = 'historique'"
            class="btn btn-sm rounded-pill px-3 py-2 fw-bold"
            [class.btn-primary]="activeTab === 'historique'"
            [class.btn-light]="activeTab !== 'historique'"
            style="font-size: 12.5px;"
          >
            <i class="bi bi-clock-history me-1"></i>Historique des séances ({{ getDemandesCourantes().length }})
          </button>

          <button 
            type="button"
            (click)="activeTab = 'sessions'"
            class="btn btn-sm rounded-pill px-3 py-2 fw-bold"
            [class.btn-primary]="activeTab === 'sessions'"
            [class.btn-light]="activeTab !== 'sessions'"
            style="font-size: 12.5px;"
          >
            <i class="bi bi-camera-video me-1"></i>Séances Visio ({{ getProchainesSessions().length }})
          </button>

          <button 
            *ngIf="viewMode === 'mentor'"
            type="button"
            (click)="activeTab = 'disponibilites'"
            class="btn btn-sm rounded-pill px-3 py-2 fw-bold"
            [class.btn-primary]="activeTab === 'disponibilites'"
            [class.btn-light]="activeTab !== 'disponibilites'"
            style="font-size: 12.5px;"
          >
            <i class="bi bi-calendar-week me-1"></i>Mes créneaux ({{ mesDispos.length }})
          </button>

          <button 
            *ngIf="viewMode === 'mentore'"
            type="button"
            (click)="activeTab = 'matching'"
            class="btn btn-sm rounded-pill px-3 py-2 fw-bold"
            [class.btn-primary]="activeTab === 'matching'"
            [class.btn-light]="activeTab !== 'matching'"
            style="font-size: 12.5px;"
          >
            <i class="bi bi-stars me-1"></i>Mentors suggérés ({{ matchingMentors.length }})
          </button>
        </div>

        <!-- 4. CONTENU DE L'ONGLET SÉLECTIONNÉ -->
        <div class="card border-0 shadow-sm rounded-4 p-3 p-md-4 bg-white mb-4">
          
          <!-- Spinner de chargement -->
          <div *ngIf="loading" class="text-center py-5">
            <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
            <p class="text-muted small mt-2">Chargement de votre tableau de bord...</p>
          </div>

          <!-- ONGLET 1 : DEMANDES REÇUES (MENTOR) -->
          <div *ngIf="!loading && activeTab === 'recues'">
            <div *ngIf="demandesRecues.length === 0" class="text-center py-5 text-muted">
              <i class="bi bi-inbox fs-1 text-secondary opacity-50 mb-2 d-block"></i>
              <p class="mb-0">Vous n'avez reçu aucune demande de mentorat pour le moment.</p>
            </div>

            <div *ngFor="let demande of demandesRecues" class="card border mb-3 rounded-3 p-3 shadow-none">
              <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                <div>
                  <h6 class="fw-bold mb-1 text-dark" style="font-size: 14px;">
                    {{ demande.mentore.user.first_name }} {{ demande.mentore.user.last_name }}
                    <span class="text-muted fw-normal small">({{ demande.mentore.filiere || 'Apprenant' }})</span>
                  </h6>
                  <span class="badge bg-primary-subtle text-primary border border-primary-subtle me-2" style="font-size: 11px;">{{ demande.matiere.nom }}</span>
                  <small class="text-muted" style="font-size: 11.5px;">Reçue le {{ demande.date_creation | date:'dd MMM yyyy à HH:mm' }}</small>
                </div>
                <span class="badge" [ngClass]="getBadgeClass(demande.statut)" style="font-size: 11px;">
                  {{ demande.statut_display }}
                </span>
              </div>

              <!-- Bloc Date et Créneau Prévus -->
              <div *ngIf="demande.date_heure_souhaitee" class="p-2 mb-2 rounded-2 bg-light border d-flex align-items-center gap-2 flex-wrap">
                <i class="bi bi-calendar-event text-primary"></i>
                <strong class="text-dark small">Créneau demandé :</strong>
                <span class="text-primary fw-bold small">
                  {{ demande.date_heure_souhaitee | date:'EEEE d MMMM yyyy à HH:mm' }}
                </span>
                <span class="badge bg-secondary-subtle text-secondary small">{{ demande.duree_minutes || 60 }} min</span>
              </div>

              <p class="text-secondary small mb-3 p-2 bg-light rounded-2 border" style="font-size: 13px;">
                « {{ demande.message }} »
              </p>

              <!-- Lien Visio si Acceptée -->
              <div *ngIf="demande.statut === 'ACCEPTEE' && demande.lien_visio" class="p-2 p-md-3 mb-3 rounded-3 bg-primary-subtle border border-primary-subtle d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-camera-video-fill text-primary fs-5"></i>
                  <div>
                    <strong class="text-primary small d-block">Visioconférence Jitsi Meet prête</strong>
                    <span class="text-muted" style="font-size: 11px;">Accès direct sécurisé sans installation</span>
                  </div>
                </div>
                <a [href]="demande.lien_visio" target="_blank" class="btn btn-sm btn-primary px-3">
                  <i class="bi bi-box-arrow-up-right me-1"></i>Rejoindre la visio
                </a>
              </div>

              <div *ngIf="demande.statut === 'EN_ATTENTE'" class="d-flex gap-2 justify-content-end flex-wrap">
                <button (click)="handleAction(demande.id, 'accepter')" class="btn btn-sm btn-success px-3">
                  <i class="bi bi-check-lg me-1"></i>Confirmer la séance
                </button>
                <button (click)="handleAction(demande.id, 'refuser')" class="btn btn-sm btn-outline-danger px-3">
                  <i class="bi bi-x-lg me-1"></i>Refuser
                </button>
              </div>

              <div *ngIf="demande.statut === 'ACCEPTEE'" class="d-flex gap-2 justify-content-end flex-wrap">
                <button (click)="handleAction(demande.id, 'annuler')" class="btn btn-sm btn-outline-danger">
                  <i class="bi bi-x-circle me-1"></i>Annuler
                </button>
                <button (click)="handleAction(demande.id, 'terminer')" class="btn btn-sm btn-outline-primary">
                  <i class="bi bi-flag-fill me-1"></i>Terminée
                </button>
              </div>

              <!-- Bloc Avis vérifié reçu pour le mentor -->
              <div *ngIf="demande.statut === 'TERMINEE'" class="mt-2">
                <div *ngIf="demande.avis" class="p-2.5 rounded-3 bg-warning-subtle border border-warning-subtle">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="badge bg-warning text-dark fw-bold" style="font-size: 11px;">
                      <i class="bi bi-patch-check-fill me-1"></i>Avis vérifié reçu
                    </span>
                    <div class="text-warning small">
                      <i *ngFor="let s of [1,2,3,4,5]" class="bi" [ngClass]="s <= demande.avis.note ? 'bi-star-fill' : 'bi-star'"></i>
                      <span class="text-dark fw-bold ms-1">{{ demande.avis.note }}/5</span>
                    </div>
                  </div>
                  <p *ngIf="demande.avis.commentaire" class="text-dark small mb-0 fst-italic">
                    « {{ demande.avis.commentaire }} »
                  </p>
                </div>
                <div *ngIf="!demande.avis" class="text-muted small fst-italic">
                  <i class="bi bi-clock me-1"></i>Séance terminée. En attente de l'évaluation du mentoré.
                </div>
              </div>
            </div>
          </div>

          <!-- ONGLET 2 : DEMANDES ENVOYÉES (MENTORÉ) -->
          <div *ngIf="!loading && activeTab === 'envoyees'">
            <div *ngIf="demandesEnvoyees.length === 0" class="text-center py-5 text-muted">
              <i class="bi bi-send fs-1 text-secondary opacity-50 mb-2 d-block"></i>
              <p class="mb-2">Vous n'avez envoyé aucune demande de mentorat.</p>
              <a routerLink="/mentors" class="btn btn-primary btn-sm mt-2">Trouver un mentor</a>
            </div>

            <div *ngFor="let demande of demandesEnvoyees" class="card border mb-3 rounded-3 p-3 shadow-none">
              <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                <div>
                  <h6 class="fw-bold mb-1 text-dark" style="font-size: 14px;">
                    Mentor : {{ demande.mentor.user.first_name }} {{ demande.mentor.user.last_name }}
                  </h6>
                  <span class="badge bg-primary-subtle text-primary border border-primary-subtle me-2" style="font-size: 11px;">{{ demande.matiere.nom }}</span>
                  <small class="text-muted" style="font-size: 11.5px;">Envoyée le {{ demande.date_creation | date:'dd MMM yyyy à HH:mm' }}</small>
                </div>
                <span class="badge" [ngClass]="getBadgeClass(demande.statut)" style="font-size: 11px;">
                  {{ demande.statut_display }}
                </span>
              </div>

              <!-- Bloc Date et Créneau Prévus -->
              <div *ngIf="demande.date_heure_souhaitee" class="p-2 mb-2 rounded-2 bg-light border d-flex align-items-center gap-2 flex-wrap">
                <i class="bi bi-calendar-event text-primary"></i>
                <strong class="text-dark small">Séance prévue :</strong>
                <span class="text-primary fw-bold small">
                  {{ demande.date_heure_souhaitee | date:'EEEE d MMMM yyyy à HH:mm' }}
                </span>
                <span class="badge bg-secondary-subtle text-secondary small">{{ demande.duree_minutes || 60 }} min</span>
              </div>

              <p class="text-secondary small mb-3 p-2 bg-light rounded-2 border" style="font-size: 13px;">
                « {{ demande.message }} »
              </p>

              <!-- Lien Visio si Confirmée -->
              <div *ngIf="demande.statut === 'ACCEPTEE' && demande.lien_visio" class="p-2 p-md-3 mb-2 rounded-3 bg-success-subtle border border-success-subtle d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-camera-video-fill text-success fs-5"></i>
                  <div>
                    <strong class="text-success small d-block">Votre séance est validée !</strong>
                    <span class="text-muted" style="font-size: 11px;">Rejoignez la salle de visioconférence à l'heure convenue</span>
                  </div>
                </div>
                <a [href]="demande.lien_visio" target="_blank" class="btn btn-sm btn-success px-3">
                  <i class="bi bi-box-arrow-up-right me-1"></i>Rejoindre la visio
                </a>
              </div>

              <div *ngIf="demande.statut === 'ACCEPTEE'" class="d-flex gap-2 justify-content-end flex-wrap">
                <button (click)="handleAction(demande.id, 'annuler')" class="btn btn-sm btn-outline-danger">
                  <i class="bi bi-x-circle me-1"></i>Annuler ma réservation
                </button>
                <button (click)="handleAction(demande.id, 'terminer')" class="btn btn-sm btn-outline-success">
                  <i class="bi bi-check2-circle me-1"></i>Séance effectuée
                </button>
              </div>

              <!-- Bloc Avis vérifié pour le mentoré -->
              <div *ngIf="demande.statut === 'TERMINEE'" class="mt-2">
                <div *ngIf="demande.avis" class="p-2.5 rounded-3 bg-warning-subtle border border-warning-subtle">
                  <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="badge bg-warning text-dark fw-bold" style="font-size: 11px;">
                      <i class="bi bi-patch-check-fill me-1"></i>Votre avis vérifié déposé
                    </span>
                    <div class="text-warning small">
                      <i *ngFor="let s of [1,2,3,4,5]" class="bi" [ngClass]="s <= demande.avis.note ? 'bi-star-fill' : 'bi-star'"></i>
                      <span class="text-dark fw-bold ms-1">{{ demande.avis.note }}/5</span>
                    </div>
                  </div>
                  <p *ngIf="demande.avis.commentaire" class="text-dark small mb-0 fst-italic">
                    « {{ demande.avis.commentaire }} »
                  </p>
                </div>

                <div *ngIf="!demande.avis" class="p-2.5 rounded-3 bg-warning-subtle border border-warning-subtle d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <div>
                    <strong class="text-dark small d-block">
                      <i class="bi bi-star-fill text-warning me-1"></i>Séance terminée ! Donnez votre avis vérifié
                    </strong>
                    <span class="text-muted" style="font-size: 11px;">Évaluez la clarté et la pédagogie de votre mentor.</span>
                  </div>
                  <button (click)="openAvisModal(demande)" class="btn btn-sm btn-warning text-dark fw-bold rounded-pill px-3 shadow-sm">
                    <i class="bi bi-star-fill me-1"></i>Laisser un avis
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- ONGLET 3 : MES DISPONIBILITÉS (MENTOR) -->
          <div *ngIf="!loading && activeTab === 'disponibilites'">
            <div class="mb-3">
              <h5 class="fw-bold text-dark mb-1" style="font-size: 16px;">
                <i class="bi bi-calendar-week text-primary me-2"></i>Mes créneaux hebdomadaires
              </h5>
              <p class="text-muted small mb-0">
                Définissez les plages horaires où les étudiants peuvent réserver des sessions d'accompagnement avec vous.
              </p>
            </div>

            <!-- Formulaire d'ajout rapide -->
            <div class="card p-3 mb-3 bg-light border rounded-3">
              <h6 class="fw-bold text-dark mb-2" style="font-size: 13.5px;">Ajouter un créneau</h6>
              <form (ngSubmit)="ajouterDisponibilite()" class="row g-2 align-items-end">
                <div class="col-12 col-sm-4">
                  <label class="small text-muted fw-bold mb-1">Jour *</label>
                  <select [(ngModel)]="newJour" name="newJour" class="form-select form-select-sm" required>
                    <option [ngValue]="0">Lundi</option>
                    <option [ngValue]="1">Mardi</option>
                    <option [ngValue]="2">Mercredi</option>
                    <option [ngValue]="3">Jeudi</option>
                    <option [ngValue]="4">Vendredi</option>
                    <option [ngValue]="5">Samedi</option>
                    <option [ngValue]="6">Dimanche</option>
                  </select>
                </div>
                <div class="col-6 col-sm-3">
                  <label class="small text-muted fw-bold mb-1">Début *</label>
                  <input type="time" [(ngModel)]="newDebut" name="newDebut" class="form-control form-control-sm" required>
                </div>
                <div class="col-6 col-sm-3">
                  <label class="small text-muted fw-bold mb-1">Fin *</label>
                  <input type="time" [(ngModel)]="newFin" name="newFin" class="form-control form-control-sm" required>
                </div>
                <div class="col-12 col-sm-2">
                  <button type="submit" class="btn btn-sm btn-primary w-100">
                    <i class="bi bi-plus-lg me-1"></i>Ajouter
                  </button>
                </div>
              </form>
            </div>

            <!-- Liste des créneaux -->
            <div *ngIf="mesDispos.length === 0" class="text-center py-4 text-muted border rounded-3 bg-white">
              <i class="bi bi-calendar-x fs-1 text-secondary opacity-50 mb-2 d-block"></i>
              <p class="mb-0 small">Vous n'avez pas encore configuré de créneau de disponibilité.</p>
            </div>

            <div *ngIf="mesDispos.length > 0" class="d-flex flex-column gap-2">
              <div *ngFor="let d of mesDispos" class="p-2 px-3 border rounded-3 bg-white d-flex align-items-center justify-content-between flex-wrap gap-2 shadow-sm">
                <div class="d-flex align-items-center gap-2">
                  <span class="badge bg-primary-subtle text-primary fw-bold" style="font-size: 11px;">
                    {{ d.jour_display }}
                  </span>
                  <span class="text-dark fw-bold" style="font-size: 13px;">
                    {{ d.heure_debut }} &mdash; {{ d.heure_fin }}
                  </span>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <span class="badge bg-success-subtle text-success" style="font-size: 10.5px;">Actif</span>
                  <button (click)="supprimerDisponibilite(d.id)" class="btn btn-sm btn-outline-danger p-1 px-2" title="Supprimer">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- ONGLET 4 : SESSIONS CONFIRMÉES (VISIO) -->
          <div *ngIf="!loading && activeTab === 'sessions'">
            <div class="mb-3">
              <h5 class="fw-bold text-dark mb-1" style="font-size: 16px;">
                <i class="bi bi-camera-video text-primary me-2"></i>Mes séances Visio confirmées
              </h5>
              <p class="text-muted small mb-0">
                Rejoignez directement votre salle de réunion Jitsi sécurisée sans installation requise.
              </p>
            </div>

            <div *ngIf="getProchainesSessions().length === 0" class="text-center py-5 text-muted border rounded-3 bg-light">
              <i class="bi bi-calendar-check fs-1 text-secondary opacity-50 mb-2 d-block"></i>
              <p class="mb-0 small">Aucune séance confirmée actuellement.</p>
            </div>

            <div *ngFor="let seance of getProchainesSessions()" class="card border mb-3 rounded-3 p-3 shadow-none">
              <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                <div class="d-flex align-items-center gap-2">
                  <i class="bi" [ngClass]="seance.matiere.icone || 'bi-journal-code'" style="color: var(--blue); font-size: 1.2rem;"></i>
                  <strong class="text-dark" style="font-size: 14px;">{{ seance.matiere.nom }}</strong>
                </div>
                <span class="badge bg-success text-white" style="font-size: 11px;">Confirmée</span>
              </div>

              <p class="text-muted small mb-2">
                <i class="bi bi-calendar-event me-1 text-primary"></i>
                {{ seance.date_heure_souhaitee ? (seance.date_heure_souhaitee | date:'EEEE d MMMM yyyy à HH:mm') : 'Horaire convenu' }}
                &bull; Avec <strong>{{ viewMode === 'mentor' ? seance.mentore.user.first_name : seance.mentor.user.first_name }}</strong>
              </p>

              <div *ngIf="seance.lien_visio" class="d-flex justify-content-end">
                <a [href]="seance.lien_visio" target="_blank" class="btn btn-sm btn-primary px-3">
                  <i class="bi bi-camera-video-fill me-1"></i>Entrer dans la salle Visio
                </a>
              </div>
            </div>
          </div>

          <!-- ONGLET 5 : MENTORS RECOMMANDÉS (MATCHING INTELLIGENT) -->
          <div *ngIf="!loading && activeTab === 'matching'">
            <div class="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h5 class="fw-bold text-dark mb-1" style="font-size: 16px;">
                  <i class="bi bi-stars text-primary me-2"></i>Mentors les plus compatibles avec vous
                </h5>
                <p class="text-muted small mb-0">
                  Basé sur votre cursus : <strong>{{ currentUser?.filiere || 'Informatique' }}</strong> &bull; <strong>{{ currentUser?.niveau_display }}</strong>.
                </p>
              </div>
              <a routerLink="/mentors" [queryParams]="{ mode: 'matching' }" class="btn btn-sm btn-outline-primary">
                Assistant complet &rarr;
              </a>
            </div>

            <div *ngIf="matchingMentors.length === 0" class="text-center py-4 text-muted border rounded-3 bg-light">
              <i class="bi bi-person-x fs-1 text-secondary opacity-50 mb-2 d-block"></i>
              <p class="mb-0 small">Aucune recommandation disponible pour l'instant.</p>
            </div>

            <div class="row g-2">
              <div *ngFor="let match of matchingMentors" class="col-12 col-md-6">
                <div class="card border rounded-3 p-3 bg-white h-100 shadow-sm position-relative">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div class="d-flex align-items-center gap-2">
                      <img *ngIf="match.mentor.photo_url" [src]="match.mentor.photo_url" class="rounded-circle object-fit-cover" style="width: 40px; height: 40px;">
                      <div *ngIf="!match.mentor.photo_url" class="avatar avatar--initials" style="width: 40px; height: 40px; font-size: 13px;">
                        {{ getInitials(match.mentor) }}
                      </div>
                      <div>
                        <strong class="text-dark d-block" style="font-size: 13.5px;">{{ match.mentor.user.first_name }} {{ match.mentor.user.last_name }}</strong>
                        <small class="text-muted" style="font-size: 11px;">{{ match.mentor.filiere || 'Génie Logiciel' }} &bull; {{ match.mentor.niveau_display }}</small>
                      </div>
                    </div>
                    <span class="badge rounded-pill px-2 py-1 fw-bold" [ngClass]="getScoreBadgeClass(match.score)" style="font-size: 11px;">
                      {{ match.score }}%
                    </span>
                  </div>

                  <p *ngIf="match.raisons?.length" class="text-muted small mb-3 p-2 bg-light rounded-2 border" style="font-size: 11.5px;">
                    <i class="bi bi-check-circle-fill text-success me-1"></i>{{ match.raisons[0] }}
                  </p>

                  <div class="mt-auto d-flex gap-2">
                    <a [routerLink]="['/mentor', match.mentor.id]" class="btn btn-outline-primary btn-sm flex-grow-1">
                      Profil
                    </a>
                    <a [routerLink]="['/messages']" [queryParams]="{ destinataireId: match.mentor.id }" class="btn btn-light border btn-sm px-3" title="Contacter">
                      <i class="bi bi-chat-dots"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ONGLET PROGRESSION PAR MATIÈRE -->
          <div *ngIf="!loading && activeTab === 'progression'">
            <div class="mb-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <h5 class="fw-bold text-dark mb-1" style="font-size: 16px;">
                  <i class="bi bi-graph-up-arrow text-primary me-2"></i>Progression et volume par matière
                </h5>
                <p class="text-muted small mb-0">
                  Suivez vos séances terminées, vos heures cumulées et vos axes de perfectionnement.
                </p>
              </div>
              <div class="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill fw-bold" style="font-size: 11px;">
                Total : {{ getHeuresEffectuees() }}h réalisées
              </div>
            </div>

            <div *ngIf="getMatiereProgressions().length === 0" class="text-center py-5 text-muted border rounded-3 bg-light">
              <i class="bi bi-bar-chart-line fs-1 text-secondary opacity-50 mb-2 d-block"></i>
              <p class="mb-0 small">Aucune séance enregistrée pour calculer la progression.</p>
            </div>

            <div class="row g-3">
              <div *ngFor="let prog of getMatiereProgressions()" class="col-12 col-md-6">
                <div class="card border rounded-3 p-3 bg-white h-100 shadow-sm">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div class="d-flex align-items-center gap-2">
                      <div class="p-2 rounded-3 bg-primary-subtle text-primary d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                        <i class="bi" [ngClass]="prog.icone" style="font-size: 1.2rem;"></i>
                      </div>
                      <div>
                        <strong class="text-dark d-block" style="font-size: 14px;">{{ prog.nom }}</strong>
                        <small class="text-muted" style="font-size: 11px;">{{ prog.totalSessions }} séance(s) au total</small>
                      </div>
                    </div>
                    <span class="badge rounded-pill px-2.5 py-1 fw-bold" [ngClass]="prog.pourcentage === 100 ? 'bg-success text-white' : 'bg-primary text-white'" style="font-size: 11px;">
                      {{ prog.pourcentage }}% terminé
                    </span>
                  </div>

                  <!-- Jauge de progression -->
                  <div class="progress mb-2" style="height: 8px; border-radius: 4px; background-color: #e2e8f0;">
                    <div 
                      class="progress-bar progress-bar-striped progress-bar-animated" 
                      role="progressbar" 
                      [style.width.%]="prog.pourcentage" 
                      [ngClass]="prog.pourcentage === 100 ? 'bg-success' : 'bg-primary'"
                      [attr.aria-valuenow]="prog.pourcentage" 
                      aria-valuemin="0" 
                      aria-valuemax="100"
                    ></div>
                  </div>

                  <!-- Détails chiffrés -->
                  <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-1 border-top mt-2 small text-muted" style="font-size: 11.5px;">
                    <div>
                      <span class="text-success fw-bold me-2"><i class="bi bi-check-circle-fill me-1"></i>{{ prog.terminees }} faite(s)</span>
                      <span *ngIf="prog.acceptees > 0" class="text-primary fw-bold me-2"><i class="bi bi-calendar2-check-fill me-1"></i>{{ prog.acceptees }} validée(s)</span>
                      <span *ngIf="prog.enAttente > 0" class="text-warning fw-bold"><i class="bi bi-hourglass-split me-1"></i>{{ prog.enAttente }} en attente</span>
                    </div>
                    <div class="fw-bold text-dark">
                      <i class="bi bi-clock me-1 text-secondary"></i>{{ prog.heuresRealisees }}h
                    </div>
                  </div>

                  <!-- Bouton d'action selon rôle -->
                  <div class="mt-3 pt-2 border-top d-flex justify-content-end">
                    <a *ngIf="viewMode === 'mentore'" routerLink="/mentors" [queryParams]="{ matiere: prog.id }" class="btn btn-sm btn-outline-primary rounded-pill px-3" style="font-size: 11.5px;">
                      <i class="bi bi-search me-1"></i>Voir les mentors en {{ prog.nom }}
                    </a>
                    <button *ngIf="viewMode === 'mentor'" (click)="activeTab = 'disponibilites'" class="btn btn-sm btn-outline-secondary rounded-pill px-3" style="font-size: 11.5px;">
                      <i class="bi bi-calendar-plus me-1"></i>Ouvrir un créneau
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ONGLET HISTORIQUE COMPLET -->
          <div *ngIf="!loading && activeTab === 'historique'">
            <div class="mb-3">
              <h5 class="fw-bold text-dark mb-1" style="font-size: 16px;">
                <i class="bi bi-clock-history text-primary me-2"></i>Historique complet de vos séances
              </h5>
              <p class="text-muted small mb-0">
                Consultez, filtrez et retrouvez l'ensemble de vos demandes, séances réalisées et avis vérifiés.
              </p>
            </div>

            <!-- Filtres de recherche -->
            <div class="card p-3 mb-3 bg-light border rounded-3">
              <div class="row g-2 align-items-center">
                <!-- Recherche texte -->
                <div class="col-12 col-md-5">
                  <div class="input-group input-group-sm">
                    <span class="input-group-text bg-white border-end-0"><i class="bi bi-search text-muted"></i></span>
                    <input 
                      type="text" 
                      [(ngModel)]="historiqueSearchText" 
                      class="form-control border-start-0" 
                      placeholder="Rechercher par nom, matière, mot-clé..."
                    >
                    <button *ngIf="historiqueSearchText" class="btn btn-white border border-start-0 text-muted" type="button" (click)="historiqueSearchText = ''">
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </div>
                </div>

                <!-- Filtre Matière -->
                <div class="col-6 col-md-4">
                  <select [(ngModel)]="historiqueMatiereFilter" class="form-select form-select-sm">
                    <option value="TOUTES">Toutes les matières</option>
                    <option *ngFor="let m of getMatieresListFromDemandes()" [value]="m">{{ m }}</option>
                  </select>
                </div>

                <!-- Compteur de résultats -->
                <div class="col-6 col-md-3 text-end small text-muted">
                  <strong>{{ getFilteredHistorique().length }}</strong> résultat(s)
                </div>
              </div>

              <!-- Filtres Statut en pills -->
              <div class="d-flex gap-1 overflow-auto mt-2 pt-2 border-top" style="-webkit-overflow-scrolling: touch; white-space: nowrap;">
                <button 
                  type="button" 
                  (click)="historiqueStatutFilter = 'TOUS'" 
                  class="btn btn-sm rounded-pill px-2.5 py-1"
                  [class.btn-dark]="historiqueStatutFilter === 'TOUS'"
                  [class.btn-white]="historiqueStatutFilter !== 'TOUS'"
                  [class.border]="historiqueStatutFilter !== 'TOUS'"
                  style="font-size: 11px;"
                >
                  Tous
                </button>
                <button 
                  type="button" 
                  (click)="historiqueStatutFilter = 'TERMINEE'" 
                  class="btn btn-sm rounded-pill px-2.5 py-1"
                  [class.btn-success]="historiqueStatutFilter === 'TERMINEE'"
                  [class.btn-white]="historiqueStatutFilter !== 'TERMINEE'"
                  [class.border]="historiqueStatutFilter !== 'TERMINEE'"
                  style="font-size: 11px;"
                >
                  <i class="bi bi-check2-circle me-1"></i>Terminées
                </button>
                <button 
                  type="button" 
                  (click)="historiqueStatutFilter = 'ACCEPTEE'" 
                  class="btn btn-sm rounded-pill px-2.5 py-1"
                  [class.btn-primary]="historiqueStatutFilter === 'ACCEPTEE'"
                  [class.btn-white]="historiqueStatutFilter !== 'ACCEPTEE'"
                  [class.border]="historiqueStatutFilter !== 'ACCEPTEE'"
                  style="font-size: 11px;"
                >
                  <i class="bi bi-calendar-check me-1"></i>Confirmées
                </button>
                <button 
                  type="button" 
                  (click)="historiqueStatutFilter = 'EN_ATTENTE'" 
                  class="btn btn-sm rounded-pill px-2.5 py-1"
                  [class.btn-warning]="historiqueStatutFilter === 'EN_ATTENTE'"
                  [class.btn-white]="historiqueStatutFilter !== 'EN_ATTENTE'"
                  [class.border]="historiqueStatutFilter !== 'EN_ATTENTE'"
                  style="font-size: 11px;"
                >
                  <i class="bi bi-hourglass-split me-1"></i>En attente
                </button>
                <button 
                  type="button" 
                  (click)="historiqueStatutFilter = 'REFUSEE'" 
                  class="btn btn-sm rounded-pill px-2.5 py-1"
                  [class.btn-danger]="historiqueStatutFilter === 'REFUSEE'"
                  [class.btn-white]="historiqueStatutFilter !== 'REFUSEE'"
                  [class.border]="historiqueStatutFilter !== 'REFUSEE'"
                  style="font-size: 11px;"
                >
                  Refusées / Annulées
                </button>
              </div>
            </div>

            <!-- Liste des cartes historique -->
            <div *ngIf="getFilteredHistorique().length === 0" class="text-center py-5 text-muted border rounded-3 bg-white">
              <i class="bi bi-funnel fs-1 text-secondary opacity-50 mb-2 d-block"></i>
              <p class="mb-0 small">Aucune séance ne correspond aux filtres sélectionnés.</p>
            </div>

            <div *ngFor="let demande of getFilteredHistorique()" class="card border mb-3 rounded-3 p-3 shadow-none bg-white">
              <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                <div class="d-flex align-items-center gap-2">
                  <div class="avatar avatar--initials" style="width: 38px; height: 38px; font-size: 13px;">
                    {{ viewMode === 'mentor' ? getInitials(demande.mentore) : getInitials(demande.mentor) }}
                  </div>
                  <div>
                    <h6 class="fw-bold mb-0 text-dark" style="font-size: 13.5px;">
                      {{ viewMode === 'mentor' ? (demande.mentore.user.first_name + ' ' + demande.mentore.user.last_name) : (demande.mentor.user.first_name + ' ' + demande.mentor.user.last_name) }}
                    </h6>
                    <small class="text-muted" style="font-size: 11px;">
                      {{ viewMode === 'mentor' ? (demande.mentore.filiere || 'Mentoré') : (demande.mentor.filiere || 'Mentor') }}
                      &bull; Demande du {{ demande.date_creation | date:'dd/MM/yyyy' }}
                    </small>
                  </div>
                </div>
                <div class="d-flex align-items-center gap-1">
                  <span class="badge bg-primary-subtle text-primary border border-primary-subtle" style="font-size: 11px;">
                    {{ demande.matiere.nom }}
                  </span>
                  <span class="badge" [ngClass]="getBadgeClass(demande.statut)" style="font-size: 11px;">
                    {{ demande.statut_display }}
                  </span>
                </div>
              </div>

              <!-- Bloc Date et Heure -->
              <div class="p-2 mb-2 rounded-2 bg-light border d-flex align-items-center justify-content-between flex-wrap gap-2 small">
                <div>
                  <i class="bi bi-calendar-event text-primary me-1"></i>
                  <span class="fw-bold text-dark">
                    {{ demande.date_heure_souhaitee ? (demande.date_heure_souhaitee | date:'EEEE d MMMM yyyy à HH:mm') : 'Créneau convenu' }}
                  </span>
                </div>
                <span class="badge bg-secondary-subtle text-secondary">{{ demande.duree_minutes || 60 }} min</span>
              </div>

              <p class="text-secondary small mb-2 p-2 bg-light rounded-2 border" style="font-size: 12.5px;">
                « {{ demande.message }} »
              </p>

              <!-- Avis vérifié affiché si déjà noté -->
              <div *ngIf="demande.avis" class="p-2 mb-2 rounded-2 bg-warning-subtle border border-warning-subtle small d-flex align-items-center justify-content-between flex-wrap gap-1">
                <div>
                  <i class="bi bi-patch-check-fill text-warning me-1"></i>
                  <strong>Avis vérifié déposé :</strong>
                  <span class="ms-1 fst-italic text-dark">« {{ demande.avis.commentaire || 'Séance validée' }} »</span>
                </div>
                <div class="text-warning fw-bold">
                  {{ demande.avis.note }}/5 ⭐
                </div>
              </div>

              <!-- Actions contextuelles -->
              <div class="d-flex justify-content-end gap-2 flex-wrap pt-1">
                <button *ngIf="demande.peut_noter" (click)="openAvisModal(demande)" class="btn btn-sm btn-warning text-dark fw-bold rounded-pill px-3 shadow-sm">
                  <i class="bi bi-star-fill me-1"></i>Laisser un avis vérifié
                </button>
                <a *ngIf="demande.statut === 'ACCEPTEE' && demande.lien_visio" [href]="demande.lien_visio" target="_blank" class="btn btn-sm btn-success px-3">
                  <i class="bi bi-camera-video me-1"></i>Lien Visio
                </a>
                <a [routerLink]="['/messages']" [queryParams]="{ destinataireId: viewMode === 'mentor' ? demande.mentore.id : demande.mentor.id }" class="btn btn-sm btn-light border px-2.5" title="Discuter">
                  <i class="bi bi-chat-dots me-1"></i>Message
                </a>
              </div>
            </div>
          </div>

        </div>
      </main>

      <!-- 5. VOLET LATÉRAL DROIT : SESSIONS PROGRAMMÉES (DESKTOP SEULEMENT >= 1200px) -->
      <aside class="dashboard-right">
        <!-- Sessions Confirmées -->
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h6 class="fw-bold text-dark mb-0" style="font-size: 13.5px;">
            <i class="bi bi-camera-video me-1 text-primary"></i>Vos séances Visio
          </h6>
          <span class="badge bg-primary-subtle text-primary rounded-pill px-2" style="font-size: 10.5px;">
            {{ getProchainesSessions().length }}
          </span>
        </div>

        <div *ngIf="getProchainesSessions().length === 0" class="card border rounded-3 p-3 bg-light text-center text-muted small mb-4">
          <i class="bi bi-calendar2-check fs-4 text-secondary mb-1 d-block opacity-50"></i>
          Aucune séance confirmée actuellement.
        </div>

        <div *ngFor="let seance of getProchainesSessions() | slice:0:3" class="card border rounded-3 p-2 px-3 mb-2 bg-white shadow-sm">
          <div class="d-flex align-items-center gap-2 mb-1">
            <i class="bi" [ngClass]="seance.matiere.icone || 'bi-journal-code'" style="color: var(--blue);"></i>
            <strong style="font-size: 12.5px;">{{ seance.matiere.nom }}</strong>
          </div>
          <p class="text-muted small mb-1" style="font-size: 11px;">
            <i class="bi bi-clock me-1"></i>
            {{ seance.date_heure_souhaitee ? (seance.date_heure_souhaitee | date:'dd MMM à HH:mm') : 'Horaire convenu' }}
          </p>
          <p class="text-dark small mb-2" style="font-size: 11.5px;">
            Avec : <strong>{{ viewMode === 'mentor' ? seance.mentore.user.first_name : seance.mentor.user.first_name }}</strong>
          </p>
          <a *ngIf="seance.lien_visio" [href]="seance.lien_visio" target="_blank" class="btn btn-sm btn-primary w-100 py-1" style="font-size: 11.5px;">
            <i class="bi bi-camera-video-fill me-1"></i>Rejoindre Visio (Jitsi)
          </a>
        </div>

        <!-- Mentors Suggérés pour mentoré -->
        <div *ngIf="viewMode === 'mentore' && matchingMentors.length > 0" class="mt-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="fw-bold text-dark mb-0" style="font-size: 13px;">
              <i class="bi bi-stars me-1 text-primary"></i>Mentors suggérés
            </h6>
            <a routerLink="/mentors" [queryParams]="{ mode: 'matching' }" class="text-primary small text-decoration-none fw-bold" style="font-size: 11px;">
              Voir tout &rarr;
            </a>
          </div>

          <div *ngFor="let match of matchingMentors | slice:0:2" class="card border rounded-3 p-2 mb-2 bg-white shadow-sm">
            <div class="d-flex align-items-center gap-2 mb-1">
              <img *ngIf="match.mentor.photo_url" [src]="match.mentor.photo_url" class="rounded-circle object-fit-cover" style="width: 32px; height: 32px;">
              <div *ngIf="!match.mentor.photo_url" class="avatar avatar--initials" style="width: 32px; height: 32px; font-size: 11px;">
                {{ getInitials(match.mentor) }}
              </div>
              <div class="overflow-hidden me-auto">
                <div class="fw-bold text-dark text-truncate" style="font-size: 12px;">
                  {{ match.mentor.user.first_name }} {{ match.mentor.user.last_name }}
                </div>
                <small class="text-muted d-block text-truncate" style="font-size: 10.5px;">
                  {{ match.mentor.filiere || 'Génie Logiciel' }}
                </small>
              </div>
              <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-0 fw-bold" style="font-size: 10px;">
                {{ match.score }}%
              </span>
            </div>
            <div class="d-flex gap-1 mt-1">
              <a [routerLink]="['/mentor', match.mentor.id]" class="btn btn-outline-primary btn-sm flex-grow-1 p-0 py-1" style="font-size: 11px;">
                Profil
              </a>
              <a [routerLink]="['/messages']" [queryParams]="{ destinataireId: match.mentor.id }" class="btn btn-light border btn-sm p-0 px-2" title="Contacter" style="font-size: 11px;">
                <i class="bi bi-chat-dots"></i>
              </a>
            </div>
          </div>
        </div>

      </aside>

      <!-- MODAL AVIS VÉRIFIÉ (POST-SÉANCE) -->
      <div *ngIf="isAvisModalOpen && selectedAvisDemande" class="modal-backdrop-custom d-flex align-items-center justify-content-center p-3" style="position: fixed; inset: 0; background: rgba(15, 27, 61, 0.55); z-index: 2000; backdrop-filter: blur(3px);">
        <div class="card border-0 shadow-lg rounded-4 p-4 bg-white" style="max-width: 480px; width: 100%;">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
              <span class="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2.5 py-1 mb-2 fw-bold" style="font-size: 11px;">
                <i class="bi bi-shield-check me-1"></i>Avis vérifié post-séance
              </span>
              <h5 class="fw-bold text-dark mb-0">Évaluer votre mentor</h5>
            </div>
            <button type="button" (click)="closeAvisModal()" class="btn-close" aria-label="Fermer"></button>
          </div>

          <p class="text-muted small mb-3">
            Votre séance de mentorat en <strong>{{ selectedAvisDemande.matiere.nom }}</strong> avec <strong>{{ selectedAvisDemande.mentor.user.first_name }} {{ selectedAvisDemande.mentor.user.last_name }}</strong> est terminée. Donnez votre retour d'expérience :
          </p>

          <div *ngIf="avisError" class="alert alert-danger p-2 small mb-3 rounded-3">
            <i class="bi bi-exclamation-triangle-fill me-1"></i>{{ avisError }}
          </div>

          <form (ngSubmit)="submitAvis()">
            <!-- Étoiles interactives -->
            <div class="text-center py-3 bg-light rounded-3 mb-3 border">
              <label class="small text-muted fw-bold d-block mb-2">Votre note globale</label>
              <div class="d-flex justify-content-center gap-2 mb-2">
                <button 
                  type="button" 
                  *ngFor="let s of [1,2,3,4,5]" 
                  (click)="setAvisNote(s)"
                  (mouseenter)="avisHoverNote = s"
                  (mouseleave)="avisHoverNote = 0"
                  class="btn p-0 border-0 bg-transparent"
                  style="font-size: 1.8rem; cursor: pointer; transition: transform 0.15s ease;"
                  [title]="s + ' étoile(s)'"
                >
                  <i class="bi" [ngClass]="(avisHoverNote || avisNote) >= s ? 'bi-star-fill text-warning' : 'bi-star text-muted'"></i>
                </button>
              </div>
              <div class="small fw-bold text-primary" style="font-size: 12.5px;">
                {{ getRatingText(avisHoverNote || avisNote) }}
              </div>
            </div>

            <!-- Commentaire -->
            <div class="mb-3">
              <label class="small text-muted fw-bold mb-1 d-block">Votre commentaire (facultatif mais recommandé)</label>
              <textarea 
                [(ngModel)]="avisCommentaire" 
                name="commentaire" 
                rows="3" 
                class="form-control" 
                placeholder="Ex : Explications très claires, mentor patient et ponctuel. J'ai enfin compris les notions clés !"
                style="font-size: 13px;"
              ></textarea>
              <div class="form-text" style="font-size: 11px;">
                <i class="bi bi-shield-lock me-1"></i>Votre prénom et votre cursus apparaîtront publiquement avec la mention « Avis vérifié ».
              </div>
            </div>

            <div class="d-flex gap-2 justify-content-end">
              <button type="button" (click)="closeAvisModal()" class="btn btn-light border btn-sm px-3" [disabled]="submittingAvis">
                Annuler
              </button>
              <button type="submit" class="btn btn-primary btn-sm px-4 fw-bold" [disabled]="submittingAvis">
                <span *ngIf="submittingAvis" class="spinner-border spinner-border-sm me-1"></span>
                <i *ngIf="!submittingAvis" class="bi bi-check2-circle me-1"></i>Publier mon avis vérifié
              </button>
            </div>
          </form>
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
  demandesRecues: DemandeMentorat[] = [];
  demandesEnvoyees: DemandeMentorat[] = [];
  mesDispos: DisponibiliteMentor[] = [];
  matchingMentors: MatchingResult[] = [];

  activeTab: 'recues' | 'envoyees' | 'progression' | 'historique' | 'disponibilites' | 'sessions' | 'matching' = 'recues';
  viewMode: 'mentor' | 'mentore' = 'mentor';
  loading = true;
  actionMessage = '';

  isMobileDrawerOpen = false;

  // Filtres pour l'onglet Historique
  historiqueStatutFilter: string = 'TOUS';
  historiqueMatiereFilter: string = 'TOUTES';
  historiqueSearchText: string = '';

  // Modal Avis vérifié
  isAvisModalOpen = false;
  selectedAvisDemande: DemandeMentorat | null = null;
  avisNote: number = 5;
  avisHoverNote: number = 0;
  avisCommentaire: string = '';
  submittingAvis = false;
  avisError = '';

  // Formulaire nouveau créneau
  newJour: number = 1;
  newDebut: string = '18:00';
  newFin: string = '19:30';

  notifications: Notification[] = [];
  unreadCount = 0;
  isNotifOpen = false;

  openAvisModal(demande: DemandeMentorat): void {
    this.selectedAvisDemande = demande;
    this.avisNote = 5;
    this.avisHoverNote = 0;
    this.avisCommentaire = '';
    this.avisError = '';
    this.isAvisModalOpen = true;
  }

  closeAvisModal(): void {
    this.isAvisModalOpen = false;
    this.selectedAvisDemande = null;
    this.avisError = '';
  }

  setAvisNote(n: number): void {
    this.avisNote = n;
  }

  getRatingText(rating: number): string {
    switch (rating) {
      case 5: return '⭐⭐⭐⭐⭐ Excellent, très pédagogue et clair !';
      case 4: return '⭐⭐⭐⭐ Très bien, séance enrichissante';
      case 3: return '⭐⭐⭐ Bien, objectifs atteints';
      case 2: return '⭐⭐ Moyen, des points à améliorer';
      case 1: return '⭐ Décevant';
      default: return '';
    }
  }

  submitAvis(): void {
    if (!this.selectedAvisDemande) return;
    this.submittingAvis = true;
    this.avisError = '';
    this.mentorshipService.laisserAvis(
      this.selectedAvisDemande.id,
      this.avisNote,
      this.avisCommentaire
    ).subscribe({
      next: (res) => {
        this.submittingAvis = false;
        this.actionMessage = 'Votre avis vérifié a été enregistré avec succès !';
        if (this.selectedAvisDemande) {
          this.selectedAvisDemande.avis = res.avis;
          this.selectedAvisDemande.peut_noter = false;
        }
        this.closeAvisModal();
        this.loadDemandes();
      },
      error: (err) => {
        this.submittingAvis = false;
        this.avisError = err?.error?.error || 'Erreur lors de l\'enregistrement de votre avis.';
      }
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    if (this.currentUser?.role === 'MENTORE') {
      this.viewMode = 'mentore';
      this.activeTab = 'envoyees';
    }
    this.loadDemandes();
    this.loadNotifications();
    this.loadMatchingMentors();
    if (this.currentUser?.est_mentor) {
      this.loadMesDispos();
    }
  }

  loadMatchingMentors(): void {
    this.mentorshipService.getMatching().subscribe({
      next: (res) => {
        this.matchingMentors = res.results ? res.results.slice(0, 4) : [];
      }
    });
  }

  loadNotifications(): void {
    this.mentorshipService.getNotifications().subscribe({
      next: (res) => {
        this.notifications = res.notifications || [];
        this.unreadCount = res.unread_count || 0;
      }
    });
  }

  toggleNotifications(): void {
    this.isNotifOpen = !this.isNotifOpen;
    if (this.isNotifOpen) {
      this.loadNotifications();
    }
  }

  markAllRead(): void {
    this.mentorshipService.markAllNotificationsRead().subscribe(() => {
      this.unreadCount = 0;
      this.notifications.forEach(n => n.est_lu = true);
    });
  }

  openNotif(notif: Notification): void {
    if (!notif.est_lu) {
      this.mentorshipService.markNotificationRead(notif.id).subscribe();
      notif.est_lu = true;
      if (this.unreadCount > 0) this.unreadCount--;
    }
    this.isNotifOpen = false;
    this.router.navigate([notif.lien || '/tableau-de-bord']);
  }

  getNotifBadge(type: string): string {
    switch (type) {
      case 'DEMANDE': return 'bg-warning-subtle text-warning';
      case 'CONFIRMATION': return 'bg-success-subtle text-success';
      case 'ANNULATION': return 'bg-danger-subtle text-danger';
      case 'MESSAGE': return 'bg-primary-subtle text-primary';
      default: return 'bg-light text-dark';
    }
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

  loadMesDispos(): void {
    this.mentorshipService.getMyDisponibilites().subscribe({
      next: (dispos) => {
        this.mesDispos = dispos || [];
      }
    });
  }

  ajouterDisponibilite(): void {
    if (!this.newDebut || !this.newFin) return;
    this.mentorshipService.addDisponibilite({
      jour_semaine: this.newJour,
      heure_debut: this.newDebut,
      heure_fin: this.newFin
    }).subscribe({
      next: () => {
        this.actionMessage = 'Nouveau créneau ajouté à votre calendrier.';
        this.loadMesDispos();
      },
      error: (err) => {
        this.actionMessage = err?.error?.error || 'Erreur lors de l\'ajout du créneau.';
      }
    });
  }

  supprimerDisponibilite(id: number): void {
    this.mentorshipService.deleteDisponibilite(id).subscribe({
      next: () => {
        this.actionMessage = 'Créneau supprimé.';
        this.loadMesDispos();
      }
    });
  }

  getDemandesCourantes(): DemandeMentorat[] {
    return this.viewMode === 'mentor' ? this.demandesRecues : this.demandesEnvoyees;
  }

  getProchainesSessions(): DemandeMentorat[] {
    return this.getDemandesCourantes().filter(d => d.statut === 'ACCEPTEE');
  }

  getTermineesCount(): number {
    return this.getDemandesCourantes().filter(d => d.statut === 'TERMINEE').length;
  }

  getHeuresEffectuees(): string {
    const list = this.getDemandesCourantes();
    const terminees = list.filter(d => d.statut === 'TERMINEE');
    const totalMin = terminees.reduce((sum, d) => sum + (d.duree_minutes || 60), 0);
    const hours = totalMin / 60;
    return hours % 1 === 0 ? hours.toFixed(0) : hours.toFixed(1);
  }

  getHeuresPlanifiees(): string {
    const list = this.getDemandesCourantes();
    const acceptees = list.filter(d => d.statut === 'ACCEPTEE');
    const totalMin = acceptees.reduce((sum, d) => sum + (d.duree_minutes || 60), 0);
    const hours = totalMin / 60;
    return hours % 1 === 0 ? hours.toFixed(0) : hours.toFixed(1);
  }

  getNbMatieres(): number {
    const set = new Set<number>();
    this.getDemandesCourantes().forEach(d => {
      if (d.matiere?.id) set.add(d.matiere.id);
    });
    return set.size;
  }

  getMatiereProgressions(): MatiereProgression[] {
    const list = this.getDemandesCourantes();
    const map = new Map<number, MatiereProgression>();

    for (const d of list) {
      if (!d.matiere) continue;
      const mId = d.matiere.id;
      if (!map.has(mId)) {
        map.set(mId, {
          id: mId,
          nom: d.matiere.nom,
          icone: d.matiere.icone || 'bi-journal-code',
          totalSessions: 0,
          terminees: 0,
          acceptees: 0,
          enAttente: 0,
          heuresRealisees: 0,
          pourcentage: 0
        });
      }
      const stat = map.get(mId)!;
      stat.totalSessions++;
      if (d.statut === 'TERMINEE') {
        stat.terminees++;
        stat.heuresRealisees += (d.duree_minutes || 60) / 60;
      } else if (d.statut === 'ACCEPTEE') {
        stat.acceptees++;
      } else if (d.statut === 'EN_ATTENTE') {
        stat.enAttente++;
      }
    }

    const result = Array.from(map.values());
    result.forEach(r => {
      r.pourcentage = r.totalSessions > 0 ? Math.round((r.terminees / r.totalSessions) * 100) : 0;
      r.heuresRealisees = Math.round(r.heuresRealisees * 10) / 10;
    });
    return result.sort((a, b) => b.totalSessions - a.totalSessions);
  }

  getFilteredHistorique(): DemandeMentorat[] {
    const list = this.getDemandesCourantes();
    return list.filter(d => {
      // Filtre statut
      if (this.historiqueStatutFilter !== 'TOUS' && d.statut !== this.historiqueStatutFilter) {
        return false;
      }
      // Filtre matière
      if (this.historiqueMatiereFilter !== 'TOUTES' && d.matiere?.nom !== this.historiqueMatiereFilter) {
        return false;
      }
      // Filtre recherche textuelle
      if (this.historiqueSearchText.trim()) {
        const query = this.historiqueSearchText.toLowerCase();
        const mentoreName = d.mentore?.user ? `${d.mentore.user.first_name} ${d.mentore.user.last_name}`.toLowerCase() : '';
        const mentorName = d.mentor?.user ? `${d.mentor.user.first_name} ${d.mentor.user.last_name}`.toLowerCase() : '';
        const matiereNom = (d.matiere?.nom || '').toLowerCase();
        const msg = (d.message || '').toLowerCase();
        if (!mentoreName.includes(query) && !mentorName.includes(query) && !matiereNom.includes(query) && !msg.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }

  getMatieresListFromDemandes(): string[] {
    const set = new Set<string>();
    this.getDemandesCourantes().forEach(d => {
      if (d.matiere?.nom) set.add(d.matiere.nom);
    });
    return Array.from(set);
  }

  getHeuresMentorat(): string {
    return this.getHeuresEffectuees();
  }

  getUserInitials(): string {
    const fn = this.currentUser?.user?.first_name ? this.currentUser.user.first_name[0].toUpperCase() : 'U';
    const ln = this.currentUser?.user?.last_name ? this.currentUser.user.last_name[0].toUpperCase() : '';
    return `${fn}${ln}`;
  }

  getInitials(profile?: Profile): string {
    if (!profile?.user) return 'M';
    const f = profile.user.first_name ? profile.user.first_name[0].toUpperCase() : 'M';
    const l = profile.user.last_name ? profile.user.last_name[0].toUpperCase() : '';
    return f + l;
  }

  getScoreBadgeClass(score: number): string {
    if (score >= 90) return 'bg-success text-white';
    if (score >= 80) return 'bg-primary text-white';
    if (score >= 70) return 'bg-info text-dark';
    return 'bg-secondary text-white';
  }

  getPendingCount(): number {
    return this.demandesRecues.filter(d => d.statut === 'EN_ATTENTE').length;
  }

  getBadgeClass(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'bg-warning-subtle text-warning border border-warning';
      case 'ACCEPTEE': return 'bg-success-subtle text-success border border-success';
      case 'REFUSEE': return 'bg-danger-subtle text-danger border border-danger';
      case 'TERMINEE': return 'bg-secondary-subtle text-secondary border border-secondary';
      case 'ANNULEE': return 'bg-dark-subtle text-dark border border-secondary';
      default: return 'bg-light text-dark';
    }
  }

  handleAction(demandeId: number, action: 'accepter' | 'refuser' | 'terminer' | 'annuler'): void {
    this.mentorshipService.updateDemandeStatus(demandeId, action).subscribe({
      next: () => {
        const labels: Record<string, string> = {
          accepter: 'Séance confirmée ! Le lien de visio a été généré.',
          refuser: 'Demande refusée.',
          terminer: 'Session marquée comme terminée.',
          annuler: 'Séance annulée.'
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
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/connexion']);
      }
    });
  }
}
