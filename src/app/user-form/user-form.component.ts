import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
  AbstractControl,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService, User } from '../user.service';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-user-form',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NavbarComponent],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css'],
})
export class UserFormComponent implements OnInit {
  departementId: string | null = null;
  cohorteId: string | null = null;
  userForm: FormGroup;
  showPasswordFields: boolean = false;
  isCohorteContext: boolean = false;
  isEditMode: boolean = false;
  userId: string | null = null;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.userForm = this.fb.group(
      {
        nom: ['', Validators.required],
        prenom: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        telephone: ['', Validators.required],
        adresse: [''],
        photo: [''],
        role: ['', Validators.required],
        mot_de_passe: [''],
        confirmation_mot_de_passe: [''],
      },
      { validator: this.passwordMatchValidator }
    );
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.departementId = params.get('departementId');
      this.cohorteId = params.get('cohorteId');
      this.userId = params.get('userId');
      this.isCohorteContext = !!this.cohorteId;

      if (this.isCohorteContext) {
        this.userForm.patchValue({ role: 'apprenant' });
      } else if (this.departementId) {
        this.userForm.patchValue({ role: 'employe' });
      }

      if (this.userId) {
        this.isEditMode = true;
        this.userService.getUser(this.userId).subscribe((user: User) => {
          this.userForm.patchValue(user);
          this.onRoleChange();
        });
      }

      this.onRoleChange();
    });
  }

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

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const userData: User = this.userForm.value;
    delete userData.confirmation_mot_de_passe;

    if (!this.showPasswordFields) {
      delete userData.mot_de_passe;
    }

    if (this.isEditMode) {
      this.userService.updateUser(this.userId!, userData).subscribe(
        (response: User) => {
          console.log('Utilisateur mis à jour avec succès :', response);
          this.onRetour();
        },
        (error: any) => {
          console.error(
            "Erreur lors de la mise à jour de l'utilisateur :",
            error
          );
          this.isLoading = false;
        }
      );
    } else {
      if (this.departementId) {
        this.userService
          .createUserFromDepartement(this.departementId, userData)
          .subscribe(
            (response: User) => {
              console.log('Utilisateur créé avec succès :', response);
              this.onRetour();
            },
            (error: any) => {
              console.error(
                "Erreur lors de la création de l'utilisateur :",
                error
              );
              this.isLoading = false;
            }
          );
      } else if (this.cohorteId) {
        this.userService
          .createUserFromCohorte(this.cohorteId, userData)
          .subscribe(
            (response: User) => {
              console.log('Apprenant créé avec succès :', response);
              this.onRetour();
            },
            (error: any) => {
              console.error(
                "Erreur lors de la création de l'apprenant :",
                error
              );
              this.isLoading = false;
            }
          );
      }
    }
  }

  onRetour(): void {
    if (this.departementId) {
      this.router.navigate(['/departement', this.departementId]);
    } else if (this.cohorteId) {
      this.router.navigate(['/cohorte', this.cohorteId]);
    }
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.userForm.patchValue({
          photo: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const motDePasseControl = formGroup.get('mot_de_passe');
    const confirmationMotDePasseControl = formGroup.get(
      'confirmation_mot_de_passe'
    );

    if (motDePasseControl && confirmationMotDePasseControl) {
      const motDePasse = motDePasseControl.value;
      const confirmationMotDePasse = confirmationMotDePasseControl.value;

      if (motDePasse !== confirmationMotDePasse) {
        confirmationMotDePasseControl.setErrors({ passwordMismatch: true });
      } else {
        confirmationMotDePasseControl.setErrors(null);
      }
    }
  }
}
