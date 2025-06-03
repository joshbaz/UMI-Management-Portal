import apiRequest from "../../../utils/apiRequestUrl"
import { queryClient } from "../../../utils/tanstack"

/* ********** ERROR HANDLING ********** */

const errorHandling = (error: any) => {
    if (error?.response) {
      
        throw {message: `Error ${error.response.status}: ${error.response.statusText}. ${error.response?.data?.message}`}
       
      } else if (error.request) {
        throw {message: "No response from server. Please check your network connection."}
        
      } else {
        throw {message: `Request failed: ${error.message}`}
       
      }
}

/* ********** AUTH ********** */

export const registerSuperAdminService = async (newUser: any) => {
    try {
        const response = await apiRequest.post("/management/register-superadmin", newUser)
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

export const loginSuperAdmin = async (user: any) => {
    try {
        const response = await apiRequest.post("/management/login/super-admin", user);
        const { token, role } = response.data
        localStorage.setItem('role', role);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const loginResearchCentreAdmin = async (user: any) => {
    try {
        const response = await apiRequest.post("/management/login/research-centre-admin", user);
        const { token, role } = response.data;
        localStorage.setItem('role', role);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const getLoggedInUserDetails = async () => {
    try {
        const response = await apiRequest.get("/management/user/details");

      
        return {
            ...response.data,
            loginTime: new Date().toISOString()
        };
    } catch (error) {
        errorHandling(error);
    }
};

export const updateUserProfileService = async (data: any) => {
    try {
        const response = await apiRequest.put("/management/profile", data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const changePasswordService = async (data: any) => {
    try {
        const response = await apiRequest.put("/management/profile/password", data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}


export const logoutService = async () => {
    try {
        const response = await apiRequest.post("/management/logout")
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

/* ********** SCHOOLS ********** */
export const addSchoolService = async (data: any) => {
    try {
        const response = await apiRequest.post("/management/schools", data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const addSchoolMembersService = async (schoolId: string, data: any) => {
    try {
        const response = await apiRequest.post(`/management/schools/${schoolId}/members`, data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};
export const updateSchoolMembersService = async (schoolId: string, data: any) => {
    try {
        const response = await apiRequest.put(`/management/schools/${schoolId}/members`, data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};


export const getAllSchoolsService = async () => {
    try {
        const response = await apiRequest.get("/management/schools");
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const getSchoolService = async (id: string) => {
    try {
        const response = await apiRequest.get(`/management/schools/${id}`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const updateSchoolService = async (id: string, data: any) => {
    try {
        const response = await apiRequest.put(`/management/schools/${id}`, data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const deleteSchoolService = async (id: string) => {
    try {
        const response = await apiRequest.delete(`/management/schools/${id}`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};


/* ********** CAMPUS ********** */

export const createCampusService = async (data: any) => {
    try {
        const response = await apiRequest.post("/management/campuses", data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const getAllCampusesService = async () => {
    try {
        const response = await apiRequest.get("/management/campuses");
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const getCampusService = async (id: string) => {
    try {
        const response = await apiRequest.get(`/management/campuses/${id}`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const updateCampusService = async (id: string, data: any) => {
    try {
        const response = await apiRequest.put(`/management/campuses/${id}`, data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const deleteCampusService = async (id: string) => {
    try {
        const response = await apiRequest.delete(`/management/campuses/${id}`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

/* ********** DEPARTMENTS ********** */
export const createDepartmentService = async (schoolId: string, data: any) => {
    try {
        const response = await apiRequest.post(`/management/schools/${schoolId}/departments`, data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const getAllDepartmentsService = async (schoolId: string) => {
    try {
        const response = await apiRequest.get(`/management/schools/${schoolId}/departments`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const getDepartmentService = async (schoolId: string, departmentId: string) => {
    try {
        const response = await apiRequest.get(`/management/schools/${schoolId}/departments/${departmentId}`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const updateDepartmentService = async (schoolId: string, departmentId: string, data: any) => {
    try {
        const response = await apiRequest.put(`/management/schools/${schoolId}/departments/${departmentId}`, data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const deleteDepartmentService = async (schoolId: string, departmentId: string) => {
    try {
        const response = await apiRequest.delete(`/management/schools/${schoolId}/departments/${departmentId}`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

/* ********** FACULTY ********** */
export const createFacultyService = async (data: any) => {
    try {
        const response = await apiRequest.post('/management/faculty', data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const getAllFacultyService = async () => {
    try {
        const response = await apiRequest.get('/management/faculty');
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const getFacultyService = async (facultyId: string) => {
    try {
        const response = await apiRequest.get(`/management/faculty/${facultyId}`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const updateFacultyService = async (facultyId: string, data: any) => {
    try {
        const response = await apiRequest.put(`/management/faculty/${facultyId}`, data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const changeFacultyPasswordService = async (facultyId: string, data: any) => {
    try {
        const response = await apiRequest.put(`/management/faculty/${facultyId}/password`, data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};
export const deleteFacultyService = async (facultyId: string) => {
    try {
        const response = await apiRequest.delete(`/management/faculty/${facultyId}`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};


/* ********** SUPERVISOR ********** */
export const createSupervisorService = async (data: any) => {
    try {
        const response = await apiRequest.post('/management/supervisor', data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const getAllSupervisorsService = async () => {
    try {
        const response = await apiRequest.get('/management/supervisor');
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const getSupervisorService = async (supervisorId: string) => {
    try {
        const response = await apiRequest.get(`/management/supervisor/${supervisorId}`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const updateSupervisorService = async (supervisorId: string, data: any) => {
    try {
        const response = await apiRequest.put(`/management/supervisor/${supervisorId}`, data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const deleteSupervisorService = async (supervisorId: string) => {
    try {
        const response = await apiRequest.delete(`/management/supervisor/${supervisorId}`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const assignStudentsToSupervisorService = async (supervisorId: string, studentIds: string[]) => {
    try {
        const response = await apiRequest.post(`/management/supervisor/${supervisorId}/assign-students`, { studentIds });
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const assignSupervisorsToStudentService = async (studentId: string, supervisorIds: string[]) => {
    try {
        const response = await apiRequest.post(`/management/students/${studentId}/assign-supervisors`, { supervisorIds });
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};


export const getAssignedStudentsService = async (supervisorId: string) => {
    try {
        const response = await apiRequest.get(`/management/supervisor/${supervisorId}/students`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};


export const changeStudentSupervisorService = async (studentId: string, data: { oldSupervisorId: string, newSupervisorId: string, reason: string }) => {
    try {
        const response = await apiRequest.put(`/management/students/${studentId}/change-supervisor`, data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};




/* ********** STUDENT ********** */
export const createStudentService = async (data: any) => {
    try {
        const response = await apiRequest.post('/management/students', data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const updateStudentService = async (studentId: string, data: any) => {
    try {
        const response = await apiRequest.put(`/management/students/${studentId}`, data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const changeStudentPasswordService = async (studentId: string, data: any) => {
    try {
        const response = await apiRequest.put(`/management/students/${studentId}/password`, data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};


export const deleteStudentService = async (studentId: string) => {
    try {
        const response = await apiRequest.delete(`/management/students/${studentId}`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const getStudentService = async (studentId: string) => {
    try {
        const response = await apiRequest.get(`/management/students/${studentId}`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const getAllStudentsService = async () => {
    try {
        const response = await apiRequest.get('/management/students');
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const getStudentStatusesService = async (studentId: string) => {
    try {
        const response = await apiRequest.get(`/management/students/${studentId}/statuses`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};



/* ********** STATUS ********** */
export const createStatusDefinitionService = async (data: any) => {
    try {
        const response = await apiRequest.post('/management/status-definitions', data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const getAllStatusDefinitionsService = async () => {
    try {
        const response = await apiRequest.get('/management/status-definitions');
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const getStatusDefinitionService = async (id: string) => {
    try {
        const response = await apiRequest.get(`/management/status-definitions/${id}`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const updateStatusDefinitionService = async (id: string, data: any) => {
    try {
        const response = await apiRequest.put(`/management/status-definitions/${id}`, data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const deleteStatusDefinitionService = async (id: string) => {
    try {
        const response = await apiRequest.delete(`/management/status-definitions/${id}`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};



/* ********** PROPOSAL ********** */
export const getAllProposalsService = async () => {
    try {
        const response = await apiRequest.get('/management/proposals');
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const getProposalService = async (proposalId: string) => {
    try {
        const response = await apiRequest.get(`/management/proposals/${proposalId}`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};

export const getStudentProposalsService = async (studentId: string) => {
    try {
        const response = await apiRequest.get(`/management/students/${studentId}/proposals`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
};




export const addDefenseDateService = async (proposalId: string, defenseDate: string, type: string) => {
    try {
        const response = await apiRequest.post(`/management/proposals/${proposalId}/defense-date`, { defenseDate, type })
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

export const addComplianceReportDateService = async (proposalId: string, complianceReportDate: string) => {
    try {
        const response = await apiRequest.post(`/management/proposals/${proposalId}/compliance-report-date`, { complianceReportDate })
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

export const generateDefenseReportService = async (proposalId: string, reportData: FormData) => {
    try {
      const response = await apiRequest.post(`/management/generate-defense-report/${proposalId}`, reportData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      errorHandling(error);
    }
  }

  export const getProposalDefenseReportsService = async (proposalId: string) => {
    try {
    const response = await apiRequest.get(`/management/proposal/${proposalId}/defense-reports`);
    return response.data;
    } catch (error) {
    errorHandling(error);
    }
}

export const downloadProposalDefenseReportService = async (reportId) => {
    try {
      const response = await apiRequest.get(
        `/management/defense-reports/${reportId}/download`,
        {
          responseType: 'blob', // Important: This tells axios to expect binary data
          headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          }
        }
      );
      return response;
    } catch (error) {
      console.error('Error downloading report:', error);
      throw error;
    }
  }; 


/* ********** END OF PROPOSAL MANAGEMENT ********** */

/* ********** REVIEWER MANAGEMENT ********** */

export const getReviewersService = async () => {
    try {
        const response = await apiRequest.get("/management/reviewers")
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

export const deleteReviewerService = async (proposalId: string, reviewerId: string) => {
    try {
        const response = await apiRequest.delete(`/management/reviewers/${proposalId}/${reviewerId}`)
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}



/* ********** END OF REVIEWER MANAGEMENT ********** */

/* ********** PANELIST MANAGEMENT ********** */

export const addPanelistsService = async (proposalId: string, panelists: any) => {
    try {
        const response = await apiRequest.post(`/management/panelists/${proposalId}`, { panelists })
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

export const getPanelistsService = async () => {
    try {   
        const response = await apiRequest.get("/management/panelists")
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}   


export const deletePanelistService = async (proposalId: string, panelistId: string) => {
    try {
        const response = await apiRequest.delete(`/management/panelists/${proposalId}/${panelistId}`)
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

/* ********** END OF PANELIST MANAGEMENT ********** */

/* ********** REVIEWER MARK MANAGEMENT ********** */

export const addReviewerMarkService = async (proposalId: string, reviewerId: string, grade: number, feedback: string) => {
    try {
        const response = await apiRequest.post(`/management/reviewer-marks/${proposalId}/${reviewerId}`, { grade, feedback })
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}   

/* ********** PANELIST MARK MANAGEMENT ********** */

export const addPanelistMarkService = async (proposalId: string, panelistId: string, grade: number, feedback: string) => {
    try {
        const response = await apiRequest.post(`/management/panelist-marks/${proposalId}/${panelistId}`, { grade, feedback })
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

/* ********** END OF REVIEWER MARK MANAGEMENT ********** */

/* ********** FIELD LETTER MANAGEMENT ********** */

export const generateFieldLetterService = async (proposalId: string, formData: FormData) => {
    try {
        const response = await apiRequest.post(`/management/generate-field-letter/${proposalId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const updateFieldLetterDateService = async (proposalId: string, fieldLetterDate: string) => {
    try {
        const response = await apiRequest.put(`/management/update-field-letter-date/${proposalId}`, { fieldLetterDate })
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}

export const updateEthicsCommitteeDateService = async (proposalId: string, ethicsCommitteeDate: string) => {
    try {
        const response = await apiRequest.put(`/management/update-ethics-committee-date/${proposalId}`, { ethicsCommitteeDate })
        return response.data
    } catch (error) {
        errorHandling(error)
    }
}
/* ********** END OF FIELD LETTER MANAGEMENT ********** */


/* ********** STUDENT BOOK MANAGEMENT ********** */

export const submitStudentBookService = async (studentId: string, data: any) => {
    try {
        const response = await apiRequest.post(`/management/students/${studentId}/books`, data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
    }

export const getStudentBooksService = async (studentId: string) => {
    try {
        const response = await apiRequest.get(`/management/students/${studentId}/books`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

/* ********** END OF STUDENT BOOK MANAGEMENT ********** */

/** Chairperson */
export const getChairpersonsService = async () => {
    try {
      const response = await apiRequest.get('/management/chairperson');
      return response.data;
    } catch (error) {
      errorHandling(error);
    }
  }

  export const createChairpersonService = async (name: string, email: string) => {
    try {
      const response = await apiRequest.post('/management/chairperson', {
        name,
        email
      });
      return response.data;
    } catch (error) {
      errorHandling(error);
    }
  }

  /* ********** EXTERNAL PERSONS MANAGEMENT ********** */

export const getExternalPersonsService = async () => {
    try {
        const response = await apiRequest.get('/management/external-persons');
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const getExternalPersonsByRoleService = async (role: string) => {
    try {
        const response = await apiRequest.get(`/management/external-persons/${role}`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}


export const createExternalPersonService = async (name: string, email: string, role: string) => {
    try {
        const response = await apiRequest.post('/management/external-person', { name, email, role });
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}


export const updateExternalPersonService = async (id: string, data: { name?: string, email?: string, role?: string, isActive?: boolean }) => {
    try {
        const response = await apiRequest.put(`/management/external-person/${id}`, data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const deleteExternalPersonService = async (id: string) => {
    try {
        const response = await apiRequest.delete(`/management/external-person/${id}`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

/* ********** GRADE BOOK MANAGEMENT ********** */

export const getAllBooksService = async () => {
    try {
        const response = await apiRequest.get("/management/books");
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const getBookService = async (bookId: string) => {
    try {
        const response = await apiRequest.get(`/management/books/${bookId}`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}
    /* ********** END OF GRADE BOOK MANAGEMENT ********** */

/* ********** EXAMINER MANAGEMENT ********** */

export const createExaminerService = async (data: any) => {
    try {
        const response = await apiRequest.post('/management/examiners', data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}





export const getAllExaminersService = async () => {
    try {
        const response = await apiRequest.get('/management/examiners');
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const getExaminerService = async (examinerId: string) => {
    try {
        const response = await apiRequest.get(`/management/examiners/${examinerId}`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const updateExaminerService = async (examinerId: string, data: any) => {
    try {
        const response = await apiRequest.put(`/management/examiners/${examinerId}`, data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const assignExaminersToBookService = async (bookId: string, examinerIds: string[]) => {
    try {
        const response = await apiRequest.post(`/management/books/${bookId}/examiners`, { examinerIds });
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const addPanelistsToBookService = async (bookId: string, panelists: any) => {
    try {
        const response = await apiRequest.post(`/management/books/${bookId}/panelists`, { panelists });
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}



export const updateExternalExaminerMarkService = async (assignmentId: string, mark: number, comments: string, status: string) => {
    try {
        const response = await apiRequest.post(`/management/examiner-marks/${assignmentId}`, { mark, comments, status });
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

/* ********** USER MANAGEMENT ********** */

export const getAllUsersService = async () => {
    try {
        const response = await apiRequest.get('/management/users'); 
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const getUserService = async (userId: string) => {
    try {
        const response = await apiRequest.get(`/management/users/${userId}`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}


    export const createUserService = async (data: any) => {
    try {
        const response = await apiRequest.post('/management/users', data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const updateUserService = async (userId: string, data: any) => {
    try {
        const response = await apiRequest.put(`/management/users/${userId}`, data);
        return response.data;
    } catch (error) {
        errorHandling(error);   
    }
}

export const deactivateUserService = async (userId: string) => {
    try {
        const response = await apiRequest.put(`/management/users/${userId}/deactivate`);
        return response.data;
    } catch (error) {   
        errorHandling(error);
    }
}

export const reactivateUserService = async (userId: string) => {
    try {
        const response = await apiRequest.put(`/management/users/${userId}/reactivate`);
        return response.data;
    } catch (error) {   
        errorHandling(error);
    }
}




export const deleteUserService = async (userId: string) => {
    try {
        const response = await apiRequest.delete(`/management/users/${userId}`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const updateUserPasswordService = async (userId: string, newPassword: string) => {
    try {
        const response = await apiRequest.put(`/management/users/${userId}/password`, { newPassword });
        return response.data;
    } catch (error) {
        errorHandling(error);   
    }
}

/* ********** END OF USER MANAGEMENT ********** */

/* ********** VIVA MANAGEMENT ********** */

export interface VivaScheduleData {
  location: string;
  chairpersonId: string;
  minutesSecretaryId: string;
  panelistIds: string[];
  reviewerIds: string[];
}

export const scheduleVivaService = async (bookId: string, scheduledDate: string, data: VivaScheduleData) => {
    try {
        const response = await apiRequest.post(`/management/books/${bookId}/viva`, { 
            scheduledDate,
            location: data.location,
            chairpersonId: data.chairpersonId,
            minutesSecretaryId: data.minutesSecretaryId,
            panelistIds: data.panelistIds,
            reviewerIds: data.reviewerIds
        });
        return response.data;   
    } catch (error) {
        errorHandling(error);
    }
}   

export interface VivaVerdictData {
  verdict: string;
  comments: string;
  externalMark?: number;
  internalMark?: number;
}

export const recordVivaVerdictService = async (vivaId: string, data: VivaVerdictData) => {
    try {
        const response = await apiRequest.put(`/management/viva/${vivaId}`, data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const getAllPanelistsService = async () => {
    try {
        const response = await apiRequest.get('/management/panelists');
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const addNewPanelistService = async (data: any) => {
    try {
        const response = await apiRequest.post('/management/panelists', data);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

//to be removed
export const createReviewerService = async (data: any) => {
    try {
        const response = await apiRequest.post(`/management/reviewer`, data)
        return response.data
        
    } catch (error) {
        errorHandling(error)
    }
}

export const getBookVivasService = async (bookId: string) => {
    try {
        const response = await apiRequest.get(`/management/books/${bookId}/viva`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

/* ********** END OF VIVA MANAGEMENT ********** */

/* ********** COMPLIANCE REPORT MANAGEMENT ********** */

export const updateMinutesSentDateService = async (bookId: string, minutesSentDate: string) => {
    try {
        const response = await apiRequest.put(`/management/books/${bookId}/minutes-sent`, { minutesSentDate });
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const updateComplianceReportDateService = async (bookId: string, complianceReportDate: string) => {
    try {
        const response = await apiRequest.put(`/management/books/${bookId}/compliance-report`, { complianceReportDate });
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

/* ********** END OF COMPLIANCE REPORT MANAGEMENT ********** */

/* ********** STUDENT PROGRESS MANAGEMENT ********** */

export const updateResultsApprovalDateService = async (studentId: string, resultsApprovedDate: string) => {
    try {
        const response = await apiRequest.put(`/management/students/${studentId}/results-approved`, { resultsApprovedDate });   
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const updateResultsSentDateService = async (studentId: string, resultsSentDate: string) => {
    try {
        const response = await apiRequest.put(`/management/students/${studentId}/results-sent`, { resultsSentDate });
        return response.data;
    } catch (error) {   
        errorHandling(error);
    }
}

export const updateSenateApprovalDateService = async (studentId: string, senateApprovalDate: string) => {
    try {
        const response = await apiRequest.put(`/management/students/${studentId}/senate-approval`, { senateApprovalDate });
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

/* ********** DASHBOARD MANAGEMENT ********** */

export const getDashboardStatsService = async () => {
    try {
        const response = await apiRequest.get('/management/dashboard/stats');
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const getStatusStatisticsService = async (category?: string) => {
    try {
        console.log("category", category);
        const url = category 
            ? `/management/dashboard/status-statistics?category=${category}` 
            : '/management/dashboard/status-statistics';
        const response = await apiRequest.get(url);
        return response.data;
    } catch (error) {
        errorHandling(error);
        throw error;
    }
}

export const getProgressTrendsService = async (timeRange: string) => {
    try {
        const response = await apiRequest.get(`/management/dashboard/progress-trends?timeRange=${timeRange}`);
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}


/* ********** END OF DASHBOARD MANAGEMENT ********** */

/* ********** NOTIFICATION MANAGEMENT ********** */

export const getNotificationsService = async () => {
    try {
        const response = await apiRequest.get('/management/notifications');
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}


/* ********** PROPOSAL DEFENSE MANAGEMENT ********** */

export const scheduleProposalDefenseService = async (proposalId: string, scheduledDate: string, panelistIds: any) => {
    try {
        const response = await apiRequest.post(`/management/proposals/${proposalId}/defenses`, { scheduledDate, panelistIds });
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const recordProposalDefenseVerdictService = async (defenseId: string, verdict: string, comments: string) => {
    try {
        const response = await apiRequest.put(`/management/defenses/${defenseId}`, { verdict, comments });
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const getProposalDefensesService = async () => {
    try {
        const response = await apiRequest.get('/management/defenses');
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

/* ********** END OF PROPOSAL DEFENSE MANAGEMENT ********** */

/* ********** GRADUATION MANAGEMENT ********** */

// export const getSenateApprovedStudentsService = async () => {
//     try {
//         const response = await apiRequest.get('/management/students/senate-approved');
//         return response.data;
//     } catch (error) {
//         errorHandling(error);
//     }
// }


export const getGraduationStatisticsService = async () => {
    try {
        const response = await apiRequest.get('/management/graduation');
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

export const addStudentToGraduationService = async (studentId: string, academicYear: string) => {
    try {
        const response = await apiRequest.post(`/management/graduation`, { studentId, academicYear });
        return response.data;
    } catch (error) {
        errorHandling(error);
    }
}

/* ********** END OF GRADUATION MANAGEMENT ********** */



















