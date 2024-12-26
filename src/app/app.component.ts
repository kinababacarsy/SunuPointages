import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AssignationCarteComponent } from './assignation-carte/assignation-carte.component';
import { NavbarComponent } from './navbar/navbar.component';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  template: `    <app-navbar></app-navbar>
                <router-outlet></router-outlet>`

})
export class AppComponent {
  title = 'SunuPointage';
}


