import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest, map, tap, Subject } from 'rxjs'

@Injectable({
  providedIn: 'root'
})
export class DashboardAdminService {
  private apiUrl = 'http://127.0.0.1:8000/api/';
  private refreshTrigger = new Subject<void>();
  
  // Signal pour les statistiques
  private statsSignal = signal({
    totalEmployes: 0,
    totalApprenants: 0,
    totalDepartements: 0,
    totalCohortes: 0,
    totalAdmins: 0,
    totalVigiles: 0
  });

  constructor(private http: HttpClient) {
    // S'abonner aux événements de rafraîchissement
    this.refreshTrigger.subscribe(() => {
      this.refreshAllStats().subscribe();
    });
  }

  // Méthode pour déclencher un rafraîchissement
  triggerRefresh() {
    this.refreshTrigger.next();
  }

  // Ajouter un utilisateur et mettre à jour les stats
  addUser(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}users`, userData).pipe(
      tap(() => {
        this.triggerRefresh(); // Rafraîchir après l'ajout
      })
    );
  }

  // Ajouter un utilisateur au département
  addUserToDepartement(departementId: string, userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}departements/${departementId}/users`, userData).pipe(
      tap(() => {
        this.triggerRefresh();
      })
    );
  }

  // Ajouter un utilisateur à la cohorte
  addUserToCohorte(cohorteId: string, userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}cohortes/${cohorteId}/users`, userData).pipe(
      tap(() => {
        this.triggerRefresh();
      })
    );
  }

  // Import CSV avec mise à jour automatique
  importCSV(file: File, type: 'departement' | 'cohorte', id: string): Observable<any> {
    const formData = new FormData();
    formData.append('csv_file', file);

    const url = type === 'departement' 
      ? `${this.apiUrl}users/import-csv/departement/${id}`
      : `${this.apiUrl}users/import-csv/cohorte/${id}`;

    return this.http.post(url, formData).pipe(
      tap(() => {
        this.triggerRefresh();
      })
    );
  }

  refreshAllStats(): Observable<any> {
    return combineLatest([
      this.http.get<any>(`${this.apiUrl}users/count`),
      this.http.get<number>(`${this.apiUrl}departements/count`),
      this.http.get<number>(`${this.apiUrl}cohortes/count`)
    ]).pipe(
      map(([userCount, depCount, cohCount]) => {
        const stats = {
          totalEmployes: userCount.employes,
          totalApprenants: userCount.apprenants,
          totalAdmins: userCount.admins,
          totalVigiles: userCount.vigiles,
          totalDepartements: depCount,
          totalCohortes: cohCount
        };
        
        this.statsSignal.set(stats);
        return stats;
      })
    );
  }

  get stats() {
    return this.statsSignal;
  }
}