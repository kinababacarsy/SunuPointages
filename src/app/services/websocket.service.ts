import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {
  private socket: any;
  private socketUrl: string = 'http://localhost:3000';  // URL du serveur WebSocket
  public message$ = new Subject<any>();  // Pour diffuser les messages reçus

  constructor() {
    this.socket = io(this.socketUrl);

    // Écoute des messages "rfid-card" du serveur
    this.socket.on('rfid-card', (data: any) => {
      console.log('Données de la carte RFID reçues:', data);
      this.message$.next(data); // Transmet les données utilisateur au composant
    });

    this.socket.on('checkin-status', (status: any) => {
      console.log('Statut de pointage:', status);
      this.message$.next(status); // Transmet le statut de pointage
    });

    // Écoute des messages "control-door" du serveur
    this.socket.on('control-door', (data: any) => {
      console.log('Commande de contrôle de la porte reçue:', data);
      this.message$.next(data); // Transmet la commande de contrôle de la porte
    });
  }

  // Méthode pour envoyer un message au serveur WebSocket
  sendMessage(event: string, data: any) {
    this.socket.emit(event, data);
  }

  // Méthode pour se déconnecter
  disconnect() {
    this.socket.disconnect();
  }
}
