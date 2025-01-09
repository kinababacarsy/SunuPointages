import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { HttpClient } from '@angular/common/http'; // Import du service HttpClient
@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  constructor(private router: Router, private http: HttpClient) {}
  deconnexion() {
    console.log('Déconnexion');

    // Appelez l'API pour invalider le token JWT
    this.http
      .post(
        'http://localhost:8000/api/logout',
        {},
        {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
        }
      )
      .subscribe(
        (response: any) => {
          console.log('Déconnexion réussie', response);

          // Supprimer le token localement
          localStorage.removeItem('token');

          // Rediriger vers la page de connexion
          this.router.navigate(['/login']);
        },
        (error) => {
          console.error('Erreur lors de la déconnexion', error);
        }
      );
  }
}