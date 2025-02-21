// src/app/services/card-id.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CardIdService {
  private apiUrl = 'http://localhost:3000/api/cardID';

  constructor(private http: HttpClient) {}

  getCardID(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
