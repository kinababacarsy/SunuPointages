import { ActivatedRoute, Router } from '@angular/router';
import { UserService, User } from '../user.service';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-user-form',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css'],
})
export class UserFormComponent implements OnInit {
  departementId: string | null = null;
  cohorteId: string | null = null;
  userForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      poste: ['', Validators.required], // Champ spécifique aux employés
      dateEntree: ['', Validators.required], // Champ spécifique aux employés
      adresse: [''], // Optionnel
      photo: [''], // Optionnel
      cardID: [''], // Optionnel
      status: [''], // Optionnel
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.departementId = params.get('id'); // Récupère l'ID du département
      this.cohorteId = params.get('id'); // Récupère l'ID de la cohorte
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      alert('Veuillez remplir tous les champs obligatoires.');
      return;
    }

    const userData: User = this.userForm.value;

    if (this.departementId) {
      // Créer un nouvel employé dans un département
      this.userService
        .createUserFromDepartement(this.departementId, userData)
        .subscribe(
          () => {
            alert('Employé créé avec succès !');
            this.router.navigate(['/departement', this.departementId]); // Redirige vers la page du département
          },
          (error) => {
            alert("Erreur lors de la création de l'employé.");
          }
        );
    } else if (this.cohorteId) {
      // Créer un nouvel apprenant dans une cohorte
      this.userService
        .createUserFromCohorte(this.cohorteId, userData)
        .subscribe(
          () => {
            alert('Apprenant créé avec succès !');
            this.router.navigate(['/cohorte', this.cohorteId]); // Redirige vers la page de la cohorte
          },
          (error) => {
            alert("Erreur lors de la création de l'apprenant.");
          }
        );
    }
  }

  onRetour(): void {
    if (this.departementId) {
      this.router.navigate(['/departement', this.departementId]); // Redirige vers la page du département
    } else if (this.cohorteId) {
      this.router.navigate(['/cohorte', this.cohorteId]); // Redirige vers la page de la cohorte
    }
  }
}
