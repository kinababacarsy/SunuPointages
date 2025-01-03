import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssignationCarteService } from '../services/assignation-carte.service';
@Component({
  selector: 'app-assignation-carte',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assignation-carte.component.html',
  styleUrls: ['./assignation-carte.component.css'],
})
export class AssignationCarteComponent {
  cardData = {
    fullName: 'Satorou Gojo',
    matricule: 'APP001',
    cardNumber: '',
    assignmentDate: new Date().toLocaleDateString(),
  };

  message = '';
  cardStatus = '';

  constructor(private AssignationCarteService: AssignationCarteService) {}

  scanRFID() {
    // Simule le scan et vérifie l'état de la carte
    this.AssignationCarteService.verifierEtatCarte(this.cardData.cardNumber).subscribe(
      (response) => {
        this.message = response.message;
        this.cardStatus = 'active';
      },
      (error) => {
        this.message = error.error.message || 'Erreur lors de la vérification.';
        this.cardStatus = 'inactive';
      }
    );
  }

  confirmAssignment() {
    // Assigne la carte à l'utilisateur
    const userId = '123'; // Remplace par l'ID réel de l'utilisateur
    this.AssignationCarteService.assignerCarte(userId, this.cardData.cardNumber).subscribe(
      (response) => {
        this.message = 'Carte assignée avec succès !';
        console.log(response);
      },
      (error) => {
        this.message = error.error.message || 'Erreur lors de l\'assignation.';
      }
    );
  }

  cancelAssignment() {
    // Réinitialise les données du formulaire
    this.cardData.cardNumber = '';
    this.message = 'Assignation annulée.';
    this.cardStatus = '';
  }
}
