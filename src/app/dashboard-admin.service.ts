import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DashboardAdminService {
  getStatistics() {
    return {
      totalEmployees: 60,
      totalLearners: 100,
      attendanceList: [
        { name: 'Jane Doe', department: 'IT', date: '2024-12-10' },
        { name: 'John Smith', department: 'HR', date: '2024-12-10' },
      ],
      history: {
        present: 20,
        absent: 5,
      }
    };
  }
}