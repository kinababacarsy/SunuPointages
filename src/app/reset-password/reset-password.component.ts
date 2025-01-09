import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; // Importation de FormsModule
import { CommonModule } from '@angular/common'; // Importation de CommonModule

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, CommonModule], // Ajout de FormsModule et CommonModule
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent implements OnInit {
  token: string | null = null;
  email: string | null = null;
  password: string = '';
  confirmPassword: string = '';
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'];
      this.email = params['email'];
    });
  }

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }

    const data = {
      token: this.token,
      email: this.email,
      mot_de_passe: this.password, // Utiliser 'mot_de_passe' au lieu de 'password'
      mot_de_passe_confirmation: this.confirmPassword, // Utiliser 'mot_de_passe_confirmation' au lieu de 'password_confirmation'
    };

    this.http.post('http://localhost:8000/password/reset', data).subscribe(
      (response) => {
        this.router.navigate(['/login']);
      },
      (error) => {
        this.errorMessage = 'Erreur lors de la réinitialisation du mot de passe.';
      }
    );
  }
}
