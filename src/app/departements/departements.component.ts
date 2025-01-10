import { Component, OnInit } from '@angular/core';
import { DepartementService } from '../departement.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Ajoutez cette ligne
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-cohortes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NavbarComponent],
  templateUrl: './departements.component.html',
  styleUrls: ['./departements.component.css'],
})
export class DepartementsComponent implements OnInit {
  departements: any[] = [];
  showModal: boolean = false;
  showEditModal: boolean = false;
  showDeleteModal: boolean = false;
  showDeleteMultipleModal: boolean = false;
  departmentForm: FormGroup;
  editDepartmentForm: FormGroup;
  departementToEdit: any;
  departementToDelete: any;
  selectedDepartements: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  searchQuery: string = '';
  departementsLoaded: boolean = false;
  allDepartements: any[] = [];
  errorMessage: string | null = null;
  editErrorMessage: string | null = null;

  constructor(
    private departementService: DepartementService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.departmentForm = this.fb.group({
      nom_departement: ['', Validators.required],
      description: ['', Validators.required],
    });
    this.editDepartmentForm = this.fb.group({
      nom_departement: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    console.log('ngOnInit called');
    if (!this.departementsLoaded) {
      this.loadDepartements();
      this.departementsLoaded = true;
    }
  }

  // Charge la liste des départements
  loadDepartements(): void {
    console.log('loadDepartements called');
    this.departementService
      .getDepartements()
      .then((data) => {
        console.log('Départements chargés:', data);
        this.allDepartements = data; // Stocke la liste complète
        this.departements = data; // Initialise la liste affichée
      })
      .catch((error) => {
        console.error('Erreur lors du chargement des départements', error);
      });
  }

  // Fonction pour normaliser une chaîne et ignorer les accents
  normalizeString(str: string): string {
    return str
      .normalize('NFD') // Décompose les caractères accentués en leurs composants de base
      .replace(/[\u0300-\u036f]/g, ''); // Supprime les diacritiques (accents)
  }

  // Filtre les départements en fonction de la recherche
  filterDepartements(): void {
    console.log('filterDepartements called with query:', this.searchQuery);
    const normalizedQuery = this.normalizeString(
      this.searchQuery.trim().toLowerCase()
    );

    if (normalizedQuery === '') {
      // Réinitialise la liste des départements à la liste complète
      this.departements = this.allDepartements;
    } else {
      // Filtre les départements en fonction de la recherche (en ignorant les accents)
      this.departements = this.allDepartements.filter((departement: any) =>
        this.normalizeString(
          departement.nom_departement.toLowerCase()
        ).includes(normalizedQuery)
      );
    }
  }

  // Ouvre le modal de création
  openCreateModal(): void {
    console.log('Ouverture du modal de création');
    this.showModal = true;
  }

  // Ferme le modal de création
  closeModal(): void {
    console.log('Fermeture du modal de création');
    this.showModal = false;
    this.departmentForm.reset();
    this.errorMessage = null;
  }

  // Crée un nouveau département
  createDepartement(event: Event): void {
    event.preventDefault();
    if (this.departmentForm.valid) {
      this.departementService
        .createDepartement(this.departmentForm.value)
        .then((response: any) => {
          console.log('Département créé avec succès', response);
          this.loadDepartements();
          this.closeModal();
        })
        .catch((error: any) => {
          console.error('Erreur lors de la création du département', error);
          if (
            error.response &&
            error.response.data &&
            error.response.data.errors &&
            error.response.data.errors.nom_departement
          ) {
            this.errorMessage = error.response.data.errors.nom_departement[0];
            this.departmentForm
              .get('nom_departement')
              ?.setErrors({ unique: true });
          } else {
            this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
          }
        });
    } else {
      console.error(
        'Formulaire de création invalide',
        this.departmentForm.errors
      );
    }
  }

  // Ouvre le modal de modification
  openEditModal(departement: any): void {
    console.log(
      'Ouverture du modal de modification pour le département',
      departement
    );
    this.departementToEdit = departement;
    this.editDepartmentForm.patchValue({
      nom_departement: departement.nom_departement,
      description: departement.description,
    });
    this.showEditModal = true;
  }

  // Ferme le modal de modification
  closeEditModal(): void {
    console.log('Fermeture du modal de modification');
    this.showEditModal = false;
    this.departementToEdit = null;
    this.editDepartmentForm.reset();
    this.editErrorMessage = null;
  }

  // Met à jour un département
  updateDepartement(event: Event): void {
    event.preventDefault();
    if (this.editDepartmentForm.valid && this.departementToEdit) {
      this.departementService
        .updateDepartement(
          this.departementToEdit.id,
          this.editDepartmentForm.value
        )
        .then((response: any) => {
          console.log('Département mis à jour avec succès', response);
          this.loadDepartements();
          this.closeEditModal();
        })
        .catch((error: any) => {
          console.error('Erreur lors de la mise à jour du département', error);
          if (
            error.response &&
            error.response.data &&
            error.response.data.errors &&
            error.response.data.errors.nom_departement
          ) {
            this.editErrorMessage =
              error.response.data.errors.nom_departement[0];
            this.editDepartmentForm
              .get('nom_departement')
              ?.setErrors({ unique: true });
          } else {
            this.editErrorMessage =
              'Une erreur est survenue. Veuillez réessayer.';
          }
        });
    } else {
      console.error(
        'Formulaire de modification invalide',
        this.editDepartmentForm.errors
      );
    }
  }

  // Ouvre le modal de suppression
  openDeleteModal(departement: any): void {
    console.log(
      'Ouverture du modal de suppression pour le département',
      departement
    );
    this.departementToDelete = departement;
    this.showDeleteModal = true;
  }

  // Ferme le modal de suppression
  closeDeleteModal(): void {
    console.log('Fermeture du modal de suppression');
    this.showDeleteModal = false;
    this.departementToDelete = null;
  }

  // Vérifie si un département peut être supprimé
  canDeleteDepartement(departement: any): boolean {
    return departement && departement.users && departement.users.length === 0;
  }

  // Vérifie si tous les départements sélectionnés peuvent être supprimés
  canDeleteSelectedDepartements(): boolean {
    return this.selectedDepartements.every((departement) =>
      this.canDeleteDepartement(departement)
    );
  }

  // Vérifie si un département sélectionné contient des utilisateurs
  hasUsersInSelectedDepartements(): boolean {
    return this.selectedDepartements.some(
      (departement) => departement.users && departement.users.length > 0
    );
  }

  // Confirme la suppression d'un département
  confirmDelete(): void {
    if (
      this.departementToDelete &&
      this.canDeleteDepartement(this.departementToDelete)
    ) {
      this.departementService
        .deleteDepartement(this.departementToDelete.id)
        .then((response) => {
          console.log('Département supprimé avec succès', response);
          this.loadDepartements();
          this.closeDeleteModal();
        })
        .catch((error) => {
          console.error('Erreur lors de la suppression du département', error);
        });
    } else {
      console.log(
        'Ce département contient des utilisateurs, il ne peut pas être supprimé.'
      );
    }
  }

  // Confirme la suppression multiple de départements
  confirmDeleteMultiple(): void {
    if (this.canDeleteSelectedDepartements()) {
      this.selectedDepartements.forEach((departement) => {
        this.departementService
          .deleteDepartement(departement.id)
          .then((response) => {
            console.log('Département supprimé avec succès', response);
            this.loadDepartements();
          })
          .catch((error) => {
            console.error(
              'Erreur lors de la suppression du département',
              error
            );
          });
      });
      this.selectedDepartements = [];
      this.closeDeleteMultipleModal();
    } else {
      console.log(
        'Un ou plusieurs départements sélectionnés contiennent des utilisateurs, ils ne peuvent pas être supprimés.'
      );
    }
  }

  // Ouvre le modal de suppression multiple
  openDeleteMultipleModal(): void {
    console.log('Ouverture du modal de suppression multiple');
    this.showDeleteMultipleModal = true;
  }

  // Ferme le modal de suppression multiple
  closeDeleteMultipleModal(): void {
    console.log('Fermeture du modal de suppression multiple');
    this.showDeleteMultipleModal = false;
  }

  // Ajoute ou retire un département de la sélection
  toggleSelection(departement: any): void {
    const index = this.selectedDepartements.indexOf(departement);
    if (index > -1) {
      this.selectedDepartements.splice(index, 1);
    } else {
      this.selectedDepartements.push(departement);
    }
  }

  // Sélectionne ou désélectionne tous les départements
  toggleAllSelection(): void {
    const allSelected = this.departements.every(
      (departement) => departement.selected
    );
    this.departements.forEach((departement) => {
      departement.selected = !allSelected;
    });
    this.selectedDepartements = allSelected ? [] : this.departements;
  }

  // Ouvre le modal de suppression multiple pour les départements sélectionnés
  deleteSelectedDepartements(): void {
    console.log(
      'Ouverture du modal de suppression multiple pour les départements sélectionnés',
      this.selectedDepartements
    );
    this.openDeleteMultipleModal();
  }

  // Recherche des départements
  searchDepartements(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.searchQuery = target.value;
      console.log(
        'Recherche des départements avec la requête',
        this.searchQuery
      );
      this.filterDepartements();
    }
  }

  // Pagination
  get paginatedDepartements(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.departements.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.departements.length / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Navigue vers la page de détails du département
  viewDepartementDetails(departementId: number): void {
    this.router.navigate(['/departement', departementId]);
  }
}
