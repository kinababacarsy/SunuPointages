import { Routes } from '@angular/router';
import { DepartementsComponent } from './departements/departements.component';
import { CohortesComponent } from './cohortes/cohortes.component';
import { DashboardAdminComponent } from './dashboard-admin/dashboard-admin.component';
import { AssignationCarteComponent } from './assignation-carte/assignation-carte.component';

import { DepartementVueComponent } from './departement-vue/departement-vue.component';
import { EmployeeDetailsComponent } from './employee-details/employee-details.component';
import { CohorteVueComponent } from './cohorte-vue/cohorte-vue.component'; // Ajouté
import { ApprenantDetailsComponent } from './apprenant-details/apprenant-details.component'; // Ajouté
import { UserFormComponent } from './user-form/user-form.component';
import { ConnexionVigileComponent } from './connexion-vigile/connexion-vigile.component';
import { DashboardVigileComponent } from './dashboard-vigile/dashboard-vigile.component';
import { ListeVigileComponent } from './liste-vigile/liste-vigile.component';
import { ApprenantFormComponent } from './apprenant-form/apprenant-form.component';

// Configuration des routes
export const routes: Routes = [
  { path: 'dashboard-admin', component: DashboardAdminComponent }, //route pour l'interface de l'admin
  { path: 'departements', component: DepartementsComponent },
  { path: 'cohortes', component: CohortesComponent },
  { path: 'departement/:id', component: DepartementVueComponent },
  { path: 'cohorte/:id', component: CohorteVueComponent }, // Ajouté
  { path: 'employee-details/:id', component: EmployeeDetailsComponent },
  { path: 'apprenant-details/:id', component: ApprenantDetailsComponent }, // Ajouté
  { path: 'departement/:id/ajout-utilisateur', component: UserFormComponent }, // Route pour ajouter un employé dans un département
  {
    path: 'departement/:id/edit-utilisateur/:userId',
    component: UserFormComponent,
  }, // Route pour éditer un utilisateur dans un département
  { path: 'cohorte/:id/ajout-apprenant', component: ApprenantFormComponent },
  {
    path: 'cohorte/:id/edit-apprenant/:userId',
    component: ApprenantFormComponent,
  }, // Route pour éditer un apprenant dans une cohorte
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirection par défaut
  { path: 'login', component: ConnexionVigileComponent }, // Route vers ConnexionVigile
  { path: 'dashboard-vigile', component: DashboardVigileComponent }, // Route vers DashboardVigile
  { path: 'liste-vigile', component: ListeVigileComponent }, // Route vers ListeVigile
  { path: 'assignation-carte/:id', component: AssignationCarteComponent }, //route pour assigner une carte à un utilisateur
];
