import React, { useMemo, useState, useEffect } from 'react';
import { format } from "date-fns";
import { HiPlus, HiPencil, HiTrash, HiX } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import { useGetAllCourses, useGetAllCampuses, useGetAllSchools, useUpdateCourse, useDeleteCourse } from '@/store/tanstackStore/services/queries';
import { toast } from 'sonner';


const StatCard = ({ value, label, highlight }) => {
  return (
    <div className={`flex-1 bg-white rounded-lg border ${highlight ? 'border-[#7A5AF8]' : 'border-gray-200'} p-6`}>
      <div className="text-3xl font-semibold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
};

const CampusTabs = ({ courses, selectedCampus, setSelectedCampus, campusesData }) => {
  const counts = useMemo(() => {
    const map = {};
    courses.forEach(c => {
      const campusName = c.campus?.name || 'Unknown';
      map[campusName] = (map[campusName] || 0) + 1;
    });
    return map;
  }, [courses]);

  const campuses = useMemo(() => {
    if (campusesData?.campuses) {
      return campusesData.campuses.map(c => c.name).sort();
    }
    return Object.keys(counts).sort();
  }, [campusesData?.campuses, counts]);

  return (
    <div className="px-1">
      <div className="flex items-center gap-6 border-b border-gray-200">
        {campuses.map(c => {
          const active = selectedCampus === c;
          return (
            <button
              key={c}
              onClick={() => setSelectedCampus(c)}
              className={`relative py-3 text-sm ${active ? 'text-[#23388F] font-medium' : 'text-gray-600'}`}
            >
              {c} <span className="ml-1 text-gray-400">{counts[c]}</span>
              {active && <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-[#23388F]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const SearchBox = ({ value, onChange }) => {
  return (
    <div className="flex-1">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by Code, or Title"
        className="w-full h-10 px-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#23388F] text-sm"
      />
    </div>
  );
};

const PageSize = ({ pageSize, setPageSize }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Show:</span>
      <select
        value={pageSize}
        onChange={(e) => setPageSize(parseInt(e.target.value))}
        className="h-10 px-3 rounded-md border border-gray-300 text-sm"
      >
        {[10, 20, 30, 50].map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  );
};

const Table = ({ data, isLoading, onEdit, onDelete }) => {
  if (isLoading) {
    return (
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="text-left text-gray-600 text-xs border-b">
              <th className="px-4 py-3">Crs. Code</th>
              <th className="px-4 py-3">Course Title</th>
              <th className="px-4 py-3">Campus</th>
              <th className="px-4 py-3">School</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                Loading courses...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="text-left text-gray-600 text-xs border-b">
            <th className="px-4 py-3">Crs. Code</th>
            <th className="px-4 py-3">Course Title</th>
            <th className="px-4 py-3">Campus</th>
            <th className="px-4 py-3">School</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((c) => (
            <tr key={c.id} className="text-sm text-gray-900 border-b last:border-b-0">
              <td className="px-4 py-4">{c.code}</td>
              <td className="px-4 py-4">{c.title}</td>
              <td className="px-4 py-4">{c.campus?.name || 'Unknown'}</td>
              <td className="px-4 py-4">
                <span className="inline-flex items-center gap-1">
                  <span className="px-2 py-0.5 text-xs rounded bg-gray-100 border border-gray-200">
                    {c.school?.code || 'N/A'}
                  </span>
                </span>
              </td>
              <td className="px-4 py-4">
                <span className={`px-2 py-0.5 text-xs rounded border ${
                  c.isActive 
                    ? 'border-green-200 bg-green-50 text-green-700' 
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}>
                  {c.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onEdit(c)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Edit course"
                  >
                    <HiPencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(c)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete course"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                No courses found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

const Pagination = ({ totalItems, pageSize, currentPage, setCurrentPage }) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  const go = (p) => setCurrentPage(Math.min(Math.max(1, p), totalPages));

  return (
    <div className="flex items-center justify-between px-1 mt-4">
      <p className="text-xs text-gray-500">Showing {Math.min(pageSize, totalItems - (currentPage - 1) * pageSize)} of {totalItems} Results</p>
      <div className="flex items-center gap-2">
        <button disabled={!canPrev} onClick={() => go(currentPage - 1)} className={`px-3 py-1.5 text-sm rounded border ${canPrev ? 'bg-white hover:bg-gray-50' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>Previous</button>
        <span className="text-sm text-gray-600">{currentPage}</span>
        <button disabled={!canNext} onClick={() => go(currentPage + 1)} className={`px-3 py-1.5 text-sm rounded border ${canNext ? 'bg-white hover:bg-gray-50' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>Next</button>
      </div>
    </div>
  );
};

const EditCourseModal = ({ isOpen, onClose, course, schoolsData, campusesData, onSave, isLoading }) => {
  const [form, setForm] = useState({
    schoolCode: '',
    campusId: '',
    code: '',
    title: '',
    description: '',
  });

  // Initialize form when course changes
  useEffect(() => {
    if (course) {
      setForm({
        schoolCode: course.school?.code || '',
        campusId: course.campus?.id || '',
        code: course.code || '',
        title: course.title || '',
        description: course.description || '',
      });
    }
  }, [course]);

  const selectedSchool = useMemo(
    () => (schoolsData?.schools || []).find((s) => s.code === form.schoolCode),
    [form.schoolCode, schoolsData?.schools]
  );

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!form.schoolCode || !form.campusId || !form.code || !form.title) {
      toast.error('Please fill in School, Campus, Course Code and Course Title.');
      return;
    }

    const selectedSchoolData = (schoolsData?.schools || []).find((s) => s.code === form.schoolCode);
    if (!selectedSchoolData) {
      toast.error('Selected school not found.');
      return;
    }

    const courseData = {
      id: course.id,
      code: form.code,
      title: form.title,
      description: form.description || null,
      campusId: form.campusId,
      schoolId: selectedSchoolData.id,
    };

    onSave(courseData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Edit Course</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-md"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Campus */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Campus</label>
              <select
                name="campusId"
                value={form.campusId}
                onChange={onChange}
                className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm"
              >
                {(campusesData?.campuses || []).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* School Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">School Code</label>
              <select
                name="schoolCode"
                value={form.schoolCode}
                onChange={onChange}
                className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm"
              >
                {(schoolsData?.schools || []).map((s) => (
                  <option key={s.code} value={s.code}>{s.code}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-2">{selectedSchool?.name || '\u00A0'}</p>
            </div>

            {/* Course Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course Code</label>
              <input
                name="code"
                value={form.code}
                onChange={onChange}
                placeholder="Enter course code"
                className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm"
              />
            </div>

            {/* Course Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
              <input
                name="title"
                value={form.title}
                onChange={onChange}
                placeholder="Enter course title"
                className="w-full h-10 px-3 rounded-md border border-gray-300 text-sm"
              />
            </div>

            {/* Course Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Course Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={onChange}
                rows={6}
                className="w-full px-3 py-2 rounded-md border border-gray-300 text-sm resize-y"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 mt-8">
            <button 
              onClick={onClose} 
              disabled={isLoading}
              className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              disabled={isLoading}
              className="px-4 py-2 text-sm rounded-md bg-[#23388F] text-white hover:bg-[#2d48b8] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeleteCourseModal = ({ isOpen, onClose, course, onConfirm, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Delete Course</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-md"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <HiTrash className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Are you sure?</h3>
              <p className="text-sm text-gray-600 mb-4">
                You are about to delete the course <strong>"{course?.title}"</strong> ({course?.code}). 
                This action cannot be undone.
              </p>
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
                <strong>Course Details:</strong><br />
                Campus: {course?.campus?.name || 'Unknown'}<br />
                School: {course?.school?.code || 'N/A'}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6">
            <button 
              onClick={onClose} 
              disabled={isLoading}
              className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button 
              onClick={() => onConfirm(course)}
              disabled={isLoading}
              className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Deleting...' : 'Delete Course'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CourseManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCampus, setSelectedCampus] = useState("");
  const [pageSize, setPageSize] = useState(parseInt(localStorage.getItem("courses_pageSize")) || 10);
  const [currentPage, setCurrentPage] = useState(parseInt(localStorage.getItem("courses_currentPage")) || 1);

  // Modal state management
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // API queries
  const { data: schoolsData } = useGetAllSchools();
  const { data: campusesData } = useGetAllCampuses();
  const { data: coursesData, isLoading: coursesLoading, error: coursesError, refetch: refetchCourses } = useGetAllCourses({
    page: currentPage,
    limit: pageSize,
    isActive: true, // Only show active courses by default
  });

  // Mutations
  const updateCourseMutation = useUpdateCourse();
  const deleteCourseMutation = useDeleteCourse();

  // Handler functions for edit and delete actions
  const handleEdit = (course) => {
    setSelectedCourse(course);
    setEditModalOpen(true);
  };

  const handleDelete = (course) => {
    setSelectedCourse(course);
    setDeleteModalOpen(true);
  };

  const handleEditSave = (courseData) => {
    updateCourseMutation.mutate(courseData, {
      onSuccess: () => {
        toast.success('Course updated successfully!');
        setEditModalOpen(false);
        setSelectedCourse(null);
        refetchCourses();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to update course. Please try again.');
      },
    });
  };

  const handleDeleteConfirm = (course) => {
    deleteCourseMutation.mutate(course.id, {
      onSuccess: () => {
        toast.success('Course deleted successfully!');
        setDeleteModalOpen(false);
        setSelectedCourse(null);
        refetchCourses();
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to delete course. Please try again.');
      },
    });
  };

  const closeModals = () => {
    setEditModalOpen(false);
    setDeleteModalOpen(false);
    setSelectedCourse(null);
  };

  // Set default campus when campuses data loads
  useEffect(() => {
    if (campusesData?.campuses?.length > 0 && !selectedCampus) {
      setSelectedCampus(campusesData.campuses[0].name);
    }
  }, [campusesData?.campuses, selectedCampus]);

  // Persist pagination state
  useEffect(() => {
    localStorage.setItem("courses_pageSize", pageSize);
    localStorage.setItem("courses_currentPage", currentPage);
  }, [pageSize, currentPage]);

  // Get courses and stats
  const courses = coursesData?.courses || [];
  const pagination = coursesData?.pagination || {};
  
  // Stats
  const allCoursesCount = pagination.totalCount || 0;
  const activeCoursesCount = courses.filter(c => c.isActive).length;
  const availableThisSemesterCount = courses.length; // Assuming all fetched courses are available

  // Filtered by campus + search
  const filtered = useMemo(() => {
    let filteredCourses = courses;
    
    // Filter by campus if selected
    if (selectedCampus) {
      filteredCourses = courses.filter(c => c.campus?.name === selectedCampus);
    }
    
    // Filter by search term
    const term = searchTerm.trim().toLowerCase();
    if (term) {
      filteredCourses = filteredCourses.filter(c =>
        c.code.toLowerCase().includes(term) || 
        c.title.toLowerCase().includes(term) ||
        c.school?.code.toLowerCase().includes(term)
      );
    }
    
    return filteredCourses;
  }, [courses, selectedCampus, searchTerm]);

  return (
    <div className="mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between py-6 px-6 pb-0 w-full h-[88px] border-b border-gray-200">
        <p className="text-sm font-[Inter-Medium] text-gray-900">Research Centre Portal</p>
        <p className="text-sm font-[Inter-Medium] text-gray-600">Digital Research Information Management System</p>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center px-6 py-3">
        <h1 className="text-2xl font-semibold text-gray-800">Courses</h1>
        <span className="text-sm text-gray-500">Last login: {format(new Date(), "MM-dd-yyyy hh:mm:ssaa")}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6">
        <StatCard value={allCoursesCount} label="All Courses" />
        <StatCard value={activeCoursesCount} label="Active Courses" highlight />
        <StatCard value={availableThisSemesterCount} label="Available This Semester" />
      </div>

      {/* Content */}
      <div className="bg-white p-6 rounded-lg shadow-md mx-6 mb-8">
        {/* Tabs */}
        <CampusTabs
          courses={courses}
          selectedCampus={selectedCampus}
          setSelectedCampus={setSelectedCampus}
          campusesData={campusesData}
        />

        {/* Controls */}
        <div className="flex justify-between items-center my-4">
          <SearchBox value={searchTerm} onChange={setSearchTerm} />
          <div className="flex items-center gap-3">
            <PageSize pageSize={pageSize} setPageSize={setPageSize} />
            <button
              onClick={() => navigate("/courses/add")}
              className="inline-flex items-center px-4 py-2 bg-[#23388F] text-white rounded-lg text-sm font-medium hover:bg-[#2d48b8] gap-2"
            >
              <HiPlus className="w-5 h-5" />
              Add Course
            </button>
          </div>
        </div>

        {/* Table */}
        <Table 
          data={filtered} 
          isLoading={coursesLoading} 
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Pagination */}
        <Pagination
          totalItems={pagination.totalCount || filtered.length}
          pageSize={pageSize}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      </div>

      {/* Modals */}
      <EditCourseModal
        isOpen={editModalOpen}
        onClose={closeModals}
        course={selectedCourse}
        schoolsData={schoolsData}
        campusesData={campusesData}
        onSave={handleEditSave}
        isLoading={updateCourseMutation.isPending}
      />

      <DeleteCourseModal
        isOpen={deleteModalOpen}
        onClose={closeModals}
        course={selectedCourse}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteCourseMutation.isPending}
      />
    </div>
  );
};

export default CourseManagement;