// pointage.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Pointage {
  matricule: string;
  nom: string;
  departement: string;
  premierPointage: string;
  dernierPointage: string;
  statut: string;
}

@Injectable({
  providedIn: 'root'
})
export class PointageService {
  private apiUrl = 'http://votre-api-url/pointages'; // Remplacez par votre URL d'API

  constructor(private http: HttpClient) {}

  getPointages(): Observable<Pointage[]> {
    return this.http.get<Pointage[]>(this.apiUrl);
  }
}