import React, { useState, useMemo, useCallback, memo } from 'react'
import { format } from 'date-fns'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/react-table'
import { UserPlus, Loader2, Search, Plus, X } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deletePanelistService, addNewPanelistService, recordVivaVerdictService, scheduleVivaService } from '../../store/tanstackStore/services/api'
import { toast } from 'sonner'
import { Icon } from "@iconify-icon/react"
import { useGetAllPanelists, useGetBookVivas } from "../../store/tanstackStore/services/queries"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useNavigate } from 'react-router-dom'

// Viva status constants
const VIVA_STATUS = {
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  RESCHEDULED: 'RESCHEDULED'
};

// Viva verdict options
const VIVA_VERDICTS = {
  PASS: 'PASS',
  PASS_WITH_MINOR_CORRECTIONS: 'PASS_WITH_MINOR_CORRECTIONS',
  PASS_WITH_MAJOR_CORRECTIONS: 'PASS_WITH_MAJOR_CORRECTIONS',
  FAIL: 'FAIL',
  RESCHEDULE: 'RESCHEDULE'
};

const getStatusColor = (status) => {
  switch (status) {
    case VIVA_STATUS.SCHEDULED:
      return 'bg-blue-100 text-blue-800';
    case VIVA_STATUS.COMPLETED:
      return 'bg-green-100 text-green-800';
    case VIVA_STATUS.FAILED:
      return 'bg-red-100 text-red-800';
    case VIVA_STATUS.RESCHEDULED:
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const GradeBookVivaTable = ({ 
  panelists, 
  bookId, 
  refetchBook, 
  onUpdateClick, 
  onViewClick,
  defenseGrades
}) => {
  const navigate = useNavigate();
  const [isScheduleVivaOpen, setIsScheduleVivaOpen] = useState(false);
  const [isVerdictDialogOpen, setIsVerdictDialogOpen] = useState(false);
  const [selectedVivaId, setSelectedVivaId] = useState(null);
  const [verdict, setVerdict] = useState('');
  const [comments, setComments] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [selectedPanelists, setSelectedPanelists] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddPanelistMode, setIsAddPanelistMode] = useState(false);
  const [newPanelist, setNewPanelist] = useState({ name: '', email: '', institution: '' });
  const [externalMark, setExternalMark] = useState('');
  const [internalMark, setInternalMark] = useState('');
  
  // Fetch all available panelists
  const { data: allPanelists, isLoading: isPanelistsLoading } = useGetAllPanelists();
  
  // Fetch viva history for the book
  const { data: vivaData, isLoading: isVivaLoading } = useGetBookVivas(bookId);
  const vivaHistory = vivaData?.vivas || [];
  
  const queryClient = useQueryClient();

  // Filter panelists based on search term
  const filteredPanelists = useMemo(() => {
    if (!allPanelists?.panelists) return [];
    return searchTerm 
      ? allPanelists.panelists.filter(p => 
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
          p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.institution && p.institution.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      : allPanelists.panelists;
  }, [allPanelists, searchTerm]);

  // Mutation for recording viva verdict
  const recordVerdictMutation = useMutation({
    mutationFn: async ({ vivaId, verdict, comments, externalMark, internalMark }) => {
      return await recordVivaVerdictService(vivaId, {verdict, comments, externalMark, internalMark});
    },
    onSuccess: () => {
      toast.success('Viva verdict recorded successfully');
      queryClient.invalidateQueries(['book', bookId]);
      queryClient.invalidateQueries(['book-vivas', bookId]);
      setIsVerdictDialogOpen(false);
      refetchBook();
    },
    onError: (error) => {
      toast.error(`Failed to record verdict: ${error.message}`);
    }
  });

  // Mutation for scheduling/rescheduling viva
  const scheduleVivaMutation = useMutation({
    mutationFn: async ({ date, panelists, attempt }) => {
      return await scheduleVivaService(bookId, date, panelists, attempt);
    },
    onSuccess: () => {
      toast.success('Viva scheduled successfully');
      queryClient.invalidateQueries(['book', bookId]);
      queryClient.invalidateQueries(['book-vivas', bookId]);
      setIsScheduleVivaOpen(false);
      refetchBook();
    },
    onError: (error) => {
      toast.error(`Failed to schedule viva: ${error.message}`);
    }
  });

  // Mutation for adding a new panelist
  const addPanelistMutation = useMutation({
    mutationFn: async (panelistData) => {
      return await addNewPanelistService(panelistData);
    },
    onSuccess: (data) => {
      toast.success('Panelist added successfully');
      queryClient.invalidateQueries(['panelists']);
      queryClient.invalidateQueries(['book', bookId]);
      setNewPanelist({ name: '', email: '', institution: '' });
      setIsAddPanelistMode(false);
      // Add the newly created panelist to selected panelists
      if (data && data.id) {
        setSelectedPanelists([...selectedPanelists, data.id]);
      }
    },
    onError: (error) => {
      toast.error(`Failed to add panelist: ${error.message}`);
    }
  });

  const handleRecordVerdict = (vivaId) => {
    setSelectedVivaId(vivaId);
    setVerdict('');
    setComments('');
    setExternalMark('');
    setInternalMark('');
    setIsVerdictDialogOpen(true);
  };

  const handleVerdictSubmit = (e) => {
    e.preventDefault();
    recordVerdictMutation.mutate({
      vivaId: selectedVivaId,
      verdict,
      comments,
      externalMark: externalMark ? parseFloat(externalMark) : undefined,
      internalMark: internalMark ? parseFloat(internalMark) : undefined
    });
  };

  const handleScheduleViva = (e) => {
    e.preventDefault();
    const attempt = vivaHistory?.length ? vivaHistory.length + 1 : 1;
    scheduleVivaMutation.mutate({
      date: scheduledDate,
      panelists: selectedPanelists,
      attempt
    });
  };

  const handleAddNewPanelist = (e) => {
    e.preventDefault();
    if (!newPanelist.name || !newPanelist.email) {
      toast.error('Name and email are required');
      return;
    }
    addPanelistMutation.mutate(newPanelist);
  };

  // Define columns for TanStack Table
  const columns = useMemo(() => [
    {
      accessorKey: 'attempt',
      header: 'Attempt',
      cell: ({ row }) => <span>{row.index + 1}</span>
    },
    {
      accessorKey: 'scheduledDate',
      header: 'Date',
      cell: ({ row }) => format(new Date(row.original.scheduledDate), "dd-MMM-yyyy")
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-sm font-[Inter-Medium] text-xs ${getStatusColor(row.original.status)}`}>
          {row.original.status}
        </span>
      )
    },
    {
      accessorKey: 'verdict',
      header: 'Verdict',
      cell: ({ row }) => row.original.verdict || '-'
    },
    {
      accessorKey: 'panelists',
      header: 'Panelists',
      cell: ({ row }) => (
        <div className="max-w-max">
          {row.original.panelists?.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {row.original.panelists.map((panelist, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 rounded-sm font-[Inter-Medium] text-xs">
                  {panelist.name}
                </span>
              ))}
            </div>
          ) : (
            <span className="text-gray-400">No panelists</span>
          )}
        </div>
      )
    },
    {
      accessorKey: 'marks',
      header: 'Marks',
      cell: ({ row }) => {
        const viva = row.original;
        if (!viva.externalMark && !viva.internalMark) return '-';
        
        return (
          <div className="space-y-1">
            {viva.externalMark !== undefined && (
              <div className="text-sm">
                <span className="font-medium">External:</span> {viva.externalMark}% 
                <span className="text-xs text-gray-500 ml-1">
                  (Final: {viva.finalExternalMark?.toFixed(1)}%)
                </span>
              </div>
            )}
            {viva.internalMark !== undefined && (
              <div className="text-sm">
                <span className="font-medium">Internal:</span> {viva.internalMark}%
                <span className="text-xs text-gray-500 ml-1">
                  (Final: {viva.finalInternalMark?.toFixed(1)}%)
                </span>
              </div>
            )}
          </div>
        );
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        row.original.status === VIVA_STATUS.SCHEDULED && (
          <button
            onClick={() => handleRecordVerdict(row.original.id)}
            className="text-primary-600 font-[Inter-Medium] border border-primary-600 rounded-sm px-2 py-1  hover:text-primary-700"
          >
            Record Verdict
          </button>
        )
      )
    }
  ], []);

  // Initialize TanStack Table
  const table = useReactTable({
    data: vivaHistory || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });


  const toggleScheduleDialog = useCallback(() => {
   
    navigate(`/grades/book/schedule-viva/${bookId}`);
  }, []);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-[Inter-Medium]">Viva Details</h3>
        <button
          className="px-3 py-1.5 text-sm font-[Inter-Medium] text-white bg-primary-600 rounded hover:bg-primary-700"
          onClick={toggleScheduleDialog}
        >
          {vivaHistory?.length > 0 ? 'Reschedule Viva' : 'Schedule Viva'}
        </button>
      </div>

      {/* Viva History Table using TanStack Table */}
      <div className="mt-4 rounded-md border">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id}
                    className="px-4 py-2 text-left text-sm font-[Inter-Regular] text-gray-900"
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
          <tbody className="divide-y divide-gray-200">
            {isVivaLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-4 text-sm text-center">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-400" />
                </td>
              </tr>
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-2 text-sm font-[Inter-Regular]">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-4 text-sm font-[Inter-Regular] text-center text-gray-500">
                  No viva history available
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination Controls */}
        {vivaHistory?.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="flex items-center gap-2">
              <button
                className="px-2 py-1 text-sm border rounded disabled:opacity-50"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </button>
              <button
                className="px-2 py-1 text-sm border rounded disabled:opacity-50"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </button>
            </div>
            <span className="text-sm text-gray-700">
              Page {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </span>
          </div>
        )}
      </div>

      {/* Schedule Viva Dialog */}
      <Dialog open={isScheduleVivaOpen} onOpenChange={setIsScheduleVivaOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold leading-6">
              {vivaHistory?.length > 0 ? 'Reschedule Viva' : 'Schedule Viva'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleScheduleViva} className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="vivaDate">Viva Date</Label>
              <Input
                id="vivaDate"
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label>Select Panelists</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`px-2 py-1 text-xs rounded ${!isAddPanelistMode ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setIsAddPanelistMode(false)}
                  >
                    <Search className="h-3 w-3 inline mr-1" />
                    Search
                  </button>
                  <button
                    type="button"
                    className={`px-2 py-1 text-xs rounded ${isAddPanelistMode ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => setIsAddPanelistMode(true)}
                  >
                    <Plus className="h-3 w-3 inline mr-1" />
                    Add New
                  </button>
                </div>
              </div>
              
              {!isAddPanelistMode ? (
                <>
                  <div className="relative mb-2">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search panelists..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  
                  <div className="max-h-[200px] overflow-y-auto border rounded-md p-2">
                    {isPanelistsLoading ? (
                      <div className="flex justify-center items-center py-4">
                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                      </div>
                    ) : filteredPanelists.length > 0 ? (
                      filteredPanelists.map(panelist => (
                        <div key={panelist.id} className="flex items-center gap-2 py-1 hover:bg-gray-50 px-2 rounded">
                          <input
                            type="checkbox"
                            id={`panelist-${panelist.id}`}
                            checked={selectedPanelists.includes(panelist.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPanelists([...selectedPanelists, panelist.id]);
                              } else {
                                setSelectedPanelists(selectedPanelists.filter(id => id !== panelist.id));
                              }
                            }}
                          />
                          <label htmlFor={`panelist-${panelist.id}`} className="text-sm flex-1 cursor-pointer">
                            <div className="font-medium">{panelist.name}</div>
                            <div className="text-xs text-gray-500">{panelist.email}</div>
                            {panelist.institution && (
                              <div className="text-xs text-gray-500">{panelist.institution}</div>
                            )}
                          </label>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 py-2 text-center">
                        {searchTerm ? 'No panelists match your search' : 'No panelists available'}
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="border rounded-md p-4">
                  <h4 className="text-sm font-medium mb-3">Add New Panelist</h4>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="panelistName" className="text-xs">Name *</Label>
                      <Input
                        id="panelistName"
                        value={newPanelist.name}
                        onChange={(e) => setNewPanelist({...newPanelist, name: e.target.value})}
                        placeholder="Enter panelist name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="panelistEmail" className="text-xs">Email *</Label>
                      <Input
                        id="panelistEmail"
                        type="email"
                        value={newPanelist.email}
                        onChange={(e) => setNewPanelist({...newPanelist, email: e.target.value})}
                        placeholder="Enter panelist email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="panelistInstitution" className="text-xs">Institution</Label>
                      <Input
                        id="panelistInstitution"
                        value={newPanelist.institution}
                        onChange={(e) => setNewPanelist({...newPanelist, institution: e.target.value})}
                        placeholder="Enter institution (optional)"
                      />
                    </div>
                    <Button 
                      type="button" 
                      onClick={handleAddNewPanelist}
                      disabled={addPanelistMutation.isPending || !newPanelist.name || !newPanelist.email}
                      className="w-full"
                    >
                      {addPanelistMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add Panelist
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
              
              {selectedPanelists.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium mb-1">Selected Panelists ({selectedPanelists.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedPanelists.map(id => {
                      const panelist = allPanelists?.panelists?.find(p => p.id === id);
                      return panelist ? (
                        <div key={id} className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs flex items-center">
                          {panelist.name}
                          <button
                            type="button"
                            onClick={() => setSelectedPanelists(selectedPanelists.filter(pId => pId !== id))}
                            className="ml-1 text-primary-600 hover:text-primary-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="submit"
                disabled={!scheduledDate || selectedPanelists.length === 0 || scheduleVivaMutation.isPending}
              >
                {scheduleVivaMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  'Schedule Viva'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Verdict Dialog */}
      <Dialog open={isVerdictDialogOpen} onOpenChange={setIsVerdictDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold leading-6">
              Record Viva Verdict
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleVerdictSubmit} className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label>Verdict</Label>
              <select
                value={verdict}
                onChange={(e) => setVerdict(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Select a verdict</option>
                {Object.entries(VIVA_VERDICTS).map(([key, value]) => (
                  <option key={key} value={value}>{value.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>External Mark (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={externalMark}
                  onChange={(e) => setExternalMark(e.target.value)}
                  placeholder="Enter external mark"
                  className="h-10"
                />
                {externalMark && (
                  <p className="text-xs font-[Inter-Medium] text-gray-500">
                    Final mark: {(parseFloat(externalMark) * 0.2).toFixed(1)}%
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label>Internal Mark (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={internalMark}
                  onChange={(e) => setInternalMark(e.target.value)}
                  placeholder="Enter internal mark"
                  className="h-10"
                />
                {internalMark && (
                  <p className="text-xs font-[Inter-Medium] text-gray-500">
                    Final mark: {(parseFloat(internalMark) * 0.2).toFixed(1)}%
                  </p>
                )}
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label>Comments (Optional)</Label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Enter any comments or recommendations..."
              />
            </div>

            <DialogFooter>
              <Button
                type="submit"
                disabled={!verdict || recordVerdictMutation.isPending}
              >
                {recordVerdictMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Recording...
                  </>
                ) : (
                  'Record Verdict'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default GradeBookVivaTable