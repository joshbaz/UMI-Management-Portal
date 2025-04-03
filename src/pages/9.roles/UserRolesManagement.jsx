import React, { useState, useEffect } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  getFilteredRowModel,
  createColumnHelper,
} from "@tanstack/react-table";
import { Search, Eye, EyeOff } from "lucide-react";
import { useGetAllCampuses, useGetAllUsers } from "../../store/tanstackStore/services/queries";
import { createUserService, deactivateUserService, reactivateUserService } from "../../store/tanstackStore/services/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const UserRolesManagement = () => {
  const [users, setUsers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [globalFilter, setGlobalFilter] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const { data: campuses, isLoading: campusesLoading } = useGetAllCampuses();
  const { data: usersData, isLoading: usersLoading } = useGetAllUsers();
  const queryClient = useQueryClient();
  let navigate = useNavigate();
  // useEffect(() => {
  //   if (usersData?.users) {
  //     setUsers(usersData.users);
  //   }
  // }, [usersData]);

  const createUserMutation = useMutation({
    mutationFn: createUserService,
    onSuccess: (data) => {
      queryClient.resetQueries({ queryKey: ['users'] });
      toast.success(data.message);
      setIsModalVisible(false);
    },
    onError: (error) => {
      toast.error(error?.message);
      console.error(error);
    }
  });

  const deactivateUserMutation = useMutation({
    mutationFn: deactivateUserService,
    onSuccess: (data) => {
      queryClient.resetQueries({ queryKey: ['users'] });
      toast.success(data.message);
      setIsConfirmModalVisible(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(error?.message);
      console.error(error);
    }
  });

  const reactivateUserMutation = useMutation({
    mutationFn: reactivateUserService,
    onSuccess: (data) => {
      queryClient.resetQueries({ queryKey: ['users'] });
      toast.success(data.message);
      setIsConfirmModalVisible(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(error?.message);
      console.error(error);
    }
  });

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const showConfirmModal = (user) => {
    setSelectedUser(user);
    setIsConfirmModalVisible(true);
  };

  const handleConfirmCancel = () => {
    setIsConfirmModalVisible(false);
    setSelectedUser(null);
  };

  const handleDeactivate = () => {
    if (selectedUser) {
      deactivateUserMutation.mutate(selectedUser.id);
    }
  };

  const handleReactivate = () => {
    if (selectedUser) {
      reactivateUserMutation.mutate(selectedUser.id);
    }
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Please enter user name"),
    email: Yup.string().email("Please enter a valid email").required("Please enter email"),
    role: Yup.string().required("Please select a role"),
    password: Yup.string().required("Please enter password"),
    campus: Yup.string().required("Please select a campus"),
  });

  const handleSubmit = async (values, { resetForm }) => {
    try {
      console.log("Adding new user:", values);
      createUserMutation.mutate(values);
      // resetForm();
    } catch (error) {
      alert("Failed to add user");
      console.error(error);
    }
  };

  const columnHelper = createColumnHelper();
  
  const columns = [
    columnHelper.accessor("name", {
      header: "Name",
      cell: (info) => (
        <div className="capitalize font-[Inter-Medium]">
          {info.row.original.title ? `${info.row.original.title} ${info.getValue()}` : info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor("email", {
      header: "Email",
      cell: (info) => (
        <div className="text-xs text-gray-500 lowercase">
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.accessor("role", {
      header: "Role",
      cell: (info) => {
        const role = info.getValue();
        let displayText = "User";
        let color = "#15803D";
        let bgColor = "#DCFCE7";
        
        if (role === "SUPERADMIN") {
          displayText = "Super Admin";
          color = "#23388F";
          bgColor = "#ECF6FB";
        } else if (role === "RESEARCH_ADMIN") {
          displayText = "Research Centre Admin";
        } else if (role === "MANAGER") {
          displayText = "Manager";
          color = "#B45309";
          bgColor = "#FEF3C7";
        } else if (role === "REGISTRY_ADMIN") {
          displayText = "Registry Admin";
          color = "#9333EA";
          bgColor = "#F3E8FF";
        }
        
        return (
          <span
            className="capitalize text-xs font-[Inter-Regular]"
            style={{
              color: color,
              backgroundColor: bgColor,
              border: `1px solid ${color}`,
              padding: '0.25rem 0.5rem',
              borderRadius: '0.375rem',
              display: 'inline-block'
            }}
          >
            {displayText}
          </span>
        );
      },
    }),
    columnHelper.accessor("campus.name", {
      header: "Campus",
      cell: (info) => (
        <div className="text-sm font-[Inter-Regular] text-gray-700">
          {info.getValue() || "N/A"}
        </div>
      ),
    }),
    columnHelper.accessor("isActive", {
      header: "Status",
      cell: (info) => {
        const isActive = info.getValue();
        return (
          <span
            className="text-xs font-[Inter-Regular] bg-gray-50"
            style={{
              color: isActive ? "#15803D" : "#6b7280",
              backgroundColor: isActive ? "#DCFCE7" : "#f9fafb",
              border: `1px solid ${isActive ? "#15803D" : "#6b7280"}`,
              padding: '0.25rem 0.5rem',
              borderRadius: '0.375rem',
              display: 'inline-block'
            }}
          >
            {isActive ? "Active" : "Inactive"}
          </span>
        );
      },
    }),
    columnHelper.accessor("createdAt", {
      header: "Created At",
      cell: (info) => {
        const date = new Date(info.getValue());
        return (
          <div className="text-xs text-gray-500">
            {date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: (info) => (
        <div className="flex gap-2">
          <button 
            onClick={() => navigate(`/users/${info.row.original.id}`)}
            className="rounded border text-gray-700 border-semantic-bg-border shadow-sm py-1 px-2 hover:bg-gray-50 font-[Inter-Medium] text-sm"
          >
            Open
          </button>
          <button 
            className={`rounded border shadow-sm py-1 px-2 font-[Inter-Medium] text-sm ${
              info.row.original.isActive 
                ? "text-red-600 border-red-300 hover:bg-red-50" 
                : "text-green-600 border-green-300 hover:bg-green-50"
            }`}
            onClick={() => showConfirmModal(info.row.original)}
          >
            {info.row.original.isActive ? "Deactivate" : "Reactivate"}
          </button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: usersData?.users || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      pagination: {
        pageSize: pageSize,
        pageIndex: currentPage - 1,
      },
      globalFilter,
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({ pageIndex: currentPage - 1, pageSize });
        setCurrentPage(newState.pageIndex + 1);
        setPageSize(newState.pageSize);
        localStorage.setItem("pageSize", newState.pageSize.toString());
      }
    },
    onGlobalFilterChange: setGlobalFilter,
    manualPagination: true,
    pageCount: Math.ceil((usersData?.users?.length || 0) / pageSize),
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">User Roles Management</h1>
        <button 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={showModal}
        >
          Add New User
        </button>
      </div>

      <div className="bg-white py-4 rounded-lg shadow-md mb-8">
        <div className="flex items-center justify-between mb-4 gap-4 px-4">
          <div className="flex items-center gap-2 justify-between flex-1">
            <div className="relative w-1/3">
              <input
                type="text"
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Search all columns..."
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="block rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
            >
              {[10, 20, 30, 40, 50].map((size) => (
                <option key={size} value={size}>
                  Show {size}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="rounded-md border">
          <table className="w-full">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-sm font-[Inter-Medium] text-gray-500 capitalize tracking-wider"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usersLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-4 text-center">
                    <div className="flex justify-center items-center h-40">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  </td>
                </tr>
              ) : usersData?.users?.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-4 font-[Inter-Regular] text-center text-gray-500">
                    No users available.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-4 py-4 whitespace-nowrap text-sm font-[Inter-Regular] text-gray-900"
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 bg-white">
          <div className="flex font-[Roboto-Regular] items-center text-sm text-gray-500">
            Showing{" "}
            <span className="font-[Roboto-Medium] mx-1">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
            </span>
            to{" "}
            <span className="font-[Roboto-Medium] mx-1">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                usersData?.users?.length || 0
              )}
            </span>
            of{" "}
            <span className="font-[Roboto-Medium] mx-1">
              {usersData?.users?.length || 0}
            </span>{" "}
            results
          </div>
          <div className="flex items-center gap-2">
            <button
              className="border border-gray-300 rounded p-1 font-[Roboto-Regular] text-sm disabled:opacity-50"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </button>
            {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map(
              (pageNumber) => (
                <button
                  key={pageNumber}
                  className={`w-8 h-8 rounded text-sm ${
                    pageNumber === table.getState().pagination.pageIndex + 1
                      ? "bg-blue-50 text-blue-600 font-[Roboto-Medium]"
                      : "text-gray-500"
                  }`}
                  onClick={() => table.setPageIndex(pageNumber - 1)}
                >
                  {pageNumber}
                </button>
              )
            )}
            <button
              className="border border-gray-300 rounded p-1 font-[Roboto-Regular] text-sm disabled:opacity-50"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {isModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New User</h2>
              <button 
                onClick={handleCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <Formik
              initialValues={{
                name: '',
                email: '',
                role: '',
                password: '',
                title: '',
                phone: '',
                designation: '',
                campus: ''
              }}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="mb-4 flex gap-4">
                    <div className="w-1/2">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
                        Title
                      </label>
                      <Field as="select" name="title" className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                        <option value="">Select a title</option>
                        <option value="Mr.">Mr.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Miss.">Miss.</option>
                        <option value="Dr.">Dr.</option>
                        <option value="Prof.">Prof.</option>
                        <option value="Assoc. Prof.">Assoc. Prof.</option>
                      </Field>
                    </div>
                    <div className="w-1/2">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                        Name
                      </label>
                      <Field
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter user name"
                        className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                      <ErrorMessage name="name" component="p" className="text-red-500 text-xs italic mt-1" />
                    </div>
                  </div>

                  <div className="mb-4 flex gap-4">
                    <div className="w-1/2">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                        Email
                      </label>
                      <Field
                        id="email"
                        name="email"
                        type="email"
                        placeholder="Enter email address"
                        className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                      <ErrorMessage name="email" component="p" className="text-red-500 text-xs italic mt-1" />
                    </div>
                    <div className="w-1/2">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                        Phone
                      </label>
                      <Field
                        id="phone"
                        name="phone"
                        type="text"
                        placeholder="Enter phone number"
                        className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>
                  </div>

                  <div className="mb-4 flex gap-4">
                    <div className="w-1/2">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="designation">
                        Designation (Job Title)
                      </label>
                      <Field
                        id="designation"
                        name="designation"
                        type="text"
                        placeholder="Enter designation"
                        className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>
                    <div className="w-1/2">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
                        Role
                      </label>
                      <Field as="select" name="role" className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                        <option value="">Select a role</option>
                        <option value="SUPERADMIN">Super Admin</option>
                        <option value="RESEARCH_ADMIN">Research Admin</option>
                        <option value="MANAGER">Manager</option>
                        <option value="REGISTRY_ADMIN">Registry Admin</option>
                      </Field>
                      <ErrorMessage name="role" component="p" className="text-red-500 text-xs italic mt-1" />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="campus">
                      Campus
                    </label>
                    <Field as="select" name="campus" className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" disabled={campusesLoading}>
                      <option value="">Select a campus</option>
                      {campusesLoading ? (
                        <option value="" disabled>Loading campuses...</option>
                      ) : (
                        campuses?.campuses?.map((campus) => (
                          <option key={campus.id} value={campus.id}>
                            {campus.name}
                          </option>
                        ))
                      )}
                    </Field>
                    <ErrorMessage name="campus" component="p" className="text-red-500 text-xs italic mt-1" />
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                      Password
                    </label>
                    <div className="relative">
                      <Field
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        className="shadow appearance-none border border-gray-300 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-10"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <ErrorMessage name="password" component="p" className="text-red-500 text-xs italic mt-1" />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                      disabled={isSubmitting || createUserMutation.isPending}
                    >
                      {createUserMutation.isPending ? "Adding..." : "Add User"}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}

      {isConfirmModalVisible && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Confirm {selectedUser.isActive ? "Deactivation" : "Reactivation"}</h2>
              <button 
                onClick={handleConfirmCancel}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700">
                Are you sure you want to {selectedUser.isActive ? "deactivate" : "reactivate"} the user <span className="font-semibold">{selectedUser.title ? `${selectedUser.title} ${selectedUser.name}` : selectedUser.name}</span>?
              </p>
              {selectedUser.isActive && (
                <p className="text-gray-500 mt-2 text-sm">
                  This user will no longer be able to access the system until reactivated.
                </p>
              )}
              {!selectedUser.isActive && (
                <p className="text-gray-500 mt-2 text-sm">
                  This user will regain access to the system with their previous permissions.
                </p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={selectedUser.isActive ? handleDeactivate : handleReactivate}
                className={`${selectedUser.isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'} text-white font-bold py-2 px-4 rounded`}
                disabled={selectedUser.isActive ? deactivateUserMutation.isPending : reactivateUserMutation.isPending}
              >
                {selectedUser.isActive 
                  ? (deactivateUserMutation.isPending ? "Deactivating..." : "Deactivate") 
                  : (reactivateUserMutation.isPending ? "Reactivating..." : "Reactivate")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRolesManagement;