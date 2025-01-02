import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { AppComponent } from './app/app.component';
import { ConnexionVigileComponent } from './app/connexion-vigile/connexion-vigile.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([
      { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redirection par défaut
      { path: 'login', component: ConnexionVigileComponent }, // Route vers ConnexionVigile
      // Ajoutez d'autres routes ici si nécessaire
    ], withComponentInputBinding()),
  ],
}).catch(err => console.error(err));