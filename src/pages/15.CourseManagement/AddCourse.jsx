import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAllSchools, useGetAllCampuses, useCreateCourse } from '@/store/tanstackStore/services/queries';
import { toast } from 'sonner';

const StepHeader = () => {
  return (
    <div className="grid grid-cols-1 gap-8">
      <div>
        <div className="h-[2px] bg-[#CDAA4C]" />
        <div className="mt-3">
          <p className="text-sm font-medium text-gray-700">Step 1</p>
          <p className="text-xs text-gray-500">Course Information</p>
        </div>
      </div>
    </div>
  );
};

const AddCourse = () => {
  const navigate = useNavigate();
  const { data: schoolsData } = useGetAllSchools();
  const { data: campusesData } = useGetAllCampuses();
  const createCourseMutation = useCreateCourse();
  const [form, setForm] = useState({
    schoolCode: '',
    campusId: '',
    code: '',
    title: '',
    description: '',
  });

  const selectedSchool = useMemo(
    () => (schoolsData?.schools || []).find((s) => s.code === form.schoolCode),
    [form.schoolCode, schoolsData?.schools]
  );

  // Set sensible defaults when data arrives
  useEffect(() => {
    if (!form.schoolCode && schoolsData?.schools?.length > 0) {
      setForm((prev) => ({ ...prev, schoolCode: schoolsData.schools[0].code }));
    }
  }, [schoolsData?.schools]);

  useEffect(() => {
    if (!form.campusId && campusesData?.campuses?.length > 0) {
      setForm((prev) => ({ ...prev, campusId: campusesData.campuses[0].id }));
    }
  }, [campusesData?.campuses]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onCancel = () => navigate('/courses');

  const onSave = () => {
    // Minimal client validation
    if (!form.schoolCode || !form.campusId || !form.code || !form.title) {
      toast.error('Please fill in School, Campus, Course Code and Course Title.');
      return;
    }

    // Find the school ID from the school code
    const selectedSchoolData = (schoolsData?.schools || []).find((s) => s.code === form.schoolCode);
    if (!selectedSchoolData) {
      toast.error('Selected school not found.');
      return;
    }

    // Prepare course data for API
    const courseData = {
      code: form.code,
      title: form.title,
      description: form.description || null,
      campusId: form.campusId,
      schoolId: selectedSchoolData.id,
    };

    // Create course using mutation
    createCourseMutation.mutate(courseData, {
      onSuccess: (data) => {
        toast.success('Course created successfully!');
        navigate('/courses');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to create course. Please try again.');
      },
    });
  };

  return (
    <div className="mx-auto space-y-6">
      <div className="flex items-center justify-between py-6 px-6 pb-0 w-full h-[88px] border-b border-gray-200">
        <p className="text-sm font-[Inter-Medium] text-gray-900">Research Centre Portal</p>
        <p className="text-sm font-[Inter-Medium] text-gray-600">Digital Research Information Management System</p>
      </div>

      <div className="px-6 py-3">
        <h1 className="text-2xl font-semibold text-gray-800">Add Course Manually</h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mx-6 mb-8">
        <StepHeader />

        {/* Form */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
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
            onClick={onCancel} 
            disabled={createCourseMutation.isPending}
            className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button 
            onClick={onSave} 
            disabled={createCourseMutation.isPending}
            className="px-4 py-2 text-sm rounded-md bg-[#23388F] text-white hover:bg-[#2d48b8] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createCourseMutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCourse;