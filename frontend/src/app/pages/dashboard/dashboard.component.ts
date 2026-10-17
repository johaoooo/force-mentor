import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MentorshipService } from '../../services/mentorship.service';
import { AuthService } from '../../services/auth.service';
import { DemandeMentorat, Profile, DisponibiliteMentor, Notification } from '../../models/models';

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
            <span *ngIf="demandesEnvoyees.length" class="badge bg-success rounded-pill ms-auto" style="font-size: 11px;">
              {{ demandesEnvoyees.length }}
            </span>
          </a>
          <a *ngIf="currentUser?.est_mentor" (click)="activeTab = 'disponibilites'" class="sidebar-nav-link" [class.active]="activeTab === 'disponibilites'" style="cursor: pointer;">
            <i class="bi bi-calendar-week"></i>
            <span>Mes créneaux & Horaires</span>
            <span *ngIf="mesDispos.length" class="badge bg-secondary rounded-pill ms-auto" style="font-size: 11px;">
              {{ mesDispos.length }}
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
        <div class="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom flex-wrap gap-2">
          <div class="d-flex align-items-center gap-2">
            <h1 class="h4 fw-bold text-dark mb-0">Espace {{ viewMode === 'mentor' ? 'Mentor' : 'Mentoré' }}</h1>
            <span class="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-pill" style="font-size: 11px;">
              <i class="bi bi-circle-fill me-1" style="font-size: 6px;"></i>En ligne
            </span>
          </div>

          <div class="d-flex align-items-center gap-2">
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
              <div *ngIf="isNotifOpen" class="card shadow-lg border-0 rounded-3 position-absolute end-0 mt-2 p-2" style="width: 310px; z-index: 1050;">
                <div class="d-flex justify-content-between align-items-center px-2 py-1 border-bottom mb-2">
                  <strong class="text-dark small"><i class="bi bi-bell-fill text-primary me-1"></i>Notifications</strong>
                  <button *ngIf="unreadCount > 0" (click)="markAllRead()" class="btn btn-link btn-sm p-0 text-primary small text-decoration-none" style="font-size: 11px;">
                    Tout marquer lu
                  </button>
                </div>

                <div *ngIf="notifications.length === 0" class="text-center py-3 text-muted small">
                  Aucune notification.
                </div>

                <div style="max-height: 260px; overflow-y: auto;">
                  <div 
                    *ngFor="let notif of notifications" 
                    (click)="openNotif(notif)" 
                    class="p-2 mb-1 rounded-2 cursor-pointer border-bottom"
                    [style.background]="notif.est_lu ? '#ffffff' : '#f0f7ff'"
                    style="cursor: pointer;"
                  >
                    <div class="d-flex align-items-center gap-1 mb-1">
                      <span class="badge" [ngClass]="getNotifBadge(notif.type_notif)" style="font-size: 10px;">
                        {{ notif.type_display }}
                      </span>
                      <small class="text-muted ms-auto" style="font-size: 10.5px;">{{ notif.date_creation | date:'dd/MM HH:mm' }}</small>
                    </div>
                    <div class="fw-bold text-dark small mb-0">{{ notif.titre }}</div>
                    <small class="text-muted text-truncate d-block" style="font-size: 11.5px;">{{ notif.message }}</small>
                  </div>
                </div>
              </div>
            </div>

            <button *ngIf="currentUser?.est_mentor" (click)="activeTab = 'disponibilites'" class="btn btn-outline-primary btn-sm">
              <i class="bi bi-clock-history me-1"></i>Gérer mes disponibilités
            </button>
            <a routerLink="/mentors" class="btn btn--primary btn-sm">
              <i class="bi bi-plus-lg me-1"></i>Réserver une séance
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
                Vous avez {{ getPendingCount() }} demande(s) en attente et {{ getProchainesSessions().length }} séance(s) confirmée(s).
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
              <div class="text-muted small mb-1 fw-bold">SESSIONS CONFIRMÉES</div>
              <div class="fs-3 fw-bold text-warning">{{ countSessionsActives() }}</div>
              <small class="text-muted" style="font-size: 11.5px;">Avec lien visio activé</small>
            </div>
          </div>
        </div>

        <!-- Onglets Principaux -->
        <div class="card border-0 shadow-sm rounded-4 p-4 bg-white mb-4">
          <div class="d-flex gap-2 border-bottom mb-4 flex-wrap">
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
            <button 
              *ngIf="currentUser?.est_mentor"
              class="btn py-2 px-3 border-0 fw-bold" 
              [style.color]="activeTab === 'disponibilites' ? 'var(--blue)' : 'var(--muted)'"
              [style.border-bottom]="activeTab === 'disponibilites' ? '3px solid var(--blue)' : 'none'"
              (click)="activeTab = 'disponibilites'"
            >
              <i class="bi bi-calendar2-week-fill me-2"></i>Mes disponibilités ({{ mesDispos.length }})
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

            <div *ngFor="let demande of demandesRecues" class="card border mb-3 rounded-3 p-3 shadow-none">
              <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                <div>
                  <h6 class="fw-bold mb-1 text-dark">
                    {{ demande.mentore.user.first_name }} {{ demande.mentore.user.last_name }}
                    <span class="text-muted fw-normal small">({{ demande.mentore.filiere || 'Apprenant' }})</span>
                  </h6>
                  <span class="badge-skill me-2">{{ demande.matiere.nom }}</span>
                  <small class="text-muted">Reçue le {{ demande.date_creation | date:'dd MMM yyyy à HH:mm' }}</small>
                </div>
                <span class="badge" [ngClass]="getBadgeClass(demande.statut)">
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

              <p class="text-secondary small mb-3 p-2 bg-light rounded-2 border">
                « {{ demande.message }} »
              </p>

              <!-- Lien Visio si Acceptée -->
              <div *ngIf="demande.statut === 'ACCEPTEE' && demande.lien_visio" class="p-3 mb-3 rounded-3 bg-primary-subtle border border-primary-subtle d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-camera-video-fill text-primary fs-5"></i>
                  <div>
                    <strong class="text-primary small d-block">Lien de visioconférence généré (Jitsi Meet)</strong>
                    <span class="text-muted" style="font-size: 11.5px;">Accès direct sécurisé sans installation</span>
                  </div>
                </div>
                <a [href]="demande.lien_visio" target="_blank" class="btn btn-sm btn-primary px-3">
                  <i class="bi bi-box-arrow-up-right me-1"></i>Rejoindre la visio
                </a>
              </div>

              <div *ngIf="demande.statut === 'EN_ATTENTE'" class="d-flex gap-2 justify-content-end">
                <button (click)="handleAction(demande.id, 'accepter')" class="btn btn-sm btn-success px-3">
                  <i class="bi bi-check-lg me-1"></i>Confirmer & Créer la visio
                </button>
                <button (click)="handleAction(demande.id, 'refuser')" class="btn btn-sm btn-outline-danger px-3">
                  <i class="bi bi-x-lg me-1"></i>Refuser
                </button>
              </div>

              <div *ngIf="demande.statut === 'ACCEPTEE'" class="d-flex gap-2 justify-content-end">
                <button (click)="handleAction(demande.id, 'annuler')" class="btn btn-sm btn-outline-danger">
                  <i class="bi bi-x-circle me-1"></i>Annuler la séance
                </button>
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

            <div *ngFor="let demande of demandesEnvoyees" class="card border mb-3 rounded-3 p-3 shadow-none">
              <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                <div>
                  <h6 class="fw-bold mb-1 text-dark">
                    Mentor : {{ demande.mentor.user.first_name }} {{ demande.mentor.user.last_name }}
                  </h6>
                  <span class="badge-skill me-2">{{ demande.matiere.nom }}</span>
                  <small class="text-muted">Envoyée le {{ demande.date_creation | date:'dd MMM yyyy à HH:mm' }}</small>
                </div>
                <span class="badge" [ngClass]="getBadgeClass(demande.statut)">
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

              <p class="text-secondary small mb-3 p-2 bg-light rounded-2 border">
                « {{ demande.message }} »
              </p>

              <!-- Lien Visio si Confirmée -->
              <div *ngIf="demande.statut === 'ACCEPTEE' && demande.lien_visio" class="p-3 mb-2 rounded-3 bg-success-subtle border border-success-subtle d-flex align-items-center justify-content-between flex-wrap gap-2">
                <div class="d-flex align-items-center gap-2">
                  <i class="bi bi-camera-video-fill text-success fs-5"></i>
                  <div>
                    <strong class="text-success small d-block">Votre séance est validée !</strong>
                    <span class="text-muted" style="font-size: 11.5px;">Rejoignez la salle de visioconférence à l'heure convenue</span>
                  </div>
                </div>
                <a [href]="demande.lien_visio" target="_blank" class="btn btn-sm btn-success px-3">
                  <i class="bi bi-box-arrow-up-right me-1"></i>Rejoindre la visio
                </a>
              </div>

              <div *ngIf="demande.statut === 'ACCEPTEE'" class="d-flex justify-content-end">
                <button (click)="handleAction(demande.id, 'annuler')" class="btn btn-sm btn-outline-danger">
                  <i class="bi bi-x-circle me-1"></i>Annuler ma réservation
                </button>
              </div>
            </div>
          </div>

          <!-- GESTION DES DISPONIBILITÉS (MENTOR) -->
          <div *ngIf="!loading && activeTab === 'disponibilites'">
            <div class="mb-4">
              <h5 class="fw-bold text-dark mb-1">
                <i class="bi bi-clock-history text-primary me-2"></i>Mes créneaux de disponibilité
              </h5>
              <p class="text-muted small">
                Définissez les plages horaires régulières où vous êtes disponible pour accompagner les étudiants.
              </p>
            </div>

            <!-- Formulaire d'ajout rapide de créneau -->
            <div class="card p-3 mb-4 bg-light border rounded-3">
              <h6 class="fw-bold text-dark mb-2">Ajouter un créneau hebdomadaire</h6>
              <form (ngSubmit)="ajouterDisponibilite()" class="row g-2 align-items-end">
                <div class="col-12 col-sm-4">
                  <label class="small text-muted fw-bold mb-1">Jour de la semaine *</label>
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
                  <label class="small text-muted fw-bold mb-1">Heure début *</label>
                  <input type="time" [(ngModel)]="newDebut" name="newDebut" class="form-control form-control-sm" required>
                </div>
                <div class="col-6 col-sm-3">
                  <label class="small text-muted fw-bold mb-1">Heure fin *</label>
                  <input type="time" [(ngModel)]="newFin" name="newFin" class="form-control form-control-sm" required>
                </div>
                <div class="col-12 col-sm-2">
                  <button type="submit" class="btn btn-sm btn-primary w-100">
                    <i class="bi bi-plus-lg me-1"></i>Ajouter
                  </button>
                </div>
              </form>
            </div>

            <!-- Liste des créneaux existants -->
            <div *ngIf="mesDispos.length === 0" class="text-center py-4 text-muted border rounded-3 bg-white">
              <i class="bi bi-calendar-x fs-1 text-secondary opacity-50 mb-2 d-block"></i>
              <p class="mb-0">Vous n'avez pas encore configuré de créneau de disponibilité.</p>
            </div>

            <div *ngIf="mesDispos.length > 0" class="table-responsive">
              <table class="table table-hover align-middle border rounded-3 overflow-hidden bg-white">
                <thead class="table-light">
                  <tr style="font-size: 12.5px;">
                    <th>Jour</th>
                    <th>Plage Horaire</th>
                    <th>Statut</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let d of mesDispos">
                    <td class="fw-bold text-dark">{{ d.jour_display }}</td>
                    <td>
                      <span class="badge bg-light text-dark border">
                        {{ d.heure_debut }} - {{ d.heure_fin }}
                      </span>
                    </td>
                    <td>
                      <span class="badge bg-success-subtle text-success">Actif</span>
                    </td>
                    <td class="text-end">
                      <button (click)="supprimerDisponibilite(d.id)" class="btn btn-sm btn-outline-danger p-1 px-2" title="Supprimer ce créneau">
                        <i class="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

        </div>
      </main>

      <!-- 3. VOLET LATÉRAL DROIT : CALENDRIER & SESSIONS RÉELLES -->
      <aside class="dashboard-right">
        <!-- Mini Calendrier -->
        <div class="calendar-widget">
          <div class="calendar-header">
            <span>{{ currentMonthYear }}</span>
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
                 [class.today]="d.day === todayDay"
                 [class.has-event]="d.hasEvent">
              {{ d.day }}
            </div>
          </div>
        </div>

        <!-- Prochaines Sessions en Direct -->
        <h6 class="fw-bold text-dark mb-3">
          <i class="bi bi-camera-video me-1 text-primary"></i>Sessions confirmées
        </h6>

        <div *ngIf="getProchainesSessions().length === 0" class="card border rounded-3 p-3 bg-light text-center text-muted small">
          <i class="bi bi-calendar2-check fs-4 text-secondary mb-1 d-block opacity-50"></i>
          Aucune session confirmée pour le moment.
        </div>

        <div *ngFor="let seance of getProchainesSessions()" class="card border rounded-3 p-3 mb-2 bg-white shadow-sm">
          <div class="d-flex align-items-center gap-2 mb-1">
            <i class="bi" [ngClass]="seance.matiere.icone || 'bi-journal-code'" style="color: var(--blue);"></i>
            <strong style="font-size: 13px;">{{ seance.matiere.nom }}</strong>
          </div>
          <p class="text-muted small mb-1">
            <i class="bi bi-clock me-1"></i>
            {{ seance.date_heure_souhaitee ? (seance.date_heure_souhaitee | date:'dd MMM à HH:mm') : 'Horaire à convenir' }}
          </p>
          <p class="text-dark small mb-2">
            Avec : <strong>{{ viewMode === 'mentor' ? seance.mentore.user.first_name : seance.mentor.user.first_name }}</strong>
          </p>
          <a *ngIf="seance.lien_visio" [href]="seance.lien_visio" target="_blank" class="btn btn-sm btn-primary w-100" style="font-size: 12px;">
            <i class="bi bi-camera-video-fill me-1"></i>Rejoindre Visio (Jitsi)
          </a>
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
  mesDispos: DisponibiliteMentor[] = [];

  activeTab: 'recues' | 'envoyees' | 'disponibilites' = 'recues';
  viewMode: 'mentor' | 'mentore' = 'mentor';
  loading = true;
  actionMessage = '';

  // Formulaire nouveau créneau
  newJour: number = 1;
  newDebut: string = '18:00';
  newFin: string = '19:30';

  todayDay: number = new Date().getDate();
  currentMonthYear: string = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  // Calendrier dynamique
  calendarDays = [
    { day: 28 }, { day: 29 }, { day: 30 }, { day: 1 }, { day: 2 }, { day: 3 }, { day: 4 },
    { day: 5 }, { day: 6 }, { day: 7 }, { day: 8 }, { day: 9 }, { day: 10 }, { day: 11 },
    { day: 12 }, { day: 13 }, { day: 14 }, { day: 15 }, { day: 16 }, { day: 17, hasEvent: true }, { day: 18 },
    { day: 19 }, { day: 20 }, { day: 21 }, { day: 22 }, { day: 23 }, { day: 24 }, { day: 25 },
    { day: 26 }, { day: 27 }, { day: 28 }, { day: 29 }, { day: 30 }, { day: 31 }, { day: 1 }
  ];

  notifications: Notification[] = [];
  unreadCount = 0;
  isNotifOpen = false;

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    if (this.currentUser?.role === 'MENTORE') {
      this.viewMode = 'mentore';
      this.activeTab = 'envoyees';
    }
    this.loadDemandes();
    this.loadNotifications();
    if (this.currentUser?.est_mentor) {
      this.loadMesDispos();
    }
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
      default: return 'bg-primary-subtle text-primary';
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
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/connexion']);
    });
  }
}
