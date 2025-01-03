interface DashboardStats {
  total_employees: number;
  total_students: number;
  total_departments: number;
  total_cohorts: number;
  total_guards: number;
  total_admins: number;
  current_date: string;
  current_time: string;
  employees_present: number;
  employees_late: number;
  employees_absent: number;
  students_present: number;
  students_late: number;
  students_absent: number;
  departments: Array<{
    department: { id: number; name: string };
    count: number;
  }>;
  recent_activity: Array<{
    id: number;
    date: string;
    status: string;
    first_check_in: string;
    last_check_out: string | null;
    employee?: { id: number; first_name: string; last_name: string };
    student?: { id: number; first_name: string; last_name: string };
  }>;
}