// assignation-carte.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RfidService } from '../rfid.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-assignation-carte',
  imports: [CommonModule, FormsModule,RouterModule],
  templateUrl: './assignation-carte.component.html',
  styleUrls: ['./assignation-carte.component.css'],
  standalone: true,
  providers: [RfidService],

})
export class AssignationCarteComponent implements OnInit {
  cardData = {
    fullName: '',
    matricule: '',
    cardNumber: '',
    assignmentDate: ''
  };

  constructor(private rfidService: RfidService, private router: Router) {}

  ngOnInit() {
    const user = history.state.user;
    if (user) {
      this.cardData.fullName = user.fullName;
      this.cardData.matricule = user.matricule;
      this.cardData.assignmentDate = new Date().toISOString().split('T')[0];
    }

    this.rfidService.listen().subscribe((data) => {
      if (data.cardId) {
        this.cardData.cardNumber = data.cardId;
      }
    });
  }

  scanRFID() {
    this.rfidService.listen().subscribe(data => {
      this.cardData.cardNumber = data.cardNumber;
    });
  }

  cancelAssignment() {
    this.router.navigate(['/dashboard-admin']);
  }

  confirmAssignment() {
    // Logique pour confirmer l'assignation
    console.log('Assignment confirmed');
    // Envoyer la requête de mise à jour de l'utilisateur avec la carte UID
    this.rfidService.assignCard(this.cardData).subscribe(
      response => {
        console.log('Carte assignée avec succès:', response);
        this.router.navigate(['/dashboard-admin']);
      },
      error => {
        console.error('Erreur lors de l\'assignation de la carte:', error);
      }
    );
  }

}
