import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router'; // Ajoutez cette ligne

@Component({
  standalone: true,
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.css'],
  imports: [HttpClientModule, CommonModule],
})
export class DashboardAdminComponent implements OnInit {
  totalEmployes: number = 0;
  totalApprenants: number = 0;
  totalDepartements: number = 0;
  totalCohortes: number = 0;
  totalAdmins: number = 0;
  totalVigiles: number = 0;
  date: string = new Date().toLocaleString();
  presences: any[] = [];
  historiques: any[] = [];

  // Options pour le graphique
  pieChartOptions: any = {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      top: '5%',
      left: 'center',
    },
    series: [
      {
        name: 'Statistiques',
        type: 'pie',
        radius: ['40%', '70%'], // Donut chart
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          { value: 0, name: 'Présents' },
          { value: 0, name: 'Congés/voyages' },
          { value: 0, name: 'Retards' },
          { value: 0, name: 'Absents' },
        ],
      },
    ],
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    // Remplacez par vos propres API
    this.http.get('/api/users?role=employe').subscribe((data: any) => {
      this.totalEmployes = data.length;
    });

    this.http.get('/api/users?role=apprenant').subscribe((data: any) => {
      this.totalApprenants = data.length;
    });

    this.http.get('/api/departements').subscribe((data: any) => {
      this.totalDepartements = data.length;
    });

    this.http.get('/api/cohortes').subscribe((data: any) => {
      this.totalCohortes = data.length;
    });

    this.http.get('/api/users?role=admin').subscribe((data: any) => {
      this.totalAdmins = data.length;
    });

    this.http.get('/api/users?role=vigile').subscribe((data: any) => {
      this.totalVigiles = data.length;
    });

    // Ajoutez d'autres appels API pour obtenir les présences et historiques

    this.http.get('/api/historiques').subscribe((data: any) => {
      this.historiques = data;
      this.updateChartData();
    });
  }

  updateChartData() {
    const present = this.historiques.filter(
      (h) => h.status === 'Présent'
    ).length;
    const conges = this.historiques.filter((h) => h.status === 'Congé').length;
    const retards = this.historiques.filter(
      (h) => h.status === 'Retard'
    ).length;
    const absents = this.historiques.filter(
      (h) => h.status === 'Absent'
    ).length;

    this.pieChartOptions.series[0].data = [
      { value: present, name: 'Présents' },
      { value: conges, name: 'Congés' },
      { value: retards, name: 'Retards' },
      { value: absents, name: 'Absents' },
    ];
  }
}
