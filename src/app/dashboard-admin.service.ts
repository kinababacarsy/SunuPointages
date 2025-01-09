// dashboard-admin.service.ts

import { Injectable } from '@angular/core';
// Importation du décorateur Injectable pour rendre la classe injectable

import { HttpClient } from '@angular/common/http';
// Importation de HttpClient pour effectuer des requêtes HTTP

import { Observable } from 'rxjs';
// Importation de l'interface Observable de RxJS pour gérer les flux de données asynchrones

@Injectable({
  providedIn: 'root'
})
// Décorateur Injectable pour indiquer que cette classe peut être injectée dans d'autres classes
// providedIn: 'root' signifie que le service est disponible dans toute l'application

export class DashboardAdminService {
  // Déclaration de la classe DashboardAdminService

  private apiUrl = 'http://127.0.0.1:8000/api';
  // URL de base de l'API. Remplacez par l'URL de votre API

  constructor(private http: HttpClient) {}
  // Constructeur de la classe, injecte HttpClient pour effectuer des requêtes HTTP

  getCountDepartements(): Observable<any> {
    // Méthode pour obtenir le nombre de départements
    return this.http.get<any>(`${this.apiUrl}/departements/count`);
    // Effectue une requête GET à l'URL spécifiée et retourne un Observable de type any
  }

  getCountCohortes(): Observable<any> {
    // Méthode pour obtenir le nombre de cohortes
    return this.http.get<any>(`${this.apiUrl}/cohortes/count`);
    // Effectue une requête GET à l'URL spécifiée et retourne un Observable de type any
  }

  getCountEmployes(): Observable<number> {
    // Méthode pour obtenir le nombre d'employés
    return this.http.get<number>(`${this.apiUrl}/users/count?role=employe`);
    // Effectue une requête GET à l'URL spécifiée avec le paramètre de requête role=employe et retourne un Observable de type number
  }

  getCountApprenants(): Observable<number> {
    // Méthode pour obtenir le nombre d'apprenants
    return this.http.get<number>(`${this.apiUrl}/users/count?role=apprenant`);
    // Effectue une requête GET à l'URL spécifiée avec le paramètre de requête role=apprenant et retourne un Observable de type number
  }

  getCountAllUsers(): Observable<any> {
    // Méthode pour obtenir le nombre total d'utilisateurs
    return this.http.get<any>(`${this.apiUrl}/users/count`);
    // Effectue une requête GET à l'URL spécifiée et retourne un Observable de type any
  }

  getUserPresences(date?: string): Observable<any> {
    // Méthode pour obtenir les présences des utilisateurs, optionnellement filtrées par date
    let url = `${this.apiUrl}/users/presences`;
    // URL de base pour obtenir les présences des utilisateurs
    if (date) {
      // Si une date est fournie
      url += `?date=${date}`;
      // Ajoute le paramètre de requête date à l'URL
    }
    return this.http.get<any>(url);
    // Effectue une requête GET à l'URL spécifiée et retourne un Observable de type any
  }

  getUserHistorique(): Observable<any> {
    // Méthode pour obtenir l'historique des utilisateurs
    return this.http.get<any>(`${this.apiUrl}/users/historique`);
    // Effectue une requête GET à l'URL spécifiée et retourne un Observable de type any
  }
}