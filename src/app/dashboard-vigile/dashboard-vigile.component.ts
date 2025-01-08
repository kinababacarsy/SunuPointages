import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { WebSocketService } from '../services/websocket.service'; // Import du service WebSocket
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pointage',
  imports: [CommonModule],
  templateUrl: './dashboard-vigile.component.html',
  styleUrls: ['./dashboard-vigile.component.css'],
})
export class DashboardVigileComponent implements OnInit, OnDestroy {
  employeeData = {
    matricule: 'en attente...',
    nom: 'en attente...',
    prenom: 'en attente...',
    statut: 'en attente...',
    premierPointage: 'en attente...',
    dernierPointage: 'en attente...',
    photo: 'inconnu.png',
    pointages: [] as { date: string; type: string }[],
  };

  errorMessages: string[] = [];
  private messageSubscription!: Subscription;

  constructor(
    private router: Router,
    private http: HttpClient,
    private websocketService: WebSocketService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.messageSubscription = this.websocketService.message$.subscribe(
      (data: any) => {
        switch (data.type) {
          case 'check-in':
            this.handleCheckIn(data);
            break;
          case 'check-out':
            this.handleCheckOut(data);
            break;
          case 'card-data':
            this.handleCardData(data);
            break;
          case 'pointages':
            this.handlePointages(data);
            break;
          default:
            console.warn('Événement WebSocket non géré:', data);
        }
      }
    );
  }

  ngOnDestroy() {
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
  }

  private handleCheckIn(data: any) {
    console.log('Données Check-In reçues:', data);
    const timestamp = new Date(data.date);
    const formattedDate = this.formatDate(timestamp);
    this.employeeData.pointages.push({ date: formattedDate, type: 'Check-In' });
    this.employeeData.premierPointage = formattedDate;
    this.cdr.detectChanges();

    this.createControleAcces(data).subscribe(
      (response) => {
        console.log('Réponse API Check-In:', response);
        this.errorMessages = [];
        this.employeeData.premierPointage = response.heure;
        this.employeeData.statut = response.statut;
      },
      (error) => this.handleApiError(error)
    );
  }

  private handleCheckOut(data: any) {
    console.log('Données Check-Out reçues:', data);
    const timestamp = new Date(data.date);
    this.employeeData.dernierPointage = this.formatDate(timestamp);
    this.cdr.detectChanges();

    this.createControleAcces(data).subscribe(
      (response) => {
        console.log('Réponse API Check-Out:', response);
        this.errorMessages = [];
        this.employeeData.dernierPointage = response.heure;
        this.employeeData.statut = response.statut;
      },
      (error) => this.handleApiError(error)
    );
  }
  private getPointagesByCardId(cardId: string) {
    if (!cardId) {
      console.error('Card ID est invalide ou manquant');
      this.errorMessages = ['ID de carte invalide ou manquant'];
      this.cdr.detectChanges();
      return; // Ne pas continuer si cardId est manquant
    }

    // Faire la requête HTTP avec le cardId dans l'URL
    const url = `http://localhost:8000/api/controle-acces/pointages/${cardId}`;

    this.http.get<any>(url).subscribe(
      (response: any) => {
        console.log('Pointages récupérés pour la carte ID', cardId, response);

        // Vérification de la réponse et mise à jour des pointages
        if (
          response &&
          response.pointages &&
          Array.isArray(response.pointages)
        ) {
          this.employeeData.pointages = response.pointages;

          // Traitement du Check-In et Check-Out
          const checkIn = response.pointages.find(
            (pointage: any) => pointage.type === 'Check-In'
          );
          const checkOut = response.pointages.find(
            (pointage: any) => pointage.type === 'Check-Out'
          );

          if (checkIn) {
            const checkInDateTime = this.formatDateTime(
              checkIn.date,
              checkIn.heure
            );
            this.employeeData.premierPointage = checkInDateTime;
          } else {
            this.employeeData.premierPointage = 'Non effectué';
          }

          if (checkOut) {
            const checkOutDateTime = this.formatDateTime(
              checkOut.date,
              checkOut.heure
            );
            this.employeeData.dernierPointage = checkOutDateTime;
          } else {
            this.employeeData.dernierPointage = 'Non effectué';
          }

          this.cdr.detectChanges();
        } else {
          console.error('Réponse invalide ou pointages non trouvés');
          this.errorMessages = ['Aucun pointage trouvé pour cette carte.'];
          this.cdr.detectChanges();
        }
      },
      (error) => {
        console.error('Erreur lors de la récupération des pointages', error);
        this.errorMessages = ['Erreur lors de la récupération des pointages'];
        this.cdr.detectChanges();
      }
    );
  }

  private formatDateTime(date: string, heure: string): string {
    const dateParts = date.split('-'); // Séparer la date (yyyy-mm-dd)
    const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`; // Convertir en jj/mm/aaaa

    // Retourner la date et l'heure combinées
    return `${formattedDate} ${heure.substr(0, 5)}`; // Ne prendre que l'heure jusqu'à hh:mm
  }

  private handleCardData(data: any) {
    if (data.found) {
      // Mise à jour des informations utilisateur
      this.employeeData = {
        ...this.employeeData,
        matricule: data.userData.matricule || 'en attente...',
        nom: data.userData.nom || 'en attente...',
        prenom: data.userData.prenom || 'en attente...',
        statut: data.userData.statut || 'en attente...',
        photo: data.userData.photo || 'inconnu.png',
        premierPointage: data.userData.premierPointage || 'en attente...',
        dernierPointage: data.userData.dernierPointage || 'en attente...',
      };

      // Assurez-vous que `cardID` est disponible et valide avant de l'utiliser
      const cardId = data.userData.cardID;
      if (cardId) {
        this.getPointagesByCardId(cardId); // Passer le cardId valide à la méthode
      } else {
        console.error("ID de carte manquant dans les données de l'utilisateur");
        this.errorMessages = ['ID de carte manquant'];
        this.cdr.detectChanges();
      }

      // Réinitialiser après 10 secondes
      setTimeout(() => this.resetEmployeeData(), 10000);
    } else {
      console.log('Utilisateur non trouvé:', data.message);
      this.employeeData = {
        ...this.employeeData,
        matricule: 'Non trouvé',
        nom: 'Non trouvé',
        prenom: 'Non trouvé',
        statut: 'Non trouvé',
        photo: 'Alerte.png',
        premierPointage: 'Non trouvé',
        dernierPointage: 'Non trouvé',
      };
      setTimeout(() => this.resetEmployeeData(), 10000);
    }
  }

  private handlePointages(data: any) {
    if (data && Array.isArray(data.pointages)) {
      this.employeeData.pointages = data.pointages;
      this.cdr.detectChanges();
    } else {
      console.error('Les données de pointages sont invalides', data);
    }
  }

  private resetEmployeeData() {
    this.employeeData = {
      ...this.employeeData,
      matricule: 'en attente...',
      nom: 'en attente...',
      prenom: 'en attente...',
      statut: 'en attente...',
      photo: 'inconnu.png',
      premierPointage: 'en attente...',
      dernierPointage: 'en attente...',
      pointages: [],
    };
  }

  private formatDate(date: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return date.toLocaleString('fr-FR', options);
  }

  private createControleAcces(data: any) {
    const requestData = {
      ...data,
      card_id: this.employeeData.matricule,
    };

    return this.http.post<any>(
      'http://localhost:8000/api/controle-acces',
      requestData
    );
  }

  private handleApiError(error: any) {
    if (error && error.error && error.error.errors) {
      this.errorMessages = Object.values(error.error.errors);
    } else {
      this.errorMessages = ['Une erreur inconnue est survenue.'];
    }
    this.cdr.detectChanges();
  }

  ouvrirPorte() {
    console.log('Ouverture porte');
    this.websocketService.sendMessage('control-door', { action: 'open' });
  }

  fermerPorte() {
    console.log('Fermeture porte');
    this.websocketService.sendMessage('control-door', { action: 'close' });
  }

  consulterListe() {
    this.router.navigate(['/liste-vigile']);
  }

  deconnexion() {
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
        (error) => console.error('Erreur lors de la déconnexion', error)
      );
  }
}
