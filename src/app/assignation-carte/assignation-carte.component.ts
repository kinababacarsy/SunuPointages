// assignation-carte.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RfidService } from '../rfid.service';
import { Route, RouterModule } from '@angular/router';

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
    fullName: 'Satorou Gojo',
    matricule: 'APP001',
    cardNumber: '',
    assignmentDate: '12/10/2024'
  };
  router: any;

  constructor(private rfidService: RfidService) {}

  ngOnInit() {
    this.rfidService.listen().subscribe((data) => {
      if (data.cardId) {
        this.cardData.cardNumber = data.cardId;
      }
    });
  }

  scanRFID() {
    // Logique pour scanner la carte RFID
    console.log('Scanning RFID...');
  }

  cancelAssignment() {
    // Logique pour annuler
    this.router.navigate(['/dashboard-admin']);
  }

  confirmAssignment() {
    // Logique pour confirmer
    console.log('Assignment confirmed');
  }
}
