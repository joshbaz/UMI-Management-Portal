/* eslint-disable react/prop-types */
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { FiSearch } from "react-icons/fi";
import { useGetAllStatusDefinitions } from "../../store/tanstackStore/services/queries";
import { HexColorPicker } from "react-colorful";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStatusDefinitionService } from "../../store/tanstackStore/services/api";
import { Form, Formik } from "formik";
import * as Yup from "yup";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { queryClient } from "@/utils/tanstack";
import { toast } from "sonner";

// Priority types and their colors
const PRIORITY_TYPES = {
  Urgent: "text-red-500",
  Important: "text-orange-500",
  Anytime: "text-green-500",
};

// Component: Search bar with icon
const SearchBar = ({ value, onChange, placeholder = "Search" }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <FiSearch className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        placeholder={placeholder}
      />
    </div>
  );
};

// Create Status Modal Component
const CreateStatusModal = ({ isOpen, onClose }) => {
 
  const [formData, setFormData] = useState({
    name: "",
    description: "", 
    expectedDuration: "",
    warningDays: "",
    criticalDays: "",
    delayDays: "",
    notifyRoles: [],
    color: "#000000",
    isActive: true
  });

  const createStatusMutation = useMutation({
    mutationFn: createStatusDefinitionService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statusDefinitions'] });
      toast.success('Status created successfully');
      onClose();
    },
    onError: (error) => {
      console.error('Error creating status:', error);
      toast.error('Error creating status: ' + error.message);
    }
  });

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required('Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters'),
    description: Yup.string()
      .required('Description is required')
      .min(10, 'Description must be at least 10 characters')
      .max(500, 'Description must be less than 500 characters'),
    expectedDuration: Yup.number()
      .nullable()
      .transform((value) => (isNaN(value) ? null : value))
      .min(1, 'Duration must be at least 1 day')
      .max(1000, 'Duration must be less than 1000 days'),
    warningDays: Yup.number()
      .nullable() 
      .transform((value) => (isNaN(value) ? null : value))
      .test('warning-days', 'Warning days must be less than expected duration', function(value) {
        const { expectedDuration } = this.parent;
        if (!value || !expectedDuration) return true;
        return value < expectedDuration;
      }),
    criticalDays: Yup.number()
      .nullable()
      .transform((value) => (isNaN(value) ? null : value))
      .test('critical-days', 'Critical days must be less than warning days', function(value) {
        const { warningDays } = this.parent;
        if (!value || !warningDays) return true;
        return value < warningDays;
      }),
    delayDays: Yup.number()
      .nullable()
      .transform((value) => (isNaN(value) ? null : value))
      .test('delay-days', 'Delay days must be more than expected duration', function(value) {
        const { expectedDuration } = this.parent;
        if (!value || !expectedDuration) return true;
        return value > expectedDuration;
      }),
    notifyRoles: Yup.array()
      .of(Yup.string())
      .nullable(),
    color: Yup.string()
      .required('Color is required')
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Invalid hex color'),
    isActive: Yup.boolean()
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Create New Status</h2>
        <Formik
          initialValues={{
            name: "",
            description: "",
            expectedDuration: "",
            warningDays: "",
            criticalDays: "",
            delayDays: "",
            notifyRoles: [],
            color: "#000000",
            isActive: true
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            createStatusMutation.mutate(values);
          }}
        >
          {({ values, errors, touched, handleChange, handleSubmit, setFieldValue }) => (
            <Form >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    name="name"
                    className={`mt-1 block w-full rounded-md border lowercase ${errors.name && touched.name ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
                    value={values.name}
                    onChange={handleChange}
                  />
                  {errors.name && touched.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    className={`mt-1 block w-full rounded-md border ${errors.description && touched.description ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
                    value={values.description}
                    onChange={handleChange}
                  />
                  {errors.description && touched.description && (
                    <p className="mt-1 text-xs text-red-500">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expected Duration (days)</label>
                    <input
                      type="number"
                      name="expectedDuration"
                      className={`mt-1 block w-full rounded-md border ${errors.expectedDuration && touched.expectedDuration ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
                      value={values.expectedDuration}
                      onChange={handleChange}
                    />
                    {errors.expectedDuration && touched.expectedDuration && (
                      <p className="mt-1 text-xs text-red-500">{errors.expectedDuration}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Warning Days</label>
                    <input
                      type="number"
                      name="warningDays"
                      className={`mt-1 block w-full rounded-md border ${errors.warningDays && touched.warningDays ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
                      value={values.warningDays}
                      onChange={handleChange}
                    />
                    {errors.warningDays && touched.warningDays && (
                      <p className="mt-1 text-xs text-red-500">{errors.warningDays}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Critical Days</label>
                    <input
                      type="number"
                      name="criticalDays"
                      className={`mt-1 block w-full rounded-md border ${errors.criticalDays && touched.criticalDays ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
                      value={values.criticalDays}
                      onChange={handleChange}
                    />
                    {errors.criticalDays && touched.criticalDays && (
                      <p className="mt-1 text-xs text-red-500">{errors.criticalDays}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Delay Days</label>
                    <input
                      type="number"
                      name="delayDays"
                      className={`mt-1 block w-full rounded-md border ${errors.delayDays && touched.delayDays ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
                      value={values.delayDays}
                      onChange={handleChange}
                    />
                    {errors.delayDays && touched.delayDays && (
                      <p className="mt-1 text-xs text-red-500">{errors.delayDays}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Notify Roles (optional)</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {[
                      {value: 'SUPER_ADMIN', label: 'Super Admin'},
                      {value: 'MANAGER', label: 'Manager'},
                      {value: 'RESEARCH_ADMIN', label: 'Research Center Admin'}, 
                      {value: 'SCHOOL_ADMIN', label: 'School Admin'},
                      {value: 'FACULTY', label: 'Faculty'},
                      {value: 'STUDENT', label: 'Student'},
                      {value: 'SUPERVISOR', label: 'Supervisor'},
                      {value: 'EXAMINER', label: 'Examiner'},
                      {value: 'DEAN', label: 'Dean'}
                    ].map(role => (
                      <button
                        key={role.value}
                        type="button"
                        className={`px-3 py-1 rounded-full text-sm ${
                          values.notifyRoles?.includes(role.value)
                            ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                            : 'bg-gray-100 text-gray-700 border border-gray-300'
                        }`}
                        onClick={() => {
                          const newRoles = values.notifyRoles?.includes(role.value)
                            ? values.notifyRoles.filter(r => r !== role.value)
                            : [...(values.notifyRoles || []), role.value];
                          setFieldValue('notifyRoles', newRoles);
                        }}
                      >
                        {role.label}
                      </button>
                    ))}
                  </div>
                  {errors.notifyRoles && touched.notifyRoles && (
                    <p className="mt-1 text-xs text-red-500">{errors.notifyRoles}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status Color</label>
                  <HexColorPicker 
                    color={values.color} 
                    onChange={(color) => setFieldValue('color', color)} 
                  />
                  <input
                    type="text"
                    name="color"
                    className={`mt-2 block w-full rounded-md border ${errors.color && touched.color ? 'border-red-500' : 'border-gray-300'} px-3 py-2`}
                    value={values.color}
                    onChange={handleChange}
                  />
                  {errors.color && touched.color && (
                    <p className="mt-1 text-xs text-red-500">{errors.color}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    className="rounded border-gray-300"
                    checked={values.isActive}
                    onChange={handleChange}
                  />
                  <label className="ml-2 text-sm text-gray-700">Active Status</label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
                  disabled={createStatusMutation.isPending}
                >
                  {createStatusMutation.isPending ? 'Creating...' : 'Create Status'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

// Main component: Notifications management page
const StatusManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("notifications");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Fetch status definitions
  const { data: statusDefinitions, isLoading } = useGetAllStatusDefinitions();

  const handleRowClick = (notificationId) => {
    setSelectedNotificationId(notificationId);
    setIsDrawerOpen(true);
  };

  console.log(statusDefinitions)

  // Table columns definition
  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: (info) => (
          <span
            style={{
              color: info.row.original.color,
              backgroundColor: `${info.row.original.color}18`,
              border: `1px solid ${info.row.original.color}`
            }}
            className="text-left hover:text-primary-600 cursor-pointer rounded-md px-2 py-1 capitalize"
          >
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: (info) => (
            <span
                onClick={() => handleRowClick(info.row.original.id)}
                className="text-left hover:text-primary-600 cursor-pointer whitespace-normal break-words"
            >
                {info.getValue()}
            </span>
        ),
      },
      {
        accessorKey: "expectedDuration",
        header: "Expected Duration",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "warningDays",
        header: "Warning Days",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "criticalDays", 
        header: "Critical Days",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "notifyRoles",
        header: "Notify Roles",
        cell: (info) => (
          <div className="flex flex-wrap gap-1">
            {info.getValue()?.map((role, index) => (
              <span key={index} className="px-2 py-1 text-xs bg-gray-100 rounded">
                {role}
              </span>
            ))}
          </div>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: (info) => (
          <span className={info.getValue() ? "text-green-500" : "text-red-500"}>
            {info.getValue() ? "Active" : "Inactive"}
          </span>
        ),
      },
    
      {
        accessorKey: "updatedAt",
        header: "Updated At", 
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      },
      {
        accessorKey: "actions",
        header: " ",
        cell: (info) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(info.row.original.id);
            }}
            className="rounded border border-semantic-bg-border shadow-sm py-1 px-3 hover:bg-gray-50"
          >
            Open
          </button>
        ),
      },
    ],
    []
  );



console.log(statusDefinitions)

  // Filter status data based on search query
  const filteredStatusData = useMemo(() => {
    let filtered = statusDefinitions?.statusDefinitions || [];
    
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [searchQuery, statusDefinitions]);



  // Initialize table
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data:  filteredStatusData,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter: searchQuery,
      pagination,
    },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setSearchQuery,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-full">
      <CreateStatusModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      
      {/* Global Search */}
      <div className="p-6 pb-0 w-1/2">
        <SearchBar
          value={searchQuery}
          onChange={(value) => setSearchQuery(value)}
          placeholder="Search notifications..."
        />
      </div>

      {/* Horizontal Line */}
      <div className="my-6 border-t border-gray-200"></div>

      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          Status Management
        </h1>
        <div className="flex items-center gap-4">
         
          <div className="text-sm text-gray-500">
            Last login: {format(new Date(), "MM-dd-yyyy hh:mm:ssaa")}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="px-6 py-4">
        <div className="bg-white rounded-lg shadow">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex gap-8 px-4">
              <button
                onClick={() => setActiveTab("notifications")}
                className={`py-4 px-1 border-b-2 ${
                  activeTab === "notifications"
                    ? "border-primary-500 text-primary-500"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } font-medium text-sm focus:outline-none`}
              >
               Status Definitions
              </button>
           
            </div>
          </div>

          {/* Search and Controls */}
          <div className="p-4 flex justify-between items-center border-b">
            <div className="w-[240px]">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={activeTab === "notifications" ? "Search notifications" : "Search status"}
              />
            </div>

          
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Show:</span>
                <select
                  value={pagination.pageSize}
                  onChange={e => {
                    setPagination(old => ({
                      ...old,
                      pageSize: Number(e.target.value)
                    }))
                  }}
                  className="border border-gray-300 rounded shadow-sm py-1 px-2 text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  {[5, 10, 15, 20].map(pageSize => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize}
                    </option>
                  ))}
                </select>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Create Status
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 capitalize tracking-wider"
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
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-3 py-1.5 whitespace-nowrap text-xs text-gray-900"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 bg-white">
            <div className="flex items-center text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium mx-1">
                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
              </span>
              to{" "}
              <span className="font-medium mx-1">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getPrePaginationRowModel().rows.length
                )}
              </span>
              of{" "}
              <span className="font-medium mx-1">
                {table.getPrePaginationRowModel().rows.length}
              </span>{" "}
              results
            </div>
            <div className="flex items-center gap-2">
              <button
                className="border rounded p-1 text-sm disabled:opacity-50"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </button>
              {Array.from(
                { length: table.getPageCount() },
                (_, i) => i + 1
              ).map((pageNumber) => (
                <button
                  key={pageNumber}
                  className={`w-8 h-8 rounded text-sm ${
                    pageNumber === table.getState().pagination.pageIndex + 1
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-500"
                  }`}
                  onClick={() => table.setPageIndex(pageNumber - 1)}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                className="border rounded p-1 text-sm disabled:opacity-50"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
     
    </div>
  );
};

export default StatusManagement;
