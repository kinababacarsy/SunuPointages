import { Component, OnInit } from '@angular/core';
import { CohorteService } from '../cohorte.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cohortes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './cohortes.component.html',
  styleUrls: ['./cohortes.component.css'],
})
export class CohortesComponent implements OnInit {
  cohortes: any[] = [];
  showModal: boolean = false;
  showEditModal: boolean = false;
  showDeleteModal: boolean = false;
  showDeleteMultipleModal: boolean = false;
  cohorteForm: FormGroup;
  editCohorteForm: FormGroup;
  cohorteToEdit: any;
  cohorteToDelete: any;
  selectedCohortes: any[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  searchQuery: string = '';
  cohortesLoaded: boolean = false; // Ajout de cette variable

  constructor(private cohorteService: CohorteService, private fb: FormBuilder) {
    this.cohorteForm = this.fb.group({
      nom_cohorte: ['', Validators.required],
      description: ['', Validators.required],
    });
    this.editCohorteForm = this.fb.group({
      nom_cohorte: ['', Validators.required],
      description: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    console.log('ngOnInit called');
    if (!this.cohortesLoaded) {
      this.loadCohortes();
      this.cohortesLoaded = true;
    }
  }

  loadCohortes(): void {
    console.log('loadCohortes called');
    this.cohorteService
      .getCohortes()
      .then((data) => {
        console.log('Cohortes loaded:', data);
        this.cohortes = data;
        this.filterCohortes();
      })
      .catch((error) => {
        console.error('Erreur lors du chargement des cohortes', error);
      });
  }

  filterCohortes(): void {
    console.log('filterCohortes called with query:', this.searchQuery);
    if (this.searchQuery.trim() === '') {
      // Si la requête de recherche est vide, ne filtrez pas les cohortes
      this.cohortes = this.cohortes;
    } else {
      this.cohorteService
        .getCohortes()
        .then((data) => {
          this.cohortes = data.filter((cohorte: any) =>
            cohorte.nom_cohorte
              .toLowerCase()
              .includes(this.searchQuery.toLowerCase())
          );
        })
        .catch((error) => {
          console.error('Erreur lors de la recherche des cohortes', error);
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
    this.cohorteForm.reset();
  }

  createCohorte(event: Event): void {
    event.preventDefault();
    if (this.cohorteForm.valid) {
      this.cohorteService
        .createCohorte(this.cohorteForm.value)
        .then((response) => {
          console.log('Cohorte créée avec succès', response);
          this.loadCohortes();
          this.closeModal();
        })
        .catch((error) => {
          console.error('Erreur lors de la création de la cohorte', error);
        });
    } else {
      console.error('Formulaire de création invalide', this.cohorteForm.errors);
    }
  }

  openEditModal(cohorte: any): void {
    console.log('Ouverture du modal de modification pour la cohorte', cohorte);
    this.cohorteToEdit = cohorte;
    this.editCohorteForm.patchValue({
      nom_cohorte: cohorte.nom_cohorte,
      description: cohorte.description,
    });
    this.showEditModal = true;
  }

  closeEditModal(): void {
    console.log('Fermeture du modal de modification');
    this.showEditModal = false;
    this.cohorteToEdit = null;
    this.editCohorteForm.reset();
  }

  updateCohorte(event: Event): void {
    event.preventDefault();
    if (this.editCohorteForm.valid && this.cohorteToEdit) {
      this.cohorteService
        .updateCohorte(this.cohorteToEdit.id, this.editCohorteForm.value)
        .then((response) => {
          console.log('Cohorte mise à jour avec succès', response);
          this.loadCohortes();
          this.closeEditModal();
        })
        .catch((error) => {
          console.error('Erreur lors de la mise à jour de la cohorte', error);
        });
    } else {
      console.error(
        'Formulaire de modification invalide',
        this.editCohorteForm.errors
      );
    }
  }

  openDeleteModal(cohorte: any): void {
    console.log('Ouverture du modal de suppression pour la cohorte', cohorte);
    this.cohorteToDelete = cohorte;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    console.log('Fermeture du modal de suppression');
    this.showDeleteModal = false;
    this.cohorteToDelete = null;
  }

  confirmDelete(): void {
    if (this.cohorteToDelete) {
      this.cohorteService
        .deleteCohorte(this.cohorteToDelete.id)
        .then((response) => {
          console.log('Cohorte supprimée avec succès', response);
          this.loadCohortes();
          this.closeDeleteModal();
        })
        .catch((error) => {
          console.error('Erreur lors de la suppression de la cohorte', error);
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
    this.selectedCohortes.forEach((cohorte) => {
      this.cohorteService
        .deleteCohorte(cohorte.id)
        .then((response) => {
          console.log('Cohorte supprimée avec succès', response);
          this.loadCohortes();
        })
        .catch((error) => {
          console.error('Erreur lors de la suppression de la cohorte', error);
        });
    });
    this.selectedCohortes = [];
    this.closeDeleteMultipleModal();
  }

  toggleSelection(cohorte: any): void {
    const index = this.selectedCohortes.indexOf(cohorte);
    if (index > -1) {
      this.selectedCohortes.splice(index, 1);
    } else {
      this.selectedCohortes.push(cohorte);
    }
  }

  toggleAllSelection(): void {
    const allSelected = this.cohortes.every((cohorte) => cohorte.selected);
    this.cohortes.forEach((cohorte) => {
      cohorte.selected = !allSelected;
    });
    this.selectedCohortes = allSelected ? [] : this.cohortes;
  }

  deleteSelectedCohortes(): void {
    console.log(
      'Ouverture du modal de suppression multiple pour les cohortes sélectionnées',
      this.selectedCohortes
    );
    this.openDeleteMultipleModal();
  }

  searchCohortes(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.searchQuery = target.value;
      console.log('Recherche des cohortes avec la requête', this.searchQuery);
      this.filterCohortes();
    }
  }

  get paginatedCohortes(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.cohortes.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.cohortes.length / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }
}
