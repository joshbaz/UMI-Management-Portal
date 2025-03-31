import React, { useEffect, useMemo, useState } from "react";
import { useGetAllStudents, useGetSupervisor } from "../../store/tanstackStore/services/queries";
import { useMutation } from "@tanstack/react-query";
import { assignStudentsToSupervisorService } from "../../store/tanstackStore/services/api";
import { useNavigate, useParams } from "react-router-dom";
import { HiArrowLeft, HiPlus } from "react-icons/hi";
import { format } from "date-fns";
import { Search } from "lucide-react";
import AssignStudentTable from "./AssignStudentTable";
import { toast } from "sonner";

const AssignStudents = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get supervisor ID from URL params
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    localStorage.getItem("selectedCategory") || "All Students"
  );
  const [pageSize, setPageSize] = useState(
    parseInt(localStorage.getItem("pageSize")) || 10
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(localStorage.getItem("currentPage")) || 1
  );
  const [selectedStudents, setSelectedStudents] = useState([]);

  // Query to fetch all students
  const { data: studentsData, isLoading, error } = useGetAllStudents();

  // Query to fetch supervisor details
  const { data: supervisorData, isLoading: supervisorLoading } = useGetSupervisor(id);

  // Mutation for assigning students
  const assignStudentsMutation = useMutation({
    mutationFn: ({ supervisorId, studentIds }) => 
      assignStudentsToSupervisorService(supervisorId, studentIds),
    onSuccess: (data) => {
      toast.success(data?.message || "Students assigned successfully",{
        duration: 5000,
        action: {
          label: "Undo",
          onClick: () => toast.dismiss()
        }
      });
      navigate(-1);
    },
    onError: (error) => {
      console.error("Error assigning students:", error);
      toast.error(error?.message || "Error assigning students. Please try again.", {
        duration: 40000,
        action: {
          label: "Close",
          onClick: () => toast.dismiss()
        }
      });
    }
  });

  // Manage column visibility state
  const [columnVisibility, setColumnVisibility] = useState({
    fullname: true,
    email: true,
    campus: true,
    schoolCode: true,
    program: true,
    status: true,
    actions: true,
  });

  // Save pagination state to localStorage
  useEffect(() => {
    localStorage.setItem("selectedCategory", selectedCategory);
    localStorage.setItem("pageSize", pageSize);
    localStorage.setItem("currentPage", currentPage);
  }, [selectedCategory, pageSize, currentPage]);

  // Filter students based on search, category and program level using useMemo
    // Filter students to only show those in workshop status
    const workshopStudents = studentsData?.students?.filter(student => 
      student.statuses?.find(s => s.isCurrent)?.definition?.name?.toLowerCase() === "workshop"
    );
  const filteredStudents = useMemo(() => {
    return (studentsData?.students || []).filter((student) => {
      const matchesCategory =
      student.statuses?.find(s => s.isCurrent)?.definition?.name?.toLowerCase() === "workshop";

      const matchesSearch =
        student?.firstName
          ?.toLowerCase()
          ?.includes(searchTerm?.toLowerCase()) ||
        student?.lastName?.toLowerCase()?.includes(searchTerm?.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [studentsData?.students, selectedCategory, searchTerm]);

  // Pagination logic with useMemo
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    let paginatedData = filteredStudents.slice(
      startIndex,
      startIndex + pageSize
    );

    if (paginatedData.length === 0 && filteredStudents.length > 0) {
      // Reset the current page when the selected page size is too large for the available data
      setCurrentPage(1);
      paginatedData = filteredStudents.slice(0, pageSize);
    }

    return paginatedData;
  }, [filteredStudents, currentPage, pageSize]);

  const handleAssignToggle = (student) => {
    setSelectedStudents(prev => {
      const isSelected = prev.find(s => s.id === student.id);
      if (isSelected) {
        return prev.filter(s => s.id !== student.id);
      } else {
        return [...prev, student];
      }
    });
  };

  const handleSave = () => {
    const studentIds = selectedStudents.map(student => student.id);
    assignStudentsMutation.mutate({ supervisorId: id, studentIds });
  };



  if (isLoading || supervisorLoading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        Error loading students: {error.message}
      </div>
    );
  }

  return (
    <div className=" max-w-7xl mx-auto space-y-6">
      {/* Search Bar */}
      <div className="p-6 border-b min-h-[90px] border-gray-300 w-full"></div>

      {/* Header */}
      {/* <div className="flex justify-between items-center p-4">
        <h1 className="text-2xl font-semibold text-gray-800">
          {" "}
          Assign Students to Supervisor{" "}
        </h1>
        <span className="text-sm text-gray-500">
          Last login: {format(new Date(), "MM-dd-yyyy hh:mm:ssaa")}
        </span>
      </div> */}

      {/* Table Control Panel */}
      {/* <StudentTableControlPanel
        visibleColumns={columnVisibility}
        setVisibleColumns={setColumnVisibility}
      /> */}

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
              <span className="text-lg font-medium text-gray-900">
                {supervisorData?.supervisor?.title} {supervisorData?.supervisor?.name}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs, Search, Table, and Pagination */}
      <div className="p-6">
        <div className=" bg-white pb-6 rounded-lg shadow-md">
          {/* Tabs */}
          <div className="flex flex-row items-center gap-8 border-b min-h-[68px] px-6 ">
            <h2 className="text-lg font-semibold">
              Assign Students :{" "}
              <span className="text-sm text-gray-500">
                ({selectedStudents.length}) Students Selected
              </span>
            </h2>
          </div>

          <div className="flex justify-between items-center my-4 px-6">
            <div className="relative w-[600px]">
              <h2 className="text-sm font-normal text-[#626263]">
                All admitted, unassigned students are shown in this table. Use
                the degree (Masters/PhD) and branch/school filters to find the
                student you want, then click 'Assign' to link them to the
                supervisor.
              </h2>
            </div>
          </div>

          {/* Search, Page Size, and Add Student Button */}
          <div className="flex justify-between items-center my-4 px-6">
            <div className="relative w-[600px]">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by Name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <div className="flex items-center gap-3">
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
            {/* Student Table */}
            <AssignStudentTable
              students={paginatedStudents}
              columnVisibility={columnVisibility}
              setColumnVisibility={setColumnVisibility}
              selectedStudents={selectedStudents}
              onAssignToggle={handleAssignToggle}
            />
          </div>

          <div className="flex justify-center items-center gap-4 pt-8">
            <button 
              onClick={handleSave}
              disabled={selectedStudents.length === 0 || assignStudentsMutation.isPending}
              className="min-w-[200px] text-lg flex items-center justify-center px-4 py-2 bg-primary-500 text-white rounded-lg gap-2 hover:bg-primary-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {assignStudentsMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>

          {/* Pagination */}
          {/* <AssignStudentPagination
          totalItems={filteredStudents.length}
          pageSize={pageSize}
          setPageSize={setPageSize}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        /> */}
        </div>
      </div>
    </div>
  );
};

export default AssignStudents;
