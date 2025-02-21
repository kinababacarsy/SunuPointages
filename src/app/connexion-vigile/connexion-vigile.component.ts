// src/app/connexion-vigile/connexion-vigile.component.ts
import { Component, OnInit, OnDestroy, isStandalone } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../services/login.service';
import { CardIdService } from '../../../CONNEXION RFID/card-id.service';
import { Subscription, interval } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-connexion-vigile',
  templateUrl: './connexion-vigile.component.html',
  imports: [CommonModule, FormsModule],
  standalone: true,
  styleUrls: ['./connexion-vigile.component.css'],
})
export class ConnexionVigileComponent implements OnInit, OnDestroy {
  loginData = {
    email: '',
    password: '',
    cardID: '',
  };

  errorMessage: string | null = null;
  showPassword = false;
  showEmailError = false;
  showPasswordError = false;
  showModal: boolean = false;
  cardID: string = '';

  private cardIdSubscription: Subscription | null = null; // Utiliser une union de types

  constructor(
    private loginService: LoginService,
    private router: Router,
    private cardIdService: CardIdService
  ) {}

  ngOnInit(): void {
    this.cardIdSubscription = interval(1000).subscribe(() => {
      this.cardIdService.getCardID().subscribe(
        (response) => {
          if (response.cardID) {
            this.cardID = response.cardID;
            this.loginData.cardID = response.cardID;
            this.loginWithCardID(response.cardID);
          }
        },
        (error) => {
          console.error(
            "Erreur lors de la récupération de l'ID de la carte:",
            error
          );
        }
      );
    });
  }

  ngOnDestroy(): void {
    if (this.cardIdSubscription) {
      this.cardIdSubscription.unsubscribe();
    }
  }

  onCardIDClick(): void {
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  loginWithCardID(cardID: string): void {
    // console.log('Essai de connexion avec cardID:', cardID);
    this.loginService.loginWithCardID(cardID).subscribe(
      (response) => {
        if (response.role === 'admin') {
          localStorage.setItem('token', response.token);
          this.router.navigate(['/dashboard-admin']);
          // console.log('Utilisateur admin connecté avec cardID');
        } else {
          this.errorMessage = "Vous n'avez pas accès avec cette carte";
        }
      },
      (error) => {
        if (error.status === 401) {
          this.errorMessage = 'CardID non valide ou non autorisé';
        } else {
          this.errorMessage = 'Erreur de connexion, veuillez réessayer';
        }
      }
    );
  }

  onSubmit(): void {
    this.loginService
      .login(this.loginData.email, this.loginData.password)
      .subscribe(
        (response) => {
          if (response.role === 'admin') {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            this.router.navigate(['/dashboard-admin']);
            // console.log('Utilisateur admin connecté avec email et mot de passe');
          } else if (response.role === 'vigile') {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            this.router.navigate(['/dashboard-vigile']);
            console.log(
              'Utilisateur vigile connecté avec email et mot de passe'
            );
          } else {
            this.errorMessage = 'Rôle non reconnu';
          }
        },
        (error) => {
          if (error.status === 401) {
            this.errorMessage = 'Email ou mot de passe incorrect';
          } else {
            this.errorMessage = 'Erreur de connexion, veuillez réessayer';
          }
        }
      );
  }

  onForgotPassword() {
    this.router.navigate(['/forgot-password']);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onEmailChange() {
    this.showEmailError =
      this.loginData.email.length > 0 && !this.loginData.email.includes('@');
  }

  onPasswordChange() {
    this.showPasswordError =
      this.loginData.password.length > 0 && this.loginData.password.length < 8;
  }
}
