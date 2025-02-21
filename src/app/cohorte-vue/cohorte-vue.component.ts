import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CohorteService } from '../cohorte.service';
import { UserService } from '../user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-cohorte-vue',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './cohorte-vue.component.html',
  styleUrls: ['./cohorte-vue.component.css'],
  providers : [UserService],
})
export class CohorteVueComponent implements OnInit {
  headers = [
    'Sélection',
    'Profil',
    'Nom et Prénom',
    'Matricule',
    'Cohorte',
    'Téléphone',
    'Email',
    'Carte',
    'Actions',
    '',
    '',
    '',
  ];
  cohorte: any; // Informations de la cohorte
  users: any[] = []; // Liste complète des apprenants
  filteredUsers: any[] = []; // Liste des apprenants filtrés
  searchTerm: string = ''; // Terme de recherche
  currentPage: number = 1; // Page actuelle
  pages: number[] = []; // Liste des pages
  isLoading: boolean = true; // Indicateur de chargement
  errorMessage: string | null = null; // Message d'erreur
  selectedUsers: any[] = []; // Apprenants sélectionnés pour la suppression multiple
  showDeleteModal: boolean = false; // Afficher le modal de suppression unique
  showDeleteMultipleModal: boolean = false; // Afficher le modal de suppression multiple
  showChangeCohorteModal: boolean = false; // Afficher le modal de changement de cohorte
  userToDelete: any = null; // Apprenant à supprimer
  userToChangeCohorte: any = null; // Apprenant à changer de cohorte
  newCohorteId: string = ''; // Nouvelle cohorte sélectionnée
  cohortes: any[] = []; // Liste des cohortes disponibles
  sortField: string = 'nom'; // Champ de tri
  sortOrder: string = 'asc'; // Ordre de tri

  constructor(
    private route: ActivatedRoute,
    private cohorteService: CohorteService,
    private userService: UserService,
    private router: Router // Injecter le Router
  ) {}

  async ngOnInit(): Promise<void> {
    const cohorteId = this.route.snapshot.paramMap.get('id');
    if (cohorteId) {
      await this.loadCohorteAndUsers(cohorteId); // Charger les données initiales
      this.loadCohortes();
    } else {
      this.errorMessage = 'ID de la cohorte non trouvé.';
      this.isLoading = false;
    }
  }

  // Méthode pour naviguer vers les détails de l'apprenant
  viewApprenantDetails(userId: string): void {
    this.router.navigate(['/apprenant-details', userId]);
  }

  // Charger les informations de la cohorte et les apprenants associés
  loadCohorteAndUsers(cohorteId: string): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.cohorteService
      .getCohorte(cohorteId)
      .then((cohorte) => {
        this.cohorte = cohorte;
        this.userService.getUsersByCohorte(cohorteId).subscribe({
          next: (users) => {
            this.users = users;
            this.filteredUsers = users;
            this.sortUsers();
            this.updatePagination();
            this.isLoading = false;
          },
          error: (error) => {
            this.errorMessage =
              'Erreur lors du chargement des apprenants. Veuillez réessayer.';
            this.isLoading = false;
            console.error(error);
          },
        });
      })
      .catch((error) => {
        this.errorMessage =
          'Erreur lors du chargement de la cohorte. Veuillez réessayer.';
        this.isLoading = false;
        console.error(error);
      });
  }

  // Charger la liste des cohortes
  loadCohortes(): void {
    this.cohorteService.getCohortes().then((cohortes) => {
      this.cohortes = cohortes;
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

  // Filtrer les apprenants en fonction du terme de recherche
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

  // Trier les apprenants
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
          // Supprimer l'apprenant de la liste
          this.users = this.users.filter(
            (user) => user.id !== this.userToDelete.id
          );
          this.filteredUsers = this.filteredUsers.filter(
            (user) => user.id !== this.userToDelete.id
          );
          this.updatePagination();

          this.closeDeleteModal();
        },
        error: (error) => {
          this.errorMessage =
            "Erreur lors de la suppression de l'apprenant. Veuillez réessayer.";
          console.error(error);
        },
      });
    }
  }

  // Ouvrir le modal de changement de cohorte
  openChangeCohorteModal(user: any): void {
    this.userToChangeCohorte = user;
    this.newCohorteId = user.cohorte_id;
    this.showChangeCohorteModal = true;
  }

  // Fermer le modal de changement de cohorte
  closeChangeCohorteModal(): void {
    this.showChangeCohorteModal = false;
    this.userToChangeCohorte = null;
  }

  // Confirmer le changement de cohorte
  confirmChangeCohorte(): void {
    if (this.userToChangeCohorte && this.newCohorteId) {
      this.userService
        .updateUser(this.userToChangeCohorte.id, {
          cohorte_id: this.newCohorteId,
        })
        .subscribe({
          next: () => {
            // Recharger les données de la cohorte et des apprenants
            this.loadCohorteAndUsers(this.cohorte.id);

            this.closeChangeCohorteModal();
          },
          error: (error) => {
            this.errorMessage =
              'Erreur lors du changement de cohorte. Veuillez réessayer.';
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
          // Recharger les données de la cohorte et des apprenants
          this.loadCohorteAndUsers(this.cohorte.id);

          this.selectedUsers = []; // Réinitialiser la sélection
          this.closeDeleteMultipleModal(); // Fermer le modal
        })
        .catch((error) => {
          this.errorMessage =
            'Erreur lors de la suppression des apprenants. Veuillez réessayer.';
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

  // Importer des apprenants via un fichier CSV
  importCSV(event: any, cohorte_id: string): void {
    const file = event.target.files[0]; // Récupérer le fichier sélectionné
    if (file) {
      const reader = new FileReader(); // Créer un FileReader pour lire le fichier
      reader.onload = (e: any) => {
        const csvData = e.target.result; // Lire les données du fichier
        const users = this.parseCSV(csvData); // Parser le CSV en tableau d'apprenants

        // Appeler le service pour ajouter les apprenants
        this.userService
          .importUsersFromCSVToCohorte(file, cohorte_id)
          .subscribe({
            next: () => {
              // Recharger les données de la cohorte et des apprenants
              this.loadCohorteAndUsers(cohorte_id);
            },
            error: (error) => {
              // Gérer les erreurs
              this.errorMessage =
                "Erreur lors de l'importation des apprenants. Veuillez réessayer.";
              console.error(error);
            },
          });
      };
      reader.readAsText(file); // Lire le fichier comme texte
    }
  }

  // Parser un fichier CSV en tableau d'apprenants
  parseCSV(csvData: string): any[] {
    const lines = csvData.split('\n');
    const users = [];
    for (let i = 1; i < lines.length; i++) {
      const [nom, prenom, email, telephone, adresse, photo] =
        lines[i].split(',');
      if (nom && prenom && email) {
        users.push({
          nom,
          prenom,
          email,
          telephone,
          adresse,
          photo,
          role: 'apprenant', // Utiliser le rôle "apprenant" par défaut
          cohorte_id: this.cohorte.id,
        });
      }
    }
    return users;
  }

  // Ajoutez cette méthode dans DepartementVueComponent
  redirectToAddUser(): void {
    this.router.navigate(['/cohorte', this.cohorte.id, 'ajout-apprenant']);
  }

  // Éditer un apprenant
  // Méthode pour éditer un apprenant
  editUser(user: any): void {
    console.log("Éditer l'apprenant", user);
    this.redirectToEditUser(user.id); // Redirige vers le formulaire d'édition
  }
  // Dans votre composant (par exemple, DepartementVueComponent ou CohorteVueComponent)
  redirectToEditUser(userId: string): void {
    if (this.cohorte.id) {
      this.router.navigate([
        '/cohorte',
        this.cohorte.id,
        'edit-apprenant',
        userId,
      ]);
    }
  }
  // Assigner une carte à un apprenant
  assignCard(userId: string) {
    this.router.navigate(['/assignation-carte', userId]);
  }
}
