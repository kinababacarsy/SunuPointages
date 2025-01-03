import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AssignationCarteService {
  private baseUrl = 'http://localhost:8000/api'; // Remplace par ton URL de backend

  constructor(private http: HttpClient) {}

  assignerCarte(userId: string, cardID: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/rfid/assigner/${userId}`, { cardID });
  }

  lireCarte(cardID: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/users/rfid/lecture`, { cardID });
  }

  verifierEtatCarte(cardID: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/rfid/etat/${cardID}`);
  }
}
