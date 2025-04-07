import { useQuery } from '@tanstack/react-query';
import { getAllBooksService, getAllCampusesService, getAllDepartmentsService, getAllExaminersService, getAllFacultyService, getAllProposalsService, getAllSchoolsService, getAllStatusDefinitionsService, getAllStudentsService, getAllSupervisorsService, getAllUsersService, getAssignedStudentsService, getBookService, getCampusService, getDepartmentService, getExaminerService, getFacultyService, getLoggedInUserDetails, getPanelistsService, getProposalService, getReviewersService, getSchoolService, getStatusDefinitionService, getStudentBooksService, getStudentProposalsService, getStudentService, getStudentStatusesService, getSupervisorService, getUserService, getAllPanelistsService, getBookVivasService, getDashboardStatsService, getStatusStatisticsService, getProgressTrendsService, getNotificationsService, getProposalDefensesService, getGraduationStatisticsService } from './api';

export const useGetLoggedInUserDetails = () => {
  return useQuery({
    queryKey: ['loggedInUser'],
    queryFn: getLoggedInUserDetails,
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
  });
};

export const useGetAllCampuses = () => {
  return useQuery({
    queryKey: ['campuses'],
    queryFn: getAllCampusesService,
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
  });
};

export const useGetCampus = (id: string) => {
  return useQuery({
    queryKey: ['campus', id],
    queryFn: () => getCampusService(id),
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    enabled: !!id
  });
};

/* ********** DEPARTMENTS ********** */
export const useGetAllDepartments = (schoolId: string) => {
  return useQuery({
    queryKey: ['departments', schoolId],
    queryFn: () => getAllDepartmentsService(schoolId),
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    enabled: !!schoolId
  });
};

export const useGetDepartment = (schoolId: string, departmentId: string) => {
  return useQuery({
    queryKey: ['department', schoolId, departmentId], 
    queryFn: () => getDepartmentService(schoolId, departmentId),
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    enabled: !!schoolId && !!departmentId
  });
};

/* ********** SCHOOLS ********** */
export const useGetAllSchools = () => {
  return useQuery({
    queryKey: ['schools'],
    queryFn: getAllSchoolsService,
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
  });
};

export const useGetSchool = (id: string) => {
  return useQuery({
    queryKey: ['school', id],
    queryFn: () => getSchoolService(id),
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    enabled: !!id
  });
};

/* ********** FACULTY ********** */
export const useGetAllFaculty = () => {
  return useQuery({
    queryKey: ['faculty'],
    queryFn: getAllFacultyService,
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
  });
};

export const useGetFaculty = (id: string) => {
  return useQuery({
    queryKey: ['faculty', id],
    queryFn: () => getFacultyService(id),
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    enabled: !!id
  });
};

/* ********** SUPERVISOR ********** */
export const useGetAllSupervisors = () => {
  return useQuery({
    queryKey: ['supervisors'],
    queryFn: getAllSupervisorsService,
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
  });
};

export const useGetSupervisor = (id: string) => {
  return useQuery({
    queryKey: ['supervisor', id],
    queryFn: () => getSupervisorService(id),
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    enabled: !!id
  });
};

export const useGetAssignedStudents = (supervisorId: string) => {
  return useQuery({
    queryKey: ['assignedStudents', supervisorId],
    queryFn: () => getAssignedStudentsService(supervisorId),
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    enabled: !!supervisorId
  });
};





/* ********** STUDENT ********** */
export const useGetAllStudents = () => {
  return useQuery({
    queryKey: ['students'],
    queryFn: getAllStudentsService,
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
  });
};

export const useGetStudent = (id: string) => {
  return useQuery({
    queryKey: ['student', id], 
    queryFn: () => getStudentService(id),
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    enabled: !!id
  });
};

export const useGetStudentStatuses = (studentId: string) => {
  return useQuery({
    queryKey: ['studentStatuses', studentId],
    queryFn: () => getStudentStatusesService(studentId),
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    enabled: !!studentId
  });
};



/* ********** STATUS ********** */
export const useGetAllStatusDefinitions = () => {
  return useQuery({
    queryKey: ['statusDefinitions'],
    queryFn: getAllStatusDefinitionsService,
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
  });
};

export const useGetStatusDefinition = (id: string) => {
  return useQuery({
    queryKey: ['statusDefinition', id],
    queryFn: () => getStatusDefinitionService(id), 
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    enabled: !!id
  });
};



/* ********** PROPOSAL ********** */
export const useGetAllProposals = () => {
  return useQuery({
    queryKey: ['proposals'],
    queryFn: getAllProposalsService,
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
  });
};

export const useGetProposal = (id: string) => {
  return useQuery({
    queryKey: ['proposal', id],
    queryFn: () => getProposalService(id),
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    enabled: !!id
  });
};

export const useGetStudentProposals = (studentId: string) => {
  return useQuery({
    queryKey: ['studentProposals', studentId],
    queryFn: () => getStudentProposalsService(studentId),
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    enabled: !!studentId
  });
};



/* ********** REVIEWER MANAGEMENT ********** */

export function useGetReviewers() {
  return useQuery({
    queryKey: ['reviewers'],
      queryFn: getReviewersService,
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    networkMode: 'online',
  });
}

/* ********** END OF REVIEWER MANAGEMENT ********** */

/* ********** PANELIST MANAGEMENT ********** */

export function useGetPanelists() {
  return useQuery({
    queryKey: ['panelists'],
    queryFn: getPanelistsService,
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    networkMode: 'online',
  });
}

/* ********** END OF PANELIST MANAGEMENT ********** */  

/* ********** STUDENT BOOK MANAGEMENT ********** */

export const useGetStudentBooks = (studentId: string) => {
  return useQuery({
    queryKey: ['studentBooks', studentId],
    queryFn: () => getStudentBooksService(studentId),
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    enabled: !!studentId
  });
};

/* ********** END OF STUDENT BOOK MANAGEMENT ********** */

/* ********** GRADE BOOK MANAGEMENT ********** */

export const useGetAllBooks = () => {
  return useQuery({
    queryKey: ['books'],
    queryFn: getAllBooksService,
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
  });
};

export const useGetBook = (bookId: string) => {
  return useQuery({
    queryKey: ['book', bookId],
    queryFn: () => getBookService(bookId),
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    enabled: !!bookId
  });
};

/* ********** END OF GRADE BOOK MANAGEMENT ********** */

/* ********** EXAMINER MANAGEMENT ********** */

export const useGetAllExaminers = () => {
  return useQuery({
    queryKey: ['examiners'],
      queryFn: getAllExaminersService,
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
  });
};

export const useGetExaminer = (id: string) => {
  return useQuery({
    queryKey: ['examiner', id],
    queryFn: () => getExaminerService(id),
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    enabled: !!id
  });
};

  /* ********** END OF EXAMINER MANAGEMENT ********** */  

/* ********** USER MANAGEMENT ********** */

export const useGetAllUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: getAllUsersService,
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
  });
};  

export const useGetUser = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => getUserService(userId),
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    enabled: !!userId
  });
};  
/* ********** END OF USER MANAGEMENT ********** */

/* ********** VIVA MANAGEMENT ********** */

export const useGetAllPanelists = () => {
  return useQuery({
    queryKey: ['panelists'],
    queryFn: getAllPanelistsService,
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
  });
};

export const useGetBookVivas = (bookId: string) => {
  return useQuery({
    queryKey: ['bookVivas', bookId],
    queryFn: () => getBookVivasService(bookId),
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
    enabled: !!bookId
  });
};
/* ********** END OF VIVA MANAGEMENT ********** */

/* ********** DASHBOARD MANAGEMENT ********** */

export const useGetDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStatsService,
    staleTime: 300000, // 5 minutes
    refetchInterval: false,
    retry: 1,
  });
};

export const useGetStatusStatistics = (category?: string) => {
  return useQuery({
    queryKey: ['statusStatistics', category],
    queryFn: () => getStatusStatisticsService(category),
    staleTime: 300000, // 5 minutes
    refetchInterval: false,
    retry: 1,
  });
};

export const useGetProgressTrends = (timeRange: string) => {
  return useQuery({
    queryKey: ['progressTrends', timeRange],
    queryFn: () => getProgressTrendsService(timeRange),
    staleTime: 300000, // 5 minutes
    refetchInterval: false,
    retry: 1,
  });
};
/* ********** END OF DASHBOARD MANAGEMENT ********** */

/* ********** NOTIFICATION MANAGEMENT ********** */

export const useGetNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: getNotificationsService,
    staleTime: 300000, // 5 minutes
    refetchInterval: false,
    retry: 1,
  });
};
/* ********** END OF NOTIFICATION MANAGEMENT ********** */

/* ********** PROPOSAL DEFENSE MANAGEMENT ********** */

export const useGetProposalDefenses = () => {
  return useQuery({
    queryKey: ['proposalDefenses'],
    queryFn: getProposalDefensesService,
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
  });
};
/* ********** END OF PROPOSAL DEFENSE MANAGEMENT ********** */

/* ********** GRADUATION MANAGEMENT ********** */

export const useGetGraduationStatistics = () => {
  return useQuery({
    queryKey: ['graduationStatistics'],
    queryFn: getGraduationStatisticsService,
    staleTime: Infinity, // 1 minute
    refetchInterval: false,
  });
};

/* ********** END OF GRADUATION MANAGEMENT ********** */

/* ********** SENATE APPROVED STUDENTS MANAGEMENT ********** */

// export const useGetSenateApprovedStudents = () => {
//   return useQuery({
//     queryKey: ['senateApprovedStudents'],
//     queryFn: getSenateApprovedStudentsService,
//     staleTime: Infinity, // 1 minute
//     refetchInterval: false,
//   });
// };
/* ********** END OF SENATE APPROVED STUDENTS MANAGEMENT ********** */

