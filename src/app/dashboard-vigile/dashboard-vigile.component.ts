import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from '../services/websocket.service'; // Import du service WebSocket
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { UserService } from '../user.service'; // Import du service pour récupérer les infos du vigile connecté

@Component({
  selector: 'app-pointage',
  imports: [CommonModule],
  templateUrl: './dashboard-vigile.component.html',
  styleUrls: ['./dashboard-vigile.component.css'],
})
export class DashboardVigileComponent implements OnInit, OnDestroy {
  // Stocke les données de l'utilisateur à afficher
  employeeData = {
    matricule: 'en attente...',
    nom: 'en attente...',
    prenom: 'en attente...',
    statut: 'en attente...',
    premierPointage: 'en attente...',
    dernierPointage: 'en attente...',
    photo: 'inconnu.png', // Ajouter l'URL de la photo
  };

  // Ajout des informations du vigile connecté
  vigileData = {
    nom: '',
    prenom: '',
    email: '',
  };

  private messageSubscription!: Subscription; // Pour stocker l'abonnement aux messages
  showModal = false; // Pour contrôler l'affichage du modal

  constructor(
    private router: Router,
    private http: HttpClient,
    private websocketService: WebSocketService,
    private cdr: ChangeDetectorRef, // Injectez ChangeDetectorRef
    private userService: UserService // Service pour récupérer les informations du vigile
  ) {}

  ngOnInit() {
    // S'abonner aux messages WebSocket
    this.messageSubscription = this.websocketService.message$.subscribe(
      (data: any) => {
        switch (data.type) {
          case 'Check-In':
            this.handleCheckIn(data);
            break;
          case 'Check-Out':
            this.handleCheckOut(data);
            break;
          case 'card-data':
            this.handleCardData(data);
            break;
          default:
            console.warn('Événement WebSocket non géré:', data);
        }
      }
    );
  }

  ngOnDestroy() {
    // Désabonnement pour éviter les fuites de mémoire
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  // Fonction pour afficher le modal avec les informations du vigile
  showVigileInfoModal() {
    this.showModal = true;
  }

  // Fonction pour fermer le modal
  closeModal() {
    this.showModal = false;
  }

  // Logique pour la modification du mot de passe (si nécessaire)
  changePassword() {
    // Logique pour rediriger vers la page de changement de mot de passe
    console.log('Rediriger vers la page de changement de mot de passe');
    // Exemple: this.router.navigate(['/change-password']);
  }

  // Gestion du Check-In
  private handleCheckIn(data: any) {
    console.log('Données Check-In reçues:', data); // Log pour débogage
    const timestamp = new Date(data.timestamp);
    this.employeeData.premierPointage = this.formatDate(timestamp);
    this.cdr.detectChanges(); // Force la détection de changement
    console.log('Check-In traité:', this.employeeData.premierPointage);
  }

  // Gestion du Check-Out
  private handleCheckOut(data: any) {
    console.log('Données Check-Out reçues:', data); // Log pour débogage
    const timestamp = new Date(data.timestamp);
    this.employeeData.dernierPointage = this.formatDate(timestamp);
    this.cdr.detectChanges(); // Force la détection de changement
    console.log('Check-Out traité:', this.employeeData.dernierPointage);
  }

  private handleCardData(data: any) {
    if (data.found) {
      // Mise à jour des informations utilisateur
      if (data.userData.statut === 'Bloque') {
        // Si l'utilisateur est bloqué, on affiche une image "bloque" et on masque les autres informations
        this.employeeData = {
          matricule: 'Utilisateur bloqué',
          nom: '',
          prenom: '',
          statut: 'Bloqué',
          premierPointage: '',
          dernierPointage: '',
          photo: 'bloque.png', // Image spécifique pour un utilisateur bloqué
        };
      } else {
        // Sinon, on affiche les informations normales
        this.employeeData = {
          ...this.employeeData, // Conserver les données existantes
          matricule: data.userData.matricule || 'en attente...',
          nom: data.userData.nom || 'en attente...',
          prenom: data.userData.prenom || 'en attente...',
          statut: data.userData.statut || 'en attente...',
          photo: data.userData.photo || 'inconnu.png',
        };
      }

      // Réinitialiser après 10 secondes
      setTimeout(() => this.resetEmployeeData(), 10000);
    } else {
      // Utilisateur non trouvé
      console.log('Utilisateur non trouvé:', data.message);
      this.employeeData = {
        ...this.employeeData, // Conserver les données existantes
        matricule: 'Non trouvé',
        nom: 'Non trouvé',
        prenom: 'Non trouvé',
        statut: 'Non trouvé',
        photo: 'Alerte.png',
      };

      // Réinitialiser après 10 secondes
      setTimeout(() => this.resetEmployeeData(), 10000);
    }
  }

  // Réinitialiser les données utilisateur
  private resetEmployeeData() {
    console.log('Réinitialisation des données utilisateur'); // Log pour débogage
    this.employeeData = {
      ...this.employeeData, // Conserver les données existantes
      matricule: 'en attente...',
      nom: 'en attente...',
      prenom: 'en attente...',
      statut: 'en attente...',
      photo: 'inconnu.png',
    };
  }

  // Méthode pour formater la date (ex: "12/01/2025 14:30")
  private formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleString('fr-FR', options); // Formate selon les paramètres locaux (fr-FR)
  }

  // Méthodes pour contrôler la porte
  ouvrirPorte() {
    console.log('Ouverture porte');
    this.websocketService.sendMessage('control-door', { action: 'open' });
  }

  fermerPorte() {
    console.log('Fermeture porte');
    this.websocketService.sendMessage('control-door', { action: 'close' });
  }

  // Navigation
  consulterListe() {
    console.log('Consultation liste');
    this.router.navigate(['/liste-vigile']);
  }

  // Déconnexion
  deconnexion() {
    console.log('Déconnexion');
    this.http
      .post(
        'http://localhost:8000/api/logout',
        {},
        {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
        }
      )
      .subscribe(
        (response: any) => {
          console.log('Déconnexion réussie', response);
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        },
        (error) => {
          console.error('Erreur lors de la déconnexion', error);
        }
      );
  }
}
