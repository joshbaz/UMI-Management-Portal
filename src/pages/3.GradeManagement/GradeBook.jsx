import { format } from "date-fns";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import React, { useMemo, useState, useCallback } from "react";
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

const GradeBook = () => {
  let navigate = useNavigate();
  const { id: bookId } = useParams();
  const { data: book, isPending: isLoading, error, refetch: refetchBook } = useGetBook(bookId);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  
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
      <div className="grid grid-cols-4 px-6">
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

      {/* Book Examiners */}
      <div className="bg-white py-4 rounded-lg shadow-md mx-6 mb-8">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-lg font-[Inter-Medium] text-gray-900">Book Examiners</h2>
          <div className="flex gap-2">
            {
              !showResubmissionButton && (
                <button
                className="px-3 py-1.5 text-sm font-[Inter-Medium] text-white bg-primary-600 rounded hover:bg-primary-700"
                onClick={() => navigate(`/grades/book/add-external-examiner/${bookId}`)}
              >
                Add External Examiner
              </button>
              )
            }
           
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
    </div>  
  );
};

export default GradeBook;