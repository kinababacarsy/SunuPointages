import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService, User } from '../user.service';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-user-form',
  imports: [CommonModule, FormsModule, NavbarComponent, ReactiveFormsModule], // Importer FormsModule pour le two-way binding
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css'],
})
export class UserFormComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef;

  userForm: FormGroup;
  isLoading = false;
  isEditMode = false;
  showPasswordFields = false;
  departementId: string | null = null;
  nomDepartement: string = '';
  userId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userForm = this.createForm();
  }

  ngOnInit() {
    // Récupérer l'ID du département depuis l'URL si présent
    this.departementId = this.route.snapshot.paramMap.get('id'); // 'id' au lieu de 'departementId'
    console.log('ID du département:', this.departementId); // Vérifiez la valeur dans la console

    // Si un userId est présent, c'est le mode édition
    this.userId = this.route.snapshot.paramMap.get('userId');
    if (this.userId) {
      this.isEditMode = true;
      this.loadUserData();
    }

    // Initialiser le formulaire avec les validateurs appropriés
    this.userForm = this.createForm();

    // Appeler onRoleChange pour configurer les validateurs et les champs conditionnels
    this.onRoleChange();
  }

  createForm(): FormGroup {
    const form = this.fb.group({
      nom: ['', [Validators.required]],
      prenom: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required]],
      adresse: [''],
      role: [
        { value: 'employe', disabled: this.isEditMode },
        [Validators.required],
      ], // Désactiver en mode édition
      photo: [''],
      mot_de_passe: [
        { value: '', disabled: this.isEditMode }, // Désactiver en mode édition
        this.isEditMode ? [] : [Validators.required, Validators.minLength(8)],
      ],
      confirmation_mot_de_passe: [{ value: '', disabled: this.isEditMode }], // Désactiver en mode édition
    });

    return form;
  }
  loadUserData() {
    if (this.userId) {
      this.userService.getUser(this.userId).subscribe({
        next: (user: User) => {
          this.userForm.patchValue({
            nom: user.nom,
            prenom: user.prenom,
            email: user.email,
            telephone: user.telephone,
            adresse: user.adresse,
            role: user.role,
            photo: user.photo,
          });
          this.onRoleChange(); // Mettre à jour l'affichage des champs de mot de passe
        },
        error: (error) => {
          console.error(
            'Erreur lors du chargement des données utilisateur:',
            error
          );
        },
      });
    }
  }

  onRoleChange() {
    const role = this.userForm.get('role')?.value;
    this.showPasswordFields = role === 'admin' || role === 'vigile';
  
    if (this.showPasswordFields && !this.isEditMode) {
      // Si le rôle est "admin" ou "vigile" et que nous sommes en mode création, le mot de passe est obligatoire
      this.userForm.get('mot_de_passe')?.setValidators([Validators.required, Validators.minLength(8)]);
    } else {
      // Pour le rôle "employé" ou en mode édition, le mot de passe est optionnel
      this.userForm.get('mot_de_passe')?.setValidators([]);
    }
  
    // Mettre à jour la validation du champ
    this.userForm.get('mot_de_passe')?.updateValueAndValidity();
  }
  
  onSubmit() {
    console.log('Formulaire valide:', this.userForm.valid); // Afficher la validité du formulaire
    console.log('Erreurs du formulaire:', this.userForm.errors); // Afficher les erreurs globales du formulaire
    console.log(
      'Erreurs du champ mot_de_passe:',
      this.userForm.get('mot_de_passe')?.errors
    ); // Afficher les erreurs du champ mot_de_passe
  
    if (this.userForm.valid) {
      this.isLoading = true;
  
      // Récupérer les valeurs du formulaire, y compris les champs désactivés
      const userData: User = this.userForm.getRawValue();
  
      // Supprimer la confirmation du mot de passe avant l'envoi
      delete userData.confirmation_mot_de_passe;
  
      // Si le mot de passe est vide en mode édition, ne pas l'envoyer au serveur
      if (this.isEditMode && !userData.mot_de_passe) {
        delete userData.mot_de_passe; // Supprimer le champ mot_de_passe de l'objet userData
      }
  
      // Afficher les données du formulaire dans la console
      console.log('Données du formulaire:', userData);
  
      if (this.isEditMode) {
        // Mise à jour d'un utilisateur existant avec PATCH
        this.userService.updateUser(this.userId!, userData).subscribe({
          next: () => this.handleSuccess(),
          error: (error) => this.handleError(error),
          complete: () => (this.isLoading = false),
        });
      } else if (this.departementId) {
        // Création d'un utilisateur dans un département
        this.userService
          .createUserFromDepartement(this.departementId, userData)
          .subscribe({
            next: () => this.handleSuccess(),
            error: (error) => this.handleError(error),
            complete: () => (this.isLoading = false),
          });
      }
    } else {
      console.log('Le formulaire est invalide. Veuillez corriger les erreurs.');
    }
  }
  

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      // Ici, vous pouvez ajouter la logique pour gérer le téléchargement de la photo
      // Pour l'instant, nous allons simplement stocker l'URL de la photo
      const reader = new FileReader();
      reader.onload = () => {
        this.userForm.patchValue({
          photo: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  }

  private handleSuccess() {
    // Rediriger vers la page appropriée après le succès
    if (this.departementId) {
      this.router.navigate(['/departement', this.departementId]); // 'departement' au lieu de 'departements'
    } else {
      this.router.navigate(['/users']);
    }
  }

  private handleError(error: any) {
    console.error('Erreur:', error);
    this.isLoading = false;
    // Ici, vous pouvez ajouter la logique pour afficher un message d'erreur à l'utilisateur
  }
  
  onRetour() {
    if (this.departementId) {
      this.router.navigate(['/departement', this.departementId]); // 'departement' au lieu de 'departements'
    } else {
      this.router.navigate(['/users']);
    }
  }
}
