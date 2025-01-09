import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // Assurez-vous que 'root' est bien spécifié pour que le service soit accessible globalement
})
export class ForgotPasswordService {
  private apiUrl = 'http://localhost:8000/password/email'; // URL de votre backend Laravel

  constructor(private http: HttpClient) {}

  sendResetEmail(email: string): Observable<any> {
    return this.http.post(this.apiUrl, { email });
  }
}
