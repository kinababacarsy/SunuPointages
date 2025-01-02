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

@Component({
  selector: 'app-departements',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
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
  itemsPerPage: number = 10;
  searchQuery: string = '';
  departementsLoaded: boolean = false;

  constructor(
    private departementService: DepartementService,
    private fb: FormBuilder,
    private router: Router // Ajoutez cette ligne
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

  loadDepartements(): void {
    console.log('loadDepartements called');
    this.departementService
      .getDepartements()
      .then((data) => {
        console.log('Departements loaded:', data);
        this.departements = data;
        this.filterDepartements();
      })
      .catch((error) => {
        console.error('Erreur lors du chargement des départements', error);
      });
  }

  filterDepartements(): void {
    console.log('filterDepartements called with query:', this.searchQuery);
    if (this.searchQuery.trim() === '') {
      this.departements = this.departements;
    } else {
      this.departementService
        .getDepartements()
        .then((data) => {
          this.departements = data.filter((departement: any) =>
            departement.nom_departement
              .toLowerCase()
              .includes(this.searchQuery.toLowerCase())
          );
        })
        .catch((error) => {
          console.error('Erreur lors de la recherche des départements', error);
        });
    }
  }

  openCreateModal(): void {
    console.log('Ouverture du modal de création');
    this.showModal = true;
  }

  closeModal(): void {
    console.log('Fermeture du modal de création');
    this.showModal = false;
    this.departmentForm.reset();
  }

  createDepartement(event: Event): void {
    event.preventDefault();
    if (this.departmentForm.valid) {
      this.departementService
        .createDepartement(this.departmentForm.value)
        .then((response) => {
          console.log('Département créé avec succès', response);
          this.loadDepartements();
          this.closeModal();
        })
        .catch((error) => {
          console.error('Erreur lors de la création du département', error);
        });
    } else {
      console.error(
        'Formulaire de création invalide',
        this.departmentForm.errors
      );
    }
  }
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

  closeEditModal(): void {
    console.log('Fermeture du modal de modification');
    this.showEditModal = false;
    this.departementToEdit = null;
    this.editDepartmentForm.reset();
  }

  updateDepartement(event: Event): void {
    event.preventDefault();
    if (this.editDepartmentForm.valid && this.departementToEdit) {
      this.departementService
        .updateDepartement(
          this.departementToEdit.id,
          this.editDepartmentForm.value
        )
        .then((response) => {
          console.log('Département mis à jour avec succès', response);
          this.loadDepartements();
          this.closeEditModal();
        })
        .catch((error) => {
          console.error('Erreur lors de la mise à jour du département', error);
        });
    } else {
      console.error(
        'Formulaire de modification invalide',
        this.editDepartmentForm.errors
      );
    }
  }

  openDeleteModal(departement: any): void {
    console.log(
      'Ouverture du modal de suppression pour le département',
      departement
    );
    this.departementToDelete = departement;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    console.log('Fermeture du modal de suppression');
    this.showDeleteModal = false;
    this.departementToDelete = null;
  }

  confirmDelete(): void {
    if (this.departementToDelete) {
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
    }
  }

  openDeleteMultipleModal(): void {
    console.log('Ouverture du modal de suppression multiple');
    this.showDeleteMultipleModal = true;
  }

  closeDeleteMultipleModal(): void {
    console.log('Fermeture du modal de suppression multiple');
    this.showDeleteMultipleModal = false;
  }

  confirmDeleteMultiple(): void {
    this.selectedDepartements.forEach((departement) => {
      this.departementService
        .deleteDepartement(departement.id)
        .then((response) => {
          console.log('Département supprimé avec succès', response);
          this.loadDepartements();
        })
        .catch((error) => {
          console.error('Erreur lors de la suppression du département', error);
        });
    });
    this.selectedDepartements = [];
    this.closeDeleteMultipleModal();
  }

  toggleSelection(departement: any): void {
    const index = this.selectedDepartements.indexOf(departement);
    if (index > -1) {
      this.selectedDepartements.splice(index, 1);
    } else {
      this.selectedDepartements.push(departement);
    }
  }

  toggleAllSelection(): void {
    const allSelected = this.departements.every(
      (departement) => departement.selected
    );
    this.departements.forEach((departement) => {
      departement.selected = !allSelected;
    });
    this.selectedDepartements = allSelected ? [] : this.departements;
  }

  deleteSelectedDepartements(): void {
    console.log(
      'Ouverture du modal de suppression multiple pour les départements sélectionnés',
      this.selectedDepartements
    );
    this.openDeleteMultipleModal();
  }

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

  // Ajoutez cette méthode pour naviguer vers la page de détails du département
  viewDepartementDetails(departementId: number): void {
    this.router.navigate(['/departement', departementId]);
  }
}
