/* eslint-disable react/prop-types */
import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { HiX, HiMinusSm } from 'react-icons/hi';
import { IoFilterSharp } from 'react-icons/io5';
import { HiOutlineDocumentDuplicate } from 'react-icons/hi';
import { FiSearch } from 'react-icons/fi';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  getPaginationRowModel
} from '@tanstack/react-table';

import { useGetAllSupervisors, useGetReviewers, useGetAllExaminers } from '../../store/tanstackStore/services/queries';

// Utility Components
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

// Tab Component
const StatsTableTab = ({ selectedTab, setSelectedTab }) => {
  const tabs = ['Examiners', 'Supervisors', 'Reviewers'];

  return (
    <div className="border-b border-gray-200">
      <div className="flex space-x-8 px-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              selectedTab === tab
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

// Pagination Component
const TablePagination = ({ table }) => {
  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
      <div className="flex items-center">
        <span className="text-sm text-gray-700">
          Showing{' '}
          <span className="font-medium">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span>{' '}
          to{' '}
          <span className="font-medium">
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              table.getFilteredRowModel().rows.length
            )}
          </span>{' '}
          of <span className="font-medium">{table.getFilteredRowModel().rows.length}</span> results
        </span>
      </div>
      <div className="flex items-center space-x-2">
        <button
          className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </button>
        <span className="text-sm text-gray-700">
          Page <span className="font-medium">{table.getState().pagination.pageIndex + 1}</span> of{' '}
          <span className="font-medium">{table.getPageCount()}</span>
        </span>
        <button
          className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </button>
      </div>
    </div>
  );
};

// Examiners Table
const ExaminersTable = ({ data }) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const columnHelper = createColumnHelper();
  
  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: info => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-600 font-medium">
                {info.getValue()?.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{info.getValue()}</div>
            <div className="text-sm text-gray-500">{info.row.original?.title || 'Examiner'}</div>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor(row => row.workEmail || row.email || row.primaryEmail, {
      id: 'email',
      header: 'Email',
      cell: info => <span className="text-sm text-gray-500">{info.getValue()}</span>,
    }),
    columnHelper.accessor('type', {
      header: 'Type',
      cell: info => (
        <div>
          <div className="text-sm text-gray-900">{info.getValue()}</div>
          
        </div>
      ),
    }),
    columnHelper.accessor('institution', {
      header: 'Institution',
      cell: info => <span className="text-sm text-gray-500">{info.getValue()}</span>,
    }),
    columnHelper.accessor('books', {
      header: 'Statistics',
      cell: info => {
        const books = info.getValue() || [];
        const examinerId = info.row.original?.id;
        
        // Count total books assigned to this examiner
        const totalAssignments = books.reduce((count, book) => {
          const hasAssignment = book.examinerAssignments?.some(
            assignment => assignment.examinerId === examinerId
          );
          return hasAssignment ? count + 1 : count;
        }, 0);
        
        // Count pending assignments (no grade but is current)
        const pendingAssignments = books.reduce((count, book) => {
          const isPending = book.examinerAssignments?.some(
            assignment => assignment.examinerId === examinerId && 
                         !assignment.grade && 
                         assignment.isCurrent
          );
          return isPending ? count + 1 : count;
        }, 0);
        
        // Count completed assignments (has grade)
        const completedAssignments = books.reduce((count, book) => {
          const isCompleted = book.examinerAssignments?.some(
            assignment => assignment.examinerId === examinerId && 
                         assignment.grade
          );
          return isCompleted ? count + 1 : count;
        }, 0);
        
        return (
          <div className="space-y-1">
            <div className="flex items-center text-sm font-[Inter-Regular] justify-between">
              <span>Total Books:</span>
              <span className="font-medium">{totalAssignments}</span>
            </div>
            <div className="flex items-center text-sm font-[Inter-Regular] justify-between">
              <span>Pending:</span>
              <span className="text-yellow-600">{pendingAssignments}</span>
            </div>
            <div className="flex items-center text-sm font-[Inter-Regular] justify-between">
              <span>Completed:</span>
              <span className="text-green-600">{completedAssignments}</span>
            </div>
          </div>
        );
      },
    }),

  ];

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter,
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const safeValue = String(filterValue || '').toLowerCase();
      if (safeValue === '') return true;
      
      // Search in all fields of the row
      const searchable = (value) => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') {
          // For nested objects like books array, convert to string representation
          return JSON.stringify(value).toLowerCase();
        }
        return String(value).toLowerCase();
      };
      
      // Check if any field in the row contains the filter value
      return Object.entries(row.original).some(([key, value]) => {
        return searchable(value).includes(safeValue);
      });
    },
  });

  if (!data || data.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No examiners data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="p-4">
        <SearchBar 
          value={globalFilter || ''}
          onChange={value => table.setGlobalFilter(value)}
          placeholder="Search examiners..."
        />
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th 
                  key={header.id}
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <TablePagination table={table} />
    </div>
  );
};

// Supervisors Table
const SupervisorsTable = ({ data }) => {
    
  const [globalFilter, setGlobalFilter] = useState('');
  const columnHelper = createColumnHelper();
  
  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: info => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-600 font-medium">
                {info.getValue()?.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{info.row.original?.title} {info.getValue()}</div>
            <div className="text-sm text-gray-500">{'Supervisor'}</div>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor(row => row?.workEmail || row?.email || row?.primaryEmail, {
      id: 'email',
      header: 'Email',
      cell: info => <span className="text-sm text-gray-500">{info.getValue()}</span>,
    }),

    columnHelper.accessor('campus.name', {
      header: 'Campus',
      cell: info => <span className="text-sm text-gray-500">{info.getValue()}</span>,
    }),
    columnHelper.accessor('students', {
      header: 'Statistics',
      cell: info => {
        const students = info.getValue() || [];
        
        // Count students with "Results Approved by Senate" status
        const completedCount = students.filter(student => 
          student.statuses?.some(status => 
            status.definition?.name === 'results approved by senate'
          )
        ).length || 0;

        
        
        // Count students without "Results Approved by Senate" status
        const inProgressCount = students.length - completedCount;
        
        return (
          <div className="space-y-1">
            <div className="flex items-center text-sm font-[Inter-Regular] justify-between">
              <span>Current Students:</span>
              <span className="font-medium">{students.length || 0}</span>
            </div>
            <div className="flex items-center text-sm font-[Inter-Regular] justify-between">
              <span>Completed:</span>
              <span className="text-green-600">
                {completedCount}
              </span>
            </div>
            <div className="flex items-center text-sm font-[Inter-Regular] justify-between">
              <span>In Progress:</span>
              <span className="text-blue-600">
                {inProgressCount}
              </span>
            </div>
          </div>
        );
      },
    }),
 
  ];

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter,
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const safeValue = String(filterValue || '').toLowerCase();
      if (safeValue === '') return true;
      
      // Search in all fields of the row
      const searchable = (value) => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') {
          // For nested objects like students array, convert to string representation
          return JSON.stringify(value).toLowerCase();
        }
        return String(value).toLowerCase();
      };
      
      // Check if any field in the row contains the filter value
      return Object.entries(row.original).some(([key, value]) => {
        return searchable(value).includes(safeValue);
      });
    },
  });

  if (!data || data.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No supervisors data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="p-4">
        <SearchBar 
          value={globalFilter || ''}
          onChange={value => table.setGlobalFilter(value)}
          placeholder="Search supervisors..."
        />
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th 
                  key={header.id}
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <TablePagination table={table} />
    </div>
  );
};

// Reviewers Table
const ReviewersTable = ({ data }) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const columnHelper = createColumnHelper();
  
  const columns = [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: info => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-600 font-medium">
                {info.getValue()?.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{info.getValue()}</div>
            <div className="text-sm text-gray-500">{ 'Reviewer'}</div>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor(row => row.workEmail || row.email || row.primaryEmail, {
      id: 'email',
      header: 'Email',
      cell: info => <span className="text-sm text-gray-500">{info.getValue()}</span>,
    }),
  
 
    columnHelper.accessor('proposals', {
      header: 'Statistics',
      cell: info => {
        const proposals = info.getValue() || [];
        const pendingReviews = proposals.filter(p => 
          p.statuses?.some(s => s.definition?.name === 'proposal in review' && s.isCurrent)
        ).length || 0;
        const completedReviews = proposals.filter(p => 
          p.statuses?.some(s => s.definition?.name === 'proposal review finished' )
        ).length || 0;
        
        return (
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span>Total Reviews:</span>
              <span className="font-medium">{proposals.length || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Pending:</span>
              <span className="text-yellow-600">{pendingReviews}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Completed:</span>
              <span className="text-green-600">{completedReviews}</span>
            </div>
          </div>
        );
      },
    }),
 
  ];

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter,
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const safeValue = String(filterValue || '').toLowerCase();
      if (safeValue === '') return true;
      
      // Search in all fields of the row
      const searchable = (value) => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') {
          // For nested objects like proposals array, convert to string representation
          return JSON.stringify(value).toLowerCase();
        }
        return String(value).toLowerCase();
      };
      
      // Check if any field in the row contains the filter value
      return Object.entries(row.original).some(([key, value]) => {
        return searchable(value).includes(safeValue);
      });
    },
  });

  if (!data || data.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        No reviewers data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="p-4">
        <SearchBar 
          value={globalFilter || ''}
          onChange={value => table.setGlobalFilter(value)}
          placeholder="Search reviewers..."
        />
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th 
                  key={header.id}
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <TablePagination table={table} />
    </div>
  );
};

// Main Component
const ModifyTableDialog = ({ isOpen, onClose, columnVisibility, setColumnVisibility }) => {
  if (!isOpen) return null;

  const handleToggleColumn = (columnId) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnId]: !prev[columnId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl" style={{ width: "670px" }}>
        {/* Dialog Header */}
        <div
          className="flex justify-between items-center px-7 py-8 mt-8 mb-5 mx-7 border-b rounded border"
          style={{ height: "68px", gap: "8px" }}
        >
          <h2 className="text-lg font-semibold text-gray-900">Modify Table</h2>
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
        <div className="p-7 border rounded mb-9 mx-7">
          <div className="mb-4">
            <h3 className="text-base font-medium text-gray-900">
              Select Data Fields to Display
            </h3>
            <p className="text-sm text-gray-500">
              please select the fields in the table
            </p>
          </div>

          <div className="space-y-3">
            {Object.entries(columnVisibility).map(([columnId, isVisible]) => (
              <div key={columnId} className="flex items-center">
                <button
                  onClick={() => handleToggleColumn(columnId)}
                  className={`flex items-center justify-center w-4 h-4 rounded p-[2.5px] ${
                    isVisible ? "bg-accent2-600" : "bg-gray-200"
                  }`}
                >
                  {isVisible && (
                    <HiMinusSm className="w-3 h-3 text-white font-bold" />
                  )}
                </button>
                <span className="ml-3 text-gray-700">
                  {columnId === "name"
                    ? "Name"
                    : columnId === "email"
                    ? "Email"
                    : columnId.charAt(0).toUpperCase() + columnId.slice(1)}
                </span>
              </div>
            ))}
          </div>
          {/* Dialog Footer */}
          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-900"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FacultyStatsManagement = () => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [isModifyTableOpen, setIsModifyTableOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Examiners');
  const [columnVisibility, setColumnVisibility] = useState({
    name: true,
    email: true,
    school: true,
    campus: true,
    statistics: true
  });

  // Use the specific queries for each faculty type
  const { data: examinersData, isLoading: examinersLoading, error: examinersError } = useGetAllExaminers();
  const { data: supervisorsData, isLoading: supervisorsLoading, error: supervisorsError } = useGetAllSupervisors();
  const { data: reviewersData, isLoading: reviewersLoading, error: reviewersError } = useGetReviewers();

  const isLoading = examinersLoading || supervisorsLoading || reviewersLoading;
  const error = examinersError || supervisorsError || reviewersError;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-semibold text-gray-600">Loading faculty statistics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-semibold text-red-600">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Global Search */}
      <div className="flex items-center justify-end py-6 px-6 pb-0 w-full h-[64px]">
        {/* <h2 className="text-lg font-[Inter-SemiBold] text-gray-800">DRIMS</h2> */}
        <p className="text-sm font-[Inter-Medium]  text-gray-600">Digital Research Information Management System</p>
      </div>

      {/* Horizontal Line */}
      <div className="my-6 border-t border-gray-200"></div>

      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">Faculty Statistics</h1>
        <div className="text-sm text-gray-500">
          Last login: {format(new Date(), 'MM-dd-yyyy hh:mm:ssaa')}
        </div>
      </div>

      {/* Modify Table Dialog */}
      <ModifyTableDialog
        isOpen={isModifyTableOpen}
        onClose={() => setIsModifyTableOpen(false)}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
      />

      {/* Table Container */}
      <div className="px-6 pb-6">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Tabs */}
          <StatsTableTab 
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
          />

          {/* Render the appropriate table based on selected tab */}
          {selectedTab === 'Examiners' && (
            <ExaminersTable 
              data={examinersData?.examiners} 
              books={examinersData?.books}
              globalFilter={globalFilter}
            />
          )}
          
          {selectedTab === 'Supervisors' && (
            <SupervisorsTable 
              data={supervisorsData?.supervisors} 
              globalFilter={globalFilter}
            />
          )}
          
          {selectedTab === 'Reviewers' && (
            <ReviewersTable 
              data={reviewersData?.reviewers} 
              globalFilter={globalFilter}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default FacultyStatsManagement;