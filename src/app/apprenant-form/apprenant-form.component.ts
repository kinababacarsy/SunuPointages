import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService, User } from '../user.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-apprenant-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NavbarComponent],
  templateUrl: './apprenant-form.component.html',
  styleUrls: ['./apprenant-form.component.css'],
})
export class ApprenantFormComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  userForm: FormGroup;
  isLoading = false;
  isEditMode = false;
  cohorteId: string | null = null;
  userId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.userForm = this.createForm();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.cohorteId = params.get('id'); // Récupérer l'ID de la cohorte depuis l'URL
      this.userId = params.get('userId'); // Récupérer l'ID de l'utilisateur si en mode édition

      if (this.userId) {
        this.isEditMode = true;
        this.userService.getUser(this.userId).subscribe((user: User) => {
          this.userForm.patchValue(user); // Pré-remplir le formulaire en mode édition
        });
      }
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', Validators.required],
      adresse: [''],
      photo: [''],
    });
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
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

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched(); // Marquer tous les champs comme touchés pour afficher les erreurs
      return;
    }

    this.isLoading = true;

    const userData: User = this.userForm.value;

    if (this.isEditMode) {
      // En mode édition, mettre à jour l'apprenant
      this.userService.updateUser(this.userId!, userData).subscribe(
        (response: User) => {
          console.log('Apprenant mis à jour avec succès :', response);
          this.onRetour();
        },
        (error: any) => {
          console.error(
            "Erreur lors de la mise à jour de l'apprenant :",
            error
          );
          this.isLoading = false;
        }
      );
    } else {
      // En mode création, créer un nouvel apprenant dans la cohorte
      if (this.cohorteId) {
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
    if (this.cohorteId) {
      this.router.navigate(['/cohorte', this.cohorteId]);
    }
  }
}
