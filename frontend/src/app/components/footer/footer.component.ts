import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer">
      <div class="container footer__inner">
        <div class="footer__col">
          <a routerLink="/" class="logo-brand logo-brand--footer" aria-label="Force Mentor">
            <img src="/logo_force_mentor_white.svg" width="58" height="42" alt="Force Mentor" class="logo-brand__icon">
          </a>
          <p class="footer__desc">
            Plateforme d'accompagnement et d'entraide académique pour les apprenants du programme Force-N. Trouvez un mentor certifié en quelques clics.
          </p>
          <div class="footer__socials mt-3">
            <a href="#" aria-label="LinkedIn"><i class="bi bi-linkedin"></i></a>
            <a href="#" aria-label="Twitter / X"><i class="bi bi-twitter-x"></i></a>
            <a href="#" aria-label="TikTok"><i class="bi bi-tiktok"></i></a>
            <a href="#" aria-label="GitHub"><i class="bi bi-github"></i></a>
          </div>
        </div>
        <div class="footer__links">
          <div>
            <strong>Plateforme</strong>
            <a routerLink="/">Accueil</a>
            <a routerLink="/mentors">Trouver un mentor</a>
            <a routerLink="/comment-ca-marche">Comment ça marche</a>
            <a routerLink="/temoignages">Témoignages</a>
            <a routerLink="/faq">FAQs</a>
          </div>
          <div>
            <strong>Espace Compte</strong>
            <a routerLink="/tableau-de-bord">Tableau de bord</a>
            <a routerLink="/profil">Mon profil</a>
            <a routerLink="/connexion">Connexion</a>
            <a routerLink="/inscription">Créer un compte</a>
          </div>
        </div>
      </div>
      <div class="footer__bottom">
        <div class="container">
          <p>&copy; 2026 Force Mentor &bull; Programme Force-N &bull; Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
