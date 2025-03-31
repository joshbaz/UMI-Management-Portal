import { useState, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender
} from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { schoolData } from './SchoolData';
import SchoolSearch from './SchoolSearch';
import SchoolTablePageSize from './SchoolTablePageSize';
import SchoolPagination from './SchoolPagination';
import { useMutation } from '@tanstack/react-query';
import { deleteSchoolService } from '../../store/tanstackStore/services/api';
import { queryClient } from '../../utils/tanstack';

// Info icon helper component
const InfoIconHelper = ({ tooltip }) => {
  return (
    <div className="relative group">
      <div className="cursor-help w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
        <span className="text-white text-xs font-medium">i</span>
      </div>
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
        <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
            <div className="border-4 border-transparent border-t-gray-900" style={{ width: 0, height: 0 }} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Delete confirmation modal
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, schoolName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Delete School</h3>
        <p className="text-sm text-gray-500 mb-4">
          Are you sure you want to delete {schoolName}? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const SchoolTable = ({ 
  globalFilter, 
  setGlobalFilter, 
  columnVisibility, 
  setColumnVisibility,
  data
}) => {
  const [pageSize, setPageSize] = useState(() => {
    const savedPageSize = localStorage.getItem('schoolTablePageSize');
    return savedPageSize ? parseInt(savedPageSize) : 10;
  });
  const [pageIndex, setPageIndex] = useState(() => {
    const savedPageIndex = localStorage.getItem('schoolTablePageIndex');
    return savedPageIndex ? parseInt(savedPageIndex) : 0;
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [schoolToDelete, setSchoolToDelete] = useState(null);

 

  const deleteSchoolMutation = useMutation({
    mutationFn: deleteSchoolService,
    onSuccess: () => {
      queryClient.invalidateQueries(['schools']);
    }
  });

  useEffect(() => {
    setPageIndex(0);
  }, [data]);

  const handleDeleteClick = (school) => {
    setSchoolToDelete(school);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (schoolToDelete) {
      try {
        await deleteSchoolMutation.mutateAsync(schoolToDelete.id);
        setDeleteModalOpen(false);
        setSchoolToDelete(null);
      } catch (error) {
        console.error('Error deleting school:', error);
      }
    }
  };

  // Set initial column visibility
  const defaultColumnVisibility = {
    schoolName: true,
    schoolCode: true,
    location: true,
    campus: true,
    url: true,
    actions: true
  };

  // Use the provided columnVisibility or default to all visible
  const effectiveColumnVisibility = columnVisibility || defaultColumnVisibility;

  const columns = [
    {
      accessorKey: 'location',
      header: () => <span className="text-sm">Location</span>,
      cell: info => <div className="text-sm">{info.row.original.campus?.location}</div>
    },
    {
      accessorKey: 'name',
      header: () => <span className="text-sm">School Name</span>,
      cell: info => <div className="text-sm">{info.getValue()}</div>
    },
    {
      accessorKey: 'code',
      header: () => <span className="text-sm">Code</span>,
      cell: info => <div className="text-sm">{info.getValue()}</div>
    },
    
    {
      accessorKey: 'campus',
      header: () => <span className="text-sm">Campus</span>,
      cell: info => <div className="text-sm">{info.row.original.campus?.name}</div>
    },
    {
      accessorKey: 'url',
      header: () => <span className="text-sm">URL</span>,
      cell: info => <div className="text-sm">{info.getValue()}</div>
    },
    {
      id: 'actions',
      header: () => <span className="text-sm"> </span>,
      cell: info => (
        <div className="flex gap-4">
          <Link 
            to={`/schools/edit/${info.row.original.id}`}
            className="text-blue-600 hover:text-blue-800"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </Link>
          <button 
            className="text-red-600 hover:text-red-800"
            onClick={() => handleDeleteClick(info.row.original)}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )
    }
  ];

  const table = useReactTable({
    data: data || [], // Data is already filtered by campus in SchoolManagement component
    columns,
    state: {
      globalFilter,
      columnVisibility: effectiveColumnVisibility,
      pagination: {
        pageSize,
        pageIndex,
      },
    },
    onPaginationChange: updater => {
      if (typeof updater === 'function') {
        const newState = updater({
          pageIndex,
          pageSize,
        });
        setPageIndex(newState.pageIndex);
        setPageSize(newState.pageSize);
        localStorage.setItem('schoolTablePageIndex', newState.pageIndex.toString());
        localStorage.setItem('schoolTablePageSize', newState.pageSize.toString());
      }
    },
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSchoolToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        schoolName={schoolToDelete?.name}
      />

      {/* Table Controls */}
      <div className="p-4 flex justify-between items-center border-b">
        <div className="w-[240px]">
          <SchoolSearch 
            value={globalFilter ?? ''}
            onChange={value => setGlobalFilter(String(value))}
            placeholder="Search by Name"
          />
        </div>
        <div className="flex items-center gap-4">
          <SchoolTablePageSize
            pageSize={pageSize}
            setPageSize={setPageSize}
            setPageIndex={setPageIndex}
          />
          <Link
            to="/schools/add"
            className="inline-flex items-center px-4 py-2 bg-[#27357E] text-white rounded-lg text-sm font-medium hover:bg-[#1F2861]"
          >
            Add School
            <span className="ml-2">+</span>
          </Link>
        </div>
      </div>

      {/* Table Structure */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 capitalize tracking-wider bg-gray-50"
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
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50">
                {row.getVisibleCells().map(cell => (
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
      <SchoolPagination table={table} />
    </div>
  );
};

export default SchoolTable;
