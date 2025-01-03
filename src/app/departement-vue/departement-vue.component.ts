import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DepartementService } from '../departement.service';
import { UserService } from '../user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-departement-vue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './departement-vue.component.html',
  styleUrls: ['./departement-vue.component.css'],
})
export class DepartementVueComponent implements OnInit {
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

  // Mettre à jour la pagination
  updatePagination(): void {
    const totalPages = Math.ceil(this.filteredUsers.length / 10);
    this.pages = Array.from({ length: totalPages }, (_, i) => i + 1);
    this.goToPage(1); // Revenir à la première page après filtrage
  }

  // Naviguer vers une page spécifique
  goToPage(page: number): void {
    this.currentPage = page;
    const start = (page - 1) * 10;
    const end = start + 10;
    this.filteredUsers = this.users.slice(start, end);
  }

  // Filtrer les utilisateurs en fonction du terme de recherche
  filterUsers(): void {
    this.filteredUsers = this.users.filter(
      (user) =>
        user.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.prenom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.matricule.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    this.sortUsers();
    this.updatePagination();
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
      this.userService
        .updateUser(this.userToChangeDept.id, {
          departement_id: this.newDepartementId,
        })
        .subscribe({
          next: () => {
            // Recharger les données du département et des utilisateurs
            this.loadDepartementAndUsers(this.departement.id);

            // Recharger les informations du département
            this.reloadDepartement(this.departement.id);

            this.closeChangeDeptModal();
          },
          error: (error) => {
            this.errorMessage =
              'Erreur lors du changement de département. Veuillez réessayer.';
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

    if (
      confirm(
        'Êtes-vous sûr de vouloir supprimer les utilisateurs sélectionnés ?'
      )
    ) {
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
        const users = this.parseCSV(csvData); // Parser le CSV en tableau d'utilisateurs

        // Appeler le service pour ajouter les utilisateurs
        this.userService
          .importUsersFromCSVToDepartement(file, departement_id)
          .subscribe({
            next: () => {
              // Recharger les données du département et des utilisateurs
              this.loadDepartementAndUsers(departement_id);
            },
            error: (error) => {
              // Gérer les erreurs
              this.errorMessage =
                "Erreur lors de l'importation des utilisateurs. Veuillez réessayer.";
              console.error(error);
            },
          });
      };
      reader.readAsText(file); // Lire le fichier comme texte
    }
  }

  // Parser un fichier CSV en tableau d'utilisateurs
  parseCSV(csvData: string): any[] {
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
          departement_id: this.departement.id,
        });
      }
    }
    return users;
  }

  // Ouvrir un modal pour ajouter un utilisateur (à implémenter)
  openAddUserModal(): void {
    console.log("Ouvrir le modal d'ajout d'utilisateur");
  }

  // Éditer un utilisateur
  editUser(user: any): void {
    console.log("Éditer l'utilisateur", user);
    // Logique pour éditer un utilisateur
  }
  // Assigner une carte à un utilisateur
  assignCard(user: any): void {
    console.log('Assigner une carte à', user);
    // Logique pour assigner une carte
  }
}
