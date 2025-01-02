import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


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

  showPassword = false;
  showEmailError = false;
  showPasswordError = false;

  onSubmit() {
    console.log('Données de connexion :', this.loginData);
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
