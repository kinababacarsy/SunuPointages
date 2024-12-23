import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-assignation-carte',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './assignation-carte.component.html',
  styleUrl: './assignation-carte.component.css'
})
export class AssignationCarteComponent {


  cardData = {
    fullName: 'Satorou Gojo',
    matricule: 'APP001',
    cardNumber: '',
    assignmentDate: '12/10/2024'
  };

  scanRFID() {
    // Logique pour scanner la carte RFID
    console.log('Scanning RFID...');
  }

  cancelAssignment() {
    // Logique pour annuler
    console.log('Assignment cancelled');
  }

  confirmAssignment() {
    // Logique pour confirmer
    console.log('Assignment confirmed');
  }
}
