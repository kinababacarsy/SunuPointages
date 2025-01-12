// Importation des décorateurs et des classes nécessaires d'Angular
import { Component, OnInit } from '@angular/core'; // Décorateur pour créer un composant Angular et interface pour l'initialisation
import { CommonModule } from '@angular/common'; // Module commun contenant des fonctionnalités Angular de base
import { DashboardAdminService } from '../dashboard-admin.service'; // Service pour gérer les interactions avec l'API
import { FormsModule } from '@angular/forms'; // Module pour la gestion des formulaires Angular
import { Chart } from 'chart.js/auto'; // Bibliothèque pour créer des graphiques
import { NavbarComponent } from '../navbar/navbar.component'; // Composant Navbar utilisé dans le tableau de bord

// Définition de l'interface User représentant un utilisateur
interface User {
  matricule: string; // Identifiant unique
  prenom: string; // Prénom de l'utilisateur
  nom: string; // Nom de l'utilisateur
  type: string; // Type d'utilisateur (ex. admin, employé, etc.)
  createdAt: string; // Date de création du compte
  departement: string; // Département de l'utilisateur
  entree: string; // Heure d'entrée
  sortie: string; // Heure de sortie
  status: string; // Statut de présence
}

// Interface pour représenter l'historique des présences
interface Historique {
  status: string; // Statut (présent, absent, etc.)
  count: number; // Nombre d'occurrences de ce statut
}

// Interface pour représenter les données de présence
interface PresenceData {
  status: string; // Statut de présence
  count: number; // Nombre d'utilisateurs dans ce statut
}

// Définition des clés valides pour les périodes
type PeriodKey = 'day' | 'week' | 'month';

// Déclaration du composant Angular
@Component({
  selector: 'app-dashboard-admin', // Sélecteur HTML pour le composant
  standalone: true, // Utilisation de composants autonomes (sans AppModule)
  imports: [CommonModule, FormsModule, NavbarComponent], // Modules et composants importés
  templateUrl: './dashboard-admin.component.html', // Template HTML du composant
  styleUrls: ['./dashboard-admin.component.css'], // Fichier CSS du composant
  providers: [DashboardAdminService], // Services fournis au composant
})
export class DashboardAdminComponent implements OnInit {
  // Classe du composant

  // Définition des propriétés du composant
  date: string = new Date().toLocaleString(); // Date et heure actuelle
  presences: User[] = []; // Liste des présences récupérées
  filteredPresences: User[] = []; // Liste des présences après filtrage
  private chart: any; // Référence au graphique
  selectedPeriod = 'day'; // Période sélectionnée (par défaut : jour)
  selectedCreatedDate: string = ''; // Date de création sélectionnée
  currentDate: string = new Date().toISOString().split('T')[0]; // Date actuelle au format ISO
  isFiltered: boolean = false; // Indicateur si un filtre est appliqué

  historiques: PresenceData[] = []; // Données historiques pour le graphique

  // Totaux des utilisateurs par catégories
  totalDepartements: any[] = [];
  totalCohortes: any[] = [];
  totalEmployes: number = 0;
  totalApprenants: number = 0;
  totalAdmins: number = 0;
  totalVigiles: number = 0;

  // Variables pour la pagination
  currentPage: number = 1; // Page actuelle
  itemsPerPage: number = 2; // Nombre d'éléments par page

  // Couleurs pour chaque statut
  private statusColors: Record<string, string> = {
    present: '#28a745', // Vert pour présent
    absent: '#dc3545', // Rouge pour absent
    retard: '#ffc107', // Jaune pour retard
    'congés/voyages': '#ffc107', // Jaune pour congés/voyages
  };

  // Injection du service DashboardAdminService
  constructor(public dashboardAdminService: DashboardAdminService) {}

  // Méthode exécutée à l'initialisation du composant
  ngOnInit(): void {
    this.fetchCounts(); // Récupération des décomptes des utilisateurs
    this.fetchUserPresences(); // Récupération des présences des utilisateurs
    this.initChart(); // Initialisation du graphique
  }

  // Méthode pour récupérer les totaux par département, cohorte, etc.

  fetchCounts(): void {
    this.dashboardAdminService
      .getCountDepartements()
      .subscribe((data) => (this.totalDepartements = data.total_departements));
    this.dashboardAdminService
      .getCountCohortes()
      .subscribe((data) => (this.totalCohortes = data.total_cohortes));

    this.dashboardAdminService.getCountAllUsers().subscribe(
      (data) => {
        this.totalEmployes = data.employes;
        this.totalApprenants = data.apprenants;
        this.totalAdmins = data.admins;
        this.totalVigiles = data.vigiles;
      },
      (error) => {
        console.error('Erreur lors de la récupération des décomptes:', error);
      }
    );
  }

  // Méthode pour récupérer les présences des utilisateurs

  fetchUserPresences(date?: string): void {
    this.dashboardAdminService.getUserPresences(date).subscribe(
      (data: User[]) => {
        this.presences = data.map((user) => ({
          ...user,
          entree: '--', // Valeur par défaut pour l'entrée
          sortie: '--', // Valeur par défaut pour la sortie
          status: 'absent', // Valeur par défaut pour le statut
          createdAt: new Date().toISOString().split('T')[0], // Date de création par défaut
        }));
        this.filteredPresences = this.presences;
        this.isFiltered = false; // Réinitialiser le filtre
        this.updateChart(); // Mettre à jour le diagramme après avoir récupéré les présences
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

  // Méthode pour initialiser le graphique

  private initChart(): void {
    const ctx = document.getElementById('presenceChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.chart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: ['#dc3545', '#ffc107', '#28a745', '#ffc107'],
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

  // Méthode pour mettre à jour le graphique avec les nouvelles données

  private updateChart(): void {
    if (!this.chart) return;

    const presenceStatusCounts: Record<string, number> = {};
    const presencesToUse = this.isFiltered
      ? this.filteredPresences
      : this.presences;

    presencesToUse.forEach((presence) => {
      if (presenceStatusCounts[presence.status]) {
        presenceStatusCounts[presence.status]++;
      } else {
        presenceStatusCounts[presence.status] = 1;
      }
    });

    const labels = Object.keys(presenceStatusCounts);
    const data = Object.values(presenceStatusCounts);

    this.historiques = labels.map((status, index) => ({
      status,
      count: data[index],
    }));

    this.chart.data.labels = labels;
    this.chart.data.datasets[0].data = data;
    this.chart.update();
  }

  // Méthode pour calculer le total des présences

  calculateTotal(): number {
    return this.historiques.reduce((acc, curr) => acc + curr.count, 0);
  }

  // Méthode pour mettre à jour le graphique en fonction de la période sélectionnée

  updateChartPeriod(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const period = selectElement.value as PeriodKey;

    // Calculer les données de présence en fonction des présences filtrées ou non filtrées
    const presenceStatusCounts: Record<string, number> = {};
    const presencesToUse = this.isFiltered
      ? this.filteredPresences
      : this.presences;

    presencesToUse.forEach((presence) => {
      if (presenceStatusCounts[presence.status]) {
        presenceStatusCounts[presence.status]++;
      } else {
        presenceStatusCounts[presence.status] = 1;
      }
    });

    const labels = Object.keys(presenceStatusCounts);
    const data = Object.values(presenceStatusCounts);

    this.historiques = labels.map((status, index) => ({
      status,
      count: data[index],
    }));

    if (this.chart) {
      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = data;
      this.chart.update();
    }
  }

  // Méthode pour filtrer par type d'utilisateur

  filterByType(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const type = selectElement.value;
    this.filteredPresences = this.presences.filter((presence) => {
      return type === 'all' || presence.type === type;
    });
    this.isFiltered = true; // Mettre à jour la variable de filtrage
    this.currentPage = 1; // Reset to the first page
    this.updateChart(); // Mettre à jour le diagramme après le filtrage
  }

  // Méthode pour filtrer par date de création

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

  // Méthode pour filtrer par prénom ou nom

  filterByName(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const query = inputElement.value.toLowerCase();
    this.filteredPresences = this.presences.filter((presence) => {
      return (
        presence.prenom.toLowerCase().includes(query) ||
        presence.nom.toLowerCase().includes(query)
      );
    });
    this.isFiltered = true; // Mettre à jour la variable de filtrage
    this.currentPage = 1; // Reset to the first page
    this.updateChart(); // Mettre à jour le diagramme après le filtrage
  }
}
