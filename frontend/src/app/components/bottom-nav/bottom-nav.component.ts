import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MentorshipService } from '../../services/mentorship.service';
import { Profile } from '../../models/models';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="mobile-bottom-nav" *ngIf="!isAuthPage">
      <div class="bottom-nav-container">
        
        <!-- 1. Accueil -->
        <a 
          routerLink="/" 
          routerLinkActive="active" 
          [routerLinkActiveOptions]="{ exact: true }" 
          class="bottom-nav-item"
        >
          <div class="bottom-nav-icon-wrapper">
            <i class="bi bi-house-door icon-inactive"></i>
            <i class="bi bi-house-door-fill icon-active"></i>
          </div>
          <span class="bottom-nav-label">Accueil</span>
        </a>

        <!-- 2. Mentors (Réseau) -->
        <a 
          routerLink="/mentors" 
          routerLinkActive="active" 
          class="bottom-nav-item"
        >
          <div class="bottom-nav-icon-wrapper">
            <i class="bi bi-people icon-inactive"></i>
            <i class="bi bi-people-fill icon-active"></i>
          </div>
          <span class="bottom-nav-label">Mentors</span>
        </a>

        <!-- 3. Messages -->
        <a 
          [routerLink]="currentUser ? '/messages' : '/connexion'" 
          routerLinkActive="active" 
          class="bottom-nav-item"
        >
          <div class="bottom-nav-icon-wrapper">
            <i class="bi bi-chat-dots icon-inactive"></i>
            <i class="bi bi-chat-dots-fill icon-active"></i>
          </div>
          <span class="bottom-nav-label">Messages</span>
        </a>

        <!-- 4. Tableau de bord (avec pastille rouge de notifications/séances) -->
        <a 
          [routerLink]="currentUser ? '/tableau-de-bord' : '/connexion'" 
          routerLinkActive="active" 
          class="bottom-nav-item"
        >
          <div class="bottom-nav-icon-wrapper">
            <i class="bi bi-grid icon-inactive"></i>
            <i class="bi bi-grid-fill icon-active"></i>
            <!-- Badge Notification LinkedIn style -->
            <span *ngIf="unreadCount > 0" class="bottom-nav-badge">
              {{ unreadCount > 9 ? '9+' : unreadCount }}
            </span>
          </div>
          <span class="bottom-nav-label">Dashboard</span>
        </a>

        <!-- 5. Profil / Connexion -->
        <a 
          [routerLink]="currentUser ? '/profil' : '/connexion'" 
          routerLinkActive="active" 
          class="bottom-nav-item"
        >
          <div class="bottom-nav-icon-wrapper">
            <img 
              *ngIf="currentUser?.photo_url" 
              [src]="currentUser?.photo_url" 
              alt="Avatar" 
              class="bottom-nav-avatar"
            >
            <ng-container *ngIf="!currentUser?.photo_url">
              <i class="bi bi-person icon-inactive"></i>
              <i class="bi bi-person-fill icon-active"></i>
            </ng-container>
          </div>
          <span class="bottom-nav-label">{{ currentUser ? 'Profil' : 'Connexion' }}</span>
        </a>

      </div>
    </nav>
  `,
  styles: [`
    /* Affichage strict sur mobile uniquement (<= 768px) */
    .mobile-bottom-nav {
      display: none;
    }

    @media (max-width: 768px) {
      .mobile-bottom-nav {
        display: block;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 1040;
        background: #ffffff;
        border-top: 1px solid rgba(0, 0, 0, 0.08);
        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
        padding-bottom: env(safe-area-inset-bottom, 0px);
        transform: translateZ(0);
      }

      .bottom-nav-container {
        display: flex;
        justify-content: space-around;
        align-items: stretch;
        height: 56px;
        max-width: 100%;
        margin: 0 auto;
        padding: 0 4px;
      }

      .bottom-nav-item {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 4px 2px 2px 2px;
        color: #64748b;
        text-decoration: none;
        position: relative;
        transition: color 0.15s ease, transform 0.1s ease;
        -webkit-tap-highlight-color: transparent;
      }

      .bottom-nav-item:active {
        transform: scale(0.96);
      }

      .bottom-nav-icon-wrapper {
        position: relative;
        font-size: 20px;
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 2px;
      }

      .bottom-nav-label {
        font-size: 10.5px;
        font-weight: 500;
        line-height: 1.1;
        letter-spacing: -0.2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
        color: inherit;
      }

      .bottom-nav-avatar {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        object-fit: cover;
        border: 1.5px solid #cbd5e1;
      }

      /* Pastille rouge de notification style LinkedIn */
      .bottom-nav-badge {
        position: absolute;
        top: -5px;
        right: -8px;
        background-color: #dc2626;
        color: #ffffff;
        font-size: 9.5px;
        font-weight: 700;
        min-width: 16px;
        height: 16px;
        padding: 0 3px;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #ffffff;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        animation: badgePulse 2s infinite ease-in-out;
      }

      @keyframes badgePulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.08); }
      }

      .bottom-nav-item .icon-active {
        display: none;
      }

      .bottom-nav-item .icon-inactive {
        display: inline-flex;
      }

      .bottom-nav-item.active .icon-active {
        display: inline-flex;
      }

      .bottom-nav-item.active .icon-inactive {
        display: none;
      }

      /* État actif style LinkedIn (liseré supérieur bord-à-bord + couleur sombre/accent) */
      .bottom-nav-item.active {
        color: #0f1b3d;
      }

      .bottom-nav-item.active::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2.5px;
        background-color: #0f1b3d;
      }

      .bottom-nav-item.active .bottom-nav-label {
        font-weight: 700;
        color: #0f1b3d;
      }

      .bottom-nav-item.active .bottom-nav-avatar {
        border-color: #0f1b3d;
      }
    }
  `]
})
export class BottomNavComponent implements OnInit {
  authService = inject(AuthService);
  private mentorshipService = inject(MentorshipService);
  private router = inject(Router);

  currentUser: Profile | null = null;
  unreadCount = 0;

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.loadUnreadCount();
      } else {
        this.unreadCount = 0;
      }
    });
  }

  loadUnreadCount(): void {
    this.mentorshipService.getNotifications().subscribe({
      next: (res) => {
        this.unreadCount = res.unread_count || 0;
      },
      error: () => {}
    });
  }

  get isAuthPage(): boolean {
    const url = this.router.url;
    return url.includes('/connexion') || url.includes('/inscription');
  }
}
