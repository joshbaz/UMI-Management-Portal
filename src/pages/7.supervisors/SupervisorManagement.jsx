import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";

import { ROUTES } from "../../config/routes";

// School codes mapping
const SCHOOL_CODES = {
  SBM: "School of Business And Management",
  SDLIT: "School of Distance Learning And Information Technology",
  SCPAG: "School of Civil Service, Public Administration And Governance",
  SMS: "School of Management Sciences",
  RC: "Regional Centres",
};

const getSchoolName = (code) => {
  const schools = {
    'SDLIT': 'School of Distance Learning And Information Technology',
    'SCPAG': 'School of Civil Service, Public Administration And Governance',
    'SBM': 'School of Business And Management',
    'SMS': 'School of Management Sciences',
    'RC': 'Regional Centres'
  };
  return schools[code] || code;
};

// Sample student data
export const DUMMY_DATA = [
  {
    id: 1,
    fullname: 'Anna Roberts',
    email: 'anna.roberts@gmail.com',
    schoolCode: 'SDLIT',
    userAccess: 'Supervisor',
    campus: 'Kampala',
    status: 'Open',
    department: 'School of Distance Learning And Information Technology',
    dateOfJoining: '15/01/2025',
    currentStatus: 'Active',
    totalStudents: '8',
    phone: '+256 723 456 789'
   
  },
  {
    id: 2,
    fullname: 'Lindsay Walton',
      email: 'lindsay.walton@gmail.com',
      schoolCode: 'SCPAG',
      userAccess: 'Supervisor',
      campus: 'Kampala',
      status: 'Open',
      department: 'School of Civil Service, Public Administration And Governance',
      dateOfJoining: '20/01/2025',
      currentStatus: 'Active',
      totalStudents: '10',
      phone: '+256 734 567 890'
   
  },
  {
    id: 3,
    fullname: 'Benjamin Russell',
      email: 'benjamin.russel@gmail.com',
      schoolCode: 'SCPAG',
      userAccess: 'Supervisor',
      campus: 'Kampala',
      status: 'Open',
      department: 'School of Civil Service, Public Administration And Governance',
      dateOfJoining: '10/01/2025',
      currentStatus: 'Active',
      totalStudents: '6',
      phone: '+256 745 678 901'
   
  },
  {
    id: 4,
    fullname: 'Jeffrey Webb',
    email: 'jeffrey.webb@gmail.com',
    schoolCode: 'SCPAG',
    userAccess: 'Supervisor',
    campus: 'Kampala',
    status: 'Open',
    department: 'School of Civil Service, Public Administration And Governance',
    dateOfJoining: '12/01/2025',
    currentStatus: 'Active',
    totalStudents: '7',
    phone: '+256 789 012 345'
   
  },
 
];

// Table column definitions
const columns = [
  {
    accessorKey: 'fullname',
    header: () => <span className="text-sm">Fullname</span>,
    cell: info => <div className="text-sm">{info.getValue()}</div>
  },
  {
    accessorKey: "email",
    header: () => <span className="text-sm">Email Address</span>,
    cell: (info) => <div className="text-sm">{info.getValue()}</div>,
  },
  {
    accessorKey: "campus",
    header: () => <span className="text-sm">Campus</span>,
    cell: (info) => <div className="text-sm">{info.getValue()}</div>,
  },
  {
    accessorKey: "schoolCode",
    header: () => <span className="text-sm">School Code</span>,
    cell: (info) => (
      <div className="flex items-center gap-1 text-sm">
        <span className="text-semantic-text-secondary">{info.getValue()}</span>
        <InfoIconHelper tooltip={SCHOOL_CODES[info.getValue()]} />
      </div>
    ),
  },
 
  {
    accessorKey: "totalStudents",
    header: () => <span className="text-sm">Assigned Students</span>,
    cell: (info) => <div className="text-sm">{info.getValue()}</div>,
  },
  {
    accessorKey: "actions",
    header: () => <span className="text-sm"> </span>,
    cell: (info) => (
      <Link
        to={`${ROUTES.SUPERVISOR.ROOT}/add/${info.row.original.id}`}
        className="rounded border border-semantic-bg-border shadow-sm py-4px px-8px hover:bg-primary-500 hover:text-white text-sm"
      >
        Open
      </Link>
    ),
  },
];

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

// Component: Info icon helper for tooltips
const InfoIconHelper = ({ tooltip }) => {
  return (
    <div className="relative group">
      <div className="w-4 h-4 rounded-full bg-semantic-text-secondary flex items-center justify-center cursor-help">
        <span className="text-white text-xs font-medium">i</span>
      </div>
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
        <div className="bg-semantic-text-primary text-white text-xs rounded py-1 px-2 whitespace-nowrap">
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
            <div
              className="border-4 border-transparent border-t-semantic-text-primary"
              style={{ width: 0, height: 0 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};



const SupervisorManagement = () => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [data] = useState(DUMMY_DATA);
 
  const [columnVisibility, setColumnVisibility] = useState({
    fullname: true,
    email: true,
    category: true,
    campus: true,
    status: true,
  });

  // Initialize pagination state from localStorage or defaults
  const [pagination, setPagination] = useState(() => {
    const saved = localStorage.getItem("studentsTablePagination");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          pageIndex: parsed.pageIndex || 0,
          pageSize: parsed.pageSize || 10,
        };
      } catch (e) {
        console.error("Error parsing saved pagination state:", e);
        return { pageIndex: 0, pageSize: 10 };
      }
    }
    return { pageIndex: 0, pageSize: 10 };
  });

  // Filtered data based on active tab
  const filteredData = useMemo(() => {
    return data;
  }, [data]);

  // Table configuration
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      globalFilter,
      columnVisibility,
      pagination,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
    pageCount: Math.ceil(filteredData.length / pagination.pageSize),
  });

  // Persistence effect
  useEffect(() => {
    try {
      localStorage.setItem(
        "studentsTablePagination",
        JSON.stringify(pagination)
      );
    } catch (e) {
      console.error("Error saving pagination state:", e);
    }
  }, [pagination]);
  return (
    <div className="min-h-full">
      {/* Layout components */}
      {/* Global Search */}
      <div className="p-6 pb-0 w-1/2">
        
      </div>

      {/* Horizontal Line */}
      <div className="my-6 border-t border-gray-200"></div>

      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          Supervisors
        </h1>
        <div className="text-sm text-gray-500">
          Last login: {format(new Date(), "MM-dd-yyyy hh:mm:ssaa")}
        </div>
      </div>

    

 

     

      {/* Table Container */}
      <div className="px-6 pb-6">
        <div className="bg-white rounded-lg shadow-sm">
         

          {/* Search and Controls */}
          <div className="p-4 flex justify-between items-center border-b">
            <div className="w-[240px]">
              <SearchBar
                value={globalFilter ?? ""}
                onChange={(value) => setGlobalFilter(String(value))}
                placeholder="Search by Name"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">Show:</span>
                <select
                  value={pagination.pageSize}
                  onChange={(e) => {
                    const newSize = Number(e.target.value);
                    setPagination((prev) => ({
                      pageIndex: 0, // Reset to first page when changing page size
                      pageSize: newSize,
                    }));
                  }}
                  className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
                >
                  {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                    <option key={pageSize} value={pageSize}>
                      {pageSize}
                    </option>
                  ))}
                </select>
              </div>
              <Link
                to="/faculty/add"
                className="inline-flex items-center px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-900"
              >
                Add Supervisor
                <span className="ml-2">+</span>
              </Link>
            </div>
          </div>

          {/* Table Structure */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm divide-y divide-gray-200">
              {/* Table Header */}
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 capitalize tracking-wider"
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
              {/* Table Body */}
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-3 py-2 whitespace-nowrap text-xs text-gray-900"
                      >
                        {cell.column.columnDef.cell
                          ? flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )
                          : cell.renderCell()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 bg-white">
            <div className="flex items-center text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium mx-1">
                {pagination.pageSize * pagination.pageIndex + 1}
              </span>
              to{" "}
              <span className="font-medium mx-1">
                {Math.min(
                  (pagination.pageIndex + 1) * pagination.pageSize,
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
                    pageNumber === pagination.pageIndex + 1
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-500"
                  }`}
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      pageIndex: pageNumber - 1,
                    }))
                  }
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

export default SupervisorManagement;
