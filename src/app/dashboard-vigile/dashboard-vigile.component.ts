import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';  // Import du Router pour la redirection
import { HttpClient } from '@angular/common/http';  // Import du service HttpClient

@Component({
  selector: 'app-pointage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-vigile.component.html',
  styleUrls: ['./dashboard-vigile.component.css']
})
export class DashboardVigileComponent {
  // Données de l'employé
  employeeData = {
    matricule: 'en attente...',
    nom: 'en attente...',
    prenom: 'en attente...',
    statut: 'en attente...',
    premierPointage: 'en attente...',
    dernierPointage: 'en attente...'
  };

  // Injection du service Router et HttpClient
  constructor(private router: Router, private http: HttpClient) {}

  // Méthode pour ouvrir la porte
  ouvrirPorte() {
    console.log('Ouverture porte');
  }

  // Méthode pour fermer la porte
  fermerPorte() {
    console.log('Fermeture porte');
  }

  // Méthode pour consulter la liste (redirection vers liste-vigile)
  consulterListe() {
    console.log('Consultation liste');
    this.router.navigate(['/liste-vigile']);  // Redirection vers la page liste-vigile
  }

  // Méthode pour déconnecter l'utilisateur
  deconnexion() {
    console.log('Déconnexion');

    // Appelez l'API pour invalider le token JWT
    this.http.post('http://localhost:8000/api/logout', {}, { 
      headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') } 
    }).subscribe(
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
