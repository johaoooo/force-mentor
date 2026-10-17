import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MentorshipService } from '../../services/mentorship.service';
import { AuthService } from '../../services/auth.service';
import { Conversation, ChatMessage, Profile } from '../../models/models';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="chat-page-wrapper">
      <div class="container-fluid chat-container px-2 px-md-4 py-3">
        
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden chat-card">
          <div class="row g-0 h-100">
            
            <!-- 1. COLONNE GAUCHE : LISTE DES CONVERSATIONS -->
            <div 
              class="col-12 col-md-4 border-end chat-sidebar"
              [class.d-none]="activeConversation && isMobileView"
              [class.d-flex]="!activeConversation || !isMobileView"
            >
              <!-- En-tête de la liste -->
              <div class="p-3 border-bottom d-flex justify-content-between align-items-center bg-white">
                <div>
                  <h1 class="h5 fw-bold text-dark mb-0">
                    <i class="bi bi-chat-dots-fill text-primary me-2"></i>Messagerie
                  </h1>
                  <small class="text-muted">{{ conversations.length }} discussion(s)</small>
                </div>
                <a routerLink="/tableau-de-bord" class="btn btn-sm btn-outline-secondary" title="Retour au tableau de bord">
                  <i class="bi bi-arrow-left"></i>
                </a>
              </div>

              <!-- Filtre de recherche -->
              <div class="p-2 border-bottom bg-light">
                <div class="input-group input-group-sm">
                  <span class="input-group-text bg-white border-end-0">
                    <i class="bi bi-search text-muted"></i>
                  </span>
                  <input 
                    type="text" 
                    [(ngModel)]="searchQuery" 
                    placeholder="Filtrer les contacts..." 
                    class="form-control border-start-0"
                  >
                </div>
              </div>

              <!-- Liste scrollable des conversations -->
              <div class="chat-conv-list flex-grow-1 overflow-auto">
                <div *ngIf="loadingConvs" class="text-center py-4">
                  <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                </div>

                <div *ngIf="!loadingConvs && filteredConversations().length === 0" class="text-center py-5 text-muted px-3">
                  <i class="bi bi-chat-square-text fs-1 opacity-50 mb-2 d-block"></i>
                  <p class="small mb-1 fw-bold">Aucune conversation</p>
                  <small>Contactez un mentor ou attendez un message d'un étudiant.</small>
                </div>

                <div 
                  *ngFor="let conv of filteredConversations()" 
                  (click)="selectConversation(conv)"
                  class="chat-conv-item p-3 border-bottom cursor-pointer d-flex align-items-center gap-3"
                  [class.active]="activeConversation?.id === conv.id"
                  style="cursor: pointer; transition: background 0.15s ease;"
                >
                  <!-- Avatar -->
                  <div class="position-relative">
                    <img 
                      *ngIf="conv.autre_participant?.photo_url" 
                      [src]="conv.autre_participant.photo_url" 
                      alt="Avatar" 
                      class="rounded-circle object-fit-cover" 
                      style="width: 44px; height: 44px;"
                    >
                    <div 
                      *ngIf="!conv.autre_participant?.photo_url" 
                      class="avatar-initials" 
                      style="width: 44px; height: 44px; font-size: 15px;"
                    >
                      {{ getInitials(conv.autre_participant) }}
                    </div>
                  </div>

                  <!-- Texte & Dernier Message -->
                  <div class="flex-grow-1 overflow-hidden">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                      <strong class="text-dark small text-truncate">
                        {{ getParticipantName(conv) }}
                      </strong>
                      <small class="text-muted" style="font-size: 11px;">
                        {{ conv.date_mise_a_jour | date:'HH:mm' }}
                      </small>
                    </div>

                    <div class="d-flex justify-content-between align-items-center">
                      <p class="text-muted small text-truncate mb-0" style="font-size: 12px;">
                        {{ conv.dernier_message?.contenu || 'Nouvelle discussion' }}
                      </p>
                      <span *ngIf="conv.nb_non_lus > 0" class="badge rounded-pill bg-danger ms-1" style="font-size: 10px;">
                        {{ conv.nb_non_lus }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <!-- 2. COLONNE DROITE : FIL DE DISCUSSION -->
            <div 
              class="col-12 col-md-8 chat-main d-flex flex-column"
              [class.d-none]="!activeConversation && isMobileView"
            >
              <!-- État : Aucune conversation sélectionnée -->
              <div *ngIf="!activeConversation" class="h-100 d-flex flex-column align-items-center justify-content-center text-center p-4 bg-light">
                <div class="p-4 rounded-circle bg-white shadow-sm mb-3">
                  <i class="bi bi-chat-left-dots text-primary fs-1"></i>
                </div>
                <h2 class="h5 fw-bold text-dark mb-1">Vos messages Force Mentor</h2>
                <p class="text-muted small" style="max-width: 360px;">
                  Échangez directement avec vos pairs et vos mentors en toute sécurité sans quitter la plateforme.
                </p>
                <a routerLink="/mentors" class="btn btn-sm btn-primary">
                  <i class="bi bi-search me-1"></i>Trouver un mentor à contacter
                </a>
              </div>

              <!-- État : Conversation active -->
              <ng-container *ngIf="activeConversation">
                
                <!-- En-tête de la discussion active -->
                <div class="p-3 border-bottom bg-white d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center gap-3" *ngIf="activeConversation.autre_participant as autre">
                    <!-- Bouton retour mobile -->
                    <button 
                      type="button" 
                      class="btn btn-sm btn-light border d-md-none p-1 px-2"
                      (click)="activeConversation = null"
                    >
                      <i class="bi bi-chevron-left"></i>
                    </button>

                    <img 
                      *ngIf="autre.photo_url" 
                      [src]="autre.photo_url" 
                      alt="Avatar" 
                      class="rounded-circle object-fit-cover shadow-sm" 
                      style="width: 42px; height: 42px;"
                    >
                    <div 
                      *ngIf="!autre.photo_url" 
                      class="avatar-initials shadow-sm" 
                      style="width: 42px; height: 42px; font-size: 15px;"
                    >
                      {{ getInitials(autre) }}
                    </div>

                    <div>
                      <h2 class="fw-bold fs-6 text-dark mb-0">
                        {{ autre.user.first_name }} {{ autre.user.last_name }}
                      </h2>
                      <small class="text-muted" style="font-size: 11.5px;">
                        {{ autre.filiere || 'Force-N' }} &bull; {{ autre.role_display }}
                      </small>
                    </div>
                  </div>

                  <div class="d-flex align-items-center gap-2" *ngIf="activeConversation.autre_participant as autre">
                    <a [routerLink]="['/mentor', autre.id]" class="btn btn-sm btn-outline-primary" style="font-size: 12px;">
                      <i class="bi bi-person me-1"></i>Profil
                    </a>
                  </div>
                </div>

                <!-- Zone de messages scrollable -->
                <div #scrollContainer class="chat-messages-body flex-grow-1 p-3 overflow-auto" style="background: #f8fafc;">
                  <div *ngIf="loadingMessages" class="text-center py-4">
                    <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                  </div>

                  <div *ngIf="!loadingMessages && messages.length === 0" class="text-center py-4 text-muted small">
                    <i class="bi bi-chat-quote fs-3 d-block opacity-50 mb-1"></i>
                    Démarrez votre échange ! Envoyez un premier message ci-dessous.
                  </div>

                  <div *ngFor="let msg of messages" class="mb-3 d-flex" [ngClass]="isMyMessage(msg) ? 'justify-content-end' : 'justify-content-start'">
                    
                    <div class="message-bubble-wrapper" style="max-width: 75%;">
                      <!-- Bulle de message -->
                      <div 
                        class="p-3 rounded-4 shadow-sm"
                        [ngClass]="isMyMessage(msg) ? 'bg-primary text-white rounded-bottom-end-0' : 'bg-white text-dark rounded-bottom-start-0 border'"
                        style="font-size: 13.5px; line-height: 1.5; word-break: break-word;"
                      >
                        {{ msg.contenu }}
                      </div>
                      
                      <!-- Horodatage et coche de lecture -->
                      <div 
                        class="d-flex align-items-center gap-1 mt-1 small"
                        [ngClass]="isMyMessage(msg) ? 'justify-content-end text-muted' : 'text-muted'"
                        style="font-size: 11px;"
                      >
                        <span>{{ msg.date_envoi | date:'HH:mm' }}</span>
                        <i *ngIf="isMyMessage(msg)" class="bi bi-check2-all text-primary ms-1"></i>
                      </div>
                    </div>

                  </div>
                </div>

                <!-- Barre de saisie -->
                <div class="p-3 border-top bg-white">
                  <form (ngSubmit)="sendCurrentMessage()" class="d-flex gap-2 align-items-center">
                    <input 
                      type="text" 
                      [(ngModel)]="newMessageText" 
                      name="newMessage"
                      placeholder="Écrivez votre message..." 
                      class="form-control chat-input"
                      style="font-size: 13.5px;"
                      autocomplete="off"
                      [disabled]="sending"
                    >
                    <button 
                      type="submit" 
                      [disabled]="sending || !newMessageText.trim()" 
                      class="btn btn-primary chat-send-btn d-flex align-items-center justify-content-center px-3"
                    >
                      <span *ngIf="sending" class="spinner-border spinner-border-sm"></span>
                      <i *ngIf="!sending" class="bi bi-send-fill"></i>
                    </button>
                  </form>
                </div>

              </ng-container>

            </div>

          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .chat-page-wrapper {
      background: var(--bg, #f4f7fb);
      min-height: calc(100vh - 75px);
      display: flex;
      flex-direction: column;
    }
    .chat-container {
      max-width: 1200px;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
    }
    .chat-card {
      height: 80vh;
      min-height: 520px;
    }
    .chat-sidebar {
      background: #ffffff;
      flex-direction: column;
      height: 100%;
    }
    .chat-main {
      height: 100%;
      background: #ffffff;
    }
    .chat-conv-item:hover {
      background: #f1f5f9;
    }
    .chat-conv-item.active {
      background: #eef4ff;
      border-left: 3px solid var(--blue, #0b4bc9);
    }
    .rounded-bottom-end-0 {
      border-bottom-right-radius: 4px !important;
    }
    .rounded-bottom-start-0 {
      border-bottom-left-radius: 4px !important;
    }
    .avatar-initials {
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e0edff;
      color: #0b4bc9;
      font-weight: 700;
      border-radius: 50%;
      flex-shrink: 0;
    }
  `]
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  private mentorshipService = inject(MentorshipService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  @ViewChild('scrollContainer') private scrollContainer?: ElementRef;

  currentUser: Profile | null = null;
  conversations: Conversation[] = [];
  activeConversation: Conversation | null = null;
  messages: ChatMessage[] = [];

  loadingConvs = true;
  loadingMessages = false;
  sending = false;

  newMessageText = '';
  searchQuery = '';
  isMobileView = false;
  pollingInterval: any = null;
  private shouldScroll = false;

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    this.checkMobile();
    window.addEventListener('resize', this.onResize.bind(this));

    this.loadConversations();
    this.startPolling();
  }

  ngOnDestroy(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
    }
    window.removeEventListener('resize', this.onResize.bind(this));
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  checkMobile(): void {
    this.isMobileView = window.innerWidth < 768;
  }

  onResize(): void {
    this.checkMobile();
  }

  loadConversations(): void {
    this.mentorshipService.getConversations().subscribe({
      next: (convs) => {
        this.conversations = convs || [];
        this.loadingConvs = false;

        // Vérifier si un destinataireId est passé en paramètre URL
        const destinataireId = this.route.snapshot.queryParams['destinataireId'];
        if (destinataireId) {
          this.openOrStartWithDestinataire(+destinataireId);
        } else if (!this.activeConversation && convs.length > 0 && !this.isMobileView) {
          this.selectConversation(convs[0]);
        }
      },
      error: () => {
        this.loadingConvs = false;
      }
    });
  }

  openOrStartWithDestinataire(destinataireId: number): void {
    // Vérifier si une conversation existe déjà
    const existing = this.conversations.find(c => c.autre_participant?.id === destinataireId);
    if (existing) {
      this.selectConversation(existing);
    } else {
      // Démarrer la conversation côté API
      this.mentorshipService.startConversation(destinataireId).subscribe({
        next: (newConv) => {
          this.conversations.unshift(newConv);
          this.selectConversation(newConv);
        }
      });
    }
  }

  selectConversation(conv: Conversation): void {
    this.activeConversation = conv;
    conv.nb_non_lus = 0;
    this.loadMessages(conv.id);
  }

  loadMessages(conversationId: number): void {
    this.loadingMessages = true;
    this.mentorshipService.getMessages(conversationId).subscribe({
      next: (msgs) => {
        this.messages = msgs || [];
        this.loadingMessages = false;
        this.shouldScroll = true;
      },
      error: () => {
        this.loadingMessages = false;
      }
    });
  }

  startPolling(): void {
    // Rafraîchissement automatique toutes les 4 secondes
    this.pollingInterval = setInterval(() => {
      if (this.activeConversation) {
        this.mentorshipService.getMessages(this.activeConversation.id).subscribe({
          next: (msgs) => {
            if (msgs.length !== this.messages.length) {
              this.messages = msgs;
              this.shouldScroll = true;
            }
          }
        });
      }
    }, 4000);
  }

  sendCurrentMessage(): void {
    if (!this.activeConversation || !this.newMessageText.trim()) return;

    const text = this.newMessageText.trim();
    this.newMessageText = '';
    this.sending = true;

    this.mentorshipService.sendMessage(this.activeConversation.id, text).subscribe({
      next: (msg) => {
        this.messages.push(msg);
        this.sending = false;
        this.shouldScroll = true;
        if (this.activeConversation) {
          this.activeConversation.dernier_message = {
            id: msg.id,
            contenu: msg.contenu,
            expediteur_id: msg.expediteur_id,
            est_lu: true,
            date_envoi: msg.date_envoi
          };
        }
      },
      error: () => {
        this.sending = false;
      }
    });
  }

  scrollToBottom(): void {
    if (this.scrollContainer) {
      try {
        this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
      } catch (err) {}
    }
  }

  isMyMessage(msg: ChatMessage): boolean {
    return msg.expediteur_id === this.currentUser?.id;
  }

  getParticipantName(conv: Conversation): string {
    if (!conv.autre_participant) return 'Utilisateur inconnu';
    const u = conv.autre_participant.user;
    if (!u) return 'Utilisateur';
    if (u.first_name || u.last_name) {
      return `${u.first_name || ''} ${u.last_name || ''}`.trim();
    }
    return u.username || 'Utilisateur';
  }

  getInitials(profile?: Profile): string {
    if (!profile?.user) return 'U';
    const f = profile.user.first_name ? profile.user.first_name[0].toUpperCase() : 'U';
    const l = profile.user.last_name ? profile.user.last_name[0].toUpperCase() : '';
    return `${f}${l}`;
  }

  filteredConversations(): Conversation[] {
    if (!this.searchQuery.trim()) return this.conversations;
    const q = this.searchQuery.toLowerCase();
    return this.conversations.filter(c => {
      const name = `${c.autre_participant?.user?.first_name || ''} ${c.autre_participant?.user?.last_name || ''}`.toLowerCase();
      const bio = (c.autre_participant?.filiere || '').toLowerCase();
      return name.includes(q) || bio.includes(q);
    });
  }
}
