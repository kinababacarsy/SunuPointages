import { Injectable } from '@angular/core';
import axios from 'axios';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DepartementService {
  private apiUrl = 'http://localhost:8000/api';

  constructor() {}

  getDepartements(): Promise<any> {
    return axios
      .get(`${this.apiUrl}/departements`)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Erreur lors du chargement des départements', error);
        throw error;
      });
  }

  getDepartement(id: string): Promise<any> {
    return axios
      .get(`${this.apiUrl}/voir/departements/${id}`)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Erreur lors du chargement du département', error);
        throw error;
      });
  }

  createDepartement(departement: any): Promise<any> {
    return axios
      .post(`${this.apiUrl}/ajout/departements`, departement)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Erreur lors de la création du département', error);
        throw error;
      });
  }

  updateDepartement(id: number, departement: any): Promise<any> {
    return axios
      .put(`${this.apiUrl}/maj/departements/${id}`, departement)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Erreur lors de la mise à jour du département', error);
        throw error;
      });
  }

  deleteDepartement(id: number): Promise<any> {
    return axios
      .delete(`${this.apiUrl}/sup/departements/${id}`)
      .then((response) => response.data)
      .catch((error) => {
        console.error('Erreur lors de la suppression du département', error);
        throw error;
      });
  }

  // Récupérer le nombre d'employés dans un département
  getEmployeeCountByDepartement(departementId: string): Observable<number> {
    console.log('Requête API envoyée pour departementId:', departementId); // Log de l'ID
    return new Observable((observer) => {
      axios
        .get(`${this.apiUrl}/departements/${departementId}/employee-count`)
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
