import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AssignationCarteComponent } from './assignation-carte/assignation-carte.component';
import { NavbarComponent } from './navbar/navbar.component';
import { HttpClientModule } from '@angular/common/http';
import { DashboardAdminComponent } from './dashboard-admin/dashboard-admin.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, HttpClientModule],
  template: `    <app-navbar></app-navbar>
                <router-outlet></router-outlet>`

})
export class AppComponent {
  title = 'SunuPointage';
}


