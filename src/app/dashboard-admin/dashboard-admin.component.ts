import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.css'],
  imports: [HttpClientModule],
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
  }
}