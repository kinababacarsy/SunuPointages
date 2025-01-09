import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private apiUrl = 'http://localhost:8000/api';  // Remplacez par l'URL de votre API

  constructor(private http: HttpClient) {}

  // Méthode pour récupérer les informations du vigile connecté
  getVigileInfo(): Observable<any> {
    const token = localStorage.getItem('token');  // On récupère le token depuis le localStorage
    if (!token) {
      throw new Error('Token non trouvé');
    }
    
    return this.http.get<any>(`${this.apiUrl}/user/vigile-info`, {
      headers: {
        Authorization: `Bearer ${token}`,  // Ajouter le token dans l'entête
      },
    });
  }
}
