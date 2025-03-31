import React, { useState, useMemo, useCallback, memo } from 'react'
import { format } from 'date-fns'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table'
import { UserPlus } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deletePanelistService, addPanelistsService } from '../../store/tanstackStore/services/api'
import { toast } from 'sonner'
import { Icon } from "@iconify-icon/react";
import { useGetPanelists } from "../../store/tanstackStore/services/queries";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DeleteModal = ({ isOpen, onClose, onConfirm, panelist, isPending }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[400px]">
        <h3 className="text-lg font-[Inter-Medium] text-gray-900 mb-4">Delete Panelist</h3>
        <p className="text-sm font-[Inter-Regular] text-gray-600 mb-6">
          Are you sure you want to delete panelist <span className="font-[Inter-Medium]">{panelist.name}</span>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm font-[Inter-Medium] text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="px-4 py-2 text-sm font-[Inter-Medium] text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

const PaginationButtons = memo(({ table, currentPage, totalPages }) => {
  const pagesToShow = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    pages.push(1);

    if (currentPage <= 3) {
      pages.push(2, 3);
      pages.push('...');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push('...');
      pages.push(totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push('...');
      pages.push(currentPage - 1, currentPage, currentPage + 1);
      pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="flex items-center gap-1">
      {pagesToShow.map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="w-8 h-8 flex items-center justify-center text-gray-500">...</span>
          ) : (
            <button
              className={`w-8 h-8 rounded text-sm transition-colors ${
                currentPage === page
                  ? "bg-blue-50 text-blue-600 font-[Inter-Medium]"
                  : "text-gray-500 hover:bg-blue-50"
              }`}
              onClick={() => table.setPageIndex(page - 1)}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}
    </div>
  );
});

const GradeProposalPanelistTable = ({ panelists = [] , proposalId, onUpdateClick, defenseGrades, onViewClick   }) => {
  const [globalFilter, setGlobalFilter] = useState('')
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedPanelist, setSelectedPanelist] = useState(null)
  const [isPanelistModalOpen, setIsPanelistModalOpen] = useState(false)
  const [panelistSearchTerm, setPanelistSearchTerm] = useState("")
  const [manualPanelist, setManualPanelist] = useState({ name: "", email: "" })
  const [selectedPanelists, setSelectedPanelists] = useState([])

  const { data: panelistsData, isLoading: isLoadingPanelists } = useGetPanelists();

  const queryClient = useQueryClient()

  const { mutate: deletePanelist, isPending } = useMutation({
    mutationFn: ({ proposalId, panelistId }) => deletePanelistService(proposalId, panelistId),
    onSuccess: () => {
      toast.success('Panelist deleted successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete panelist')
    },
    onSettled: async(data, error) => {
        if(!error){
            await Promise.all([
                await queryClient.resetQueries({ queryKey: ['proposal', proposalId] }),
                setDeleteModalOpen(false),
                setSelectedPanelist(null),
            ])
        }
    }
  })

  const addPanelistsMutation = useMutation({
    mutationFn: (panelists) => addPanelistsService(proposalId, panelists),
    onSuccess: () => {
      toast.success("Panelists added successfully")
     
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to add panelists")
    },
    onSettled: async (data, error) => {
      if (!error) {
        await Promise.all([
         await queryClient.resetQueries({ queryKey: ['proposal', proposalId] }),
          resetPanelistModal()
        ]);
      }
    }
  });

  const handleOpenDelete = useCallback((panelist) => {
    if (proposalId) {
      setSelectedPanelist(panelist)
      setDeleteModalOpen(true)
    } else {
      toast.error('Proposal ID is required')
    }
  }, [])

  const handleConfirmDelete = useCallback(() => {
    if (selectedPanelist && proposalId) {
      deletePanelist({
        proposalId,
        panelistId: selectedPanelist.id
      })
    }
  }, [selectedPanelist, proposalId, deletePanelist])

  const handlePanelistSearchTermChange = useCallback((e) => {
    setPanelistSearchTerm(e.target.value)
  }, [])

  const handleManualPanelistChange = useCallback((field) => (e) => {
    setManualPanelist(prev => ({...prev, [field]: e.target.value}))
  }, [])

  const handleAddManualPanelist = useCallback(() => {
    if (manualPanelist.name && manualPanelist.email) {
      const newPanelist = {
        id: `manual-${Date.now()}`,
        name: manualPanelist.name,
        email: manualPanelist.email
      }
      setSelectedPanelists(prev => [...prev, newPanelist])
      setManualPanelist({ name: "", email: "" })
    }
  }, [manualPanelist])

  const handlePanelistSelection = useCallback((panelist) => {
    setSelectedPanelists(prev => {
      const exists = prev.some(p => p.id === panelist.id)
      return exists
        ? prev.filter(p => p.id !== panelist.id)
        : [...prev, panelist]
    })
  }, [])

  const handleRemovePanelist = useCallback((panelistId) => {
    setSelectedPanelists(prev => prev.filter(p => p.id !== panelistId))
  }, [])

  const resetPanelistModal = useCallback(() => {
    setIsPanelistModalOpen(false)
    setSelectedPanelists([])
    setManualPanelist({ name: "", email: "" })
    setPanelistSearchTerm("")
  }, [])

  const handleAddPanelists = useCallback(() => {
    if (selectedPanelists.length > 0) {
      addPanelistsMutation.mutate(selectedPanelists)
    }
  }, [selectedPanelists, addPanelistsMutation])

  const columns = useMemo(() => [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: (info) => info.getValue(),
    },
    {
      header: 'Email',
      accessorKey: 'email',
      cell: (info) => info.getValue(),
    },
    {
      header: 'Marks',
      accessorKey: 'grade',
      cell: (info) => {
        const panelistId = info.row.original.id;
        const grade = defenseGrades.find(grade => grade.gradedById === panelistId);
        return grade ? `${grade.grade}%` : '-';
      },
    },
    {
      header: 'Submitted',
      accessorKey: 'createdAt',
      cell: (info) => {
        const panelistId = info.row.original.id;
        const grade = defenseGrades.find(grade => grade.gradedById === panelistId);
        return grade && grade.createdAt 
          ? format(new Date(grade.createdAt), 'dd-MMM-yyyy') 
          : '-';
      },
    },
    {
      header: 'Updated',
      accessorKey: 'updatedAt',
      cell: (info) => {
        const panelistId = info.row.original.id;
        const grade = defenseGrades.find(grade => grade.gradedById === panelistId);
        return grade && grade.updatedAt 
          ? format(new Date(grade.updatedAt), 'dd-MMM-yyyy') 
          : '-';
      },
    },
    {
      header: '',
      accessorKey: 'action',
      cell: (info) => {
        const panelistId = info.row.original.id;
        const grade = defenseGrades.find(grade => grade.gradedById === panelistId);
        return (
        <div className='flex items-center justify-end gap-4'>
          {grade ? (
            <button
              onClick={() => onViewClick(info.row.original)}
              className="rounded border text-gray-700 border-semantic-bg-border shadow-sm py-1 px-2 hover:bg-gray-50 font-[Inter-Medium] text-sm"
            >
              View
            </button>
          ) : (
            <>
              <button
                onClick={() => onUpdateClick(info.row.original)}
                className="rounded border text-gray-700 border-semantic-bg-border shadow-sm py-1 px-2 hover:bg-gray-50 font-[Inter-Medium] text-sm"
          >
            Update
          </button>

          <button
            onClick={() => handleOpenDelete(info.row.original)}
            className="rounded py-1 px-2 border border-[#FB3836] text-red-800 bg-red-100 flex items-center justify-center overflow-hidden"
          >
            Delete
          </button>
          </> 
          )
        }
        </div>  
        ) 

      }
    },
  ], [handleOpenDelete])

  const handlePaginationChange = useCallback((updater) => {
    if (typeof updater === 'function') {
      const newState = updater({ pageIndex, pageSize })
      setPageIndex(newState.pageIndex)
      setPageSize(newState.pageSize)
    }
  }, [pageIndex, pageSize])

  const handleGlobalFilterChange = useCallback((e) => {
    setGlobalFilter(e.target.value)
  }, [])

  const handlePageSizeChange = useCallback((e) => {
    setPageSize(Number(e.target.value))
    setPageIndex(0)
  }, [])

  const table = useReactTable({
    data: panelists,
    columns,
    state: {
      globalFilter,
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: handlePaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: true
  })

  const pagination = useMemo(() => ({
    pageIndex,
    pageSize,
    pageCount: Math.ceil(panelists.length / pageSize),
    currentPage: pageIndex + 1,
  }), [pageIndex, pageSize, panelists.length]);

  return (
    <div className="w-full">
      <div className="flex items-center w-full justify-between mb-4">
      <div className="relative w-1/3">
        <input
          type="text"
          value={globalFilter}
          onChange={handleGlobalFilterChange}
          placeholder="Search panelists..."
           className="px-4 w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1">
            <span className="text-sm font-[Inter-Medium] text-gray-600">Show:</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {[5, 10, 20, 30, 40, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
         
          <button 
            onClick={() => setIsPanelistModalOpen(true)}
            className="px-4 py-2 bg-transparent text-sm font-[Inter-Medium] border border-primary-500 text-primary-500 rounded-md hover:bg-primary-100  focus:outline-none focus:ring-2 focus:ring-primary-500 flex items-center gap-2"
          >
            <UserPlus size={16} />
            Add Panelists
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100 border-b border-gray-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-[Inter-Medium] text-gray-700 capitalize tracking-wider"
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
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-4 whitespace-nowrap text-sm font-[Inter-Regular] text-gray-900"
                  >
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
        <div className="text-sm text-gray-600 font-[Inter-Regular]">
          Showing {pagination.pageIndex * pageSize + 1} to{' '}
          {Math.min((pagination.pageIndex + 1) * pageSize, table.getFilteredRowModel().rows.length)}{' '}
          of {table.getFilteredRowModel().rows.length} entries
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 text-sm font-[Inter-Medium] border border-gray-300 rounded-md disabled:opacity-50 transition-colors hover:bg-gray-50"
          >
            Previous
          </button>

          <PaginationButtons 
            table={table}
            currentPage={pagination.currentPage}
            totalPages={pagination.pageCount}
          />

          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 text-sm font-[Inter-Medium] border border-gray-300 rounded-md disabled:opacity-50 transition-colors hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        panelist={selectedPanelist}
        isPending={isPending}
      />

      {/* Panelist Modal */}
      <Dialog open={isPanelistModalOpen} onOpenChange={setIsPanelistModalOpen}>
        <DialogContent className="max-w-[80vh] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Add Panelist</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Search panelist..."
              value={panelistSearchTerm}
              onChange={handlePanelistSearchTermChange}
            />

            {/* Panelist search results */}
            {panelistSearchTerm && (
              isLoadingPanelists ? (
                <div className="text-center py-4 text-gray-600">Loading panelists...</div>
              ) : panelistsData && panelistsData?.panelists?.length > 0 ? (
                <div className="border rounded-md shadow-sm">
                  {panelistsData?.panelists
                    ?.filter(panelist =>
                      panelist.name.toLowerCase().includes(panelistSearchTerm.toLowerCase()) ||
                      panelist.email.toLowerCase().includes(panelistSearchTerm.toLowerCase())
                    )
                    .slice(0, 5)
                    .map(panelist => (
                      <div
                        key={panelist.id}
                        className={`p-3 flex justify-between items-center hover:bg-gray-50 cursor-pointer ${
                          selectedPanelists.some(p => p.id === panelist.id) ? 'bg-primary-50 border-l-4 border-primary-500' : ''
                        }`}
                        onClick={() => handlePanelistSelection(panelist)}
                      >
                        <div>
                          <div className="font-medium text-gray-800">{panelist.name}</div>
                          <div className="text-sm text-gray-500">{panelist.email}</div>
                        </div>
                        {selectedPanelists.some(p => p.id === panelist.id) && (
                          <Icon icon="mdi:check" className="w-5 h-5 text-primary-600" />
                        )}
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-md">No panelists found</div>
              )
            )}

            {/* Manual panelist entry */}
            <div className="border-t pt-4">
              <Label className="text-sm font-[Inter-Regular] mb-2">Add panelist manually</Label>
              <div className="space-y-3">
                <Input
                  type="text"
                  placeholder="Name"
                  value={manualPanelist.name}
                  onChange={handleManualPanelistChange('name')}
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={manualPanelist.email}
                  onChange={handleManualPanelistChange('email')}
                />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleAddManualPanelist}
                  disabled={!manualPanelist.name || !manualPanelist.email}
                >
                  Add to Selected
                </Button>
              </div>
            </div>

            {/* Selected panelists */}
            {selectedPanelists.length > 0 && (
              <div>
                <Label className="text-sm font-[Inter-Regular] mb-2">Selected panelists</Label>
                <div className="space-y-2">
                  {selectedPanelists.map(panelist => (
                    <div key={panelist.id} className="flex justify-between items-center p-2.5 bg-gray-100 rounded-md capitalize">
                      <span className="font-medium text-gray-800">{panelist.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemovePanelist(panelist.id)}
                      >
                        <Icon icon="mdi:close" height={20} width={20} />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={resetPanelistModal}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddPanelists}
              disabled={addPanelistsMutation.isPending || selectedPanelists.length === 0}
            >
              {addPanelistsMutation.isPending ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default GradeProposalPanelistTable