import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MentorshipService } from '../../services/mentorship.service';
import { Notification } from '../../models/models';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="navbar">
      <div class="container navbar__inner">
        <!-- Logo Emblem Figma Force Mentor -->
        <a routerLink="/" (click)="isMenuOpen = false" class="logo-brand" aria-label="Force Mentor">
          <img src="/logo_force_mentor.svg" width="58" height="42" alt="Force Mentor" class="logo-brand__icon logo-brand__icon--navbar">
        </a>

        <!-- Bouton Burger Mobile -->
        <button 
          class="navbar__toggle d-lg-none" 
          (click)="isMenuOpen = !isMenuOpen" 
          type="button" 
          aria-label="Menu de navigation"
          [attr.aria-expanded]="isMenuOpen"
        >
          <i class="bi" [ngClass]="isMenuOpen ? 'bi-x-lg' : 'bi-list'"></i>
        </button>

        <!-- Liens de navigation (Desktop & Mobile Drawer) -->
        <nav class="navbar__links" [class.navbar__links--open]="isMenuOpen">
          <a routerLink="/mentors" routerLinkActive="active" (click)="isMenuOpen = false">Trouver un mentor</a>
          <a routerLink="/comment-ca-marche" routerLinkActive="active" (click)="isMenuOpen = false">Comment ça marche</a>
          <a routerLink="/temoignages" routerLinkActive="active" (click)="isMenuOpen = false">Témoignages</a>
          <a routerLink="/faq" routerLinkActive="active" (click)="isMenuOpen = false">FAQs</a>
          <ng-container *ngIf="authService.currentUser$ | async as user">
            <a routerLink="/tableau-de-bord" routerLinkActive="active" (click)="isMenuOpen = false">Tableau de bord</a>
          </ng-container>

          <!-- Actions Auth Mobile -->
          <div class="navbar__actions-mobile d-lg-none pt-3 mt-2 border-top">
            <ng-container *ngIf="authService.currentUser$ | async as user; else mobileGuestActions">
              <a routerLink="/profil" (click)="isMenuOpen = false" class="btn btn--outline w-100 mb-2 justify-content-center">
                <img *ngIf="user.photo_url" [src]="user.photo_url" alt="Avatar" class="rounded-circle object-fit-cover me-2" style="width: 24px; height: 24px;">
                <i *ngIf="!user.photo_url" class="bi bi-person-fill me-1"></i>
                <span>{{ user.user.first_name || user.user.username }} (Mon profil)</span>
              </a>
              <button (click)="logout(); isMenuOpen = false" class="btn btn--primary w-100 justify-content-center" style="border:none;">
                <i class="bi bi-box-arrow-right me-1"></i>Déconnexion
              </button>
            </ng-container>

            <ng-template #mobileGuestActions>
              <a routerLink="/connexion" (click)="isMenuOpen = false" class="btn btn--outline w-100 mb-2 justify-content-center">Se connecter</a>
              <a routerLink="/inscription" (click)="isMenuOpen = false" class="btn btn--primary w-100 justify-content-center">S'inscrire</a>
            </ng-template>
          </div>
        </nav>

        <!-- Actions Desktop -->
        <div class="navbar__actions d-none d-lg-flex align-items-center gap-2">
          <ng-container *ngIf="authService.currentUser$ | async as user; else guestActions">
            
            <!-- Cloche Notifications -->
            <div class="position-relative me-1">
              <button 
                type="button" 
                (click)="toggleNotifications()" 
                class="btn btn-light position-relative p-0 rounded-circle d-flex align-items-center justify-content-center border" 
                style="width: 38px; height: 38px;"
                title="Notifications"
              >
                <i class="bi bi-bell text-secondary fs-5"></i>
                <span *ngIf="unreadCount > 0" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 10px;">
                  {{ unreadCount }}
                </span>
              </button>

              <!-- Dropdown Notifications -->
              <div *ngIf="isNotifOpen" class="card shadow-lg border-0 rounded-3 position-absolute end-0 mt-2 p-2" style="width: 320px; z-index: 1050;">
                <div class="d-flex justify-content-between align-items-center px-2 py-1 border-bottom mb-2">
                  <strong class="text-dark small"><i class="bi bi-bell-fill text-primary me-1"></i>Notifications</strong>
                  <button *ngIf="unreadCount > 0" (click)="markAllRead()" class="btn btn-link btn-sm p-0 text-primary small text-decoration-none" style="font-size: 11px;">
                    Tout marquer lu
                  </button>
                </div>

                <div *ngIf="notifications.length === 0" class="text-center py-3 text-muted small">
                  Aucune notification.
                </div>

                <div style="max-height: 280px; overflow-y: auto;">
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

                <div class="pt-2 text-center border-top mt-1">
                  <a routerLink="/tableau-de-bord" (click)="isNotifOpen = false" class="small text-primary fw-bold text-decoration-none">
                    Voir toutes les séances & notifications &rarr;
                  </a>
                </div>
              </div>
            </div>

            <!-- Bouton Profil -->
            <a routerLink="/profil" class="btn btn--outline" style="padding: 7px 14px; gap: 8px;">
              <img *ngIf="user.photo_url" [src]="user.photo_url" alt="Avatar" class="rounded-circle object-fit-cover" style="width: 22px; height: 22px;">
              <i *ngIf="!user.photo_url" class="bi bi-person-circle"></i>
              <span>{{ user.user.first_name || user.user.username }}</span>
            </a>

            <!-- Bouton Déconnexion -->
            <button (click)="logout()" class="btn btn--outline" style="border-color: #e2e8f0; color: #64748b; padding: 7px 12px;" title="Se déconnecter">
              <i class="bi bi-box-arrow-right"></i>
            </button>
          </ng-container>

          <ng-template #guestActions>
            <a routerLink="/connexion" class="btn btn--outline">Se connecter</a>
            <a routerLink="/inscription" class="btn btn--primary">S'inscrire</a>
          </ng-template>
        </div>
      </div>
    </header>
  `
})
export class NavbarComponent implements OnInit {
  authService = inject(AuthService);
  private mentorshipService = inject(MentorshipService);
  private router = inject(Router);

  isMenuOpen = false;
  isNotifOpen = false;
  notifications: Notification[] = [];
  unreadCount = 0;

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.loadNotifications();
      } else {
        this.notifications = [];
        this.unreadCount = 0;
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
      default: return 'bg-primary-subtle text-primary';
    }
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/connexion']);
    });
  }
}
