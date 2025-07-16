import { format } from "date-fns";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import React, { useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify-icon/react";
import { useGetProposal } from "../../store/tanstackStore/services/queries";
import GradeProposalTableTabs from "./GradeProposalTableTabs";
import GradeProposalReviewerTable from "./GradeProposalReviewerTable";
import GradeProposalViewReviewerMark from "./GradeProposalViewReviewerMark";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { addComplianceReportDateService, updateEthicsCommitteeDateService, updateFieldLetterDateService } from "../../store/tanstackStore/services/api";
import { toast } from "sonner";
import { queryClient } from "../../utils/tanstack";
import GradeProposalGenerateFieldLetter from "./GradeProposalGenerateFieldLetter";
import GradeProposalDefenseTable from "./GradeProposalDefenseTable";
import GradeProposalDefenseReport from "./GradeProposalDefenseReport";
// import GradeProposalReportsTable from "./GradeProposalReportsTable";

const GradeProposal = () => {
  let navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Reviewers");
  const [isUpdateReviewerDrawerOpen, setIsUpdateReviewerDrawerOpen] = useState(false);
  const [isViewReviewerDrawerOpen, setIsViewReviewerDrawerOpen] = useState(false);
  const [selectedReviewer, setSelectedReviewer] = useState(null);
  const [isComplianceReportDialogOpen, setIsComplianceReportDialogOpen] = useState(false);
  const [isFieldLetterDateDialogOpen, setIsFieldLetterDateDialogOpen] = useState(false);
  (false);
  const [isEthicsCommitteeDialogOpen, setIsEthicsCommitteeDialogOpen] = useState(false);
  // const [isDefenseReportDialogOpen, setIsDefenseReportDialogOpen] = useState(false);
  const [complianceReportDate, setComplianceReportDate] = useState("");
  const [fieldLetterDate, setFieldLetterDate] = useState("");
  const [ethicsCommitteeDate, setEthicsCommitteeDate] = useState("");
  const [isFieldLetterDialogOpen, setIsFieldLetterDialogOpen] = useState(false);
  const { id: proposalId } = useParams();
  const { data: proposal, isPending: isLoading, error, refetch:refetchProposal } = useGetProposal(proposalId);

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

  const updateEthicsCommitteeDateMutation = useMutation({
    mutationFn: ({ proposalId, ethicsCommitteeDate }) => updateEthicsCommitteeDateService(proposalId, ethicsCommitteeDate),
    onSuccess: () => {
      toast.success("Ethics committee date updated successfully");
      queryClient.resetQueries({ queryKey: ["proposal", proposalId] });
      setIsEthicsCommitteeDialogOpen(false);
      setEthicsCommitteeDate("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update ethics committee date");
    }
  });

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

  const isProposalActive = useMemo(
    () => !!proposal?.proposal?.isCurrent,
    [proposal?.proposal?.isCurrent]
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
    if (!isProposalActive) {
      toast.error("Cannot update reviewers for inactive proposals");
      return;
    }
    setSelectedReviewer(reviewer);
    setIsUpdateReviewerDrawerOpen(true);
  }, [isProposalActive]);



  const handleViewReviewerClick = useCallback((reviewer) => {
    setSelectedReviewer(reviewer);
    setIsViewReviewerDrawerOpen(true);
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
      <div className="flex px-6 justify-between items-center border-b border-gray-300 h-[89px]">
        <p className="text-sm font-[Inter-SemiBold]  text-gray-900">Research Centre Portal</p>
      <p className="text-sm font-[Inter-Medium]  text-gray-600">Digital Research Information Management System</p>
      </div>

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
            {!isProposalActive && (
              <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-md text-sm">
                This proposal is inactive. Some actions are disabled.
              </div>
            )}
          </div>
        </div>
      </div>

{/* Proposal Details */}
      <div className="grid grid-cols-3 px-6">
        <div>
          <h3 className="text-sm font-[Inter-Regular] text-[#626263] mb-1">
            Proposal ID
          </h3>
          <div className="flex gap-2">
          <span className="text-sm text-primary-500 font-[Inter-Medium] ">
              {proposal?.proposal?.proposalCode}
            </span>
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
        <div className="grid grid-cols-3 px-6 mt-8">
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

          {/* <div>
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
          </div> */}

<div>
            <h3 className="text-sm font-[Inter-Regular] text-[#626263] mb-1">
               Letter to Ethics Committee 
            </h3>
            <div className="flex items-center gap-4">
              <span className="text-sm font-[Inter-Regular] text-gray-900">
                {proposal?.proposal?.ethicsCommitteeDate 
                  ? format(new Date(proposal.proposal.ethicsCommitteeDate), "dd-MMM-yyyy")
                  : "Not Available"}
              </span>
              <button 
                className={`px-2 py-1 text-xs font-[Inter-Medium] text-white rounded ${isProposalActive ? 'bg-accent2-600 hover:bg-accent2-700' : 'bg-gray-400 cursor-not-allowed'}`}
                onClick={() => isProposalActive ? setIsEthicsCommitteeDialogOpen(true) : toast.error("Cannot update field letter date for inactive proposals")}
                disabled={!isProposalActive}
              >
                {proposal?.proposal?.ethicsCommitteeDate ? "Update" : "Add Date"}
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
                className={`px-2 py-1 text-xs font-[Inter-Medium] text-white rounded ${isProposalActive ? 'bg-accent2-600 hover:bg-accent2-700' : 'bg-gray-400 cursor-not-allowed'}`}
                onClick={() => isProposalActive ? setIsFieldLetterDateDialogOpen(true) : toast.error("Cannot update field letter date for inactive proposals")}
                disabled={!isProposalActive}
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
          {activeTab === "Reviewers" && (
            <GradeProposalReviewerTable 
              reviewers={reviewers} 
              proposalId={proposalId} 
              refetchProposal={refetchProposal} 
              onUpdateClick={handleReviewerUpdateClick} 
              reviewGrades={proposal?.proposal?.reviewGrades} 
              onViewClick={handleViewReviewerClick} 
              isProposalActive={isProposalActive}
            />
          )}
          
          {activeTab === "Proposal defense" && (
            <GradeProposalDefenseTable 
             
              proposalId={proposalId} 
              isProposalActive={isProposalActive}
            
              
            />
          )}


{/* 
needs to be removed for cleanups
{activeTab === "Reports" && (
  <GradeProposalReportsTable
    reports={proposal?.proposal?.defenseReports || []}
    isLoading={isLoading}
    onGenerateReportClick={() => setIsDefenseReportDialogOpen(true)}
  />
)} */}
        </div>
      </div>

      {/** Update Reviewer Mark */}
      {/* <GradeProposalUpdateReviewerMark isOpen={isUpdateReviewerDrawerOpen} onClose={() => setIsUpdateReviewerDrawerOpen(false)} reviewer={selectedReviewer} proposalId={proposalId} proposal={proposal?.proposal} /> */}

      {/** View Reviewer Mark */}
      <GradeProposalViewReviewerMark isOpen={isViewReviewerDrawerOpen} onClose={() => setIsViewReviewerDrawerOpen(false)} reviewer={selectedReviewer} proposalId={proposalId} proposal={proposal?.proposal} />

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

        {/** Ethics Committee Date Dialog */}
        <Dialog open={isEthicsCommitteeDialogOpen} onOpenChange={setIsEthicsCommitteeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold leading-6">
              {proposal?.proposal?.ethicsCommitteeDate ? "Update Ethics Committee Date" : "Add Ethics Committee Date"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => {
            e.preventDefault();
            if (!ethicsCommitteeDate) {
              toast.error("Please select a date");
              return;
            }
            updateEthicsCommitteeDateMutation.mutate({
              proposalId,
              ethicsCommitteeDate
            });
          }} className="grid gap-6 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Ethics Committee Date
              </label>
              <input
                type="date"
                value={ethicsCommitteeDate}
                onChange={(e) => setEthicsCommitteeDate(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsEthicsCommitteeDialogOpen(false)}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateEthicsCommitteeDateMutation.isPending}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                {updateEthicsCommitteeDateMutation.isPending ? "Saving..." : "Save"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/** Field Letter Dialog */}
      <GradeProposalGenerateFieldLetter isOpen={isFieldLetterDialogOpen} onClose={() => setIsFieldLetterDialogOpen(false)} proposalId={proposalId} proposal={proposal?.proposal} />

         {/** Defense Report Dialog */}
      {/* 
      Needs to be removed for cleanups
      <GradeProposalDefenseReport
        isOpen={isDefenseReportDialogOpen}
        onClose={() => setIsDefenseReportDialogOpen(false)}
        proposal={proposal?.proposal}
      /> */}
    </div>  
  );
};

export default GradeProposal;
