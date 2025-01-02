import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Pour la navigation après la connexion
import { LoginService } from '../services/login.service'; // Import du LoginService

@Component({
  selector: 'app-connexion-vigile',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './connexion-vigile.component.html',
  styleUrls: ['./connexion-vigile.component.css'],
})
export class ConnexionVigileComponent {
  loginData = {
    email: '',
    password: '',
  };

  errorMessage: string | null = null; // Variable pour afficher un message d'erreur
  showPassword = false;
  showEmailError = false;
  showPasswordError = false;

  constructor(private loginService: LoginService, private router: Router) {}

  onSubmit() {
    // Appel à la méthode login du LoginService
    this.loginService.login(this.loginData.email, this.loginData.password).subscribe(
      (response) => {
        // Si la connexion réussit, stocke le token dans localStorage
        localStorage.setItem('token', response.token);
        // Redirige l'utilisateur vers une autre page, comme le dashboard
        this.router.navigate(['/dashboard-vigile']);
        console.log('Utilisateur connecté');
      },
      (error) => {
        // Si la connexion échoue, affiche un message d'erreur
        if (error.status === 401) {
          this.errorMessage = 'Email ou mot de passe incorrect';
        } else {
          this.errorMessage = 'Erreur de connexion, veuillez réessayer';
        }
      }
    );
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onEmailChange() {
    // Vérifie si l'email contient un '@' ou s'il est vide
    this.showEmailError = this.loginData.email.length > 0 && !this.loginData.email.includes('@');
  }

  onPasswordChange() {
    // Affiche le message d'erreur si le mot de passe est inférieur à 8 caractères
    this.showPasswordError = this.loginData.password.length > 0 && this.loginData.password.length < 8;
  }
}
