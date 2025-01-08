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
import { Router } from '@angular/router'; // Ajoutez cette ligne
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-cohortes',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NavbarComponent],
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
  cohortesLoaded: boolean = false;
  errorMessage: string | null = null;
  editErrorMessage: string | null = null;

  constructor(
    private cohorteService: CohorteService,
    private fb: FormBuilder,
    private router: Router
  ) {
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

  // Charge la liste des cohortes
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

  // Filtre les cohortes en fonction de la recherche
  filterCohortes(): void {
    console.log('filterCohortes called with query:', this.searchQuery);
    if (this.searchQuery.trim() === '') {
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

  // Ouvre le modal de création
  openCreateModal(): void {
    console.log('Ouverture du modal de création');
    this.showModal = true;
  }

  // Ferme le modal de création
  closeModal(): void {
    console.log('Fermeture du modal de création');
    this.showModal = false;
    this.cohorteForm.reset();
  }

  // Crée une nouvelle cohorte
  createCohorte(event: Event): void {
    event.preventDefault();
    if (this.cohorteForm.valid) {
      this.cohorteService
        .createCohorte(this.cohorteForm.value)
        .then((response: any) => {
          console.log('Cohorte créée avec succès', response);
          this.loadCohortes();
          this.closeModal();
        })
        .catch((error: any) => {
          console.error('Erreur lors de la création de la cohorte', error);
          if (
            error.response &&
            error.response.data &&
            error.response.data.errors &&
            error.response.data.errors.nom_cohorte
          ) {
            this.errorMessage = error.response.data.errors.nom_cohorte[0];
            this.cohorteForm.get('nom_cohorte')?.setErrors({ unique: true });
          } else {
            this.errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
          }
        });
    } else {
      console.error('Formulaire de création invalide', this.cohorteForm.errors);
    }
  }

  // Ouvre le modal de modification
  openEditModal(cohorte: any): void {
    console.log('Ouverture du modal de modification pour la cohorte', cohorte);
    this.cohorteToEdit = cohorte;
    this.editCohorteForm.patchValue({
      nom_cohorte: cohorte.nom_cohorte,
      description: cohorte.description,
    });
    this.showEditModal = true;
  }

  // Ferme le modal de modification
  closeEditModal(): void {
    console.log('Fermeture du modal de modification');
    this.showEditModal = false;
    this.cohorteToEdit = null;
    this.editCohorteForm.reset();
  }

  // Met à jour une cohorte
  updateCohorte(event: Event): void {
    event.preventDefault();
    if (this.editCohorteForm.valid && this.cohorteToEdit) {
      this.cohorteService
        .updateCohorte(this.cohorteToEdit.id, this.editCohorteForm.value)
        .then((response: any) => {
          console.log('Cohorte mise à jour avec succès', response);
          this.loadCohortes();
          this.closeEditModal();
        })
        .catch((error: any) => {
          console.error('Erreur lors de la mise à jour de la cohorte', error);
          if (
            error.response &&
            error.response.data &&
            error.response.data.errors &&
            error.response.data.errors.nom_cohorte
          ) {
            this.editErrorMessage = error.response.data.errors.nom_cohorte[0];
            this.editCohorteForm
              .get('nom_cohorte')
              ?.setErrors({ unique: true });
          } else {
            this.editErrorMessage =
              'Une erreur est survenue. Veuillez réessayer.';
          }
        });
    } else {
      console.error(
        'Formulaire de modification invalide',
        this.editCohorteForm.errors
      );
    }
  }

  // Ouvre le modal de suppression
  openDeleteModal(cohorte: any): void {
    console.log('Ouverture du modal de suppression pour la cohorte', cohorte);
    this.cohorteToDelete = cohorte;
    this.showDeleteModal = true;
  }

  // Ferme le modal de suppression
  closeDeleteModal(): void {
    console.log('Fermeture du modal de suppression');
    this.showDeleteModal = false;
    this.cohorteToDelete = null;
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

  // Vérifie si une cohorte peut être supprimée
  canDeleteCohorte(cohorte: any): boolean {
    return cohorte && cohorte.users && cohorte.users.length === 0;
  }

  // Vérifie si toutes les cohortes sélectionnées peuvent être supprimées
  canDeleteSelectedCohortes(): boolean {
    return this.selectedCohortes.every((cohorte) =>
      this.canDeleteCohorte(cohorte)
    );
  }

  // Vérifie si une cohorte sélectionnée contient des apprenants
  hasApprenantsInSelectedCohortes(): boolean {
    return this.selectedCohortes.some(
      (cohorte) => cohorte.users && cohorte.users.length > 0
    );
  }

  // Confirme la suppression d'une cohorte
  confirmDelete(): void {
    if (this.cohorteToDelete && this.canDeleteCohorte(this.cohorteToDelete)) {
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
    } else {
      console.log(
        'Cette cohorte contient des apprenants, elle ne peut pas être supprimée.'
      );
    }
  }

  // Confirme la suppression multiple de cohortes
  confirmDeleteMultiple(): void {
    if (this.canDeleteSelectedCohortes()) {
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
    } else {
      console.log(
        'Une ou plusieurs cohortes sélectionnées contiennent des apprenants, elles ne peuvent pas être supprimées.'
      );
    }
  }

  // Ajoute ou retire une cohorte de la sélection
  toggleSelection(cohorte: any): void {
    const index = this.selectedCohortes.indexOf(cohorte);
    if (index > -1) {
      this.selectedCohortes.splice(index, 1);
    } else {
      this.selectedCohortes.push(cohorte);
    }
  }

  // Sélectionne ou désélectionne toutes les cohortes
  toggleAllSelection(): void {
    const allSelected = this.cohortes.every((cohorte) => cohorte.selected);
    this.cohortes.forEach((cohorte) => {
      cohorte.selected = !allSelected;
    });
    this.selectedCohortes = allSelected ? [] : this.cohortes;
  }

  // Ouvre le modal de suppression multiple pour les cohortes sélectionnées
  deleteSelectedCohortes(): void {
    console.log(
      'Ouverture du modal de suppression multiple pour les cohortes sélectionnées',
      this.selectedCohortes
    );
    this.openDeleteMultipleModal();
  }

  // Recherche des cohortes
  searchCohortes(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target) {
      this.searchQuery = target.value;
      console.log('Recherche des cohortes avec la requête', this.searchQuery);
      this.filterCohortes();
    }
  }

  // Pagination
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

  // Navigue vers la page de détails de la cohorte
  viewCohorteDetails(cohorteId: number): void {
    this.router.navigate(['/cohorte', cohorteId]);
  }
}
