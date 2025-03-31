import { format } from "date-fns";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import React, { useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify-icon/react";
import { useGetProposal } from "../../store/tanstackStore/services/queries";
import GradeProposalTableTabs from "./GradeProposalTableTabs";
import GradeProposalReviewerTable from "./GradeProposalReviewerTable";
import GradeProposalPanelistTable from "./GradeProposalPanelistTable";
import GradeProposalUpdateReviewerMark from "./GradeProposalUpdateReviewerMark";
import GradeProposalUpdatePanelistMark from "./GradeProposalUpdatePanelistMark";
import GradeProposalViewReviewerMark from "./GradeProposalViewReviewerMark";
import GradeProposalViewPanelistMark from "./GradeProposalViewPanelistMark";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { addDefenseDateService, addComplianceReportDateService, updateFieldLetterDateService } from "../../store/tanstackStore/services/api";
import { toast } from "sonner";
import { queryClient } from "../../utils/tanstack";
import GradeProposalGenerateFieldLetter from "./GradeProposalGenerateFieldLetter";

const GradeProposal = () => {
  let navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Reviewers");
  const [isUpdateReviewerDrawerOpen, setIsUpdateReviewerDrawerOpen] = useState(false);
  const [isUpdatePanelistDrawerOpen, setIsUpdatePanelistDrawerOpen] = useState(false);
  const [isViewReviewerDrawerOpen, setIsViewReviewerDrawerOpen] = useState(false);
  const [isViewPanelistDrawerOpen, setIsViewPanelistDrawerOpen] = useState(false);
  const [selectedReviewer, setSelectedReviewer] = useState(null);
  const [selectedPanelist, setSelectedPanelist] = useState(null);
  const [isDefenseDateDialogOpen, setIsDefenseDateDialogOpen] = useState(false);
  const [isComplianceReportDialogOpen, setIsComplianceReportDialogOpen] = useState(false);
  const [isFieldLetterDateDialogOpen, setIsFieldLetterDateDialogOpen] = useState(false);
  const [defenseDate, setDefenseDate] = useState("");
  const [complianceReportDate, setComplianceReportDate] = useState("");
  const [fieldLetterDate, setFieldLetterDate] = useState("");
  const [isReschedule, setIsReschedule] = useState(false);
  const [isFieldLetterDialogOpen, setIsFieldLetterDialogOpen] = useState(false);
  const { id: proposalId } = useParams();
  const { data: proposal, isPending: isLoading, error, refetch:refetchProposal } = useGetProposal(proposalId);

  const addDefenseDateMutation = useMutation({
    mutationFn: ({ proposalId, defenseDate, type }) => addDefenseDateService(proposalId, defenseDate, type),
    onSuccess: () => {
      toast.success("Defense date updated successfully");
      queryClient.resetQueries({ queryKey: ["proposal", proposalId] });
      setIsDefenseDateDialogOpen(false);
      setDefenseDate("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update defense date");
    }
  });

  const addComplianceReportDateMutation = useMutation({
    mutationFn: ({ proposalId, complianceReportDate }) => addComplianceReportDateService(proposalId, complianceReportDate),
    onSuccess: () => {
      toast.success("Compliance report date updated successfully");
      queryClient.resetQueries({ queryKey: ["proposal", proposalId] });
      setIsComplianceReportDialogOpen(false);
      setComplianceReportDate("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update compliance report date");
    }
  });

  const updateFieldLetterDateMutation = useMutation({
    mutationFn: ({ proposalId, fieldLetterDate }) => updateFieldLetterDateService(proposalId, fieldLetterDate),
    onSuccess: () => {
      toast.success("Field letter date updated successfully");
      queryClient.resetQueries({ queryKey: ["proposal", proposalId] });
      setIsFieldLetterDateDialogOpen(false);
      setFieldLetterDate("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update field letter date");
    }
  });

  const handleScheduleDefense = () => {
    setIsReschedule(false);
    setIsDefenseDateDialogOpen(true);
  };

  const handleRescheduleDefense = () => {
    setIsReschedule(true);
    setIsDefenseDateDialogOpen(true);
  };

  const handleDefenseDateSubmit = (e) => {
    e.preventDefault();
    if (!defenseDate) {
      toast.error("Please select a defense date");
      return;
    }
    addDefenseDateMutation.mutate({
      proposalId,
      defenseDate,
      type: isReschedule ? "reschedule" : "schedule"
    });
  };

  const handleComplianceReportDateSubmit = (e) => {
    e.preventDefault();
    if (!complianceReportDate) {
      toast.error("Please select a compliance report date");
      return;
    }
    addComplianceReportDateMutation.mutate({
      proposalId,
      complianceReportDate
    });
  };

  const handleFieldLetterDateSubmit = (e) => {
    e.preventDefault();
    if (!fieldLetterDate) {
      toast.error("Please select a field letter date");
      return;
    }
    updateFieldLetterDateMutation.mutate({
      proposalId,
      fieldLetterDate
    });
  };

  const currentStatus = useMemo(
    () => proposal?.proposal?.statuses?.find((s) => s.isCurrent),
    [proposal?.proposal?.statuses]
  );

  const { totalDays, expectedDays } = useMemo(() => {
    const statusDate = currentStatus?.createdAt
      ? new Date(currentStatus.createdAt)
      : new Date();
    const totalDays = Math.ceil(
      (new Date() - statusDate) / (1000 * 60 * 60 * 24)
    );
    const expectedDays = currentStatus?.definition?.expectedDuration || null;
    return { totalDays, expectedDays };
  }, [currentStatus?.createdAt, currentStatus?.definition?.expectedDuration]);

  const reviewers = useMemo(() => {
    return proposal?.proposal?.reviewers || [];
  }, [proposal?.proposal?.reviewers]);

  const handleReviewerUpdateClick = useCallback((reviewer) => {
    setSelectedReviewer(reviewer);
    setIsUpdateReviewerDrawerOpen(true);
  }, []);

  const handlePanelistUpdateClick = useCallback((panelist) => {
    setSelectedPanelist(panelist);
    setIsUpdatePanelistDrawerOpen(true);
  }, []);

  const handleViewReviewerClick = useCallback((reviewer) => {
    setSelectedReviewer(reviewer);
    setIsViewReviewerDrawerOpen(true);
  }, []);

  const handleViewPanelistClick = useCallback((panelist) => {
    setSelectedPanelist(panelist);
    setIsViewPanelistDrawerOpen(true);
  }, []);

  const hasPassedProposalGraded = useMemo(() => {
    return proposal?.proposal?.statuses?.some(
      status => status.definition.name === "passed-proposal graded"
    );
  }, [proposal?.proposal?.statuses]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-green-900" />
        <div className="text-lg font-[Inter-Medium] text-gray-600">
          {" "}
          Loading proposal data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">Error loading proposal data</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Search Bar */}
      <div className="flex px-6 justify-between items-center border-b border-gray-300 h-[89px]"></div>

      {/* Header */}
      <div className="flex justify-between items-center px-6 py-1">
        <h1 className="text-2xl font-[Inter-Medium]">Proposal</h1>
        <span className="text-sm font-[Inter-Regular] text-gray-500">
          Last login: {format(new Date(), "MM-dd-yyyy hh:mm:ssaa")}
        </span>
      </div>

      <div className="px-6 py-4 mb-4">
        <div className="bg-white p-4 rounded-[10px] shadow-md">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-4 py-2 bg-[#23388F] text-white rounded-[6px] gap-2 hover:bg-blue-600"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <span className="text-lg font-[Inter-SemiBold] capitalize text-gray-900">
                {`${proposal?.proposal?.student?.firstName} ${proposal?.proposal?.student?.lastName}` || "Loading..."}
              </span>
            </div>
          </div>
        </div>
      </div>

{/* Proposal Details */}
      <div className="grid grid-cols-4 px-6">
        <div>
          <h3 className="text-sm font-[Inter-Regular] text-[#626263] mb-1">
            Proposal ID
          </h3>
          <div className="flex gap-2">
            <span className="text-sm font-[Inter-Regular] text-gray-900">
              {proposalId || "Not Available"}
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-[Inter-Regular] text-[#626263] mb-1">
            Defense Date
          </h3>
          <div className="flex items-center gap-4">
            <span className="text-sm font-[Inter-Regular] text-gray-900">
              {proposal?.proposal?.defenseDate 
                ? format(new Date(proposal.proposal.defenseDate), "dd-MMM-yyyy")
                : "Not Scheduled"}
            </span>
            {proposal?.proposal?.defenseDate ? (
              <button
                className="px-2 py-1 text-xs font-[Inter-Medium] text-white bg-accent2-600 rounded hover:bg-accent2-700"
                onClick={() => handleRescheduleDefense()}
              >
                Reschedule
              </button>
            ) : (
              <button 
                className="px-2 py-1 text-xs font-[Inter-Medium] text-white bg-accent2-600 rounded hover:bg-accent2-700"
                onClick={() => handleScheduleDefense()}
              >
                Schedule
              </button>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-[Inter-Regular] text-[#626263] mb-1">
            Current Status
          </h3>
          <span
            style={{
              color: currentStatus?.definition?.color || "#6B7280",
              backgroundColor:
                `${currentStatus?.definition?.color}18` || "#F3F4F6",
              border: `1px solid ${
                currentStatus?.definition?.color || "#6B7280"
              }`,
            }}
            className="inline-flex px-2 py-0.5 rounded-[4px] text-sm font-[Inter-Regular] capitalize"
          >
            {currentStatus?.definition?.name || "Unknown"}
          </span>
        </div>

        <div>
          <h3 className="text-sm font-[Inter-Regular] text-[#626263] mb-1">
            Total Time
          </h3>
          <span className="text-sm font-[Inter-Regular] text-gray-900">
            {totalDays} {expectedDays ? `of ${expectedDays} days` : 'day(s)'}
          </span>
        </div>
      </div>

{/* Compliance Report and Letter to Field */}
      {hasPassedProposalGraded && (
        <div className="grid grid-cols-4 px-6 mt-8">
          <div>
            <h3 className="text-sm font-[Inter-Regular] text-[#626263] mb-1">
              Compliance Report
            </h3>
            <div className="flex gap-4">
              <span className="text-sm font-[Inter-Regular] text-gray-900">
                {proposal?.proposal?.complianceReportDate 
                  ? format(new Date(proposal.proposal.complianceReportDate), "dd-MMM-yyyy")
                  : "Not Available"}
              </span>
              <button
                className="px-2 py-1 text-xs font-[Inter-Medium] text-white bg-accent2-600 rounded hover:bg-accent2-700"
                onClick={() => setIsComplianceReportDialogOpen(true)}
              >
                {proposal?.proposal?.complianceReportDate ? "Update" : "Add Date"}
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-[Inter-Regular] text-[#626263] mb-1">
              Letter to Field
            </h3>
            <div className="flex items-center gap-4">
              <span className="text-sm font-[Inter-Regular] text-gray-900">
                {proposal?.proposal?.letterToField 
                  ? "Available"
                  : "Not Available"}
              </span>
              <button 
                className="px-2 py-1 text-xs font-[Inter-Medium] text-white bg-accent2-600 rounded hover:bg-accent2-700"
                onClick={() => setIsFieldLetterDialogOpen(true)}
              >
                Generate
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-[Inter-Regular] text-[#626263] mb-1">
              Field Letter Date
            </h3>
            <div className="flex items-center gap-4">
              <span className="text-sm font-[Inter-Regular] text-gray-900">
                {proposal?.proposal?.fieldLetterDate 
                  ? format(new Date(proposal.proposal.fieldLetterDate), "dd-MMM-yyyy")
                  : "Not Available"}
              </span>
              <button 
                className="px-2 py-1 text-xs font-[Inter-Medium] text-white bg-accent2-600 rounded hover:bg-accent2-700"
                onClick={() => setIsFieldLetterDateDialogOpen(true)}
              >
                {proposal?.proposal?.fieldLetterDate ? "Update" : "Add Date"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white py-4 rounded-lg shadow-md mx-6 mb-8">
        <GradeProposalTableTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="px-4 mt-4">
          {activeTab === "Reviewers" ? (
            <GradeProposalReviewerTable reviewers={reviewers} proposalId={proposalId} refetchProposal={refetchProposal} onUpdateClick={handleReviewerUpdateClick} reviewGrades={proposal?.proposal?.reviewGrades} onViewClick={handleViewReviewerClick} />
          ) : (
            <GradeProposalPanelistTable panelists={proposal?.proposal?.panelists || []} proposalId={proposalId} onUpdateClick={handlePanelistUpdateClick} defenseGrades={proposal?.proposal?.defenseGrades} onViewClick={handleViewPanelistClick} />
          )}
        </div>
      </div>

      {/** Update Reviewer Mark */}
      <GradeProposalUpdateReviewerMark isOpen={isUpdateReviewerDrawerOpen} onClose={() => setIsUpdateReviewerDrawerOpen(false)} reviewer={selectedReviewer} proposalId={proposalId} proposal={proposal?.proposal} />

      {/** View Reviewer Mark */}
      <GradeProposalViewReviewerMark isOpen={isViewReviewerDrawerOpen} onClose={() => setIsViewReviewerDrawerOpen(false)} reviewer={selectedReviewer} proposalId={proposalId} proposal={proposal?.proposal} />

      {/** Update Panelist Mark */}
      <GradeProposalUpdatePanelistMark isOpen={isUpdatePanelistDrawerOpen} onClose={() => setIsUpdatePanelistDrawerOpen(false)} panelist={selectedPanelist} proposalId={proposalId} proposal={proposal} />

      {/** View Panelist Mark */}
      <GradeProposalViewPanelistMark isOpen={isViewPanelistDrawerOpen} onClose={() => setIsViewPanelistDrawerOpen(false)} panelist={selectedPanelist} proposalId={proposalId} proposal={proposal?.proposal} />

      {/** Defense Date Dialog */}
      <Dialog open={isDefenseDateDialogOpen} onOpenChange={setIsDefenseDateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold leading-6">
              {isReschedule ? "Reschedule Defense Date" : "Schedule Defense Date"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDefenseDateSubmit} className="grid gap-6 py-4">
            <div className="grid gap-2 ">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Defense Date
              </label>
              <input
                type="datetime-local"
                value={defenseDate}
                onChange={(e) => setDefenseDate(e.target.value)}
                className=" h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsDefenseDateDialogOpen(false)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addDefenseDateMutation.isPending}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                {addDefenseDateMutation.isPending ? "Saving..." : "Save"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/** Compliance Report Date Dialog */}
      <Dialog open={isComplianceReportDialogOpen} onOpenChange={setIsComplianceReportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold leading-6">
              Add Compliance Report Date
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleComplianceReportDateSubmit} className="grid gap-6 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Compliance Report Date
              </label>
              <input
                type="date"
                value={complianceReportDate}
                onChange={(e) => setComplianceReportDate(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsComplianceReportDialogOpen(false)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addComplianceReportDateMutation.isPending}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                {addComplianceReportDateMutation.isPending ? "Saving..." : "Save"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/** Field Letter Date Dialog */}
      <Dialog open={isFieldLetterDateDialogOpen} onOpenChange={setIsFieldLetterDateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold leading-6">
              {proposal?.proposal?.fieldLetterDate ? "Update Field Letter Date" : "Add Field Letter Date"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFieldLetterDateSubmit} className="grid gap-6 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Field Letter Date
              </label>
              <input
                type="date"
                value={fieldLetterDate}
                onChange={(e) => setFieldLetterDate(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsFieldLetterDateDialogOpen(false)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateFieldLetterDateMutation.isPending}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                {updateFieldLetterDateMutation.isPending ? "Saving..." : "Save"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/** Field Letter Dialog */}
      <GradeProposalGenerateFieldLetter isOpen={isFieldLetterDialogOpen} onClose={() => setIsFieldLetterDialogOpen(false)} proposalId={proposalId} proposal={proposal?.proposal} />
    </div>  
  );
};

export default GradeProposal;
