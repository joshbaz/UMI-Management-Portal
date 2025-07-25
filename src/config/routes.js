export const ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  REGISTER_SUPERADMIN: '/register',
  STUDENT: {
    ROOT: '/students',
    LIST: '/students',
    ADD: '/students/add',
    DETAILS: '/students/:id',
    PROFILE: '/students/profile/:id'
  },
  GRADE: {
    ROOT: '/grades',
    LIST: '/grades',
    ADD: '/grades/add',
    DETAILS: '/grades/:id'
  },
  FACULTY: {
    ROOT: '/faculty',
    LIST: '/faculty',
    ADD: '/faculty/add',
    DETAILS: '/faculty/:id'
  },
  SCHOOLS: {
    ROOT: '/schools',
    LIST: '/schools',
    EDIT: '/schools/edit/:id',
    ADD: '/schools/add'
  },
  STATUS: {
    ROOT: '/status',
    LIST: '/status'
  },
  SUPERVISOR: {
    ROOT: '/assign-supervisor',
    LIST: '/assign-supervisor',
    ADD: '/assign-supervisor/add/:id',
    DETAILS: '/faculty/:id'
  },
  STATISTICS: {
    ROOT: '/statistics',
   
  },
  EVALUATIONS: {
    ROOT: '/evaluations',
  },
  STAFF: {
    ROOT: '/staff',
    LIST: '/staff',
    ADD: '/staff/add',
    DETAILS: '/staff/:id',
    PROFILE: '/staff/profile/:id'
  },
  NOTIFICATIONS: '/notifications',
  TABLES: '/table-builder',
  SETTINGS: '/settings',
  STUDENT_REQUESTS: {
    ROOT: '/student-requests',
   
  }
};

export default ROUTES;