import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { io } from 'socket.io-client';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket: any;
  private socketUrl: string = 'http://localhost:3000'; // URL du serveur WebSocket
  private apiUrl: string = 'http://localhost:3000/api/controle-acces'; // URL de votre serveur Node.js pour l'API
  public message$ = new Subject<any>(); // Pour diffuser les messages reçus

  constructor(private http: HttpClient) {
    // Injecter HttpClient
    this.socket = io(this.socketUrl);

    // Écoute des messages "rfid-card" du serveur
    this.socket.on('rfid-card', (data: any) => {
      console.log('Données de la carte RFID reçues:', data);
      this.message$.next({
        type: 'card-data',
        found: data.found,
        userData: {
          matricule: data.userData.matricule || 'en attente...',
          nom: data.userData.nom || 'en attente...',
          prenom: data.userData.prenom || 'en attente...',
          statut: data.userData.statut || 'en attente...',
          premierPointage: data.userData.premierPointage || 'en attente...', // Ajout de premierPointage
          dernierPointage: data.userData.dernierPointage || 'en attente...', // Ajout de dernierPointage
          photo: data.userData.photo || 'inconnu.png',
        },
      });

      // Appel API pour récupérer les pointages de l'utilisateur
      this.getPointagesByCardId(data.userData.cardID).subscribe((pointages) => {
        console.log('Pointages récupérés:', pointages);
        this.message$.next({
          type: 'pointages',
          pointages: pointages,
        });
      });
    });

    // Écoute des messages "Check-In" du serveur
    this.socket.on('Check-In', (data: any) => {
      console.log('Données de Check-In reçues:', data);
      this.message$.next({
        type: 'check-in',
        found: true,
        message: data.message || 'Check-In effectué',
        date: this.formatDate(data.date), // Formatage de la date
        heure: data.heure,
        statut: data.statut,
        etat: data.etat,
        premierPointage: data.premierPointage || 'en attente...', // Ajout de premierPointage
      });

      // Appel API pour créer un enregistrement de contrôle d'accès pour le Check-In
      this.createControleAcces(data).subscribe((response) => {
        console.log("Réponse de l'API Controle Acces Check-In:", response);
      });
    });

    // Écoute des messages "Check-Out" du serveur
    this.socket.on('Check-Out', (data: any) => {
      console.log('Données de Check-Out reçues:', data);
      this.message$.next({
        type: 'check-out',
        found: true,
        message: data.message || 'Check-Out effectué',
        date: this.formatDate(data.date), // Formatage de la date
        heure: data.heure,
        statut: data.statut,
        etat: data.etat,
        dernierPointage: data.dernierPointage || 'en attente...', // Ajout de dernierPointage
      });

      // Appel API pour créer un enregistrement de contrôle d'accès pour le Check-Out
      this.createControleAcces(data).subscribe((response) => {
        console.log("Réponse de l'API Controle Acces Check-Out:", response);
      });
    });
  }

  // Méthode pour créer un contrôle d'accès via l'API
  createControleAcces(data: any): Observable<any> {
    // Envoi de la requête POST à votre API Node.js
    return this.http.post<any>(this.apiUrl, data);
  }

  // Méthode pour récupérer les pointages par cardID via l'API
  getPointagesByCardId(cardID: string): Observable<any> {
    const url = `${this.apiUrl}/pointages/${cardID}`;
    return this.http.get<any>(url);
  }

  // Méthode pour envoyer un message au serveur WebSocket
  sendMessage(event: string, data: any) {
    this.socket.emit(event, data);
  }

  // Méthode pour se déconnecter
  disconnect() {
    this.socket.disconnect();
  }

  // Méthode pour formater la date (ex: "12/01/2025 14:30")
  private formatDate(date: any): string {
    const timestamp = new Date(date); // Convertir en objet Date
    if (isNaN(timestamp.getTime())) {
      // Si la conversion échoue, retourner une valeur par défaut
      return 'Date invalide';
    }
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return timestamp.toLocaleString('fr-FR', options); // Formater la date pour l'affichage
  }
}
