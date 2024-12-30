import { Routes } from '@angular/router';
import { DepartementsComponent } from './departements/departements.component';
import { CohortesComponent } from './cohortes/cohortes.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PointageComponent } from './pointage/pointage.component';
import { DepartementVueComponent } from './departement-vue/departement-vue.component';

// Configuration des routes
export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'departements', component: DepartementsComponent },
  { path: 'cohortes', component: CohortesComponent },
  { path: 'pointage', component: PointageComponent },
  { path: 'departement/:id', component: DepartementVueComponent },
  // Ajoutez d'autres routes ici si nécessaire
];
