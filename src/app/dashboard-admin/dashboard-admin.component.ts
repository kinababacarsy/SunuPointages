import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardAdminService } from '../dashboard-admin.service';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import { NavbarComponent } from '../navbar/navbar.component';

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
  providers: [DashboardAdminService],
})
export class DashboardAdminComponent implements OnInit {
  date: string = new Date().toLocaleString();
  presences: User[] = [];
  filteredPresences: User[] = [];
  private chart: any;
  selectedPeriod = 'day';
  selectedCreatedDate: string = '';

  historiques: PresenceData[] = [
    { status: 'present', count: 50 },
    { status: 'absent', count: 15 },
    { status: 'retard', count: 15 },
    { status: 'congés/voyages', count: 15 },
  ];

  totalDepartements: any[] = [];
  totalCohortes: any[] = [];
  totalEmployes: number = 0;
  totalApprenants: number = 0;
  totalAdmins: number = 0;
  totalVigiles: number = 0;

  // Variables de pagination
  currentPage: number = 1;
  itemsPerPage: number = 2;

  constructor(public dashboardAdminService: DashboardAdminService) {}

  ngOnInit(): void {
    this.fetchCounts();
    this.fetchUserPresences();
    this.initChart();
  }

  fetchCounts(): void {
    this.dashboardAdminService
      .getCountDepartements()
      .subscribe((data) => (this.totalDepartements = data.total_departements));
    this.dashboardAdminService
      .getCountCohortes()
      .subscribe((data) => (this.totalCohortes = data.total_cohortes));

    this.dashboardAdminService.getCountAllUsers().subscribe((data) => {
      this.totalEmployes = data.employes;
      this.totalApprenants = data.apprenants;
      this.totalAdmins = data.admins;
      this.totalVigiles = data.vigiles;
    });
  }

  fetchUserPresences(): void {
    this.dashboardAdminService.getUserPresences().subscribe(
      (data: User[]) => {
        this.presences = data.map((user) => ({
          ...user,
          entree: '--', // Valeur par défaut pour l'entrée
          sortie: '--', // Valeur par défaut pour la sortie
          status: 'absent', // Valeur par défaut pour le statut
          createdAt: new Date().toISOString().split('T')[0], // Date de création par défaut
        }));
        this.filteredPresences = this.presences;
      },
      (error) => {
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
        labels: this.historiques.map((item) => item.status),
        datasets: [
          {
            data: this.historiques.map((item) => item.count),
            backgroundColor: ['#28a745', '#dc3545', '#ffc107'],
          },
        ],
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
                const total = this.historiques.reduce(
                  (acc, curr) => acc + curr.count,
                  0
                );
                const percentage = (((value as number) / total) * 100).toFixed(
                  1
                );
                return `${context.label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
      },
    });
  }

  calculateTotal(): number {
    return this.historiques.reduce((acc, curr) => acc + curr.count, 0);
  }

  updateChartPeriod(event: Event): void {
    const periodData: Record<PeriodKey, PresenceData[]> = {
      day: [
        { status: 'present', count: 150 },
        { status: 'absent', count: 20 },
        { status: 'retard', count: 30 },
      ],
      week: [
        { status: 'present', count: 750 },
        { status: 'absent', count: 100 },
        { status: 'retard', count: 150 },
      ],
      month: [
        { status: 'present', count: 3000 },
        { status: 'absent', count: 400 },
        { status: 'retard', count: 600 },
      ],
    };

    const selectElement = event.target as HTMLSelectElement;
    const period = selectElement.value as PeriodKey;

    this.historiques = periodData[period];

    if (this.chart) {
      this.chart.data.datasets[0].data = this.historiques.map(
        (item) => item.count
      );
      this.chart.update();
    }
  }

  filterByType(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const type = selectElement.value;
    this.filteredPresences = this.presences.filter((presence) => {
      return type === 'all' || presence.type === type;
    });
    this.currentPage = 1; // Reset to the first page
  }

  filterByCreatedDate(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.selectedCreatedDate = inputElement.value;
    this.filteredPresences = this.presences.filter((presence) => {
      return (
        !this.selectedCreatedDate ||
        presence.createdAt === this.selectedCreatedDate
      );
    });
    this.currentPage = 1; // Reset to the first page
  }

  filterByName(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const query = inputElement.value.toLowerCase();
    this.filteredPresences = this.presences.filter((presence) => {
      return (
        presence.prenom.toLowerCase().includes(query) ||
        presence.nom.toLowerCase().includes(query)
      );
    });
    this.currentPage = 1; // Reset to the first page
  }
}
