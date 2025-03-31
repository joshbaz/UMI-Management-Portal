import React, { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { HiArrowLeft } from "react-icons/hi";
import { format } from "date-fns";
import { Search, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useGetBook, useGetAllExaminers } from "../../store/tanstackStore/services/queries";
import { createExaminerService, assignExaminersToBookService } from "../../store/tanstackStore/services/api";
import { queryClient } from "@/utils/tanstack";

const GradeBookAddExternalExaminer = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get book ID from URL params
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(
    parseInt(localStorage.getItem("pageSize")) || 10
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(localStorage.getItem("currentPage")) || 1
  );
  const [selectedExaminers, setSelectedExaminers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newExaminer, setNewExaminer] = useState({
    name: "",
    primaryEmail: "",
    secondaryEmail: "",
    primaryPhone: "",
    secondaryPhone: "",
    institution: "",
    type: "External"
  });

  // Query to fetch book details
  const { data: bookData, isLoading: isBookLoading, error: bookError } = useGetBook(id);
  
  // Query to fetch all examiners
  const { data: examinersData, isLoading: isExaminersLoading, error: examinersError } = useGetAllExaminers();

  // Mutation for assigning examiners
  const assignExaminersMutation = useMutation({
    mutationFn: () => assignExaminersToBookService(id, selectedExaminers.map(examiner => examiner.id)),
    onSuccess: (data) => {
      toast.success(data?.message || "Examiners assigned successfully",{
        duration: 5000,
        action: {
          label: "Undo",
          onClick: () => toast.dismiss()
        }
      });
      queryClient.resetQueries({ queryKey: ['book', id] });
      navigate(-1);
    },
    onError: (error) => {
      console.error("Error assigning examiners:", error);
      toast.error(error?.message || "Error assigning examiners. Please try again.", {
        duration: 40000,
        action: {
          label: "Close",
          onClick: () => toast.dismiss()
        }
      });
    }
  });

  // Mutation for creating a new examiner
  const createExaminerMutation = useMutation({
    mutationFn: createExaminerService,
    onSuccess: (data) => {
      toast.success(data?.message || "Examiner created successfully");
      setSelectedExaminers(prev => [...prev, data.examiner]);
      setShowModal(false);
      setNewExaminer({ 
        name: "", 
        primaryEmail: "", 
        secondaryEmail: "", 
        primaryPhone: "", 
        secondaryPhone: "", 
        institution: "", 
        type: "External" 
      });
      queryClient.resetQueries({ queryKey: ['examiners'] });
    },
    onError: (error) => {
      console.error("Error creating examiner:", error);
      toast.error(error?.message || "Error creating examiner. Please try again.");
    }
  });

  // Manage column visibility state
  const [columnVisibility, setColumnVisibility] = useState({
    name: true,
    email: true,
    type: true,
    actions: true,
  });

  // Save pagination state to localStorage
  useEffect(() => {
    localStorage.setItem("pageSize", pageSize);
    localStorage.setItem("currentPage", currentPage);
  }, [pageSize, currentPage]);

  // Filter examiners based on search and type (only External)
  const filteredExaminers = useMemo(() => {
    if (!examinersData?.examiners) return [];
    
    return examinersData.examiners.filter((examiner) => {
      const matchesSearch =
        examiner?.name
          ?.toLowerCase()
          ?.includes(searchTerm?.toLowerCase()) ||
        examiner?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        examiner?.primaryEmail?.toLowerCase()?.includes(searchTerm?.toLowerCase());
      
      // Only include external examiners
      const isExternal = examiner?.type === "External";

      return matchesSearch && isExternal;
    });
  }, [examinersData, searchTerm]);

  // Pagination logic with useMemo
  const paginatedExaminers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    let paginatedData = filteredExaminers.slice(
      startIndex,
      startIndex + pageSize
    );

    if (paginatedData.length === 0 && filteredExaminers.length > 0) {
      // Reset the current page when the selected page size is too large for the available data
      setCurrentPage(1);
      paginatedData = filteredExaminers.slice(0, pageSize);
    }

    return paginatedData;
  }, [filteredExaminers, currentPage, pageSize]);

  const handleAssignToggle = (examiner) => {
    setSelectedExaminers(prev => {
      const isSelected = prev.find(e => e.id === examiner.id);
      if (isSelected) {
        return prev.filter(e => e.id !== examiner.id);
      } else {
        return [...prev, examiner];
      }
    });
  };

  const handleSave = () => {
    console.log(selectedExaminers);
    const examinerIds = selectedExaminers.map(examiner => examiner.id);
    console.log(examinerIds);
    assignExaminersMutation.mutate({ bookId: id, examinerIds });
  };

  const handleCreateExaminer = (e) => {
    e.preventDefault();
    createExaminerMutation.mutate(newExaminer);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewExaminer(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate total pages
  const totalPages = Math.ceil(filteredExaminers.length / pageSize);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (isBookLoading || isExaminersLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (bookError || examinersError) {
    return (
      <div className="p-6 text-red-500">
        Error loading data: {bookError?.message || examinersError?.message}
      </div>
    );
  }

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
                <HiArrowLeft className="w-5 h-5" />
                Back
              </button>
              <div className="flex flex-col">
                <span className="text-lg font-medium text-gray-900">
                  Book: {bookData?.book?.title || "Loading..."}
                </span>
                <span className="text-sm font-[Inter-Medium] capitalize text-gray-600">
                  Student: {`${bookData?.book?.student?.firstName} ${bookData?.book?.student?.lastName}` || "Not Available"}
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
              Assign External Examiners:{" "}
              <span className="text-sm text-gray-500">
                ({selectedExaminers.length}) Examiners Selected
              </span>
            </h2>
          </div>

          <div className="flex justify-between items-center my-4 px-6">
            <div className="relative w-[600px]">
              <h2 className="text-sm font-normal text-[#626263]">
                All available external examiners are shown in this table. Use the search to find the examiner you want, then click 'Assign' to link them to the book.
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
                onClick={() => setShowModal(true)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg gap-2 hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Add New Examiner
              </button>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Show:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-2 py-1 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {[5, 10, 15, 20, 25].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="px-6">
            {/* Examiner Table */}
            <div className="min-w-full overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedExaminers.map((examiner) => {
                    const isSelected = selectedExaminers.some(e => e.id === examiner.id);
                    return (
                      <tr 
                        key={examiner.id} 
                        className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{examiner.name}</div>
                          <div className="text-xs text-gray-500">{examiner.institution}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{examiner.email || examiner.primaryEmail}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {examiner.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => handleAssignToggle(examiner)}
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
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination and Entries Info */}
            <div className="flex justify-between items-center mt-4 px-2">
              <div className="text-sm text-gray-600">
                Showing {Math.min(filteredExaminers.length, (currentPage - 1) * pageSize + 1)} to {Math.min(filteredExaminers.length, currentPage * pageSize)} of {filteredExaminers.length} entries
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
              disabled={selectedExaminers.length === 0 || assignExaminersMutation.isPending}
              className="min-w-[200px] text-lg flex items-center justify-center px-4 py-2 bg-primary-500 text-white rounded-lg gap-2 hover:bg-primary-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {assignExaminersMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Dialog for adding new examiner */}
      <dialog
        open={showModal}
        className="fixed inset-0 z-50 bg-transparent"
        onClick={(e) => {
          if (e.target === e.currentTarget) setShowModal(false);
        }}
      >
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add New External Examiner</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateExaminer}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={newExaminer.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Dr. John Smith"
                />
              </div>
              
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Email
                  </label>
                  <input
                    type="email"
                    name="primaryEmail"
                    value={newExaminer.primaryEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="john.smith@work.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secondary Email
                  </label>
                  <input
                    type="email"
                    name="secondaryEmail"
                    value={newExaminer.secondaryEmail}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="john.smith@personal.com"
                  />
                </div>
              </div>
              
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Phone
                  </label>
                  <input
                    type="tel"
                    name="primaryPhone"
                    value={newExaminer.primaryPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Secondary Phone
                  </label>
                  <input
                    type="tel"
                    name="secondaryPhone"
                    value={newExaminer.secondaryPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+1 (555) 987-6543"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Institution
                </label>
                <input
                  type="text"
                  name="institution"
                  value={newExaminer.institution}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="University of Example"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  name="type"
                  value={newExaminer.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="External">External</option>
                
                </select>
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createExaminerMutation.isPending}
                  className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 disabled:opacity-50"
                >
                  {createExaminerMutation.isPending ? 'Creating...' : 'Create Examiner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  );
};

export default GradeBookAddExternalExaminer;