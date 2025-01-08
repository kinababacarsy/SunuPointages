import { Component, OnInit } from '@angular/core';
import { PointageService, Pointage } from '../services/pointage.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';  // Import du module Router

@Component({
  selector: 'app-pointage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './liste-vigile.component.html',
  styleUrls: ['./liste-vigile.component.css']
})
export class PointageComponent implements OnInit {
  pointages: Pointage[] = [];
  loading: boolean = false;
  error: string = '';

  constructor(private pointageService: PointageService, private router: Router) {}  // Injection du Router

  ngOnInit(): void {
    this.loadPointages();
  }

  loadPointages(): void {
    this.loading = true;
    this.pointageService.getPointages().subscribe({
      next: (data) => {
        this.pointages = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Erreur lors du chargement des données';
        this.loading = false;
        console.error('Erreur:', err);
      }
    });
  }

  getStatusClass(statut: string): string {
    switch(statut.toLowerCase()) {
      case 'à l\'heure':
        return 'status-ontime';
      case 'retard':
        return 'status-late';
      case 'absent':
        return 'status-absent';
      default:
        return '';
    }
  }

  onRetour(): void {
    this.router.navigate(['/dashboard-vigile']);  // Redirection vers le dashboard-vigile
  }
}
