import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { AppComponent } from './app/app.component';
import { ConnexionVigileComponent } from './app/connexion-vigile/connexion-vigile.component';
import { DashboardVigileComponent } from './app/dashboard-vigile/dashboard-vigile.component';
import { PointageComponent } from './app/liste-vigile/liste-vigile.component'; // Importer le composant
import { provideHttpClient } from '@angular/common/http';  // Importation pour HttpClient

bootstrapApplication(AppComponent, {
  providers: [
    // Fournir HttpClient pour l'application entière
    provideHttpClient(),

    // Configuration des routes
    provideRouter([
      { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirection par défaut
      { path: 'login', component: ConnexionVigileComponent }, // Route vers ConnexionVigile
      { path: 'dashboard-vigile', component: DashboardVigileComponent }, // Route vers DashboardVigile
      { path: 'liste-vigile', component: PointageComponent }, // Route vers ListeVigile

      // Ajoutez d'autres routes ici si nécessaire
    ], withComponentInputBinding()),
  ],
}).catch(err => console.error(err));
