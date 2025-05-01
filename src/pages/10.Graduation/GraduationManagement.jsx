import React, { useState, useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Loader2 } from 'lucide-react';
import {  useGetGraduationStatistics, useGetAllStudents } from '../../store/tanstackStore/services/queries';
import { addStudentToGraduationService } from '../../store/tanstackStore/services/api';

const GraduationManagement = () => {
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(() => {
    const currentYear = new Date().getFullYear();
    return `${currentYear}/${currentYear + 1}`;
  });
  const [activeTab, setActiveTab] = useState('approved'); // 'approved' or 'graduates'

  const queryClient = useQueryClient();

  // Fetch graduation statistics
  const { data: gradStatsResponse, isLoading: isLoadingStats } = useGetGraduationStatistics();
  const gradStats = gradStatsResponse;

  // Fetch senate-approved students
  const { data: studentsResponse, isLoading: isLoadingStudents } = useGetAllStudents();

  const senateApprovedResponse = useMemo(() => {
    if (!studentsResponse?.students) return { data: [] };
    
    const filteredStudents = studentsResponse.students.filter(student => {
      // Find the current status by checking which status has isCurrent set to true
      const currentStatus = student.statuses?.find(status => status.isCurrent)?.definition?.name || 
                           student.statuses?.[0]?.definition?.name;
      return currentStatus === 'results approved by senate';
    });

    console.log('studentsResponse', gradStats); 

    console.log('filteredStudents', filteredStudents);
    
    return { data: filteredStudents };
  }, [studentsResponse]);
  
  const graduatesResponse = useMemo(() => {
    if (!studentsResponse?.students) return { data: [] };
    
    const filteredStudents = studentsResponse.students.filter(student => {
      // Find the current status by checking which status has isCurrent set to true
      const currentStatus = student.statuses?.find(status => status.isCurrent)?.definition?.name || 
                           student.statuses?.[0]?.definition?.name;
      return currentStatus === 'graduated';
    });
    
    return { data: filteredStudents };
  }, [studentsResponse]);
  
  const senateApprovedStudents = senateApprovedResponse?.data || [];
  const graduatedStudents = graduatesResponse?.data || [];

  // Mutation for adding student to graduation list
  const addToGraduationMutation = useMutation({
    mutationFn: (studentId) => {
      return addStudentToGraduationService(studentId, selectedAcademicYear);
    },
    onSuccess: () => {
     
      queryClient.resetQueries(['graduationStatistics']);
      queryClient.resetQueries(['allStudents']);
      queryClient.invalidateQueries(['graduationStatistics']);
      queryClient.invalidateQueries(['allStudents']);
    }
  });

  // Table columns
  const columns = useMemo(() => [
  
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div className="flex items-center capitalize">
            {`${row.original.firstName} ${row.original.lastName}`}
          </div>
        )
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <div>{row.original.email}</div>
            <div className="text-xs text-gray-600">{row.original.phoneNumber || 'No phone number'}</div>
          </div>
        )
      },
    {
      accessorKey: 'programLevel',
      header: 'Program',
      cell: ({ row }) => (
        <div className="flex items-center capitalize">
          {row.original.programLevel}
        </div>
      )
    },

    {
      accessorKey: 'school',
      header: 'School',
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.original.school?.name || 'N/A'}
        </div>
      )
    },

    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <button
          onClick={() => addToGraduationMutation.mutate(row.original.id)}
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          disabled={ addToGraduationMutation.isPending}
        >
          {addToGraduationMutation.isPending  ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </span>
          ) : row.original.isInGraduationList ? (
            'Added to Graduation'
          ) : (
            'Add to Graduation'
          )}
        </button>
      )
    }
  ], [addToGraduationMutation]);
  
  const graduatesColumns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <div className="flex items-center capitalize">
          {`${row.original.firstName} ${row.original.lastName}`}
        </div>
      )
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <div>{row.original.email}</div>
          <div className="text-xs text-gray-600">{row.original.phoneNumber || 'No phone number'}</div>
        </div>
      )
    },
    {
      accessorKey: 'programLevel',
      header: 'Program',
      cell: ({ row }) => (
        <div className="flex items-center capitalize">
          {row.original.programLevel}
        </div>
      )
    },
    {
      accessorKey: 'school',
      header: 'School',
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.original.school?.name || 'N/A'}
        </div>
      )
    },
    {
      accessorKey: 'gradAcademicYear',
      header: 'Academic Year',
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.original.gradAcademicYear || 'N/A'}
        </div>
      )
    },
    {
      accessorKey: 'graduatedAt',
      header: 'Graduation Date',
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.original.graduatedAt ? new Date(row.original.graduatedAt).toLocaleDateString() : 'N/A'}
        </div>
      )
    }
  ], []);

  const approvedTable = useReactTable({
    data: senateApprovedStudents || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
  
  const graduatesTable = useReactTable({
    data: graduatedStudents || [],
    columns: graduatesColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Function to generate academic years
  const generateAcademicYears = (count = 10) => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: count }, (_, i) => {
      const startYear = currentYear - i;
      return {
        value: `${startYear}/${startYear + 1}`,
        label: `${startYear}/${startYear + 1}`
      };
    });
  };

  // Show general loading state
  if (isLoadingStats && isLoadingStudents) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center p-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600 mb-4" />
        <h2 className="text-xl font-medium text-gray-700">Loading graduation data...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-full p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Graduation Management</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage graduation lists and view graduation statistics
        </p>
      </div>

      {/* Academic Year Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">Academic Year</label>
        <div className="mt-1 relative">
          <select
            value={selectedAcademicYear}
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
            className="mt-1 block w-48 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            {generateAcademicYears().map((year) => (
              <option key={year.value} value={year.value}>
                {year.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Graduates</h3>
          {isLoadingStats ? (
            <div className="mt-2 flex items-center">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400 mr-2" />
              <span className="text-gray-400">Loading statistics...</span>
            </div>
          ) : (
            <p className="mt-2 text-3xl font-bold text-blue-600">
              {gradStats?.totalGraduates || 0}
            </p>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Current Year Graduates</h3>
          {isLoadingStats ? (
            <div className="mt-2 flex items-center">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400 mr-2" />
              <span className="text-gray-400">Loading statistics...</span>
            </div>
          ) : (
            <p className="mt-2 text-3xl font-bold text-green-600">
              {gradStats?.currentYearGraduates || 0}
            </p>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Pending Graduation</h3>
          {isLoadingStats ? (
            <div className="mt-2 flex items-center">
              <Loader2 className="h-5 w-5 animate-spin text-gray-400 mr-2" />
              <span className="text-gray-400">Loading statistics...</span>
            </div>
          ) : (
            <p className="mt-2 text-3xl font-bold text-yellow-600">
              {gradStats?.pendingGraduation || 0}
            </p>
          )}
        </div>
      </div>

      {/* Graduation Trends Graph */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-md font-medium text-gray-900 mb-2">Graduation Trends</h2>
        <div className="h-[300px]">
          {isLoadingStats ? (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-2" />
              <p className="text-gray-500 text-center">Loading graduation trends...</p>
            </div>
          ) : (!gradStats?.yearlyTrends || gradStats.yearlyTrends.length === 0) ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500 text-center">
                No graduation trend data available. Statistics will appear here once students have been added to graduation lists.
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gradStats.yearlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="academicYear" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="masters"
                  stroke="#d97706"
                  name="Masters"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-4">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('approved')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'approved'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
               Students Ready For Graduation
            </button>
            <button
              onClick={() => setActiveTab('graduates')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                activeTab === 'graduates'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Graduates
            </button>
          </nav>
        </div>
      </div>

      {/* Senate Approved Students Table */}
      {activeTab === 'approved' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Ready for Graduation
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            {isLoadingStudents ? (
              <div className="flex flex-col items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-2" />
                <p className="text-gray-500">Loading students...</p>
              </div>
            ) : senateApprovedStudents.length === 0 ? (
              <div className="flex justify-center items-center p-8">
                <p className="text-gray-500">No students ready for graduation found.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {approvedTable.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th
                          key={header.id}
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
                  {approvedTable.getRowModel().rows.map(row => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
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
            )}
          </div>

          {/* Pagination */}
          {!isLoadingStudents && senateApprovedStudents.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => approvedTable.previousPage()}
                    disabled={!approvedTable.getCanPreviousPage()}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => approvedTable.nextPage()}
                    disabled={!approvedTable.getCanNextPage()}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <span className="text-sm text-gray-700">
                  Page {approvedTable.getState().pagination.pageIndex + 1} of{' '}
                  {approvedTable.getPageCount()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Graduates Table */}
      {activeTab === 'graduates' && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Graduates
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            {isLoadingStudents ? (
              <div className="flex flex-col items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-2" />
                <p className="text-gray-500">Loading graduates...</p>
              </div>
            ) : graduatedStudents.length === 0 ? (
              <div className="flex justify-center items-center p-8">
                <p className="text-gray-500">No graduates found.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {graduatesTable.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th
                          key={header.id}
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
                  {graduatesTable.getRowModel().rows.map(row => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <td
                          key={cell.id}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
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
            )}
          </div>

          {/* Pagination */}
          {!isLoadingStudents && graduatedStudents.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => graduatesTable.previousPage()}
                    disabled={!graduatesTable.getCanPreviousPage()}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => graduatesTable.nextPage()}
                    disabled={!graduatesTable.getCanNextPage()}
                    className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <span className="text-sm text-gray-700">
                  Page {graduatesTable.getState().pagination.pageIndex + 1} of{' '}
                  {graduatesTable.getPageCount()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GraduationManagement;