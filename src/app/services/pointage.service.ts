import { Injectable } from '@angular/core';
import { io } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';

// Définir l'interface Pointage
export interface Pointage {
  matricule: string;
  nom: string;
  prenom: string;
  date: string;
  heure: string;
  type: string; // 'Check-In' ou 'Check-Out'
  statut: string; // 'Présent', 'Absent', etc.
  etat: string; // 'Présent' ou 'Absent'
}

@Injectable({
  providedIn: 'root',
})
export class PointageService {
  private socket: any;
  private rfidCardSubject = new Subject<any>(); // Sujet pour les données RFID
  private pointageSubject = new Subject<Pointage[]>(); // Sujet pour les pointages (typé en tant que tableau de Pointage)

  constructor() {
    // Connexion au serveur WebSocket
    this.socket = io('http://localhost:3000');

    // Écouter les événements WebSocket
    this.socket.on('rfid-card', (data: any) => {
      this.rfidCardSubject.next(data);
    });

    this.socket.on('pointages', (data: Pointage[]) => {
      this.pointageSubject.next(data);
    });
  }

  // Observable pour les données de carte RFID
  getRfidCardData(): Observable<any> {
    return this.rfidCardSubject.asObservable();
  }

  // Observable pour les pointages
  getPointages(): Observable<Pointage[]> {
    return this.pointageSubject.asObservable();
  }
}
