import { Formik } from "formik";
import React, { useState } from "react";
import {
  HiOutlineArrowLeft,
  HiPencilAlt,
  HiPlus,
  HiX,
} from "react-icons/hi";
import * as yup from 'yup';
import { useFormik } from 'formik';
import { toast } from 'sonner';
import { createDepartmentService, updateDepartmentService } from '@/store/tanstackStore/services/api';
import { useMutation } from "@tanstack/react-query";
import { useGetAllDepartments } from '@/store/tanstackStore/services/queries';
import { queryClient } from "@/utils/tanstack";
import { useNavigate, useParams } from "react-router-dom";

const EditSchoolDepartmentForm = ({ handlePrevious }) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const { id: currentSchoolId } = useParams();
  const navigate = useNavigate();
  const { data: departments } = useGetAllDepartments(currentSchoolId);

  const handleLeave = () => {
    localStorage.removeItem('currentSchoolId');
    navigate('/schools', { replace: true });
  };

  return (
    <>
      <div className="mt-8 flex flex-col gap-4">
       

        {departments?.departments?.length > 0 ? (
          departments.departments.map((department) => (
            <div key={department.id} className="flex flex-col w-full">
              <div className="flex flex-row items-center justify-between">
                <h1 className="text-lg text-center">{department.name}</h1>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDepartment(department);
                    setIsUpdateOpen(true);
                  }}
                  className="flex gap-1 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600"
                >
                  Edit
                  <HiPencilAlt className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Department Details */}
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-x-6 gap-y-8">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL
                    </label>
                    <input
                      type="text"
                      value={department.url || ''}
                      readOnly
                      className="w-full h-9 rounded-md border border-gray-200 shadow-sm px-3 py-2 text-sm bg-gray-50"
                    />
                  </div>
                </div>

               
                <div className="grid grid-cols-3 gap-x-6 gap-y-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admin. Name
                    </label>
                    <input
                      type="text"
                      value={department.adminName}
                      readOnly
                      className="w-full h-9 rounded-md border border-gray-200 shadow-sm px-3 py-2 text-sm bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admin. Contacts
                    </label>
                    <input
                      type="text"
                      value={department.adminContact}
                      readOnly
                      className="w-full h-9 rounded-md border border-gray-200 shadow-sm px-3 py-2 text-sm bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Admin. Email
                    </label>
                    <input
                      type="text"
                      value={department.adminEmail}
                      readOnly
                      className="w-full h-9 rounded-md border border-gray-200 shadow-sm px-3 py-2 text-sm bg-gray-50"
                    />
                  </div>
                </div>
              </div>
              {departments.departments.indexOf(department) !== departments.departments.length - 1 && (
                <hr className="my-8 bg-gray-200 h-[1px] w-full" />
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            No departments found. Please add a department using the button below.
          </div>
        )}

        <div className="flex flex-row mt-4 space-x-2 gap-y-8 w-full items-center">
          <hr className="bg-secondary-700 w-full h-[1px]" />
          <button
            onClick={() => setIsCreateOpen(true)}
            className="h-7 px-4 py-1 min-w-max flex justify-center items-center gap-1 text-sm text-semantic-text-primary bg-transparent border border-secondary-700 rounded-full"
          >
            <HiPlus className="w-4 h-4" />
            <span>Add Department</span>
          </button>
          <hr className="bg-secondary-700 w-full h-[1px]" />
        </div>

         {/* Leave Button */}
         <div className="flex justify-end mt-4">
          <button
            onClick={handlePrevious}
            className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-gray-50 border-2 border-gray-200 hover:bg-gray-100 rounded-md shadow-sm flex items-center gap-1"
          >
            
            Previous Step
          </button>
          <button
            onClick={handleLeave}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md shadow-sm"
          >
            Done, Leave School 
          </button>
        </div>
      </div>

      <CreateDeptDialog isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      <UpdateDeptDialog isOpen={isUpdateOpen} onClose={() => {
        setIsUpdateOpen(false);
        setSelectedDepartment(null);
      }} department={selectedDepartment} />
    </>
  );
}

export default EditSchoolDepartmentForm

const CreateDeptDialog = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

   const { id: schoolId } = useParams();

  const createDepartmentMutation = useMutation({
    mutationFn: (values) => createDepartmentService(schoolId, values),
    onSuccess: () => {
      toast.success('Department created successfully');
      queryClient.invalidateQueries({ queryKey: ['departments', schoolId] });
      formik.resetForm();
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create department');
    }
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      url: '',
      adminName: '',
      adminContact: '',
      adminEmail: '',
      schoolId: schoolId
    },
    validationSchema: yup.object({
      name: yup.string()
        .required('Department name is required')
        .min(2, 'Department name must be at least 2 characters'),
      url: yup.string()
        .url('Must be a valid URL')
        .required('URL is required'),
      adminName: yup.string()
        .required('Admin name is required'),
      adminContact: yup.string()
        .required('Admin contact is required'),
      adminEmail: yup.string()
        .email('Invalid email address')
        .required('Admin email is required')
    }),
    onSubmit: (values) => {
      createDepartmentMutation.mutate(values);
    }
  });

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl" style={{ width: "670px" }}>
        {/* Dialog Header */}
        <div
          className="flex justify-between items-center px-7 py-8 mt-8 mb-5 mx-7 border-b rounded border"
          style={{ height: "68px", gap: "8px" }}
        >
          <h2 className="text-lg font-semibold text-gray-900">
            Create Department
          </h2>
          <button
            onClick={onClose}
            className="bg-primary-500 text-white rounded-lg hover:bg-primary-800 flex items-center justify-center whitespace-nowrap text-sm"
            style={{ width: "148px", height: "36px", gap: "8px" }}
          >
            <HiX className="w-4 h-4 flex-shrink-0" />
            <span className="flex-shrink-0">Close Window</span>
          </button>
        </div>

        {/* Dialog Content */}
        <form onSubmit={formik.handleSubmit}>
          <div className="p-7 border rounded mb-5 mx-7 max-h-[70vh] overflow-y-auto">
            <div className="space-y-6">
              {/** Regional content */}
              <div className="w-full flex flex-col gap-3">
                <div className="w-full grid grid-cols-1 gap-x-6 gap-y-4">
                  <div className="flex flex-col gap-1 ">
                    <label className="block text-sm font-medium text-gray-700 ">
                      Department Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.name}
                      className={`w-full h-9 rounded-md border ${formik.touched.name && formik.errors.name ? 'border-red-500' : 'border-gray-200'} shadow-sm px-3 py-2 text-sm bg-gray-50`}
                      placeholder="Enter department name"
                    />
                    {formik.touched.name && formik.errors.name && (
                      <div className="text-red-500 text-xs">{formik.errors.name}</div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="block text-sm font-medium text-gray-700 ">
                      URL
                    </label>

                    <input
                      type="text"
                      name="url"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.url}
                      className={`w-full h-9 rounded-md border ${formik.touched.url && formik.errors.url ? 'border-red-500' : 'border-gray-200'} shadow-sm px-3 py-2 text-sm bg-gray-50`}
                      placeholder="Enter department URL"
                    />
                    {formik.touched.url && formik.errors.url && (
                      <div className="text-red-500 text-xs">{formik.errors.url}</div>
                    )}
                  </div>

                  <hr className="bg-black mt-2 mb-2 w-full h-[1px]" />
                  <div className="flex flex-col gap-1">
                    <label className="block text-sm font-medium text-gray-700 ">
                      Admin. Name
                    </label>

                    <input
                      type="text"
                      name="adminName"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.adminName}
                      className={`w-full h-9 rounded-md border ${formik.touched.adminName && formik.errors.adminName ? 'border-red-500' : 'border-gray-200'} shadow-sm px-3 py-2 text-sm bg-gray-50`}
                      placeholder="Enter admin name"
                    />
                    {formik.touched.adminName && formik.errors.adminName && (
                      <div className="text-red-500 text-xs">{formik.errors.adminName}</div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="block text-sm font-medium text-gray-700 ">
                      Admin. Contacts
                    </label>

                    <input
                      type="text"
                      name="adminContact"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.adminContact}
                      className={`w-full h-9 rounded-md border ${formik.touched.adminContact && formik.errors.adminContact ? 'border-red-500' : 'border-gray-200'} shadow-sm px-3 py-2 text-sm bg-gray-50`}
                      placeholder="Enter admin contact"
                    />
                    {formik.touched.adminContact && formik.errors.adminContact && (
                      <div className="text-red-500 text-xs">{formik.errors.adminContact}</div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="block text-sm font-medium text-gray-700 ">
                      Admin. Email
                    </label>

                    <input
                      type="email"
                      name="adminEmail"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.adminEmail}
                      className={`w-full h-9 rounded-md border ${formik.touched.adminEmail && formik.errors.adminEmail ? 'border-red-500' : 'border-gray-200'} shadow-sm px-3 py-2 text-sm bg-gray-50`}
                      placeholder="Enter admin email"
                    />
                    {formik.touched.adminEmail && formik.errors.adminEmail && (
                      <div className="text-red-500 text-xs">{formik.errors.adminEmail}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dialog Footer */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={createDepartmentMutation.isPending}
                className={`w-full ${createDepartmentMutation.isPending ? 'bg-gray-400' : 'bg-primary-500 hover:bg-primary-900'} text-white py-2 px-4 rounded-lg flex items-center justify-center`}
              >
                {createDepartmentMutation.isPending ? (
                  <>
                    <span className="mr-2">Creating...</span>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  </>
                ) : (
                  'Create Department'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};


const UpdateDeptDialog = ({ isOpen, onClose, department }) => {
  if (!isOpen) return null;
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { id: schoolId } = useParams();

  const updateDepartmentMutation = useMutation({
    mutationFn: (values) => updateDepartmentService(schoolId, department.id, values),
    onSuccess: () => {
      toast.success('Department updated successfully');
      queryClient.invalidateQueries({ queryKey: ['departments', schoolId] });
      formik.resetForm();
      onClose();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update department');
    }
  });

  const formik = useFormik({
    initialValues: {
      name: department.name,
      url: department.url,
      adminName: department.adminName,
      adminContact: department.adminContact,
      adminEmail: department.adminEmail,
      schoolId: schoolId
    },
    validationSchema: yup.object({
      name: yup.string()
        .required('Department name is required')
        .min(2, 'Department name must be at least 2 characters'),
      url: yup.string()
        .url('Must be a valid URL')
        .required('URL is required'),
      adminName: yup.string()
        .required('Admin name is required'),
      adminContact: yup.string()
        .required('Admin contact is required'),
      adminEmail: yup.string()
        .email('Invalid email address')
        .required('Admin email is required')
    }),
    onSubmit: (values) => {
      updateDepartmentMutation.mutate(values);
    }
  });

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl" style={{ width: "670px" }}>
        {/* Dialog Header */}
        <div
          className="flex justify-between items-center px-7 py-8 mt-8 mb-5 mx-7 border-b rounded border"
          style={{ height: "68px", gap: "8px" }}
        >
          <h2 className="text-lg font-semibold text-gray-900">
            Update Department
          </h2>
          <button
            onClick={onClose}
            className="bg-primary-500 text-white rounded-lg hover:bg-primary-800 flex items-center justify-center whitespace-nowrap text-sm"
            style={{ width: "148px", height: "36px", gap: "8px" }}
          >
            <HiX className="w-4 h-4 flex-shrink-0" />
            <span className="flex-shrink-0">Close Window</span>
          </button>
        </div>

        {/* Dialog Content */}
        <form onSubmit={formik.handleSubmit}>
          <div className="p-7 border rounded mb-5 mx-7 max-h-[70vh] overflow-y-auto">
            <div className="space-y-6">
              {/** Regional content */}
              <div className="w-full flex flex-col gap-3">
                <div className="w-full grid grid-cols-1 gap-x-6 gap-y-1">
                  <div className="flex flex-col gap-1 ">
                    <label className="block text-sm font-medium text-gray-700 ">
                      Department Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.name}
                      className={`w-full h-9 rounded-md border ${formik.touched.name && formik.errors.name ? 'border-red-500' : 'border-gray-200'} shadow-sm px-3 py-2 text-sm bg-gray-50`}
                      placeholder="Enter department name"
                    />
                    {formik.touched.name && formik.errors.name && (
                      <div className="text-red-500 text-xs">{formik.errors.name}</div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="block text-sm font-medium text-gray-700 ">
                      URL
                    </label>

                    <input
                      type="text"
                      name="url"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.url}
                      className={`w-full h-9 rounded-md border ${formik.touched.url && formik.errors.url ? 'border-red-500' : 'border-gray-200'} shadow-sm px-3 py-2 text-sm bg-gray-50`}
                      placeholder="Enter department URL"
                    />
                    {formik.touched.url && formik.errors.url && (
                      <div className="text-red-500 text-xs">{formik.errors.url}</div>
                    )}
                  </div>
                  <hr className="bg-black mt-2 mb-2 w-full h-[1px]" />
                  <div className="flex flex-col gap-1">
                    <label className="block text-sm font-medium text-gray-700 ">
                      Admin. Name
                    </label>

                    <input
                      type="text"
                      name="adminName"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.adminName}
                      className={`w-full h-9 rounded-md border ${formik.touched.adminName && formik.errors.adminName ? 'border-red-500' : 'border-gray-200'} shadow-sm px-3 py-2 text-sm bg-gray-50`}
                      placeholder="Enter admin name"
                    />
                    {formik.touched.adminName && formik.errors.adminName && (
                      <div className="text-red-500 text-xs">{formik.errors.adminName}</div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="block text-sm font-medium text-gray-700 ">
                      Admin. Contacts
                    </label>

                    <input
                      type="text"
                      name="adminContact"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.adminContact}
                      className={`w-full h-9 rounded-md border ${formik.touched.adminContact && formik.errors.adminContact ? 'border-red-500' : 'border-gray-200'} shadow-sm px-3 py-2 text-sm bg-gray-50`}
                      placeholder="Enter admin contact"
                    />
                    {formik.touched.adminContact && formik.errors.adminContact && (
                      <div className="text-red-500 text-xs">{formik.errors.adminContact}</div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="block text-sm font-medium text-gray-700 ">
                      Admin. Email
                    </label>

                    <input
                      type="email"
                      name="adminEmail"
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      value={formik.values.adminEmail}
                      className={`w-full h-9 rounded-md border ${formik.touched.adminEmail && formik.errors.adminEmail ? 'border-red-500' : 'border-gray-200'} shadow-sm px-3 py-2 text-sm bg-gray-50`}
                      placeholder="Enter admin email"
                    />
                    {formik.touched.adminEmail && formik.errors.adminEmail && (
                      <div className="text-red-500 text-xs">{formik.errors.adminEmail}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dialog Footer */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={updateDepartmentMutation.isPending}
                className={`w-full ${updateDepartmentMutation.isPending ? 'bg-gray-400' : 'bg-primary-500 hover:bg-primary-900'} text-white py-2 px-4 rounded-lg flex items-center justify-center`}
              >
                {updateDepartmentMutation.isPending ? (
                  <>
                    <span className="mr-2">Updating...</span>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  </>
                ) : (
                  'Update Department'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
