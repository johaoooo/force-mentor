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
        <!-- Logo Officiel Force Mentor -->
        <a routerLink="/" (click)="isMenuOpen = false" class="d-flex align-items-center me-auto me-lg-0">
          <img src="/Logo_Force_Mentor.png" alt="Force Mentor" height="36" style="max-height: 36px; width: auto; display: block;">
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
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="isMenuOpen = false">Accueil</a>
          <a routerLink="/mentors" routerLinkActive="active" (click)="isMenuOpen = false">Mentors</a>
          <ng-container *ngIf="authService.currentUser$ | async as user">
            <a routerLink="/tableau-de-bord" routerLinkActive="active" (click)="isMenuOpen = false">Tableau de bord</a>
            <a routerLink="/profil" routerLinkActive="active" (click)="isMenuOpen = false">Mon profil</a>
          </ng-container>

          <!-- Actions Auth Mobile (visibles uniquement dans le tiroir mobile) -->
          <div class="navbar__actions-mobile d-lg-none pt-3 mt-2 border-top">
            <ng-container *ngIf="authService.currentUser$ | async as user; else mobileGuestActions">
              <a routerLink="/profil" (click)="isMenuOpen = false" class="btn btn--outline w-100 mb-2 justify-content-center">
                <i class="bi bi-person-fill"></i>
                <span>{{ user.user.first_name || user.user.username }}</span>
              </a>
              <button (click)="logout(); isMenuOpen = false" class="btn btn--primary w-100 justify-content-center" style="border:none;">
                Déconnexion
              </button>
            </ng-container>

            <ng-template #mobileGuestActions>
              <a routerLink="/connexion" (click)="isMenuOpen = false" class="btn btn--outline w-100 mb-2 justify-content-center">Se connecter</a>
              <a routerLink="/inscription" (click)="isMenuOpen = false" class="btn btn--primary w-100 justify-content-center">S'inscrire</a>
            </ng-template>
          </div>
        </nav>

        <!-- Actions / Authentification Desktop -->
        <div class="navbar__actions d-none d-lg-flex">
          <ng-container *ngIf="authService.currentUser$ | async as user; else guestActions">
            <a routerLink="/profil" class="btn btn--outline">
              <i class="bi bi-person-fill"></i>
              <span>{{ user.user.first_name || user.user.username }}</span>
            </a>
            <button (click)="logout()" class="btn btn--primary" style="border:none;">
              Déconnexion
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
