import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private apiUrl = 'http://localhost:8000/api/login'; // URL de l'API backend

  constructor(private http: HttpClient, private router: Router) {}

  // Méthode de connexion avec email et mot de passe
  login(email: string, password: string): Observable<any> {
    const credentials = { email, mot_de_passe: password }; // Assurez-vous que "mot_de_passe" est le bon nom

    // Envoie les informations de connexion au backend
    return this.http.post<any>(this.apiUrl, credentials).pipe(
      catchError(error => {
        console.error('Erreur de connexion', error);
        return throwError(error);  // Rejeter l'erreur pour la gérer dans le composant
      })
    );
  }

  // Méthode de connexion avec cardID (uniquement pour les admins)
  loginWithCardID(cardID: string): Observable<any> {
    const credentials = { cardID }; // Envoyer uniquement le cardID pour les admins

    // Envoie la requête pour se connecter avec cardID au backend
    return this.http.post<any>(this.apiUrl, credentials).pipe(
      catchError(error => {
        console.error('Erreur de connexion avec cardID', error);
        return throwError(error);  // Rejeter l'erreur pour la gérer dans le composant
      })
    );
  }

  // Méthode pour vérifier si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return token !== null; // Si un token est trouvé, l'utilisateur est authentifié
  }

  // Méthode pour déconnecter l'utilisateur (supprime le token)
  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']); // Rediriger vers la page de login
  }

  // Méthode pour récupérer le token JWT
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
