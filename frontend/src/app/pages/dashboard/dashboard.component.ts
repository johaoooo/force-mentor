import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MentorshipService } from '../../services/mentorship.service';
import { AuthService } from '../../services/auth.service';
import { DemandeMentorat, Profile, DisponibiliteMentor, Notification, MatchingResult } from '../../models/models';

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

        <!-- 3 KPIs Simplifiés en 1 ligne -->
        <div class="row g-2 mb-3">
          <!-- KPI MENTOR -->
          <ng-container *ngIf="viewMode === 'mentor'">
            <div class="col-4">
              <div class="card p-2 p-md-3 border-0 shadow-sm rounded-3 bg-white text-center h-100">
                <div class="text-muted fw-bold text-uppercase" style="font-size: 10.5px;">Reçues</div>
                <div class="fs-4 fw-bold text-primary my-1">{{ demandesRecues.length }}</div>
                <small class="text-muted text-truncate d-block" style="font-size: 10px;">
                  {{ getPendingCount() }} en attente
                </small>
              </div>
            </div>
            <div class="col-4">
              <div class="card p-2 p-md-3 border-0 shadow-sm rounded-3 bg-white text-center h-100">
                <div class="text-muted fw-bold text-uppercase" style="font-size: 10.5px;">Confirmées</div>
                <div class="fs-4 fw-bold text-success my-1">{{ getProchainesSessions().length }}</div>
                <small class="text-muted text-truncate d-block" style="font-size: 10px;">Séances actives</small>
              </div>
            </div>
            <div class="col-4">
              <div class="card p-2 p-md-3 border-0 shadow-sm rounded-3 bg-white text-center h-100">
                <div class="text-muted fw-bold text-uppercase" style="font-size: 10.5px;">Créneaux</div>
                <div class="fs-4 fw-bold text-warning my-1">{{ mesDispos.length }}</div>
                <small class="text-muted text-truncate d-block" style="font-size: 10px;">Hebdomadaires</small>
              </div>
            </div>
          </ng-container>

          <!-- KPI MENTORÉ -->
          <ng-container *ngIf="viewMode === 'mentore'">
            <div class="col-4">
              <div class="card p-2 p-md-3 border-0 shadow-sm rounded-3 bg-white text-center h-100">
                <div class="text-muted fw-bold text-uppercase" style="font-size: 10.5px;">Demandes</div>
                <div class="fs-4 fw-bold text-primary my-1">{{ demandesEnvoyees.length }}</div>
                <small class="text-muted text-truncate d-block" style="font-size: 10px;">Envoyées</small>
              </div>
            </div>
            <div class="col-4">
              <div class="card p-2 p-md-3 border-0 shadow-sm rounded-3 bg-white text-center h-100">
                <div class="text-muted fw-bold text-uppercase" style="font-size: 10.5px;">Confirmées</div>
                <div class="fs-4 fw-bold text-success my-1">{{ getProchainesSessions().length }}</div>
                <small class="text-muted text-truncate d-block" style="font-size: 10px;">Avec visio</small>
              </div>
            </div>
            <div class="col-4">
              <div class="card p-2 p-md-3 border-0 shadow-sm rounded-3 bg-white text-center h-100">
                <div class="text-muted fw-bold text-uppercase" style="font-size: 10.5px;">Volume</div>
                <div class="fs-4 fw-bold text-info my-1">{{ getHeuresMentorat() }}h</div>
                <small class="text-muted text-truncate d-block" style="font-size: 10px;">Accompagnement</small>
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

  activeTab: 'recues' | 'envoyees' | 'disponibilites' | 'sessions' | 'matching' = 'recues';
  viewMode: 'mentor' | 'mentore' = 'mentor';
  loading = true;
  actionMessage = '';

  isMobileDrawerOpen = false;

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

  getProchainesSessions(): DemandeMentorat[] {
    const list = this.viewMode === 'mentor' ? this.demandesRecues : this.demandesEnvoyees;
    return list.filter(d => d.statut === 'ACCEPTEE');
  }

  getHeuresMentorat(): string {
    const hours = this.getProchainesSessions().length * 1.5;
    return hours.toFixed(0);
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
