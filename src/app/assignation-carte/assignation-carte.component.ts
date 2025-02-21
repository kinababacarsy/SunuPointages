// assignation-carte.component.ts

import { Component, OnInit } from '@angular/core';
// Importation des modules nécessaires pour créer un composant Angular

import { CommonModule } from '@angular/common';
// Importation du module CommonModule pour les directives et pipes courants

import { FormsModule } from '@angular/forms';
// Importation du module FormsModule pour les formulaires template-driven

import { RfidService } from '../rfid.service';
// Importation du service RfidService pour gérer les opérations RFID

import { Router, RouterModule, ActivatedRoute } from '@angular/router';
// Importation des modules et services de routage d'Angular

import { UserService, User } from '../user.service';
import { NavbarComponent } from '../navbar/navbar.component';
// Importation du service UserService et de l'interface User pour gérer les utilisateurs

// Définir l'interface CardData
interface CardData {
  fullName: string;
  // Nom complet de l'utilisateur
  matricule: string;
  // Matricule de l'utilisateur
  cardID: string;
  // ID de la carte
  assignmentDate: string;
  // Date d'assignation de la carte
}

@Component({
  selector: 'app-assignation-carte',
  // Sélecteur du composant
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  // Modules importés pour ce composant
  templateUrl: './assignation-carte.component.html',
  // URL du template HTML
  styleUrls: ['./assignation-carte.component.css'],
  // URL des styles CSS
  standalone: true,
  // Indique que ce composant est autonome
  providers: [RfidService],
  // Fournisseurs de services pour ce composant
})
export class AssignationCarteComponent implements OnInit {
  // Déclaration de la classe AssignationCarteComponent implémentant OnInit

  cardData: CardData = {
    fullName: '',
    // Initialisation du nom complet
    matricule: '',
    // Initialisation du matricule
    cardID: '',
    // Initialisation de l'ID de la carte
    assignmentDate: '',
    // Initialisation de la date d'assignation
  };

  isScanning: boolean = false;
  // Propriété pour indiquer si le scanning est en cours

  constructor(
    private rfidService: RfidService,
    // Injection du service RfidService
    private router: Router,
    // Injection du service Router pour la navigation
    private route: ActivatedRoute,
    // Injection du service ActivatedRoute pour accéder aux paramètres de route
    private userService: UserService // Injection du service UserService pour gérer les utilisateurs
  ) {}

  ngOnInit() {
    // Méthode appelée lors de l'initialisation du composant
    this.route.params.subscribe((params) => {
      // Abonnement aux paramètres de route
      const userId = params['id'];
      // Récupération de l'ID de l'utilisateur à partir des paramètres de route
      this.userService.getUser(userId).subscribe(
        (user) => {
          // Récupération des informations de l'utilisateur
          this.cardData = {
            fullName: `${user.nom} ${user.prenom}`,
            // Concaténation du nom et du prénom de l'utilisateur
            matricule: user.matricule || '',
            // Récupération du matricule de l'utilisateur
            cardID: user.cardID || '',
            // Récupération de l'ID de la carte de l'utilisateur
            assignmentDate: new Date().toISOString().split('T')[0],
            // Récupération de la date actuelle au format ISO
          };
        },
        (error) => {
          // Gestion des erreurs
          console.error(
            "Erreur lors de la récupération des informations de l'utilisateur",
            error
          );
        }
      );
    });

    this.rfidService.listen().subscribe((data) => {
      // Abonnement aux événements RFID
      if (data.cardId) {
        // Si un ID de carte est détecté
        this.cardData.cardID = data.cardId;
        // Mise à jour de l'ID de la carte
      }
    });
  }

  scanRFID() {
    // Méthode pour scanner le RFID
    this.isScanning = true;
    // Indique que le scanning est en cours
    this.rfidService.listen().subscribe((data) => {
      // Abonnement aux événements RFID
      this.cardData.cardID = data.cardId;
      // Mise à jour de l'ID de la carte
      this.isScanning = false;
      // Indique que le scanning est terminé
    });
  }

  cancelAssignment() {
    // Méthode pour annuler l'assignation
    this.router.navigate(['/dashboard-admin']);
    // Redirection vers le tableau de bord admin
  }

  openConfirmationModal() {
    // Méthode pour ouvrir la modal de confirmation
    const modal = document.getElementById('confirmationModal');
    // Récupération de l'élément modal
    if (modal) {
      modal.style.display = 'block';
      // Affichage de la modal
    }
  }

  closeConfirmationModal() {
    // Méthode pour fermer la modal de confirmation
    const modal = document.getElementById('confirmationModal');
    // Récupération de l'élément modal
    if (modal) {
      modal.style.display = 'none';
      // Masquage de la modal
    }
  }

  openSuccessModal() {
    // Méthode pour ouvrir la modal de succès
    const modal = document.getElementById('successModal');
    // Récupération de l'élément modal
    if (modal) {
      modal.style.display = 'block';
      // Affichage de la modal
    }
  }

  closeSuccessModal() {
    // Méthode pour fermer la modal de succès
    const modal = document.getElementById('successModal');
    // Récupération de l'élément modal
    if (modal) {
      modal.style.display = 'none';
      // Masquage de la modal
      this.router.navigate(['/dashboard-admin']);
      // Redirection vers le tableau de bord admin
    }
  }

  confirmAssignment() {
    // Méthode pour confirmer l'assignation
    console.log('Assignment confirmed');
    // Log de confirmation
    // Envoyer la requête de mise à jour de l'utilisateur avec la carte UID
    this.userService
      .addCardId(this.route.snapshot.params['id'], this.cardData.cardID)
      .subscribe(
        (response) => {
          // Gestion de la réponse
          console.log('Carte assignée avec succès:', response);
          // Log de succès
          this.closeConfirmationModal();
          // Fermeture de la modal de confirmation
          this.openSuccessModal();
          // Ouverture de la modal de succès
        },
        (error) => {
          // Gestion des erreurs
          console.error("Erreur lors de l'assignation de la carte:", error);
        }
      );
  }
}
