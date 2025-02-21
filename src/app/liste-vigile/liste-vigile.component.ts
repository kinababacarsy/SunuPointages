import { Component, OnInit, OnDestroy } from '@angular/core';
import { WebSocketService } from '../services/websocket.service';  // Import du service WebSocket
import { Subscription } from 'rxjs'; // Import pour gérer les abonnements
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Import du Router


@Component({
  selector: 'app-liste-vigile',
  templateUrl: './liste-vigile.component.html',
  standalone: true,
  imports:[FormsModule,CommonModule],
  styleUrls: ['./liste-vigile.component.css']
})
export class ListeVigileComponent implements OnInit, OnDestroy {
  pointages: any[] = [];  // Tableau pour stocker les données des pointages
  loading: boolean = true;
  error: string = '';
  private webSocketSubscription!: Subscription; // Abonnement WebSocket

  constructor(
    private webSocketService: WebSocketService, // Service WebSocket
    private router: Router // Injection du Router pour la navigation
  ) { }
  ngOnInit(): void {
    // Abonnez-vous aux messages WebSocket reçus
    this.webSocketSubscription = this.webSocketService.message$.subscribe((data: any) => {
      if (data.type === 'card-data' && data.found) {
        // Lorsque des données de carte RFID sont reçues et valides
        const userData = data.userData;

        // Formater les dates avant de les ajouter au tableau
        userData.premierPointage.date = this.formatDate(userData.premierPointage.date);
        userData.dernierPointage.date = this.formatDate(userData.dernierPointage.date);

        // Vérifiez si l'utilisateur est déjà dans le tableau, sinon ajoutez-le
        const userIndex = this.pointages.findIndex(pointage => pointage.matricule === userData.matricule);
        if (userIndex === -1) {
          // Si l'utilisateur n'existe pas, on l'ajoute
          this.pointages.push({
            matricule: userData.matricule,
            nom: userData.nom,
            prenom: userData.prenom,
            premierPointage: userData.premierPointage,
            dernierPointage: userData.dernierPointage,
            statut: userData.statut
          });
        } else {
          // Si l'utilisateur existe déjà, on met à jour son dernier pointage
          this.pointages[userIndex].dernierPointage = userData.dernierPointage;
        }

        // Désactiver le chargement une fois les données reçues
        this.loading = false;
      } else if (data.found === false) {
        this.error = data.message || 'Erreur : Utilisateur non trouvé';
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    // Se désabonner de WebSocket pour éviter les fuites de mémoire
    if (this.webSocketSubscription) {
      this.webSocketSubscription.unsubscribe();
    }
  }

  onRetour(): void {
    // Redirection vers le dashboard-vigile
    this.router.navigate(['/dashboard-vigile']);
  }
  // 
  // 
  // Fonction pour formater les dates en 'dd/mm/yyyy'
  formatDate(date: string): string {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0'); // Ajoute un zéro devant le jour si nécessaire
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Mois de 1 à 12
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }
}
