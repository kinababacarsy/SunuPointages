import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService, User } from '../user.service';

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
  showPasswordFields: boolean = false; // Contrôle l'affichage des champs de mot de passe
  isCohorteContext: boolean = false; // Indique si le formulaire est utilisé dans le contexte d'une cohorte

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    // Initialisation du formulaire
    this.userForm = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      adresse: [''], // Optionnel
      photo: [''], // Optionnel
      role: [
        this.isCohorteContext ? 'apprenant' : 'employe',
        Validators.required,
      ], // Rôle par défaut
      mot_de_passe: [''], // Optionnel (uniquement pour admin et vigile)
      confirmation_mot_de_passe: [''], // Optionnel (uniquement pour admin et vigile)
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.departementId = params.get('departementId'); // Récupère l'ID du département
      this.cohorteId = params.get('cohorteId'); // Récupère l'ID de la cohorte

      // Déterminer le contexte (cohorte ou département)
      this.isCohorteContext = !!this.cohorteId;

      // Définir le rôle par défaut en fonction du contexte
      if (this.isCohorteContext) {
        this.userForm.patchValue({ role: 'apprenant' }); // Rôle par défaut pour une cohorte
      } else if (this.departementId) {
        this.userForm.patchValue({ role: 'employe' }); // Rôle par défaut pour un département
      }

      // Initialiser l'affichage des champs de mot de passe
      this.onRoleChange();
    });
  }

  // Gérer le changement de rôle
  onRoleChange(): void {
    const roleControl = this.userForm.get('role');
    const motDePasseControl = this.userForm.get('mot_de_passe');
    const confirmationMotDePasseControl = this.userForm.get(
      'confirmation_mot_de_passe'
    );

    if (roleControl && motDePasseControl && confirmationMotDePasseControl) {
      const role = roleControl.value;
      this.showPasswordFields = role === 'admin' || role === 'vigile';

      if (this.showPasswordFields) {
        motDePasseControl.setValidators([
          Validators.required,
          Validators.minLength(8),
        ]);
        confirmationMotDePasseControl.setValidators([Validators.required]);
      } else {
        motDePasseControl.clearValidators();
        confirmationMotDePasseControl.clearValidators();
      }

      motDePasseControl.updateValueAndValidity();
      confirmationMotDePasseControl.updateValueAndValidity();
    }
  }

  // Soumettre le formulaire
  onSubmit(): void {
    if (this.userForm.invalid) {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      this.userForm.markAllAsTouched();
      return;
    }

    // Vérifier la correspondance des mots de passe
    if (this.userForm.hasError('passwordMismatch')) {
      return;
    }

    // Envoyer les données
    const userData: User = this.userForm.value;
    delete userData.confirmation_mot_de_passe;

    if (!this.showPasswordFields) {
      delete userData.mot_de_passe;
    }

    if (this.departementId) {
      this.userService
        .createUserFromDepartement(this.departementId, userData)
        .subscribe(
          (response: User) => {
            console.log('Utilisateur créé avec succès :', response);
            this.router.navigate(['/departement', this.departementId]);
          },
          (error: any) => {
            console.error(
              "Erreur lors de la création de l'utilisateur :",
              error
            );
          }
        );
    } else if (this.cohorteId) {
      this.userService
        .createUserFromCohorte(this.cohorteId, userData)
        .subscribe(
          (response: User) => {
            console.log('Apprenant créé avec succès :', response);
            this.router.navigate(['/cohorte', this.cohorteId]);
          },
          (error: any) => {
            console.error("Erreur lors de la création de l'apprenant :", error);
          }
        );
    }
  }

  // Retour à la page précédente
  onRetour(): void {
    if (this.departementId) {
      this.router.navigate(['/departement', this.departementId]); // Redirige vers la page du département
    } else if (this.cohorteId) {
      this.router.navigate(['/cohorte', this.cohorteId]); // Redirige vers la page de la cohorte
    }
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.userForm.patchValue({
          photo: reader.result as string, // Met à jour la valeur de la photo dans le formulaire
        });
      };
      reader.readAsDataURL(file);
    }
  }
}
