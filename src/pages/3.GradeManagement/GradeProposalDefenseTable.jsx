import React, { useState, useMemo, useCallback } from 'react'
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
import { addNewPanelistService, recordProposalDefenseVerdictService, scheduleProposalDefenseService } from '../../store/tanstackStore/services/api'
import { toast } from 'sonner'
import { Icon } from "@iconify-icon/react"
import { useGetAllPanelists, useGetProposalDefenses } from "../../store/tanstackStore/services/queries"
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
import { useParams } from 'react-router-dom';
// Defense status constants
const DEFENSE_STATUS = {
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  RESCHEDULED: 'RESCHEDULED'
};

// Defense verdict options
const DEFENSE_VERDICTS = {
  PASS: 'PASS',
  PASS_WITH_MINOR_CORRECTIONS: 'PASS_WITH_MINOR_CORRECTIONS',
  PASS_WITH_MAJOR_CORRECTIONS: 'PASS_WITH_MAJOR_CORRECTIONS',
  FAIL: 'FAIL',
  RESCHEDULE: 'RESCHEDULE'
};

const getStatusColor = (status) => {
  switch (status) {
    case DEFENSE_STATUS.SCHEDULED:
      return 'bg-blue-100 text-blue-800';
    case DEFENSE_STATUS.COMPLETED:
      return 'bg-green-100 text-green-800';
    case DEFENSE_STATUS.FAILED:
      return 'bg-red-100 text-red-800';
    case DEFENSE_STATUS.RESCHEDULED:
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const GradeProposalDefenseTable = ({ 
  panelists, 
  
  refetchProposal, 
  onUpdateClick, 
  onViewClick 
}) => {
  const { id: proposalId } = useParams();

  console.log(proposalId);
  const [isScheduleDefenseOpen, setIsScheduleDefenseOpen] = useState(false);
  const [isVerdictDialogOpen, setIsVerdictDialogOpen] = useState(false);
  const [selectedDefenseId, setSelectedDefenseId] = useState(null);
  const [verdict, setVerdict] = useState('');
  const [comments, setComments] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [selectedPanelists, setSelectedPanelists] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddPanelistMode, setIsAddPanelistMode] = useState(false);
  const [newPanelist, setNewPanelist] = useState({ name: '', email: '', institution: '' });
  
  // Fetch all available panelists
  const { data: allPanelists, isLoading: isPanelistsLoading } = useGetAllPanelists();
  
  // Fetch defense history for the proposal
  const { data: defenseData, isLoading: isDefenseLoading } = useGetProposalDefenses();

  console.log(defenseData?.proposalDefenses);
  
  const queryClient = useQueryClient();

  // Filter defense history for the current proposal - memoized to avoid recalculation
  const defenseHistory = useMemo(() => 
    defenseData?.proposalDefenses?.filter(defense => defense.proposalId === proposalId) || [],
    [defenseData?.proposalDefenses, proposalId]
  );

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

  // Mutation for recording defense verdict
  const recordVerdictMutation = useMutation({
    mutationFn: async ({ defenseId, verdict, comments }) => {
      return await recordProposalDefenseVerdictService(defenseId, verdict, comments);
    },
    onSuccess: () => {
      toast.success('Defense verdict recorded successfully');
      queryClient.resetQueries(['proposal', proposalId]);
      queryClient.resetQueries(['proposal-defenses']);
      setIsVerdictDialogOpen(false);
    //   refetchProposal();
    },
    onError: (error) => {
      toast.error(`Failed to record verdict: ${error.message}`);
    }
  });

  // Mutation for scheduling/rescheduling defense
  const scheduleDefenseMutation = useMutation({
    mutationFn: async ({ date, panelists }) => {
      return await scheduleProposalDefenseService(proposalId, date, panelists);
    },
    onSuccess: () => {
      toast.success('Defense scheduled successfully');
      queryClient.resetQueries(['proposal', proposalId]);
      queryClient.resetQueries(['proposal-defenses']);
      setIsScheduleDefenseOpen(false);
    //   refetchProposal();
    },
    onError: (error) => {
      toast.error(`Failed to schedule defense: ${error.message}`);
    }
  });

  // Mutation for adding a new panelist
  const addPanelistMutation = useMutation({
    mutationFn: async (panelistData) => {
      return await addNewPanelistService(panelistData);
    },
    onSuccess: (data) => {
      toast.success('Panelist added successfully');
      queryClient.resetQueries(['panelists']);
      queryClient.resetQueries(['proposal', proposalId]);
      setNewPanelist({ name: '', email: '', institution: '' });
      setIsAddPanelistMode(false);
      // Add the newly created panelist to selected panelists
      if (data && data.id) {
        setSelectedPanelists(prev => [...prev, data.id]);
      }
    },
    onError: (error) => {
      toast.error(`Failed to add panelist: ${error.message}`);
    }
  });

  const handleRecordVerdict = useCallback((defenseId) => {
    setSelectedDefenseId(defenseId);
    setVerdict('');
    setComments('');
    setIsVerdictDialogOpen(true);
  }, []);

  const handleVerdictSubmit = useCallback((e) => {
    e.preventDefault();
    recordVerdictMutation.mutate({
      defenseId: selectedDefenseId,
      verdict,
      comments
    });
  }, [recordVerdictMutation, selectedDefenseId, verdict, comments]);

  const handleScheduleDefense = useCallback((e) => {
    e.preventDefault();
    // console.log(scheduledDate, selectedPanelists);
    scheduleDefenseMutation.mutate({
      date: scheduledDate,
      panelists: selectedPanelists
    });
  }, [scheduleDefenseMutation, scheduledDate, selectedPanelists]);

  const handleAddNewPanelist = useCallback((e) => {
    e.preventDefault();
    if (!newPanelist.name || !newPanelist.email) {
      toast.error('Name and email are required');
      return;
    }
    addPanelistMutation.mutate(newPanelist);
  }, [addPanelistMutation, newPanelist]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const toggleAddPanelistMode = useCallback((mode) => {
    setIsAddPanelistMode(mode);
  }, []);

  const handlePanelistSelection = useCallback((id, isChecked) => {
    setSelectedPanelists(prev => 
      isChecked 
        ? [...prev, id] 
        : prev.filter(pId => pId !== id)
    );
  }, []);

  const handleRemovePanelist = useCallback((id) => {
    setSelectedPanelists(prev => prev.filter(pId => pId !== id));
  }, []);

  const updateNewPanelist = useCallback((field, value) => {
    setNewPanelist(prev => ({...prev, [field]: value}));
  }, []);

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
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        row.original.status === DEFENSE_STATUS.SCHEDULED && (
          <button
            onClick={() => handleRecordVerdict(row.original.id)}
            className="text-primary-600 font-[Inter-Medium] border border-primary-600 rounded-sm px-2 py-1 hover:text-primary-700"
          >
            Record Verdict
          </button>
        )
      )
    }
  ], [handleRecordVerdict]);

  // Initialize TanStack Table
  const table = useReactTable({
    data: defenseHistory,
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
    setIsScheduleDefenseOpen(prev => !prev);
  }, []);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-[Inter-Medium]">Defense Details</h3>
        <button
          className="px-3 py-1.5 text-sm font-[Inter-Medium] text-white bg-primary-600 rounded hover:bg-primary-700"
          onClick={toggleScheduleDialog}
        >
          {defenseHistory?.length > 0 ? 'Reschedule Defense' : 'Schedule Defense'}
        </button>
      </div>

      {/* Defense History Table using TanStack Table */}
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
            {isDefenseLoading ? (
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
                  No defense history available
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination Controls */}
        {defenseHistory?.length > 0 && (
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

      {/* Schedule Defense Dialog */}
      <Dialog open={isScheduleDefenseOpen} onOpenChange={setIsScheduleDefenseOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold leading-6">
              {defenseHistory?.length > 0 ? 'Reschedule Defense' : 'Schedule Defense'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleScheduleDefense} className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="defenseDate">Defense Date</Label>
              <Input
                id="defenseDate"
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
                    onClick={() => toggleAddPanelistMode(false)}
                  >
                    <Search className="h-3 w-3 inline mr-1" />
                    Search
                  </button>
                  <button
                    type="button"
                    className={`px-2 py-1 text-xs rounded ${isAddPanelistMode ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => toggleAddPanelistMode(true)}
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
                      onChange={handleSearchChange}
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
                            onChange={(e) => handlePanelistSelection(panelist.id, e.target.checked)}
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
                        onChange={(e) => updateNewPanelist('name', e.target.value)}
                        placeholder="Enter panelist name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="panelistEmail" className="text-xs">Email *</Label>
                      <Input
                        id="panelistEmail"
                        type="email"
                        value={newPanelist.email}
                        onChange={(e) => updateNewPanelist('email', e.target.value)}
                        placeholder="Enter panelist email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="panelistInstitution" className="text-xs">Institution</Label>
                      <Input
                        id="panelistInstitution"
                        value={newPanelist.institution}
                        onChange={(e) => updateNewPanelist('institution', e.target.value)}
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
                            onClick={() => handleRemovePanelist(id)}
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
                disabled={!scheduledDate || selectedPanelists.length === 0 || scheduleDefenseMutation.isPending}
              >
                {scheduleDefenseMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  'Schedule Defense'
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
              Record Defense Verdict
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
                {Object.entries(DEFENSE_VERDICTS).map(([key, value]) => (
                  <option key={key} value={value}>{value.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            
            <div className="grid gap-2">
              <Label>Comments</Label>
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

export default React.memo(GradeProposalDefenseTable)