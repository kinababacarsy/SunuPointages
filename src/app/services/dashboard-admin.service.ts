// dashboard-admin.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardAdminService {
  private apiUrl = 'http://127.0.0.1:8000/api'; // Remplacez par l'URL de votre API

  constructor(private http: HttpClient) {}

  getCountDepartements(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/departements/count`);
  }

  getCountCohortes(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cohortes/count`);
  }

  getCountEmployes(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/users/count?role=employe`);
  }

  getCountApprenants(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/users/count?role=apprenant`);
  }

  getCountAllUsers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/count`);
  }

  getUserPresences(date?: string): Observable<any> {
    let url = `${this.apiUrl}/users/presences`;
    if (date) {
      url += `?date=${date}`;
    }
    return this.http.get<any>(url);
  }

  

  getUserHistorique(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/historique`);
  }
}