import React, { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Search, Plus, X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useGetAllSupervisors } from '@/store/tanstackStore/services/queries'
import { queryClient } from "@/utils/tanstack";
import { assignSupervisorsToStudentService } from "@/store/tanstackStore/services/api";

const AddSupervisors = () => {
  const navigate = useNavigate();
  const { id: studentId } = useParams(); // Get student ID from URL params
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(
    parseInt(localStorage.getItem("pageSize")) || 10
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(localStorage.getItem("currentPage")) || 1
  );
  const [selectedSupervisors, setSelectedSupervisors] = useState([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Fetch supervisors data
  const { data: supervisorsData, isLoading } = useGetAllSupervisors();

  // Specialization options
  const specializationOptions = [
    "Computer Science",
    "Business Administration",
    "Finance",
    "Economics",
    "Public Administration",
    "Human Resource Management",
    "Project Management",
    "Information Technology",
    "Data Science",
    "Marketing",
    "Accounting",
    "Education",
    "Engineering",
    "Health Sciences",
    "Law",
    "Social Sciences",
    "Other"
  ];

  // Mock data for student and supervisors
  const studentData = { student: { name: "John Doe" } };
  const currentSupervisors = { supervisors: [] };

  // Mutation for assigning supervisors
  const addSupervisorsMutation = useMutation({
    mutationKey: ["AssignSupervisors"],
    mutationFn: () => {
      const supervisorIds = selectedSupervisors.map(supervisor => supervisor.id);
      return assignSupervisorsToStudentService(studentId, supervisorIds);
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Supervisors added successfully", {
        duration: 5000,
        action: {
          label: "Undo",
          onClick: () => toast.dismiss()
        }
      });
      
      queryClient.resetQueries({ queryKey: ['student', studentId] });
      setShowConfirmDialog(false);
      navigate(-1);
    },
    onError: (error) => {
      console.error("Error assigning supervisors:", error);
      toast.error(error?.message || "Error assigning supervisors. Please try again.", {
        duration: 40000,
        action: {
          label: "Close",
          onClick: () => toast.dismiss()
        }
      });
    }
  });

  // Save pagination state to localStorage
  useEffect(() => {
    localStorage.setItem("pageSize", pageSize);
    localStorage.setItem("currentPage", currentPage);
  }, [pageSize, currentPage]);

  // Filter supervisors based on search
  const filteredSupervisors = useMemo(() => {
    if (!supervisorsData?.supervisors) return [];
    
    return supervisorsData.supervisors.filter((supervisor) => {
      const matchesSearch =
        supervisor?.name
          ?.toLowerCase()
          ?.includes(searchTerm?.toLowerCase()) ||
        supervisor?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase());
      
      return matchesSearch;
    });
  }, [supervisorsData, searchTerm]);

  // Pagination logic with useMemo
  const paginatedSupervisors = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    let paginatedData = filteredSupervisors.slice(
      startIndex,
      startIndex + pageSize
    );

    if (paginatedData.length === 0 && filteredSupervisors.length > 0) {
      // Reset the current page when the selected page size is too large for the available data
      setCurrentPage(1);
      paginatedData = filteredSupervisors.slice(0, pageSize);
    }

    return paginatedData;
  }, [filteredSupervisors, currentPage, pageSize]);

  console.log('supervisor', supervisorsData)

  const handleAssignToggle = (supervisor) => {
    setSelectedSupervisors(prev => {
      const isSelected = prev.find(r => r.id === supervisor.id);
      if (isSelected) {
        return prev.filter(r => r.id !== supervisor.id);
      } else {
        return [...prev, supervisor];
      }
    });
  };

  const handleSave = () => {
    if (selectedSupervisors.length > 0) {
      setShowConfirmDialog(true);
    }
  };

  const confirmAssignment = () => {
    addSupervisorsMutation.mutate();
    setShowConfirmDialog(false);
  };

  // Calculate total pages
  const totalPages = Math.ceil(filteredSupervisors.length / pageSize);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Search Bar */}
      <div className="p-6 border-b min-h-[90px] border-gray-300 w-full"></div>

      {/* Control Panel */}
      <div className="px-6 py-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg gap-2 hover:bg-primary-900"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <div className="flex flex-col">
                <span className="text-lg font-medium text-gray-900">
                  Student: {studentData?.student?.name || "Loading..."}
                </span>
                <span className="text-sm font-[Inter-Medium] capitalize text-gray-600">
                  Assign supervisors to this student
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs, Search, Table, and Pagination */}
      <div className="p-6">
        <div className="bg-white pb-6 rounded-lg shadow-md">
          {/* Tabs */}
          <div className="flex flex-row items-center gap-8 border-b min-h-[68px] px-6 ">
            <h2 className="text-lg font-semibold">
              Assign Supervisors:{" "}
              <span className="text-sm text-gray-500">
                ({selectedSupervisors.length}) Supervisors Selected
              </span>
            </h2>
          </div>

          <div className="flex justify-between items-center my-4 px-6">
            <div className="relative w-[600px]">
              <h2 className="text-sm font-normal text-[#626263]">
                All available supervisors are shown in this table. Use the search to find the supervisor you want, then click 'Assign' to link them to the student.
              </h2>
            </div>
          </div>

          {/* Search, Page Size, Add New Button */}
          <div className="flex justify-between items-center my-4 px-6">
            <div className="relative w-[600px]">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by Name or Email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/faculty/supervisor/add')}
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg gap-2 hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Add New Supervisor
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="px-6 overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Email
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Phone
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                        Campus
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        <div className="text-sm font-medium">Loading supervisors...</div>
                      </td>
                    </tr>
                  ) : paginatedSupervisors.length > 0 ? (
                    paginatedSupervisors.map((supervisor) => {
                      const isSelected = selectedSupervisors.some(
                        (r) => r.id === supervisor.id
                      );
                      return (
                        <tr
                          key={supervisor.id}
                          className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{supervisor?.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{supervisor?.workEmail}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{supervisor?.primaryPhone}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{supervisor?.campus?.name || "Not specified"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => handleAssignToggle(supervisor)}
                              className={`px-3 py-1 text-xs font-medium rounded-md ${
                                isSelected
                                  ? 'bg-red-100 text-red-800 hover:bg-red-200'
                                  : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                              }`}
                            >
                              {isSelected ? 'Unassign' : 'Assign'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                        <div className="text-sm font-medium">No supervisors found</div>
                        <div className="text-xs mt-1">Please add a new supervisor or adjust your search criteria</div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination and Entries Info */}
            <div className="flex justify-between items-center mt-4 px-2">
              <div className="text-sm text-gray-600">
                Showing {Math.min(filteredSupervisors.length, (currentPage - 1) * pageSize + 1)} to {Math.min(filteredSupervisors.length, currentPage * pageSize)} of {filteredSupervisors.length} entries
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
                >
                  First
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="flex items-center space-x-1">
                  {[...Array(totalPages).keys()].map((page) => (
                    <button
                      key={page + 1}
                      onClick={() => handlePageChange(page + 1)}
                      className={`px-3 py-1 border rounded-md text-sm ${
                        currentPage === page + 1
                          ? 'bg-primary-500 text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {page + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
                >
                  Next
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="px-3 py-1 border rounded-md text-sm disabled:opacity-50"
                >
                  Last
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-center items-center gap-4 pt-8">
            <button 
              onClick={handleSave}
              disabled={selectedSupervisors.length === 0 || addSupervisorsMutation.isPending}
              className="min-w-[200px] text-lg flex items-center justify-center px-4 py-2 bg-primary-500 text-white rounded-lg gap-2 hover:bg-primary-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addSupervisorsMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-[500px] max-w-[90%] shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Confirm Supervisor Assignment</h3>
              <button 
                onClick={() => setShowConfirmDialog(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                You are about to assign the following supervisors to this student:
              </p>
              <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
                {selectedSupervisors.map((supervisor) => (
                  <div key={supervisor.id} className="py-2 px-3 mb-1 bg-blue-50 rounded flex justify-between items-center">
                    <div>
                      <div className="font-medium">{supervisor.name}</div>
                      <div className="text-sm text-gray-500">{supervisor.workEmail}</div>
                    </div>
                    <button 
                      onClick={() => handleAssignToggle(supervisor)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmAssignment}
                disabled={addSupervisorsMutation.isPending}
                className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50"
              >
                {addSupervisorsMutation.isPending ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddSupervisors;