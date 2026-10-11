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
        <a routerLink="/" class="d-flex align-items-center">
          <img src="/Logo_Force_Mentor.png" alt="Force Mentor" height="36" style="max-height: 36px; width: auto; display: block;">
        </a>

        <!-- Liens de navigation A1 -->
        <nav class="navbar__links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Accueil</a>
          <a routerLink="/mentors" routerLinkActive="active">Mentors</a>
          <ng-container *ngIf="authService.currentUser$ | async as user">
            <a routerLink="/tableau-de-bord" routerLinkActive="active">Tableau de bord</a>
            <a routerLink="/profil" routerLinkActive="active">Mon profil</a>
          </ng-container>
        </nav>

        <!-- Actions / Authentification A1 -->
        <div class="navbar__actions">
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

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/connexion']);
    });
  }
}
