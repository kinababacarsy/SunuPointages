import { Injectable } from '@angular/core';
import axios from 'axios';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CohorteService {
  private apiUrl = 'http://localhost:8000/api';

  constructor() {}

  getCohortes(): Promise<any> {
    return axios
      .get(`${this.apiUrl}/cohortes`)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Erreur lors du chargement des cohortes', error);
        throw error;
      });
  }

  getCohorte(id: string): Promise<any> {
    return axios
      .get(`${this.apiUrl}/voir/cohortes/${id}`)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Erreur lors du chargement de la cohorte', error);
        throw error;
      });
  }

  createCohorte(cohorte: any): Promise<any> {
    return axios
      .post(`${this.apiUrl}/ajout/cohortes`, cohorte)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Erreur lors de la création de la cohorte', error);
        throw error;
      });
  }

  updateCohorte(id: number, cohorte: any): Promise<any> {
    return axios
      .put(`${this.apiUrl}/maj/cohortes/${id}`, cohorte)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Erreur lors de la mise à jour de la cohorte', error);
        throw error;
      });
  }

  deleteCohorte(id: number): Promise<any> {
    return axios
      .delete(`${this.apiUrl}/sup/cohortes/${id}`)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Erreur lors de la suppression de la cohorte', error);
        throw error;
      });
  }

  // Récupérer le nombre d'apprenants dans une cohorte
  getApprenantCountByCohorte(cohorteId: string): Observable<number> {
    console.log('Requête API envoyée pour cohorteId:', cohorteId); // Log de l'ID
    return new Observable((observer) => {
      axios
        .get(`${this.apiUrl}/cohortes/${cohorteId}/apprenant-count`)
        .then((response) => {
          console.log("Réponse de l'API:", response.data); // Log de la réponse
          observer.next(response.data.count);
          observer.complete();
        })
        .catch((error) => {
          console.error('Erreur lors de la requête:', error); // Log des erreurs
          observer.error(error);
        });
    });
  }
}
