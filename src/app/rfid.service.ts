// rfid.service.ts

import { Injectable } from '@angular/core';
// Importation du décorateur Injectable pour rendre la classe injectable

import { Observable } from 'rxjs';
// Importation de l'interface Observable de RxJS pour gérer les flux de données asynchrones

import axios from 'axios';
// Importation de la bibliothèque axios pour effectuer des requêtes HTTP

@Injectable({
  providedIn: 'root',
})
// Décorateur Injectable pour indiquer que cette classe peut être injectée dans d'autres classes
// providedIn: 'root' signifie que le service est disponible dans toute l'application
export class RfidService {
  // Déclaration de la classe RfidService

  private socket: WebSocket;
  // Déclaration d'une propriété privée pour stocker l'instance de WebSocket

  constructor() {
    // Constructeur de la classe
    this.socket = new WebSocket('ws://localhost:8080');
    // Initialisation de l'instance de WebSocket avec l'URL du serveur WebSocket
  }

  public listen(): Observable<any> {
    // Méthode pour écouter les messages du WebSocket
    return new Observable((observer) => {
      // Création d'un nouvel Observable
      this.socket.onmessage = (event) => {
        // Événement déclenché lorsque le WebSocket reçoit un message
        observer.next(JSON.parse(event.data));
        // Émission des données reçues après les avoir parsées en JSON
      };
      this.socket.onerror = (error) => {
        // Événement déclenché en cas d'erreur de WebSocket
        observer.error(error);
        // Émission de l'erreur
      };
      this.socket.onclose = () => {
        // Événement déclenché lorsque le WebSocket est fermé
        observer.complete();
        // Complétion de l'Observable
      };
    });
  }

  public assignCard(cardData: any): Observable<any> {
    // Méthode pour assigner une carte RFID à un utilisateur
    return new Observable((observer) => {
      // Création d'un nouvel Observable
      axios
        .put(`http://localhost:8000/api/maj/users/${cardData.matricule}`, {
          cardUID: cardData.cardNumber,
        })
        // Envoi d'une requête PUT à l'API pour mettre à jour l'utilisateur avec le nouvel UID de la carte
        .then((response) => {
          // Gestion de la réponse de la requête
          observer.next(response.data);
          // Émission des données de la réponse
          observer.complete();
          // Complétion de l'Observable
        })
        .catch((error) => {
          // Gestion des erreurs de la requête
          observer.error(error);
          // Émission de l'erreur
        });
    });
  }
}
