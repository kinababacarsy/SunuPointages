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

  getTotalDepartements(): Promise<any> {
    return axios
      .get(`${this.apiUrl}/departements/count`)
      .then((response) => response.data)
      .catch((error) => {
        console.error(
          'Erreur lors de la récupération du nombre total de départements',
          error
        );
        throw error;
      });
  }
}