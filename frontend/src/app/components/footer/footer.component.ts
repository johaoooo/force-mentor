import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="footer-custom">
      <div class="container-custom">
        <div class="footer-inner">
          <div>
            <div class="p-2 px-3 rounded-3 mb-3 d-inline-block" style="background: rgba(255, 255, 255, 0.95);">
              <img src="/Logo_Force_Mentor.png" alt="Force Mentor" height="32" style="max-height: 32px; width: auto; display: block;">
            </div>
            <p style="color: rgba(255, 255, 255, 0.7); font-size: 13.5px; max-width: 480px; line-height: 1.6;">
              Plateforme d'accompagnement académique et d'entraide pour les apprenants du programme <strong>FORCE-N</strong>, porté par l'Université numérique Cheikh Hamidou Kane (UN-CHK) et la Fondation Mastercard.
            </p>
          </div>
          <div class="d-flex flex-wrap gap-4 justify-content-md-end">
            <div>
              <strong class="d-block mb-2 text-white" style="font-size: 14px;">Navigation</strong>
              <div class="d-flex flex-column gap-1" style="font-size: 13px; color: rgba(255,255,255,0.7);">
                <a routerLink="/">Accueil</a>
                <a routerLink="/mentors">Annuaire des mentors</a>
                <a routerLink="/tableau-de-bord">Tableau de bord</a>
                <a routerLink="/profil">Mon profil</a>
              </div>
            </div>
            <div>
              <strong class="d-block mb-2 text-white" style="font-size: 14px;">Compte</strong>
              <div class="d-flex flex-column gap-1" style="font-size: 13px; color: rgba(255,255,255,0.7);">
                <a routerLink="/connexion">Connexion</a>
                <a routerLink="/inscription">Inscription</a>
                <a href="https://force-n.sn" target="_blank" rel="noopener">Programme Force-N</a>
              </div>
            </div>
          </div>
        </div>
        <div class="text-center pt-3" style="font-size: 12.5px; color: rgba(255, 255, 255, 0.5);">
          &copy; 2026 Force Mentor &bull; Programme Force-N &bull; Tous droits réservés.
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
