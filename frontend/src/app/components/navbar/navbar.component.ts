import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="navbar-custom">
      <div class="container-custom navbar-inner">
        <!-- Logo Officiel Force Mentor -->
        <a routerLink="/" class="d-flex align-items-center gap-2 text-decoration-none">
          <img src="/Logo_Force_Mentor.png" alt="Force Mentor" height="38" style="max-height: 38px; width: auto; display: block;">
        </a>

        <!-- Liens de navigation -->
        <nav class="nav-links-custom d-none d-md-flex">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Accueil</a>
          <a routerLink="/mentors" routerLinkActive="active">Annuaire des mentors</a>
          <ng-container *ngIf="authService.currentUser$ | async as user">
            <a routerLink="/tableau-de-bord" routerLinkActive="active">Tableau de bord</a>
            <a routerLink="/profil" routerLinkActive="active">Mon profil</a>
          </ng-container>
        </nav>

        <!-- Actions / Authentification -->
        <div class="d-flex align-items-center gap-2">
          <ng-container *ngIf="authService.currentUser$ | async as user; else guestActions">
            <a routerLink="/profil" class="btn-fm-outline py-1 px-3" style="font-size: 13px;">
              <i class="bi bi-person-circle"></i>
              <span>{{ user.user.first_name || user.user.username }}</span>
            </a>
            <button (click)="logout()" class="btn-fm-primary py-1 px-3" style="font-size: 13px;">
              <i class="bi bi-box-arrow-right"></i>
              <span>Déconnexion</span>
            </button>
          </ng-container>

          <ng-template #guestActions>
            <a routerLink="/connexion" class="btn-fm-outline py-1 px-3" style="font-size: 13px;">Se connecter</a>
            <a routerLink="/inscription" class="btn-fm-primary py-1 px-3" style="font-size: 13px;">S'inscrire</a>
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
