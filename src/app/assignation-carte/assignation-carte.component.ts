// assignation-carte.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RfidService } from '../rfid.service';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { UserService, User } from '../user.service';

// Définir l'interface CardData
interface CardData {
  fullName: string;
  matricule: string;
  cardID: string;
  assignmentDate: string;
}

@Component({
  selector: 'app-assignation-carte',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './assignation-carte.component.html',
  styleUrls: ['./assignation-carte.component.css'],
  standalone: true,
  providers: [RfidService],
})
export class AssignationCarteComponent implements OnInit {
  cardData: CardData = {
    fullName: '',
    matricule: '',
    cardID: '',
    assignmentDate: ''
  };

  isScanning: boolean = false; // Add this property


  constructor(
    private rfidService: RfidService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const userId = params['id'];
      this.userService.getUserById(userId).subscribe(
        user => {
          this.cardData = {
            fullName: `${user.nom} ${user.prenom}`,
            matricule: user.matricule || '',
            cardID: user.cardID || '',
            assignmentDate: new Date().toISOString().split('T')[0]
          };
        },
        error => {
          console.error('Erreur lors de la récupération des informations de l\'utilisateur', error);
        }
      );
    });

    this.rfidService.listen().subscribe((data) => {
      if (data.cardId) {
        this.cardData.cardID = data.cardId;
      }
    });
  }

  scanRFID() {
    this.isScanning = true; // Set isScanning to true when scanning
    this.rfidService.listen().subscribe(data => {
      this.cardData.cardID = data.cardId;
      this.isScanning = false; // Reset isScanning to false after scanning
    });
  }

  cancelAssignment() {
    this.router.navigate(['/dashboard-admin']);
  }

  openConfirmationModal() {
    const modal = document.getElementById('confirmationModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  closeConfirmationModal() {
    const modal = document.getElementById('confirmationModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  openSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  closeSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
      modal.style.display = 'none';
      this.router.navigate(['/dashboard-admin']);
    }
  }

  confirmAssignment() {
    // Logique pour confirmer l'assignation
    console.log('Assignment confirmed');
    // Envoyer la requête de mise à jour de l'utilisateur avec la carte UID
    this.userService.addCardId(this.route.snapshot.params['id'], this.cardData.cardID).subscribe(
      response => {
        console.log('Carte assignée avec succès:', response);
        this.closeConfirmationModal();
        this.openSuccessModal();
      },
      error => {
        console.error('Erreur lors de l\'assignation de la carte:', error);
      }
    );
  }
}
