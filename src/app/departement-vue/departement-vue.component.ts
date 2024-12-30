import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DepartementService } from '../departement.service';
import { UserService } from '../user.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-departement-vue',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './departement-vue.component.html',
  styleUrls: ['./departement-vue.component.css'],
})
export class DepartementVueComponent implements OnInit {
  departement: any;
  users: any[] = [];
  filteredUsers: any[] = [];
  searchTerm: string = '';
  currentPage: number = 1;
  pages: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private departementService: DepartementService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const departementId = this.route.snapshot.paramMap.get('id');
    if (departementId) {
      this.departementService
        .getDepartement(departementId)
        .then((departement) => {
          this.departement = departement;
          this.userService
            .getUsersByDepartement(departementId)
            .subscribe((users) => {
              this.users = users;
              this.filteredUsers = users;
              this.pages = Array.from(
                { length: Math.ceil(this.users.length / 10) },
                (_, i) => i + 1
              );
            });
        })
        .catch((error) => {
          console.error('Erreur lors du chargement du département', error);
        });
    }
  }

  openAddUserModal(): void {
    // Logique pour ouvrir le modal d'ajout d'utilisateur
  }

  goToPage(page: number): void {
    this.currentPage = page;
    const start = (page - 1) * 10;
    const end = start + 10;
    this.filteredUsers = this.users.slice(start, end);
  }

  filterUsers(): void {
    this.filteredUsers = this.users.filter(
      (user) =>
        user.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.prenom.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
}
