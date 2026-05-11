/* eslint-disable react/prop-types */
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { FiSearch } from "react-icons/fi";
import { useGetAllStatusDefinitions } from "../../store/tanstackStore/services/queries";
import { HexColorPicker } from "react-colorful";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStatusDefinitionService, updateStatusDefinitionService } from "../../store/tanstackStore/services/api";
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
  isActive: Yup.boolean(),
  stepOrder: Yup.number()
    .nullable()
    .transform((value) => (isNaN(value) ? null : value))
    .min(1, 'Step order must be at least 1')
    .max(100, 'Step order must be less than 100'),
  isFailure: Yup.boolean()
});

// Create Status Modal Component
const CreateStatusModal = ({ isOpen, onClose }) => {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px] max-h-[90vh] overflow-y-auto shadow-xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Create New Status</h2>
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
            isActive: true,
            stepOrder: "",
            isFailure: false
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            createStatusMutation.mutate(values);
          }}
        >
          {({ values, errors, touched, handleChange, setFieldValue }) => (
            <Form >
              <StatusFormBody 
                values={values} 
                errors={errors} 
                touched={touched} 
                handleChange={handleChange} 
                setFieldValue={setFieldValue} 
                isPending={createStatusMutation.isPending}
                onClose={onClose}
                submitLabel="Create Status"
              />
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

// Edit Status Modal Component
const EditStatusModal = ({ isOpen, onClose, status }) => {
  const updateStatusMutation = useMutation({
    mutationFn: (values) => updateStatusDefinitionService(status.id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['statusDefinitions'] });
      toast.success('Status updated successfully');
      onClose();
    },
    onError: (error) => {
      console.error('Error updating status:', error);
      toast.error('Error updating status: ' + error.message);
    }
  });

  if (!isOpen || !status) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px] max-h-[90vh] overflow-y-auto shadow-xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Edit Status: <span className="capitalize">{status.name}</span></h2>
        <Formik
          initialValues={{
            name: status.name || "",
            description: status.description || "",
            expectedDuration: status.expectedDuration || "",
            warningDays: status.warningDays || "",
            criticalDays: status.criticalDays || "",
            delayDays: status.delayDays || "",
            notifyRoles: status.notifyRoles || [],
            color: status.color || "#000000",
            isActive: status.isActive ?? true,
            stepOrder: status.stepOrder || "",
            isFailure: status.isFailure ?? false
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            updateStatusMutation.mutate(values);
          }}
        >
          {({ values, errors, touched, handleChange, setFieldValue }) => (
            <Form >
              <StatusFormBody 
                values={values} 
                errors={errors} 
                touched={touched} 
                handleChange={handleChange} 
                setFieldValue={setFieldValue} 
                isPending={updateStatusMutation.isPending}
                onClose={onClose}
                submitLabel="Update Status"
              />
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

// Shared Form Body for Status Modal
const StatusFormBody = ({ values, errors, touched, handleChange, setFieldValue, isPending, onClose, submitLabel }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            className={`mt-1 block w-full rounded-md border lowercase ${errors.name && touched.name ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:ring-primary-500 focus:border-primary-500`}
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
            rows={3}
            className={`mt-1 block w-full rounded-md border ${errors.description && touched.description ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:ring-primary-500 focus:border-primary-500`}
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
              className={`mt-1 block w-full rounded-md border ${errors.expectedDuration && touched.expectedDuration ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:ring-primary-500 focus:border-primary-500`}
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
              className={`mt-1 block w-full rounded-md border ${errors.warningDays && touched.warningDays ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:ring-primary-500 focus:border-primary-500`}
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
              className={`mt-1 block w-full rounded-md border ${errors.criticalDays && touched.criticalDays ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:ring-primary-500 focus:border-primary-500`}
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
              className={`mt-1 block w-full rounded-md border ${errors.delayDays && touched.delayDays ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:ring-primary-500 focus:border-primary-500`}
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
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  values.notifyRoles?.includes(role.value)
                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                    : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
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
          <div className="flex gap-4 items-start">
            <HexColorPicker 
              color={values.color} 
              onChange={(color) => setFieldValue('color', color)} 
            />
            <div className="flex-1 space-y-2">
              <div 
                className="w-full h-10 rounded-md border border-gray-300"
                style={{ backgroundColor: values.color }}
              ></div>
              <input
                type="text"
                name="color"
                className={`block w-full rounded-md border ${errors.color && touched.color ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:ring-primary-500 focus:border-primary-500`}
                value={values.color}
                onChange={handleChange}
              />
              {errors.color && touched.color && (
                <p className="mt-1 text-xs text-red-500">{errors.color}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            id="isActive"
            className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            checked={values.isActive}
            onChange={handleChange}
          />
          <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">Active Status</label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Step Order</label>
            <input
              type="number"
              name="stepOrder"
              className={`mt-1 block w-full rounded-md border ${errors.stepOrder && touched.stepOrder ? 'border-red-500' : 'border-gray-300'} px-3 py-2 focus:ring-primary-500 focus:border-primary-500`}
              value={values.stepOrder}
              onChange={handleChange}
              placeholder="e.g. 1"
            />
            {errors.stepOrder && touched.stepOrder && (
              <p className="mt-1 text-xs text-red-500">{errors.stepOrder}</p>
            )}
          </div>

          <div className="flex items-center mt-6">
            <input
              type="checkbox"
              name="isFailure"
              id="isFailure"
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              checked={values.isFailure}
              onChange={handleChange}
            />
            <label htmlFor="isFailure" className="ml-2 text-sm text-gray-700">Is Failure Status (Loopback)</label>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isPending}
        >
          {isPending ? 'Processing...' : submitLabel}
        </button>
      </div>
    </div>
  );
}

// Main component: Notifications management page
const StatusManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("notifications");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Fetch status definitions
  const { data: statusDefinitions, isLoading } = useGetAllStatusDefinitions();

  const handleEditClick = (status) => {
    setSelectedStatus(status);
    setIsEditModalOpen(true);
  };



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
            className="text-left hover:opacity-80 cursor-pointer rounded-md px-2 py-1 capitalize font-medium"
            onClick={() => handleEditClick(info.row.original)}
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
                onClick={() => handleEditClick(info.row.original)}
                className="text-left hover:text-primary-600 cursor-pointer whitespace-normal break-words line-clamp-2"
            >
                {info.getValue()}
            </span>
        ),
      },
      {
        accessorKey: "expectedDuration",
        header: "Expected Duration",
        cell: (info) => (
          <span className="text-gray-600">
            {info.getValue() ? `${info.getValue()} days` : "-"}
          </span>
        ),
      },
      {
        accessorKey: "warningDays",
        header: "Warning Days",
        cell: (info) => (
          <span className="text-orange-600 font-medium">
            {info.getValue() ?? "-"}
          </span>
        ),
      },
      {
        accessorKey: "criticalDays", 
        header: "Critical Days",
        cell: (info) => (
          <span className="text-red-600 font-medium">
            {info.getValue() ?? "-"}
          </span>
        ),
      },
      {
        accessorKey: "notifyRoles",
        header: "Notify Roles",
        cell: (info) => (
          <div className="flex flex-wrap gap-1 max-w-[200px]">
            {info.getValue()?.map((role, index) => (
              <span key={index} className="px-2 py-0.5 text-[10px] bg-blue-50 text-blue-700 border border-blue-100 rounded uppercase">
                {role.replace('_', ' ')}
              </span>
            ))}
            {(!info.getValue() || info.getValue().length === 0) && <span className="text-gray-400">-</span>}
          </div>
        ),
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: (info) => (
          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${info.getValue() ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {info.getValue() ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        accessorKey: "stepOrder",
        header: "Step Order",
        cell: (info) => (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-700 font-bold text-xs border border-gray-200">
            {info.getValue() ?? "-"}
          </span>
        ),
      },
      {
        accessorKey: "isFailure",
        header: "Loopback?",
        cell: (info) => (
          <span className={`font-semibold ${info.getValue() ? "text-red-500" : "text-gray-400"}`}>
            {info.getValue() ? "Yes" : "No"}
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
              handleEditClick(info.row.original);
            }}
            className="rounded border border-primary-200 text-primary-600 shadow-sm py-1 px-3 hover:bg-primary-50 transition-colors text-xs font-medium"
          >
            Edit
          </button>
        ),
      },
    ],
    []
  );




  // Filter status data based on search query
  const filteredStatusData = useMemo(() => {
    let filtered = statusDefinitions?.statusDefinitions || [];
    
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort by stepOrder (ascending)
    return [...filtered].sort((a, b) => {
      const orderA = a.stepOrder ?? Infinity;
      const orderB = b.stepOrder ?? Infinity;
      return orderA - orderB;
    });
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
    return (
      <div className="flex items-center justify-center h-full p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      <CreateStatusModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <EditStatusModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedStatus(null); }} status={selectedStatus} />
      
      {/* Global Search */}
      <div className="flex items-center justify-between py-6 px-6 pb-0 w-full h-[89px] border-b border-gray-200 bg-white">
        {/* <h2 className="text-lg font-[Inter-SemiBold] text-gray-800">DRIMS</h2> */}
        <p className="text-sm font-[Inter-Medium]  text-gray-900">Research Centre Portal</p>
        <p className="text-sm font-[Inter-Medium]  text-gray-600">Digital Research Information Management System</p>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 bg-white shadow-sm border-b border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Status Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">Configure and manage research workflow status definitions</p>
        </div>
        <div className="flex items-center gap-4">
         
          <div className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100">
            TIMESTAMP: {format(new Date(), "yyyy-MM-dd HH:mm:ss")}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="px-6 py-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-100 bg-gray-50/50">
            <div className="flex gap-8 px-6">
              <button
                onClick={() => setActiveTab("notifications")}
                className={`py-4 px-1 border-b-2 transition-colors ${
                  activeTab === "notifications"
                    ? "border-primary-500 text-primary-500"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } font-semibold text-sm focus:outline-none`}
              >
               Status Definitions
              </button>
           
            </div>
          </div>

          {/* Search and Controls */}
          <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-gray-100">
            <div className="w-full sm:w-[320px]">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search status by name or description..."
              />
            </div>

          
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Rows:</span>
                <select
                  value={pagination.pageSize}
                  onChange={e => {
                    setPagination(old => ({
                      ...old,
                      pageSize: Number(e.target.value)
                    }))
                  }}
                  className="border border-gray-300 rounded shadow-sm py-1 px-2 text-xs text-gray-700 hover:border-primary-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500 bg-white"
                >
                  {[5, 10, 15, 20, 50].map(pageSize => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize}
                    </option>
                  ))}
                </select>
              </div>
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all shadow-sm font-medium text-sm flex items-center gap-2"
              >
                <span className="text-lg leading-none">+</span> Create Status
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
                        className="px-4 py-3 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider"
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
              <tbody className="bg-white divide-y divide-gray-100">
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50/80 transition-colors group">
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="px-4 py-3 whitespace-nowrap text-xs text-gray-600"
                        >
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
                    <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500 italic">
                      No status definitions found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100 bg-white">
            <div className="flex items-center text-xs text-gray-500 font-medium">
              Showing{" "}
              <span className="text-gray-900 mx-1">
                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
              </span>
              -{" "}
              <span className="text-gray-900 mx-1">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getPrePaginationRowModel().rows.length
                )}
              </span>
              of{" "}
              <span className="text-gray-900 mx-1">
                {table.getPrePaginationRowModel().rows.length}
              </span>{" "}
              definitions
            </div>
            <div className="flex items-center gap-1">
              <button
                className="p-2 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
              {Array.from(
                { length: table.getPageCount() },
                (_, i) => i + 1
              ).map((pageNumber) => (
                <button
                  key={pageNumber}
                  className={`w-8 h-8 rounded-md text-xs font-bold transition-all ${
                    pageNumber === table.getState().pagination.pageIndex + 1
                      ? "bg-primary-500 text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                  onClick={() => table.setPageIndex(pageNumber - 1)}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                className="p-2 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
     
    </div>
  );
};


export default StatusManagement;
