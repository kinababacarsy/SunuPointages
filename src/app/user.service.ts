import { Injectable } from '@angular/core';
import axios from 'axios';
import { Observable } from 'rxjs';

// Interface pour typer les données utilisateur
export interface User {
  id?: string;
  matricule?: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse?: string;
  photo?: string;
  role: 'employe' | 'apprenant';
  departement_id?: string;
  cohorte_id?: string;
  cardID?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'http://localhost:8000/api'; // URL de votre API

  constructor() {}

  // Méthode générique pour gérer les erreurs
  private handleError(error: any): Observable<never> {
    console.error("Une erreur s'est produite:", error);
    return new Observable((observer) => {
      observer.error(
        error.response?.data?.message ||
          "Une erreur s'est produite. Veuillez réessayer plus tard."
      );
    });
  }

  // Récupérer la liste des utilisateurs
  getUsers(): Observable<User[]> {
    return new Observable((observer) => {
      axios
        .get(`${this.apiUrl}/users`)
        .then((response) => {
          observer.next(response.data);
          observer.complete();
        })
        .catch((error) => {
          this.handleError(error).subscribe(observer);
        });
    });
  }

  // Créer un utilisateur
  createUser(userData: User): Observable<User> {
    return new Observable((observer) => {
      axios
        .post(`${this.apiUrl}/ajout/users`, userData)
        .then((response) => {
          observer.next(response.data);
          observer.complete();
        })
        .catch((error) => {
          this.handleError(error).subscribe(observer);
        });
    });
  }

  // Ajouter un utilisateur à partir d'un département
  createUserFromDepartement(
    departementId: string,
    userData: User
  ): Observable<User> {
    return new Observable((observer) => {
      axios
        .post(
          `${this.apiUrl}/departements/${departementId}/ajout/users`,
          userData
        )
        .then((response) => {
          observer.next(response.data);
          observer.complete();
        })
        .catch((error) => {
          this.handleError(error).subscribe(observer);
        });
    });
  }

  // Ajouter un utilisateur à partir d'une cohorte
  createUserFromCohorte(cohorteId: string, userData: User): Observable<User> {
    return new Observable((observer) => {
      axios
        .post(`${this.apiUrl}/cohortes/${cohorteId}/ajout/users`, userData)
        .then((response) => {
          observer.next(response.data);
          observer.complete();
        })
        .catch((error) => {
          this.handleError(error).subscribe(observer);
        });
    });
  }

  // Ajouter plusieurs utilisateurs via un fichier CSV
  importUsersFromCSV(file: File, departementId: string): Observable<any> {
    return new Observable((observer) => {
      const formData = new FormData();
      formData.append('csv_file', file);

      axios
        .post(
          `${this.apiUrl}/departements/${departementId}/import-users`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        )
        .then((response) => {
          observer.next(response.data);
          observer.complete();
        })
        .catch((error) => {
          this.handleError(error).subscribe(observer);
        });
    });
  }

  // Récupérer un utilisateur par ID
  getUser(id: string): Observable<User> {
    return new Observable((observer) => {
      axios
        .get(`${this.apiUrl}/voir/users/${id}`)
        .then((response) => {
          observer.next(response.data);
          observer.complete();
        })
        .catch((error) => {
          this.handleError(error).subscribe(observer);
        });
    });
  }

  // Mettre à jour un utilisateur
  updateUser(id: string, userData: Partial<User>): Observable<User> {
    return new Observable((observer) => {
      axios
        .put(`${this.apiUrl}/maj/users/${id}`, userData)
        .then((response) => {
          observer.next(response.data);
          observer.complete();
        })
        .catch((error) => {
          this.handleError(error).subscribe(observer);
        });
    });
  }

  // Supprimer un utilisateur
  deleteUser(id: string): Observable<void> {
    return new Observable((observer) => {
      axios
        .delete(`${this.apiUrl}/sup/users/${id}`)
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch((error) => {
          this.handleError(error).subscribe(observer);
        });
    });
  }

  // Récupérer les utilisateurs par département
  getUsersByDepartement(departementId: string): Observable<User[]> {
    return new Observable((observer) => {
      axios
        .get(`${this.apiUrl}/users/departement/${departementId}`)
        .then((response) => {
          observer.next(response.data);
          observer.complete();
        })
        .catch((error) => {
          this.handleError(error).subscribe(observer);
        });
    });
  }

  // Récupérer les apprenants par cohorte
  getUsersByCohorte(cohorteId: string): Observable<User[]> {
    return new Observable((observer) => {
      axios
        .get(`${this.apiUrl}/users/cohorte/${cohorteId}`)
        .then((response) => {
          observer.next(response.data);
          observer.complete();
        })
        .catch((error) => {
          this.handleError(error).subscribe(observer);
        });
    });
  }

  // Récupérer le nombre d'employés dans un département
  getEmployeeCountByDepartement(departementId: string): Observable<number> {
    return new Observable((observer) => {
      axios
        .get(`${this.apiUrl}/departements/${departementId}/employee-count`)
        .then((response) => {
          observer.next(response.data.count);
          observer.complete();
        })
        .catch((error) => {
          this.handleError(error).subscribe(observer);
        });
    });
  }

  // Récupérer le nombre d'apprenants dans une cohorte
  getApprenantCountByCohorte(cohorteId: string): Observable<number> {
    return new Observable((observer) => {
      axios
        .get(`${this.apiUrl}/cohortes/${cohorteId}/apprenant-count`)
        .then((response) => {
          observer.next(response.data.count);
          observer.complete();
        })
        .catch((error) => {
          this.handleError(error).subscribe(observer);
        });
    });
  }

  // Importer des utilisateurs dans une cohorte via un fichier CSV
  importUsersFromCSVToCohorte(file: File, cohorteId: string): Observable<any> {
    return new Observable((observer) => {
      const formData = new FormData();
      formData.append('csv_file', file);

      axios
        .post(`${this.apiUrl}/cohortes/${cohorteId}/import-users`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((response) => {
          observer.next(response.data);
          observer.complete();
        })
        .catch((error) => {
          this.handleError(error).subscribe(observer);
        });
    });
  }
}
