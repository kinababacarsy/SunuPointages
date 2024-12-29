import { Routes } from '@angular/router';
import { AssignationCarteComponent } from './assignation-carte/assignation-carte.component';
import { DashboardAdminComponent } from './dashboard-admin/dashboard-admin.component';
export const routes: Routes = [
  {
    path: 'assignation-carte',
    component: AssignationCarteComponent
  },

  {
    path: 'dashboard-admin', 
    component: DashboardAdminComponent
  },
  // autres routes...
];