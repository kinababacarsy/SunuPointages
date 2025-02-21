import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  user: any;
  isPopupVisible = false;

  constructor(private router: Router, private http: HttpClient) {
    const userData = localStorage.getItem('user');
    this.user = userData ? JSON.parse(userData) : null;
  }

  toggleUserPopup(event: Event) {
    event.stopPropagation();
    this.isPopupVisible = !this.isPopupVisible;

    // Fermer le popup si on clique en dehors
    if (this.isPopupVisible) {
      document.addEventListener('click', this.closePopup);
    } else {
      document.removeEventListener('click', this.closePopup);
    }
  }

  closePopup = () => {
    this.isPopupVisible = false;
    document.removeEventListener('click', this.closePopup);
  };

  deconnexion() {
    this.http
      .post(
        'http://localhost:8000/api/logout',
        {},
        {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
        }
      )
      .subscribe({
        next: (response: any) => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          this.router.navigate(['/login']);
        },
        error: (error) => console.error('Erreur lors de la déconnexion', error),
      });
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.closePopup);
  }
}
