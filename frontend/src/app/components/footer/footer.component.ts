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
          <a routerLink="/" style="display: inline-block; background: rgba(255,255,255,0.95); padding: 6px 12px; border-radius: 8px;">
            <img src="/Logo_Force_Mentor.png" alt="Force Mentor" height="32" style="max-height: 32px; width: auto; display: block;">
          </a>
          <p class="footer__desc">
            Plateforme d'accompagnement et d'entraide académique pour les apprenants du programme Force-N. Trouvez un mentor en quelques clics.
          </p>
        </div>
        <div class="footer__links">
          <div>
            <strong>Plateforme</strong>
            <a routerLink="/">Accueil</a>
            <a routerLink="/mentors">Annuaire des mentors</a>
            <a routerLink="/tableau-de-bord">Tableau de bord</a>
            <a routerLink="/profil">Mon profil</a>
          </div>
          <div>
            <strong>Espace Compte</strong>
            <a routerLink="/connexion">Connexion</a>
            <a routerLink="/inscription">Inscription</a>
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
