import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from '../services/websocket.service';  // Import du service WebSocket
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { UserService } from '../user.service';  // Import du service pour récupérer les infos du vigile connecté

@Component({
  selector: 'app-pointage',
  imports: [CommonModule],
  standalone: true,
  templateUrl: './dashboard-vigile.component.html',
  styleUrls: ['./dashboard-vigile.component.css']
})
export class DashboardVigileComponent implements OnInit, OnDestroy {
  // Stocke les données de l'utilisateur à afficher
  employeeData = {
    matricule: 'en attente...',
    nom: 'en attente...',
    prenom: 'en attente...',
    statut: 'en attente...',
    photo: 'inconnu.png',  // Ajouter l'URL de la photo
    premierPointage: { date: '', heure: '', status: '' },
    dernierPointage: { date: '', heure: '', status: '' }
  };

  // Ajout des informations du vigile connecté
  vigileData = {
    nom: '',
    prenom: '',
    email: ''
  };

  private messageSubscription!: Subscription;  // Pour stocker l'abonnement aux messages
  showModal = false;  // Pour contrôler l'affichage du modal

  constructor(
    private router: Router,
    private http: HttpClient,
    private websocketService: WebSocketService,
    private cdr: ChangeDetectorRef, // Injectez ChangeDetectorRef
    private userService: UserService  // Service pour récupérer les informations du vigile
  ) {}

  ngOnInit() {
    // S'abonner aux messages WebSocket
    this.messageSubscription = this.websocketService.message$.subscribe((data: any) => {
      switch (data.type) {
        case 'card-data':
          this.handleCardData(data);
          break;
        case 'control-door':
          this.handleControlDoor(data);
          break;
        default:
          console.warn('Événement WebSocket non géré:', data);
      }
    });

    // Récupérer les informations du vigile connecté
    // this.getVigileInfo();
  }

  ngOnDestroy() {
    // Désabonnement pour éviter les fuites de mémoire
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  // Méthode pour récupérer les informations du vigile connecté
  // getVigileInfo() {
  //   this.userService.getVigileInfo().subscribe((data: any) => {
  //     if (data) {
  //       this.vigileData = {
  //         nom: data.nom,
  //         prenom: data.prenom,
  //         email: data.email
  //       };
  //       console.log('Informations du vigile connecté:', this.vigileData);
  //     }
  //   });
  // }

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

  private handleCardData(data: any) {
    if (data.found) {
      // Mise à jour des informations utilisateur
      if (data.userData.statut === 'Bloque') {
        // Si l'utilisateur est bloqué, on affiche une image "bloque" et on masque les autres informations
        this.employeeData = {
          matricule: '',
          nom: '',
          prenom: '',
          statut: 'Bloqué',
          photo: 'bloque.jpg',  // Image spécifique pour un utilisateur bloqué
          premierPointage: { date: '', heure: '', status: '' },
          dernierPointage: { date: '', heure: '', status: '' }
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
          premierPointage: data.userData.premierPointage || { date: '', heure: '', status: '' },
          dernierPointage: data.userData.dernierPointage || { date: '', heure: '', status: '' }
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
        premierPointage: { date: '', heure: '', status: '' },
        dernierPointage: { date: '', heure: '', status: '' }
      };

      // Réinitialiser après 10 secondes
      setTimeout(() => this.resetEmployeeData(), 10000);
    }
  }

  // Gestion des commandes de contrôle de la porte
  private handleControlDoor(data: any) {
    console.log('Commande de contrôle de la porte reçue:', data);
    // Vous pouvez ajouter des actions supplémentaires ici si nécessaire
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
      premierPointage: { date: '', heure: '', status: '' },
      dernierPointage: { date: '', heure: '', status: '' }
    };
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
    this.http.post('http://localhost:8000/api/logout', {}, {
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    }).subscribe(
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

  // Fonction pour formater les dates en 'dd/mm/yyyy'
  formatDate(date: string): string {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0'); // Ajoute un zéro devant le jour si nécessaire
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Mois de 1 à 12
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Méthode pour approuver le pointage
  approvePointage(type: string) {
    console.log(`Approuver le pointage ${type}`);
    if (type === 'premier') {
      this.employeeData.premierPointage.status = 'approved';
    } else if (type === 'dernier') {
      this.employeeData.dernierPointage.status = 'approved';
    }
    // Logique pour approuver le pointage
    // Vous pouvez envoyer une requête au serveur pour mettre à jour le statut du pointage
  }

  // Méthode pour rejeter le pointage
  rejectPointage(type: string) {
    console.log(`Rejeter le pointage ${type}`);
    if (type === 'premier') {
      this.employeeData.premierPointage.status = 'rejected';
    } else if (type === 'dernier') {
      this.employeeData.dernierPointage.status = 'rejected';
    }
    // Logique pour rejeter le pointage
    // Vous pouvez envoyer une requête au serveur pour mettre à jour le statut du pointage
  }
}
