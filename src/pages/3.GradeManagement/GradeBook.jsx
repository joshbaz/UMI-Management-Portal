import { format } from "date-fns";
import { ArrowLeft, Search, Loader2, Calendar } from "lucide-react";
import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify-icon/react";
import { useGetBook } from "../../store/tanstackStore/services/queries";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "../../utils/tanstack";
import GradeBookExaminerTable from "./GradeBookExaminerTable";
import GradeBookExaminerViewDrawer from "./GradeBookExaminerViewDrawer";
import GradeBookExaminerEditDrawer from "./GradeBookExaminerEditDrawer";
import GradeBookVivaTable from "./GradeBookVivaTable";
import { updateComplianceReportDateService, updateMinutesSentDateService } from "../../store/tanstackStore/services/api";

const GradeBook = () => {
  let navigate = useNavigate();
  const { id: bookId } = useParams();
  const { data: book, isPending: isLoading, error, refetch: refetchBook } = useGetBook(bookId);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("examiners");
  const [selectedPanelist, setSelectedPanelist] = useState(null);
  const [isVerdictDialogOpen, setIsVerdictDialogOpen] = useState(false);
  const [verdict, setVerdict] = useState("");
  const [minutesSentDate, setMinutesSentDate] = useState(null);
  const [isMinutesDateDialogOpen, setIsMinutesDateDialogOpen] = useState(false);
  const [isComplianceReportDialogOpen, setIsComplianceReportDialogOpen] = useState(false);
  const [complianceReport, setComplianceReport] = useState("");
  
  useEffect(() => {
    if (book?.book) {
      setMinutesSentDate(book.book.minutesSentDate || null);
      setComplianceReport(book.book.complianceReportDate || null);
    }
  }, [book?.book]);

  const currentStatus = useMemo(
    () => book?.book?.statuses?.find((s) => s.isCurrent),
    [book?.book?.statuses]
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

  const handleViewAssignment = useCallback((assignment) => {
    setSelectedAssignment(assignment);
    setIsViewDrawerOpen(true);
  }, []);

  const handleEditAssignment = useCallback((assignment) => {
    setSelectedAssignment(assignment);
    setIsEditDrawerOpen(true);
  }, []);

  const handleCloseViewDrawer = useCallback(() => {
    setIsViewDrawerOpen(false);
    setSelectedAssignment(null);
  }, []);

  const handleCloseEditDrawer = useCallback(() => {
    setIsEditDrawerOpen(false);
    setSelectedAssignment(null);
  }, []);

  const handleUpdatePanelist = useCallback((panelist) => {
    setSelectedPanelist(panelist);
    // Add update panelist logic here
  }, []);

  const handleViewPanelist = useCallback((panelist) => {
    setSelectedPanelist(panelist);
    // Add view panelist logic here
  }, []);

  const handleVerdictSubmit = useCallback((e) => {
    e.preventDefault();
    // Add logic to submit verdict
    toast.success("Verdict submitted successfully");
    setIsVerdictDialogOpen(false);
  }, [verdict]);

  const updateMinutesSentDateMutation = useMutation({
    mutationFn: (date) => {
      return updateMinutesSentDateService(bookId, date);
    },
    onSuccess: () => {
      toast.success("Minutes sent date recorded successfully");
      setIsMinutesDateDialogOpen(false);
      queryClient.invalidateQueries(['book', bookId]);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const updateComplianceReportMutation = useMutation({
    mutationFn: (date) => {
      return updateComplianceReportDateService(bookId, date);
    },
    onSuccess: () => {
      toast.success("Compliance report recorded successfully");
      setIsComplianceReportDialogOpen(false);
      queryClient.invalidateQueries(['book', bookId]);
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });
          

  const handleMinutesDateSubmit = useCallback((e) => {
    e.preventDefault();
    updateMinutesSentDateMutation.mutate(minutesSentDate);
  }, [minutesSentDate, updateMinutesSentDateMutation]);

  const handleComplianceReportSubmit = useCallback((e) => {
    e.preventDefault();
    updateComplianceReportMutation.mutate(complianceReport);
  }, [complianceReport, updateComplianceReportMutation]);

  // Check for current external examiner and their status
  const currentExternalExaminer = useMemo(() => {
    return book?.book?.examinerAssignments?.find(
      assignment => assignment.isCurrent && assignment.examiner?.type === "External"
    );
  }, [book?.book?.examinerAssignments]);

  console.log(currentExternalExaminer);

  const showResubmissionButton = useMemo(() => {
    return currentExternalExaminer?.status === "FAILED";
  }, [currentExternalExaminer?.status]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-green-900" />
        <div className="text-lg font-[Inter-Medium] text-gray-600">
          Loading book data...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">Error loading book data</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Search Bar */}
      <div className="flex px-6 justify-between items-center border-b border-gray-300 h-[89px]"></div>

      {/* Header */}
      <div className="flex justify-between items-center px-6 py-1">
        <h1 className="text-2xl font-[Inter-Medium]">Book</h1>
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
                {`${book?.book?.student?.firstName} ${book?.book?.student?.lastName}` || "Loading..."}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Book Details */}
      <div className="grid grid-cols-3 px-6 pb-4">
        <div>
          <h3 className="text-sm font-[Inter-Regular] text-[#626263] mb-1">
            Book ID
          </h3>
          <div className="flex gap-2">
            <span className="text-sm font-[Inter-Regular] text-gray-900">
              {book?.book?.bookCode || "Not Available"}
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

      {/** Minutes sent and compliance received buttons */}
      <div className="grid grid-cols-3 px-6 pb-4">
      <div>
          <h3 className="text-sm font-[Inter-Regular] text-[#626263] mb-1">
            Minutes Sent
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-[Inter-Regular] text-gray-900">
              {book?.book?.minutesSentDate ? format(new Date(book.book.minutesSentDate), "dd-MMM-yyyy") : "Not Sent"}
            </span>
            <button 
              onClick={() => setIsMinutesDateDialogOpen(true)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <Calendar className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-[Inter-Regular] text-[#626263] mb-1">
            Compliance Received
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm font-[Inter-Regular] text-gray-900">
              {book?.book?.complianceReportDate ? format(new Date(book.book.complianceReportDate), "dd-MMM-yyyy") : "Not Received"}
            </span>
            <button 
              onClick={() => setIsComplianceReportDialogOpen(true)}
              className="p-1 rounded-full hover:bg-gray-100"
            >
              <Calendar className="h-4 w-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mx-6 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px px-4 py-4 gap-4">
            <button
              onClick={() => setActiveTab("examiners")}
              className={`py-2 px-6 text-sm font-[Inter-Medium] rounded-lg ${
                activeTab === "examiners"
                  ? "border-2 border-primary-600 text-primary-600"
                  : "border-2 border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Book Examiners
            </button>
            <button
              onClick={() => setActiveTab("vivas")}
              className={`py-2 px-6 text-sm font-[Inter-Medium] rounded-lg ${
                activeTab === "vivas"
                  ? "border-2 border-primary-600 text-primary-600"
                  : "border-2 border-gray-200text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Vivas
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "examiners" && (
          <div className="py-4">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-lg font-[Inter-Medium] text-gray-900">Book Examiners</h2>
              <div className="flex gap-2">
                {!showResubmissionButton && (
                  <button
                    className="px-3 py-1.5 text-sm font-[Inter-Medium] text-white bg-primary-600 rounded hover:bg-primary-700"
                    onClick={() => navigate(`/grades/book/add-external-examiner/${bookId}`)}
                  >
                    Add External Examiner
                  </button>
                )}
                
                {showResubmissionButton && (
                  <button
                    className="px-3 py-1.5 text-sm font-[Inter-Medium] text-white bg-primary-600 rounded hover:bg-primary-700"
                    onClick={() => navigate(`/grades/book/add-external-examiner/${bookId}?type=resubmission`)}
                  >
                    Add External Examiner (Resubmission)
                  </button>
                )}
              </div>
            </div>
            <div className="px-4 mt-4">
              <GradeBookExaminerTable 
                examiners={book?.book?.examiners || []}
                bookId={bookId}
                refetchBook={refetchBook}
                book={book?.book}
                examinerAssignments={book?.book?.examinerAssignments || []}
                handleViewAssignment={handleViewAssignment}
                handleEditAssignment={handleEditAssignment}
              />
            </div>
          </div>
        )}

        {activeTab === "vivas" && (
          <div className="py-4">
            
            <div className="px-4 mt-4">
             
                <GradeBookVivaTable 
                  panelists={book.book.panelists || []}
                  bookId={bookId}
                  refetchBook={refetchBook}
                  onUpdateClick={handleUpdatePanelist}
                  onViewClick={handleViewPanelist}
                  
                />
             
            </div>
          </div>
        )}
      </div>

      {/* View Drawer */}
      <GradeBookExaminerViewDrawer 
        selectedAssignment={selectedAssignment}
        isOpen={isViewDrawerOpen}
        onClose={handleCloseViewDrawer}
      />

      {/* Edit Drawer */}
      <GradeBookExaminerEditDrawer  
        selectedAssignment={selectedAssignment}
        isOpen={isEditDrawerOpen}
        onClose={handleCloseEditDrawer}
        refetchBook={refetchBook}
      />

      {/* Verdict Dialog */}
      {/* <Dialog open={isVerdictDialogOpen} onOpenChange={setIsVerdictDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold leading-6">
              {book?.book?.vivaVerdict ? "Update Viva Verdict" : "Add Viva Verdict"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleVerdictSubmit} className="grid gap-6 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Verdict
              </label>
              <select
                value={verdict}
                onChange={(e) => setVerdict(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select a verdict</option>
                <option value="PASS">Pass</option>
                <option value="PASS_WITH_MINOR_CORRECTIONS">Pass with Minor Corrections</option>
                <option value="PASS_WITH_MAJOR_CORRECTIONS">Pass with Major Corrections</option>
                <option value="FAIL">Fail</option>
              </select>
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsVerdictDialogOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!verdict}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog> */}

      {/* Minutes Sent Date Dialog */}
      <Dialog open={isMinutesDateDialogOpen} onOpenChange={setIsMinutesDateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold leading-6">
              {book?.book?.minutesSentDate ? "Update Minutes Sent Date" : "Add Minutes Sent Date"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMinutesDateSubmit} className="grid gap-6 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Date
              </label>
              <input
                type="date"
                value={minutesSentDate || ''}
                onChange={(e) => setMinutesSentDate(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsMinutesDateDialogOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!minutesSentDate || updateMinutesSentDateMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateMinutesSentDateMutation.isPending ? "Submitting..." : "Submit"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Compliance Report Dialog */}
      <Dialog open={isComplianceReportDialogOpen} onOpenChange={setIsComplianceReportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold leading-6">
              {book?.book?.complianceReportDate ? "Update Compliance Received Date" : "Add Compliance Received Date"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleComplianceReportSubmit} className="grid gap-6 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Date
              </label>
              <input
                type="date"
                value={complianceReport || ''}
                onChange={(e) => setComplianceReport(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <DialogFooter>
              <button
                type="button"
                onClick={() => setIsComplianceReportDialogOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!complianceReport || updateComplianceReportMutation.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updateComplianceReportMutation.isPending ? "Submitting..." : "Submit"}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>  
  );
};

export default GradeBook;