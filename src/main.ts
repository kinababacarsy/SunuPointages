import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { AppComponent } from './app/app.component';
import { ConnexionVigileComponent } from './app/connexion-vigile/connexion-vigile.component';
import { DashboardVigileComponent } from './app/dashboard-vigile/dashboard-vigile.component'; // Importer le composant

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      { path: '', redirectTo: 'dashboard-vigile', pathMatch: 'full' }, // Redirection par défaut
      { path: 'login', component: ConnexionVigileComponent }, // Route vers ConnexionVigile
      { path: 'dashboard-vigile', component: DashboardVigileComponent }, // Route vers DashboardVigile
      // Ajoutez d'autres routes ici si nécessaire
    ], withComponentInputBinding()),
  ],
}).catch(err => console.error(err));