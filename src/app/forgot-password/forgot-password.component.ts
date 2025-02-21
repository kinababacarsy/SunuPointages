import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ForgotPasswordService } from '../services/password-reset.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule], // Retirer ForgotPasswordService ici
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent {
  email: string = '';
  message: string | null = null;

  constructor(private forgotPasswordService: ForgotPasswordService) {} // Injection du service via le constructeur

  onSubmit() {
    this.forgotPasswordService.sendResetEmail(this.email).subscribe(
      (response) => {
        this.message = 'Un email de réinitialisation a été envoyé.';
      },
      (error) => {
        this.message = 'Erreur lors de l\'envoi de l\'email.';
      }
    );
  }
}
