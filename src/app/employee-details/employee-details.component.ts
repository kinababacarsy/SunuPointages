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

        // Charger les pointages de l'employé pour la semaine sélectionnée
        this.loadEmployeePointages(employeeId);

        // Charger les absences de l'employé pour la semaine sélectionnée
        this.loadEmployeeAbsences(employeeId);
      },
      error: (error) => {
        this.errorMessage =
          "Erreur lors du chargement des détails de l'employé. Veuillez réessayer.";
        this.isLoading = false;
        console.error(error);
      },
    });
  }

  // Charger les pointages de l'employé pour la semaine sélectionnée
  loadEmployeePointages(userId: string): void {
    const startDate = this.weekDates[0].date.toISOString().split('T')[0]; // Date de début de la semaine
    const endDate = this.weekDates[4].date.toISOString().split('T')[0]; // Date de fin de la semaine

    this.userService
      .getEmployeePointages(userId, startDate, endDate)
      .subscribe({
        next: (pointages) => {
          this.updateTableWithPointages(pointages);
        },
        error: (error) => {
          console.error('Erreur lors du chargement des pointages:', error);
        },
      });
  }

  // Charger les absences de l'employé pour la semaine sélectionnée
  loadEmployeeAbsences(userId: string): void {
    const startDate = this.weekDates[0].date.toISOString().split('T')[0]; // Date de début de la semaine
    const endDate = this.weekDates[4].date.toISOString().split('T')[0]; // Date de fin de la semaine

    this.userService.getEmployeeAbsences(userId, startDate, endDate).subscribe({
      next: (absences) => {
        this.updateTableWithAbsences(absences);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des absences:', error);
      },
    });
  }

  // Mettre à jour le tableau avec les pointages
  updateTableWithPointages(pointages: any[]): void {
    this.weekDates.forEach((weekDate) => {
      const pointage = pointages.find(
        (p) => p.date === weekDate.date.toISOString().split('T')[0]
      );

      if (pointage) {
        // Mettre à jour les colonnes "Arrivée", "Départ", "Retard", "Absence", "Commentaire"
        weekDate.data[0] = pointage.type === 'Check-In' ? pointage.heure : '-';
        weekDate.data[1] = pointage.type === 'Check-Out' ? pointage.heure : '-';

        // Calculer le retard si l'heure de Check-In est après 9h00
        if (pointage.type === 'Check-In' && pointage.heure) {
          const heureCheckIn = new Date(`1970-01-01T${pointage.heure}Z`);
          const heureEntreePrevue = new Date(`1970-01-01T09:00:00Z`);

          if (heureCheckIn > heureEntreePrevue) {
            const retardEnMinutes = Math.floor(
              (heureCheckIn.getTime() - heureEntreePrevue.getTime()) / 60000
            );
            weekDate.data[2] = `${retardEnMinutes} min`;
          } else {
            weekDate.data[2] = '-';
          }
        } else {
          weekDate.data[2] = '-';
        }

        // Mettre à jour les colonnes "Absence" et "Commentaire" si c'est une absence
        if (pointage.type === 'Absence') {
          weekDate.data[3] = pointage.absenceType || '-';
          weekDate.data[4] = pointage.description || '-';
        } else {
          weekDate.data[3] = '-';
          weekDate.data[4] = '-';
        }
      } else {
        // Réinitialiser les données si aucun pointage n'est trouvé pour cette date
        weekDate.data = ['-', '-', '-', '-', '-', '-'];
      }
    });
  }

  // Mettre à jour le tableau avec les absences
  updateTableWithAbsences(absences: any[]): void {
    this.weekDates.forEach((weekDate) => {
      const absence = absences.find(
        (a) => a.date === weekDate.date.toISOString().split('T')[0]
      );

      if (absence) {
        // Mettre à jour les colonnes "Absence" et "Commentaire"
        weekDate.data[3] = absence.absenceType || '-'; // Colonne "Absence"
        weekDate.data[4] = absence.description || '-'; // Colonne "Commentaire"
      } else {
        // Réinitialiser les colonnes si aucune absence n'est trouvée pour cette date
        weekDate.data[3] = '-';
        weekDate.data[4] = '-';
      }
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

    // Recharger les pointages si l'employé est déjà chargé
    if (this.employee?.id) {
      this.loadEmployeePointages(this.employee.id);
      this.loadEmployeeAbsences(this.employee.id);
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
    if (!this.startDate || !this.endDate) {
      console.error('Veuillez sélectionner une date de début et de fin.');
      return;
    }

    const start = new Date(this.startDate);
    const end = new Date(this.endDate);

    // Parcourir toutes les dates de la semaine sélectionnée
    this.weekDates.forEach((weekDate) => {
      const currentDate = weekDate.date;

      // Vérifier si la date actuelle est dans la plage d'absence
      if (currentDate >= start && currentDate <= end) {
        // Mettre à jour la colonne "Absence" (index 3) avec le type d'absence
        weekDate.data[3] = this.absenceType;

        // Mettre à jour la colonne "Commentaire" (index 4) avec la description
        weekDate.data[4] = this.description;
      }
    });

    // Envoyer les données au backend pour enregistrement
    const absenceData = {
      userId: this.employee.id,
      startDate: this.startDate,
      endDate: this.endDate,
      absenceType: this.absenceType,
      description: this.description,
    };

    this.userService.saveAbsence(absenceData).subscribe({
      next: () => {
        console.log('Absence enregistrée avec succès.');
      },
      error: (error) => {
        console.error("Erreur lors de l'enregistrement de l'absence:", error);
      },
    });

    // Fermer le modal
    this.closeAbsenceModal();
  }

  // Méthode pour réinitialiser le formulaire
  resetForm(): void {
    this.startDate = '';
    this.endDate = '';
    this.absenceType = 'maladie';
    this.description = '';
  }

  // Basculer le statut de l'employé
  toggleStatus(): void {
    const newStatus = this.employee.status === 'Actif' ? 'Bloque' : 'Actif';
    this.updateEmployeeStatus(newStatus);
  }

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
      },
      error: (error) => {
        if (error.response && error.response.data) {
          console.error("Détails de l'erreur :", error.response.data);
          this.errorMessage =
            error.response.data.message ||
            'Erreur lors de la mise à jour du statut.';
        } else {
          this.errorMessage =
            'Erreur lors de la mise à jour du statut. Veuillez réessayer.';
        }
        console.error(error);
        alert(this.errorMessage);
      },
    });
  }
}
