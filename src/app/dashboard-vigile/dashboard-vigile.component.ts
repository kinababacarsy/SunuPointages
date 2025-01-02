import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pointage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-vigile.component.html',
  styleUrls: ['./dashboard-vigile.component.css']
})
export class DashboardVigileComponent {
  employeeData = {
    matricule: 'en attente...',
    nom: 'en attente...',
    prenom: 'en attente...',
    statut: 'en attente...',
    premierPointage: 'en attente...',
    dernierPointage: 'en attente...'
  };

  ouvrirPorte() {
    console.log('Ouverture porte');
  }

  fermerPorte() {
    console.log('Fermeture porte');
  }

  consulterListe() {
    console.log('Consultation liste');
  }

  deconnexion() {
    console.log('Déconnexion');
  }
}