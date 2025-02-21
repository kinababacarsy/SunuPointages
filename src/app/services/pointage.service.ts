import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Pointage {
  matricule: string;
  nom: string;
  prenom: string;
  departement: string;
  cohorte: string;
  premierPointage: string;
  dernierPointage: string;
  statut: string;
}

@Injectable({
  providedIn: 'root'
})
export class PointageService {
  private apiUrl = 'http://localhost:3000/api'; // URL de votre API

  constructor(private http: HttpClient) {}

  getPointages(): Observable<Pointage[]> {
    return this.http.get<Pointage[]>(`${this.apiUrl}/pointages`);
  }
}
