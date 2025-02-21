import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-apprenant-details',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent], // Importer FormsModule pour le two-way binding
  templateUrl: './apprenant-details.component.html',
  styleUrls: ['./apprenant-details.component.css'],
})
export class ApprenantDetailsComponent implements OnInit {
  apprenant: any = null; // Données de l'apprenant
  isLoading: boolean = true;
  errorMessage: string | null = null;

  // Variables pour la sélection de la semaine
  selectedWeek: Date = new Date(); // Semaine sélectionnée (par défaut, la semaine actuelle)
  weekDates: Date[] = []; // Dates de la semaine sélectionnée (lundi à vendredi)

  // Variables pour le modal d'absence
  showAbsenceModal: boolean = false; // Contrôle l'affichage du modal
  startDate: string = '';
  endDate: string = '';
  absenceType: string = 'maladie'; // Valeur par défaut
  description: string = '';

  constructor(
    private route: ActivatedRoute,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const apprenantId = this.route.snapshot.paramMap.get('id');
    if (apprenantId) {
      this.loadApprenantDetails(apprenantId);
    } else {
      this.errorMessage = "ID de l'apprenant non trouvé.";
      this.isLoading = false;
    }

    // Initialiser les dates de la semaine (lundi à vendredi)
    this.generateWeekDates(this.selectedWeek);
  }

  // Charger les détails de l'apprenant
  loadApprenantDetails(apprenantId: string): void {
    this.userService.getUser(apprenantId).subscribe({
      next: (apprenant) => {
        this.apprenant = apprenant;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage =
          "Erreur lors du chargement des détails de l'apprenant. Veuillez réessayer.";
        this.isLoading = false;
        console.error(error);
      },
    });
  }

  // Générer les dates de la semaine (lundi à vendredi)
  generateWeekDates(startDate: Date): void {
    this.weekDates = [];
    const startOfWeek = new Date(startDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Début de la semaine (lundi)

    for (let i = 0; i < 5; i++) {
      // Générer uniquement 5 jours (lundi à vendredi)
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      this.weekDates.push(date);
    }
  }

  // Changer la semaine sélectionnée
  changeWeek(offset: number): void {
    this.selectedWeek.setDate(this.selectedWeek.getDate() + offset * 7);
    this.generateWeekDates(this.selectedWeek);
  }

  // Méthode pour ouvrir le modal d'absence
  openAbsenceModal(): void {
    this.showAbsenceModal = true;
  }

  // Méthode pour fermer le modal d'absence
  closeAbsenceModal(): void {
    this.showAbsenceModal = false;
    this.resetForm(); // Réinitialiser le formulaire
  }

  // Méthode pour enregistrer l'absence
  saveAbsence(): void {
    const absenceData = {
      startDate: this.startDate,
      endDate: this.endDate,
      absenceType: this.absenceType,
      description: this.description,
    };
    console.log('Absence enregistrée:', absenceData); // Afficher les données dans la console
    this.closeAbsenceModal();
  }

  // Méthode pour réinitialiser le formulaire
  resetForm(): void {
    this.startDate = '';
    this.endDate = '';
    this.absenceType = 'maladie';
    this.description = '';
  }
}