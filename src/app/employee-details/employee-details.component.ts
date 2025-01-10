import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService, User } from '../user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-employee-details',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './employee-details.component.html',
  styleUrls: ['./employee-details.component.css'],
})
export class EmployeeDetailsComponent implements OnInit {
  employee: any = null; // Données de l'employé
  isLoading: boolean = true;
  errorMessage: string | null = null;
  updateData: string = '';

  // Variables pour la sélection de la semaine
  selectedWeek: Date = new Date(); // Semaine sélectionnée (par défaut, la semaine actuelle)
  weekDates: { date: Date; data: string[] }[] = []; // Dates de la semaine sélectionnée (lundi à vendredi) avec données
  headers = [
    'Date',
    'Arrivée',
    'Départ',
    'Retard',
    'Absence',
    'Commentaire',
    'Teams',
  ]; // En-têtes de la table

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
    const employeeId = this.route.snapshot.paramMap.get('id');
    if (employeeId) {
      this.loadEmployeeDetails(employeeId);
    } else {
      this.errorMessage = "ID de l'employé non trouvé.";
      this.isLoading = false;
    }

    // Initialiser les dates de la semaine (lundi à vendredi)
    this.generateWeekDates(this.selectedWeek);
  }

  // Charger les détails de l'employé
  loadEmployeeDetails(employeeId: string): void {
    this.userService.getUser(employeeId).subscribe({
      next: (employee) => {
        this.employee = employee;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage =
          "Erreur lors du chargement des détails de l'employé. Veuillez réessayer.";
        this.isLoading = false;
        console.error(error);
      },
    });
  }

  // Basculer le statut de l'employé
  toggleStatus(): void {
    const newStatus = this.employee.status === 'Actif' ? 'Inactif' : 'Actif';
    this.updateEmployeeStatus(newStatus);
  }

  // Dans employee-details.component.ts
  updateEmployeeStatus(newStatus: string): void {
    if (!this.employee?.id) {
      console.error("ID de l'employé non défini");
      return;
    }

    // Crée un objet updateData conforme à Partial<User>
    const updateData: Partial<User> = {
      status: newStatus, // Envoie uniquement le statut
    };

    // Utilise la méthode updateUser existante
    this.userService.updateUser(this.employee.id, updateData).subscribe({
      next: () => {
        console.log('Statut mis à jour avec succès');
        if (this.employee) {
          this.employee.status = newStatus; // Met à jour le statut localement
        }
        alert('Statut mis à jour avec succès !');
      },
      error: (error) => {
        console.error(
          'Erreur lors de la mise à jour du statut',
          error.response?.data
        );
        alert('Erreur lors de la mise à jour du statut. Veuillez réessayer.');
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
      this.weekDates.push({ date: date, data: ['-', '-', '-', '-', '-', '-'] });
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
