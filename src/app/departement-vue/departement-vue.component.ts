import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DepartementService } from '../departement.service';
import { UserService } from '../user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { AssignationCarteComponent } from '../assignation-carte/assignation-carte.component'; //import du component d'assignation

@Component({
  selector: 'app-departement-vue',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './departement-vue.component.html',
  styleUrls: ['./departement-vue.component.css'],
})
export class DepartementVueComponent implements OnInit {
  headers = [
    'Sélection',
    'Profil',
    'Nom et Prénom',
    'Matricule',
    'Département',
    'Téléphone',
    'Email',
    'Carte',
    '',
    'Actions',
    '',
    '',
  ];
  departement: any; // Informations du département
  users: any[] = []; // Liste complète des utilisateurs
  filteredUsers: any[] = []; // Liste des utilisateurs filtrés
  searchTerm: string = ''; // Terme de recherche
  currentPage: number = 1; // Page actuelle
  pages: number[] = []; // Liste des pages
  isLoading: boolean = true; // Indicateur de chargement
  errorMessage: string | null = null; // Message d'erreur
  selectedUsers: any[] = []; // Utilisateurs sélectionnés pour la suppression multiple
  showDeleteModal: boolean = false; // Afficher le modal de suppression unique
  showDeleteMultipleModal: boolean = false; // Afficher le modal de suppression multiple
  showChangeDeptModal: boolean = false; // Afficher le modal de changement de département
  userToDelete: any = null; // Utilisateur à supprimer
  userToChangeDept: any = null; // Utilisateur à changer de département
  newDepartementId: string = ''; // Nouveau département sélectionné
  departements: any[] = []; // Liste des départements disponibles
  sortField: string = 'nom'; // Champ de tri
  sortOrder: string = 'asc'; // Ordre de tri

  paginatedUsers: any[] = []; // Résultats paginés
  importedUsers: any[] = []; // Utilisateurs importés via CSV
  showImportModal: boolean = false; // Afficher le modal d'importation

  constructor(
    private route: ActivatedRoute,
    private departementService: DepartementService,
    private userService: UserService,
    private router: Router // Injecter le Router
  ) {}

  async ngOnInit(): Promise<void> {
    const departementId = this.route.snapshot.paramMap.get('id');
    if (departementId) {
      await this.loadDepartementAndUsers(departementId); // Charger les données initiales
      this.loadDepartements();
    } else {
      this.errorMessage = 'ID du département non trouvé.';
      this.isLoading = false;
    }
  }

  // Recharger les informations du département
  reloadDepartement(departementId: string): void {
    this.departementService
      .getDepartement(departementId)
      .then((departement) => {
        this.departement = departement;
      })
      .catch((error) => {
        this.errorMessage =
          'Erreur lors du rechargement du département. Veuillez réessayer.';
        console.error(error);
      });
  }

  // Méthode pour naviguer vers les détails de l'employé
  viewEmployeeDetails(userId: string): void {
    this.router.navigate(['/employee-details', userId]);
  }

  // Charger les informations du département et les utilisateurs associés
  loadDepartementAndUsers(departementId: string): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.departementService
      .getDepartement(departementId)
      .then((departement) => {
        this.departement = departement;
        this.userService.getUsersByDepartement(departementId).subscribe({
          next: (users) => {
            this.users = users;
            this.filteredUsers = users;
            this.sortUsers();
            this.updatePagination();
            this.isLoading = false;
          },
          error: (error) => {
            this.errorMessage =
              'Erreur lors du chargement des utilisateurs. Veuillez réessayer.';
            this.isLoading = false;
            console.error(error);
          },
        });
      })
      .catch((error) => {
        this.errorMessage =
          'Erreur lors du chargement du département. Veuillez réessayer.';
        this.isLoading = false;
        console.error(error);
      });
  }

  // Charger la liste des départements
  loadDepartements(): void {
    this.departementService.getDepartements().then((departements) => {
      this.departements = departements;
    });
  }

  // Fonction pour normaliser une chaîne et ignorer les accents
  normalizeString(str: string): string {
    return str
      .normalize('NFD') // Décompose les caractères accentués
      .replace(/[\u0300-\u036f]/g, '') // Supprime les diacritiques
      .toLowerCase(); // Convertit en minuscules
  }

  // Filtrer les utilisateurs en fonction du terme de recherche
  filterUsers(): void {
    const normalizedSearchTerm = this.normalizeString(this.searchTerm);

    this.filteredUsers = this.users.filter(
      (user) =>
        this.normalizeString(user.nom).includes(normalizedSearchTerm) ||
        this.normalizeString(user.prenom).includes(normalizedSearchTerm) ||
        this.normalizeString(user.matricule).includes(normalizedSearchTerm) ||
        this.normalizeString(user.email).includes(normalizedSearchTerm)
    );
    this.sortUsers();
    this.updatePagination();
  }

  // Mettre à jour la pagination
  updatePagination(): void {
    const totalPages = Math.ceil(this.filteredUsers.length / 10);
    this.pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    this.goToPage(1); // Revenir à la première page après filtrage ou tri
  }

  // Naviguer vers une page spécifique
  goToPage(page: number): void {
    if (page < 1 || page > this.pages.length) {
      return; // Ne rien faire si la page est invalide
    }

    this.currentPage = page;
    const start = (page - 1) * 10;
    const end = start + 10;
    this.paginatedUsers = this.filteredUsers.slice(start, end);
  }

  // Trier les utilisateurs
  sortUsers(): void {
    this.filteredUsers.sort((a, b) => {
      const fieldA = a[this.sortField];
      const fieldB = b[this.sortField];
      if (this.sortOrder === 'asc') {
        return fieldA > fieldB ? 1 : -1;
      } else {
        return fieldA < fieldB ? 1 : -1;
      }
    });
  }

  // Ouvrir le modal de suppression unique
  openDeleteModal(user: any): void {
    this.userToDelete = user;
    this.showDeleteModal = true;
  }

  // Fermer le modal de suppression unique
  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.userToDelete = null;
  }

  // Confirmer la suppression unique
  confirmDelete(): void {
    if (this.userToDelete) {
      this.userService.deleteUser(this.userToDelete.id).subscribe({
        next: () => {
          // Supprimer l'utilisateur de la liste
          this.users = this.users.filter(
            (user) => user.id !== this.userToDelete.id
          );
          this.filteredUsers = this.filteredUsers.filter(
            (user) => user.id !== this.userToDelete.id
          );
          this.updatePagination();

          // Recharger les informations du département
          this.reloadDepartement(this.departement.id);

          this.closeDeleteModal();
        },
        error: (error) => {
          this.errorMessage =
            "Erreur lors de la suppression de l'utilisateur. Veuillez réessayer.";
          console.error(error);
        },
      });
    }
  }

  // Ouvrir le modal de changement de département
  openChangeDeptModal(user: any): void {
    this.userToChangeDept = user;
    this.newDepartementId = user.departement_id;
    this.showChangeDeptModal = true;
  }

  // Fermer le modal de changement de département
  closeChangeDeptModal(): void {
    this.showChangeDeptModal = false;
    this.userToChangeDept = null;
  }

  // Confirmer le changement de département
  confirmChangeDept(): void {
    if (this.userToChangeDept && this.newDepartementId) {
      // Envoyer uniquement le champ departement_id
      const userData = {
        departement_id: this.newDepartementId,
      };

      // Envoyer la requête de mise à jour
      this.userService
        .updateUser(this.userToChangeDept.id, userData)
        .subscribe({
          next: () => {
            this.loadDepartementAndUsers(this.departement.id);
            this.closeChangeDeptModal();
          },
          error: (error) => {
            if (error.response && error.response.data) {
              console.error("Détails de l'erreur :", error.response.data);
              this.errorMessage =
                error.response.data.message ||
                'Erreur lors du changement de département.';
            } else {
              this.errorMessage =
                'Erreur lors du changement de département. Veuillez réessayer.';
            }
            console.error(error);
          },
        });
    }
  }

  // Ouvrir le modal de suppression multiple
  openDeleteMultipleModal(): void {
    this.showDeleteMultipleModal = true;
  }

  // Fermer le modal de suppression multiple
  closeDeleteMultipleModal(): void {
    this.showDeleteMultipleModal = false;
  }

  // Confirmer la suppression multiple
  confirmDeleteMultiple(): void {
    if (this.selectedUsers.length === 0) return;

    {
      const deleteRequests = this.selectedUsers.map((user) =>
        this.userService.deleteUser(user.id).toPromise()
      );

      Promise.all(deleteRequests)
        .then(() => {
          // Recharger les données du département et des utilisateurs
          this.loadDepartementAndUsers(this.departement.id);

          this.selectedUsers = []; // Réinitialiser la sélection
          this.closeDeleteMultipleModal(); // Fermer le modal
        })
        .catch((error) => {
          this.errorMessage =
            'Erreur lors de la suppression des utilisateurs. Veuillez réessayer.';
          console.error(error);
        });
    }
  }

  // Gestion de la sélection multiple
  toggleSelection(user: any): void {
    const index = this.selectedUsers.indexOf(user);
    if (index > -1) {
      this.selectedUsers.splice(index, 1);
    } else {
      this.selectedUsers.push(user);
    }
  }

  toggleAllSelection(): void {
    if (this.selectedUsers.length === this.filteredUsers.length) {
      this.selectedUsers = [];
    } else {
      this.selectedUsers = [...this.filteredUsers];
    }
  }

  // Importer des utilisateurs via un fichier CSV
  importCSV(event: any, departement_id: string): void {
    const file = event.target.files[0]; // Récupérer le fichier sélectionné
    if (file) {
      const reader = new FileReader(); // Créer un FileReader pour lire le fichier
      reader.onload = (e: any) => {
        const csvData = e.target.result; // Lire les données du fichier
        this.importedUsers = this.parseCSV(csvData, departement_id); // Parser le CSV en tableau d'utilisateurs
        this.showImportModal = true; // Afficher le modal
      };
      reader.readAsText(file); // Lire le fichier comme texte
    }
  }

  // Parser un fichier CSV en tableau d'utilisateurs
  parseCSV(csvData: string, departement_id: string): any[] {
    const lines = csvData.split('\n');
    const users = [];
    for (let i = 1; i < lines.length; i++) {
      const [nom, prenom, email, telephone, adresse, photo, role] =
        lines[i].split(',');
      if (nom && prenom && email) {
        users.push({
          nom,
          prenom,
          email,
          telephone,
          adresse,
          photo,
          role: role || 'employé', // Utiliser le rôle du CSV s'il existe, sinon "employé" par défaut
          departement_id: departement_id,
          selected: true, // Par défaut, l'utilisateur est sélectionné
        });
      }
    }
    return users;
  }

  // Fermer le modal d'importation
  closeImportModal(): void {
    this.showImportModal = false;
    this.importedUsers = []; // Réinitialiser la liste des utilisateurs importés
  }

  // Confirmer l'importation des utilisateurs sélectionnés
  // Méthode pour convertir un tableau d'utilisateurs en CSV
  convertToCSV(users: any[]): string {
    const headers = ['nom', 'prenom', 'email', 'telephone', 'adresse', 'photo'];
    const rows = users.map((user) =>
      headers.map((header) => user[header]).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  }

  // Méthode pour créer un fichier CSV à partir d'une chaîne CSV
  createCSVFile(csvContent: string): File {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    return new File([blob], 'users.csv', { type: 'text/csv' });
  }

  // Confirmer l'importation des utilisateurs sélectionnés
  confirmImport(departement_id: string): void {
    const usersToImport = this.importedUsers.filter((user) => user.selected);

    // Convertir le tableau en CSV
    const csvContent = this.convertToCSV(usersToImport);

    // Créer un fichier CSV
    const csvFile = this.createCSVFile(csvContent);

    // Appeler le service avec le fichier CSV
    this.userService
      .importUsersFromCSVToDepartement(csvFile, departement_id)
      .subscribe({
        next: () => {
          // Recharger les données du département et des utilisateurs
          this.loadDepartementAndUsers(departement_id);
          this.importedUsers = []; // Réinitialiser la liste des utilisateurs importés
          // Fermer le modal après l'importation réussie
          this.closeImportModal();
        },
        error: (error) => {
          // Gérer les erreurs
          this.errorMessage =
            "Erreur lors de l'importation des utilisateurs. Veuillez réessayer.";
          console.error(error);
        },
      });
  }

  // Rediriger vers le formulaire d'ajout d'un utilisateur
  redirectToAddUser(): void {
    this.router.navigate([
      '/departement',
      this.departement.id,
      'ajout-utilisateur',
    ]);
  }

  // Rediriger vers le formulaire d'assignation d'une carte
  redirectToAssigneUser(): void {
    this.router.navigate([
      '/departement',
      this.departement.id,
      'assignation-utilisateur',
    ]);
  }

  // Rediriger vers le formulaire d'édition d'un utilisateur facilement
  redirectToEditUser(userId: string): void {
    this.router.navigate([
      '/departement',
      this.departement.id,
      'edit-utilisateur',
      userId,
    ]);
  }

  // Éditer un utilisateur
  editUser(user: any): void {
    console.log("Éditer l'utilisateur", user);
    this.redirectToEditUser(user.id); // Redirige vers le formulaire d'édition
  }
  // Assigner une carte à un apprenant
  assignCard(userId: string) {
    this.router.navigate(['/assignation-carte', userId]);
  }
}
