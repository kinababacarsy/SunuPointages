import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AssignationCarteComponent } from './assignation-carte/assignation-carte.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AssignationCarteComponent],
  template: `<router-outlet></router-outlet>`

})
export class AppComponent {
  title = 'SunuPointage';
}



