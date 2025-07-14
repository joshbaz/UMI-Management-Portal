import React, { useState, useMemo } from 'react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useGetAllResearchRequests } from '../../store/tanstackStore/services/queries';
import { updateResearchRequestService } from '../../store/tanstackStore/services/api';
import { useReactTable, getCoreRowModel, flexRender, getPaginationRowModel, getFilteredRowModel, createColumnHelper } from '@tanstack/react-table';
import { FiSearch } from 'react-icons/fi';
import { format } from 'date-fns';

const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'BEING_PROCESSED', label: 'Being Processed' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'CONCLUDED', label: 'Concluded' },
];

const statusColors = {
  PENDING: 'text-yellow-700 bg-yellow-100 border-yellow-500',
  BEING_PROCESSED: 'text-blue-700 bg-blue-100 border-blue-500',
  IN_REVIEW: 'text-purple-700 bg-purple-100 border-purple-500',
  CONCLUDED: 'text-green-700 bg-green-100 border-green-500',
};

// Search Bar Component
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

function ManageResearchRequests() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [pageIndex, setPageIndex] = useState(0);
  const queryClient = useQueryClient();

  // Fetch all research requests
  const { data, isLoading, error, refetch } = useGetAllResearchRequests();
  const requests = data?.requests || [];

  // Calculate stats
  const stats = useMemo(() => {
    return {
      requested: requests.length,
      pending: requests.filter(r => r.status === 'PENDING').length,
      beingProcessed: requests.filter(r => r.status === 'BEING_PROCESSED').length,
      concluded: requests.filter(r => r.status === 'CONCLUDED').length,
    };
  }, [requests]);

  // Mutation for updating a request
  const mutation = useMutation({
    mutationFn: updateResearchRequestService,
    onSuccess: () => {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 1500);
      queryClient.invalidateQueries(['managementResearchRequests']);
      setModalOpen(false);
    },
    onError: (err) => {
      setSaveError(err?.message || 'Failed to save changes.');
    },
  });

  // Column helper
  const columnHelper = createColumnHelper();

  // Define columns
  const columns = useMemo(() => [
    {
      accessorKey: 'student',
      header: 'Student',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {row.original.student.firstName} {row.original.student.lastName}
          </span>
          <span className="text-xs text-gray-500">
            {row.original.student.registrationNumber}
          </span>
        </div>
      )
    },
    {
      accessorKey: 'requestType',
      header: 'Request Type',
      cell: ({ row }) => (
        <span className="text-sm text-wrap" >
          {row.original.requestType}
        </span>
      )
    },
    {
      accessorKey: 'submittedAt',
      header: 'Date Submitted',
      cell: ({ row }) => (
        <span className="text-sm">
          {format(new Date(row.original.submittedAt), 'dd/MM/yyyy')}
        </span>
      )
    },
    {
      accessorKey: 'responseDate',
      header: 'Response Date',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.responseDate ? format(new Date(row.original.responseDate), 'dd/MM/yyyy') : '-'}
        </span>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const statusOption = statusOptions.find(s => s.value === row.original.status);
        return (
          <span className={`border ${statusColors[row.original.status] || ''} px-2 py-1 rounded text-xs font-medium`}>
            {statusOption?.label || row.original.status.replace('_', ' ')}
          </span>
        );
      }
    },
    {
      accessorKey: 'decision',
      header: 'Decision',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.decision || '-'}
        </span>
      )
    },
    {
      accessorKey: 'actions',
      header: '',
      cell: ({ row }) => (
        <button
          className="w-max px-2 h-6 rounded border border-[#E5E7EB] text-sm font-inter font-normal text-[#111827] shadow-[0px_1px_2px_0px_#0000000D] hover:bg-gray-50"
          onClick={() => { setSelected(row.original); setModalOpen(true); setSaveError(''); }}
        >
          Open
        </button>
      )
    }
  ], []);

  // Table instance
  const table = useReactTable({
    data: requests,
    columns,
    state: {
      globalFilter: search,
      pagination: {
        pageSize,
        pageIndex,
      },
    },
    onPaginationChange: (updater) => {
      if (typeof updater === "function") {
        const newState = updater({
          pageIndex,
          pageSize,
        });
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
      }
    },
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-gray-500">Loading research requests...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-center py-12 text-red-600">{error.message || 'Failed to load research requests.'}</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">Manage Research Requests</h2>
      
      {/* Progress Cards */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Progress</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center">
            <span className="text-2xl font-bold">{stats.requested}</span>
            <span className="text-gray-500 text-sm">Total Requests</span>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center">
            <span className="text-2xl font-bold">{stats.pending}</span>
            <span className="text-gray-500 text-sm">Pending</span>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center">
            <span className="text-2xl font-bold">{stats.beingProcessed}</span>
            <span className="text-gray-500 text-sm">Being Processed</span>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col items-center">
            <span className="text-2xl font-bold">{stats.concluded}</span>
            <span className="text-gray-500 text-sm">Concluded</span>
          </div>
        </div>
      </div>
      
      {/* Table Controls */}
      <div className="mb-4 flex justify-between items-center">
        <div className="w-64">
          <SearchBar
            value={search ?? ""}
            onChange={(value) => setSearch(String(value))}
            placeholder="Search by request type or reg. number..."
          />
        </div>
        <button
          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => refetch()}
        >
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-xs font-bold text-[#111827] capitalize tracking-wider"
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
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-2 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
            Showing{' '}
            <span className="font-medium mx-1">
              {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
            </span>
            to{' '}
            <span className="font-medium mx-1">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}
            </span>
            of{' '}
            <span className="font-medium mx-1">{table.getFilteredRowModel().rows.length}</span>
            results
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
            >
              {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && selected && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
          onClick={() => setModalOpen(false)}
        >
          <div 
            className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setModalOpen(false)}
            >
              ×
            </button>
            <h3 className="text-xl font-semibold mb-4">{selected.requestType}</h3>
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">Student</div>
              <div className="font-medium">{selected.student.firstName} {selected.student.lastName} ({selected.student.registrationNumber})</div>
            </div>
            {selected.requestType === 'Change of Supervisor' && selected.formData?.currentSupervisor && (
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-1">Supervisor</div>
                <div className="font-medium">{selected.formData.currentSupervisor}</div>
              </div>
            )}
            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-1">Reason</div>
              <div className="bg-gray-50 rounded p-3 text-sm">
                {selected.formData?.reason || 'No reason provided'}
              </div>
            </div>
            <hr className="my-6 border-gray-200" />
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={selected.status}
                onChange={e => setSelected(s => ({ ...s, status: e.target.value }))}
                disabled={mutation.isPending}
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Decision</label>
              <textarea
                className="w-full border rounded px-3 py-2"
                rows={3}
                value={selected.decision}
                onChange={e => setSelected(s => ({ ...s, decision: e.target.value }))}
                disabled={mutation.isPending}
              />
            </div>
            {saveError && <div className="mb-2 text-red-600 text-sm">{saveError}</div>}
            {saveSuccess && <div className="mb-2 text-green-700 text-sm">Saved successfully!</div>}
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
                onClick={() => setModalOpen(false)}
                disabled={mutation.isPending}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => mutation.mutate({ id: selected.id, status: selected.status, decision: selected.decision })}
                disabled={mutation.isPending}
              >
                {mutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageResearchRequests; 