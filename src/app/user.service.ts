import { Injectable } from '@angular/core';
import axios from 'axios';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:8000/api'; // Remplacez par l'URL de votre API

  constructor() {}

  // Méthode pour récupérer la liste des utilisateurs
  getUsers(): Observable<any> {
    return new Observable((observer) => {
      axios
        .get(`${this.apiUrl}/users`)
        .then((response) => {
          observer.next(response.data);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  // Méthode pour créer un utilisateur
  createUser(userData: any): Observable<any> {
    return new Observable((observer) => {
      axios
        .post(`${this.apiUrl}/ajout/users`, userData)
        .then((response) => {
          observer.next(response.data);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  // Méthode pour récupérer un utilisateur par ID
  getUser(id: string): Observable<any> {
    return new Observable((observer) => {
      axios
        .get(`${this.apiUrl}/voir/users/${id}`)
        .then((response) => {
          observer.next(response.data);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  // Méthode pour mettre à jour un utilisateur
  updateUser(id: string, userData: any): Observable<any> {
    return new Observable((observer) => {
      axios
        .put(`${this.apiUrl}/maj/users/${id}`, userData)
        .then((response) => {
          observer.next(response.data);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  // Méthode pour supprimer un utilisateur
  deleteUser(id: string): Observable<any> {
    return new Observable((observer) => {
      axios
        .delete(`${this.apiUrl}/sup/users/${id}`)
        .then((response) => {
          observer.next(response.data);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  // Méthode pour récupérer les utilisateurs par département
  getUsersByDepartement(departementId: string): Observable<any> {
    return new Observable((observer) => {
      axios
        .get(`${this.apiUrl}/users/departement/${departementId}`)
        .then((response) => {
          observer.next(response.data);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }
}
