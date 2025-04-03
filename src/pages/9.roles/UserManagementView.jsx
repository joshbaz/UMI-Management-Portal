import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetUser } from '../../store/tanstackStore/services/queries';
import { updateUserService, deleteUserService } from '../../store/tanstackStore/services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { ArrowLeft, Edit, Trash2, User, Mail, Phone, Building, Calendar, Search, X } from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  getFilteredRowModel,
  createColumnHelper,
} from "@tanstack/react-table";

const UserManagementView = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userActivities, setUserActivities] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const { data: userData, isLoading, error } = useGetUser(userId);
  
  useEffect(() => {
    console.log(userData?.activities);
    if (userData?.activities) {
      setUserActivities(userData?.activities || []);
    }
  }, [userData?.activities]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const updateUserMutation = useMutation({
    mutationFn: (data) => updateUserService(userId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries(['user', userId]);
      toast.success('User updated successfully');
      setIsEditModalOpen(false);
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to update user');
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: () => deleteUserService(userId),
    onSuccess: (data) => {
      queryClient.resetQueries(['users']);
      queryClient.resetQueries(['user', userId]);
      toast.success('User deleted successfully');
      navigate('/users');
    },
    onError: (error) => {
      toast.error(error?.message || 'Failed to delete user');
    }
  });

  const handleDeleteUser = () => {
    deleteUserMutation.mutate();
    setIsDeleteModalOpen(false);
  };

  const validationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    phone: Yup.string().required('Phone number is required'),
  });

  // TanStack Table setup for user activities
  const columnHelper = createColumnHelper();
  
  const columns = [
    columnHelper.accessor("action", {
      header: "Action",
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor("timestamp", {
      header: "Timestamp",
      cell: (info) => new Date(info.getValue()).toLocaleString(),
    }),
    columnHelper.accessor("entityType", {
      header: "Entity Type",
      cell: (info) => info.getValue() || "N/A",
    }),
    columnHelper.accessor("details", {
      header: "Details",
      cell: (info) => {
        const details = info.getValue();
        if (!details) return "N/A";
        
        try {
          const parsedDetails = typeof details === 'string' ? JSON.parse(details) : details;
          
          if (parsedDetails.description) {
            return (
              <div className="max-w-md">
                <p className="text-sm text-gray-800 truncate hover:text-clip hover:whitespace-normal">
                  {parsedDetails.description}
                </p>
              </div>
            );
          }
          
          // Handle array of objects with newValue and oldValue
          if (Array.isArray(parsedDetails)) {
            return (
              <div className="max-w-md">
                {parsedDetails.map((item, index) => (
                  <div key={index} className="mb-2 p-2 border-b border-gray-100">
                    {item.newValue && item.oldValue && (
                      <>
                        <div className="text-sm">
                          <span className="font-medium text-green-600">New:</span>{" "}
                          {typeof item.newValue === 'object' ? JSON.stringify(item.newValue) : item.newValue}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium text-red-600">Old:</span>{" "}
                          {typeof item.oldValue === 'object' ? JSON.stringify(item.oldValue) : item.oldValue}
                        </div>
                      </>
                    )}
                    {Object.entries(item).filter(([k]) => k !== 'newValue' && k !== 'oldValue').map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="font-medium">{key}:</span>{" "}
                        {typeof value === 'object' ? JSON.stringify(value) : value}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            );
          }
          
          // Format JSON data in a more readable way
          return (
            <div className="max-w-md">
              <div className="text-sm text-gray-800 truncate hover:text-clip hover:whitespace-normal">
                {Object.entries(parsedDetails).map(([key, value]) => (
                  <div key={key} className="mb-1">
                    <span className="font-medium">{key}:</span>{" "}
                    {typeof value === 'object' ? JSON.stringify(value) : value}
                  </div>
                ))}
              </div>
            </div>
          );
        } catch (e) {
          return (
            <div className="max-w-md">
              <p className="text-sm text-gray-800 truncate hover:text-clip hover:whitespace-normal">
                {details}
              </p>
            </div>
          );
        }
      },
    }),
  
  ];

  const table = useReactTable({
    data: userActivities,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  });

  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading user data...</div>;
  if (error) return <div className="text-red-500">Error loading user: {error.message}</div>;
  if (!userData) return <div className="text-red-500">User not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/users')}
          className="flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Users
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">User Profile</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Edit size={18} className="mr-2" />
                Edit
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start">
              <User className="text-gray-500 mr-3 mt-1" size={20} />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                <p className="text-base font-medium text-gray-900">{userData?.user?.name}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Mail className="text-gray-500 mr-3 mt-1" size={20} />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="text-base font-medium text-gray-900">{userData?.user?.email}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Phone className="text-gray-500 mr-3 mt-1" size={20} />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                <p className="text-base font-medium text-gray-900">{userData?.user?.phone || 'Not provided'}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Building className="text-gray-500 mr-3 mt-1" size={20} />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Role</h3>
                <p className="text-base font-medium text-gray-900">{userData?.user?.role}</p>
              </div>
            </div>
            <div className="flex items-start">
              <Calendar className="text-gray-500 mr-3 mt-1" size={20} />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                <p className="text-base font-medium text-gray-900">
                  {new Date(userData?.user?.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <Building className="text-gray-500 mr-3 mt-1" size={20} />
              <div>
                <h3 className="text-sm font-medium text-gray-500">Designation</h3>
                <p className="text-base font-medium text-gray-900">{userData?.user?.designation || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">User Activity</h2>
          
          <div className="mb-4 flex justify-between items-center">
            <div className="relative">
              <input
                type="text"
                value={globalFilter || ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                placeholder="Search activities..."
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400" size={18} />
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[10, 20, 30, 50].map((pageSize) => (
                  <option key={pageSize} value={pageSize}>
                    Show {pageSize}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th 
                        key={header.id}
                        scope="col" 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-4 text-center text-sm text-gray-500">
                      No activity records found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Page{" "}
                <span className="font-medium">
                  {table.getState().pagination.pageIndex + 1}
                </span>{" "}
                of{" "}
                <span className="font-medium">
                  {table.getPageCount()}
                </span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-6 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Danger Zone</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-red-800">Delete User Account</h3>
            <p className="mt-1 text-sm text-red-600">
              Once you delete this account, there is no going back. Please be certain.
            </p>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-red-600 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 bg-red-400/20"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit User</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <Formik
              initialValues={{
                name: userData?.user?.name || '',
                email: userData?.user?.email || '',
                phone: userData?.user?.phone || '',
                designation: userData?.user?.designation || '',
              }}
              validationSchema={validationSchema}
              onSubmit={(values, { setSubmitting }) => {
                updateUserMutation.mutate(values);
                // setSubmitting(false);
              }}
            >
              {({ isSubmitting, dirty, handleSubmit }) => (
                <Form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                      <Field
                        type="text"
                        name="name"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <ErrorMessage name="name" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                      <Field
                        type="email"
                        name="email"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <ErrorMessage name="email" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                      <Field
                        type="text"
                            name="phone"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <ErrorMessage name="phone" component="div" className="text-red-500 text-sm mt-1" />
                    </div>
                  
                  
                    <div>
                      <label htmlFor="designation" className="block text-sm font-medium text-gray-700">Designation</label>
                      <Field
                        type="text"
                        name="designation"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsEditModalOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type={"submit"}
                      disabled={isSubmitting || updateUserMutation.isPending || !dirty}
                      onClick={handleSubmit}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting || updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900">Delete Student Account</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete this user account? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                disabled={deleteUserMutation.isPending}
              >
                {deleteUserMutation.isPending ? 'Deleting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementView;