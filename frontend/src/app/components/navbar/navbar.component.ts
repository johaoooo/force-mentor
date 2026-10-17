import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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
        <div class="navbar__actions d-none d-lg-flex">
          <ng-container *ngIf="authService.currentUser$ | async as user; else guestActions">
            <a routerLink="/profil" class="btn btn--outline" style="padding: 7px 14px; gap: 8px;">
              <img *ngIf="user.photo_url" [src]="user.photo_url" alt="Avatar" class="rounded-circle object-fit-cover" style="width: 22px; height: 22px;">
              <i *ngIf="!user.photo_url" class="bi bi-person-circle"></i>
              <span>{{ user.user.first_name || user.user.username }}</span>
            </a>
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
export class NavbarComponent {
  authService = inject(AuthService);
  private router = inject(Router);
  isMenuOpen = false;

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/connexion']);
    });
  }
}
