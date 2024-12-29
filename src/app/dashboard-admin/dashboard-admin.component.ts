
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
//import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';


@Component({
  selector: 'app-dashboard-admin',
  imports: [CommonModule, FormsModule, /*NgChartsModule*/],
    templateUrl: './dashboard-admin.component.html',
  styleUrl: './dashboard-admin.component.css'
})


export class DashboardAdminComponent implements OnInit {

  presences = [
    {
      matricule: 'Mat001',
      employe: 'Jane Doe',
      date: '10 Dec',
      departement: 'Informatique',
      entree: '08h00',
      sortie: '17h00',
      status: 'Présent',
      statusClass: 'bg-success'
    },
    {
      matricule: 'Mat002',
      employe: 'John Smith',
      date: '10 Dec',
      departement: 'Marketing',
      entree: '08h05',
      sortie: '17h00',
      status: 'Retard',
      statusClass: 'bg-warning'
    },
    // Ajoutez plus d'entrées selon vos besoins
  ];

  constructor() {}

  ngOnInit() {}

  chartData: ChartConfiguration<'doughnut'>['data'] = {
    labels: ['Présent', 'Absent', 'Retard'],
    datasets: [{
      data: [65, 20, 15],
      backgroundColor: [
        '#28a745',
        '#dc3545',
        '#ffc107'
      ],
      hoverOffset: 4
    }]
  };

  chartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  };

  }
  
