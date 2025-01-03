import { Component, inject, OnInit } from '@angular/core';
import {  HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { DashboardAdminService } from '../dashboard-admin.service';

@Component({
  standalone: true,
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.css'],
  imports: [ CommonModule],
  providers: [DashboardAdminService]  // Ajoutez le service dans les providers
})
export class DashboardAdminComponent implements OnInit {

  private dashboardAdminService = inject(DashboardAdminService)
  // Utiliser le signal du service
  stats = this.dashboardAdminService.stats;
  date: string = new Date().toLocaleString();
  presences: any[] = [];
  historiques: any[] = [];


  ngOnInit(): void {
    // Une seule requête pour toutes les statistiques
    this.dashboardAdminService.refreshAllStats().subscribe({
      next: () => {
        console.log('Statistiques mises à jour avec succès');
      },
      error: (error) => {
        console.error('Erreur lors de la récupération des statistiques:', error);
      }
    });

    // Rafraîchir les stats toutes les 5 minutes (optionnel)
    setInterval(() => {
      this.dashboardAdminService.refreshAllStats().subscribe();
    }, 300000);
  }
}