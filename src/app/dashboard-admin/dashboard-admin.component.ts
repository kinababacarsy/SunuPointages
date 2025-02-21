import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardAdminService } from '../services/dashboard-admin.service';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import { NavbarComponent } from "../navbar/navbar.component";

interface User {
  matricule: string;
  prenom: string;
  nom: string;
  type: string;
  createdAt: string; // Ajout de la propriété createdAt
  departement: string;
  entree: string;
  sortie: string;
  status: string;
}

interface Historique {
  status: string;
  count: number;
}

interface PresenceData {
  status: string;
  count: number;
}

type PeriodKey = 'day' | 'week' | 'month';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.css'],
  providers: [DashboardAdminService]
})
export class DashboardAdminComponent implements OnInit {
  date: string = new Date().toLocaleString();
  presences: User[] = [];
  filteredPresences: User[] = [];
  private chart: any;
  selectedPeriod = 'day';
  selectedCreatedDate: string = '';
  currentDate: string = new Date().toISOString().split('T')[0];
  isFiltered: boolean = false; // Variable pour suivre si un filtre est appliqué

  historiques: PresenceData[] = [];

  totalDepartements: any[] = [];
  totalCohortes: any[] = [];
  totalEmployes: number = 0;
  totalApprenants: number = 0;
  totalAdmins: number = 0;
  totalVigiles: number = 0;

  // Variables de pagination
  currentPage: number = 1;
  itemsPerPage: number = 2;


   // Couleurs pour chaque statut
   private statusColors: Record<string, string> = {
    'present': '#28a745', // Vert pour présent
    'absent': '#dc3545', // Rouge pour absent
    'retard': '#ffc107', // Jaune pour retard
    'congés/voyages': '#ffc107' // Jaune pour congés/voyages
  };


  constructor(public dashboardAdminService: DashboardAdminService) {}

  ngOnInit(): void {
    this.fetchCounts();
    this.fetchUserPresences();
    this.initChart();
  }

  fetchCounts(): void {
    this.dashboardAdminService.getCountDepartements().subscribe(data => this.totalDepartements = data.total_departements);
    this.dashboardAdminService.getCountCohortes().subscribe(data => this.totalCohortes = data.total_cohortes);

    this.dashboardAdminService.getCountAllUsers().subscribe(data => {
      this.totalEmployes = data.employes;
      this.totalApprenants = data.apprenants;
      this.totalAdmins = data.admins;
      this.totalVigiles = data.vigiles;
    },
    error => {
      console.error('Erreur lors de la récupération des décomptes:', error);
    });
  }

  fetchUserPresences(date?: string): void {
    this.dashboardAdminService.getUserPresences(date).subscribe(
      (data: User[]) => {
        this.presences = data.map(user => ({
          ...user,
          entree: '--', // Valeur par défaut pour l'entrée
          sortie: '--', // Valeur par défaut pour la sortie
          status: 'absent', // Valeur par défaut pour le statut
          createdAt: new Date().toISOString().split('T')[0] // Date de création par défaut
        }));
        this.filteredPresences = this.presences;
        this.isFiltered = false; // Réinitialiser le filtre
        this.updateChart(); // Mettre à jour le diagramme après avoir récupéré les présences
      },
      error => {
        console.error('Error fetching user presences:', error);
      }
    );
  }

  // Méthode pour obtenir les éléments de la page actuelle
  getPaginatedPresences(): User[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredPresences.slice(startIndex, endIndex);
  }

  // Méthode pour changer de page
  changePage(page: number): void {
    this.currentPage = page;
  }

  // Méthode pour obtenir le nombre total de pages
  getTotalPages(): number {
    return Math.ceil(this.filteredPresences.length / this.itemsPerPage);
  }

  private initChart(): void {
    const ctx = document.getElementById('presenceChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [ '#dc3545','#ffc107' ,'#28a745',   '#ffc107'],
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'bottom',
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const value = context.raw;
                const total = this.historiques.reduce((acc, curr) => acc + curr.count, 0);
                const percentage = ((value as number / total) * 100).toFixed(1);
                return `${context.label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }

  private updateChart(): void {
    if (!this.chart) return;

    const presenceStatusCounts: Record<string, number> = {};
    const presencesToUse = this.isFiltered ? this.filteredPresences : this.presences;

    presencesToUse.forEach(presence => {
      if (presenceStatusCounts[presence.status]) {
        presenceStatusCounts[presence.status]++;
      } else {
        presenceStatusCounts[presence.status] = 1;
      }
    });

    const labels = Object.keys(presenceStatusCounts);
    const data = Object.values(presenceStatusCounts);

    this.historiques = labels.map((status, index) => ({ status, count: data[index] }));

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = data;
    this.chart.update();
  }

  calculateTotal(): number {
    return this.historiques.reduce((acc, curr) => acc + curr.count, 0);
  }

  updateChartPeriod(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const period = selectElement.value as PeriodKey;

    // Calculer les données de présence en fonction des présences filtrées ou non filtrées
    const presenceStatusCounts: Record<string, number> = {};
    const presencesToUse = this.isFiltered ? this.filteredPresences : this.presences;

    presencesToUse.forEach(presence => {
      if (presenceStatusCounts[presence.status]) {
        presenceStatusCounts[presence.status]++;
      } else {
        presenceStatusCounts[presence.status] = 1;
      }
    });

    const labels = Object.keys(presenceStatusCounts);
    const data = Object.values(presenceStatusCounts);

    this.historiques = labels.map((status, index) => ({ status, count: data[index] }));

    if (this.chart) {
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = data;
      this.chart.update();
    }
  }

  filterByType(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const type = selectElement.value;
    this.filteredPresences = this.presences.filter(presence => {
      return type === 'all' || presence.type === type;
    });
    this.isFiltered = true; // Mettre à jour la variable de filtrage
    this.currentPage = 1; // Reset to the first page
    this.updateChart(); // Mettre à jour le diagramme après le filtrage
  }

  filterByCreatedDate(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const date = selectElement.value;
    if (date === '') {
      this.fetchUserPresences(); // Récupérer toutes les présences sans filtre de date
    } else {
      this.fetchUserPresences(date);
    }
    this.isFiltered = true; // Mettre à jour la variable de filtrage
    this.currentPage = 1; // Reset to the first page
  }

  filterByName(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const query = inputElement.value.toLowerCase();
    this.filteredPresences = this.presences.filter(presence => {
      return presence.prenom.toLowerCase().includes(query) || presence.nom.toLowerCase().includes(query);
    });
    this.isFiltered = true; // Mettre à jour la variable de filtrage
    this.currentPage = 1; // Reset to the first page
    this.updateChart(); // Mettre à jour le diagramme après le filtrage
  }
}
