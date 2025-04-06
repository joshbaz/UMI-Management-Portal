import React from "react";
import {
  Sheet,
  SheetContent, 
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { format } from "date-fns";

const GradeProposalViewReviewerMark = ({
  isOpen,
  onClose,
  reviewer,
  proposalId,
  proposal,
}) => {
  if (!reviewer) return null;
  
  const existingGrade = proposal?.reviewGrades?.find(
    (grade) => grade.gradedById === reviewer?.id
  );


  const getVerdictLabel = (verdict) => {
    switch (verdict) {
      case 'PASS':
        return 'Pass';
      case 'PASS_WITH_MINOR_CORRECTIONS':
        return 'Pass with Minor Corrections';
      case 'PASS_WITH_MAJOR_CORRECTIONS':
        return 'Pass with Major Corrections';
      case 'FAIL':
        return 'Fail';
      default:
        return 'Not Specified';
    }
  };
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="min-w-[440px] p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex justify-between items-center z-50">
            <SheetTitle className="text-base font-[Inter-Medium]">
              Reviewer's Report
            </SheetTitle>
            <Button
              className="bg-primary-500 hover:bg-primary-800 text-white"
              onClick={onClose}
            >
              <X className="w-4 h-4 mr-2" />
              Close Window
            </Button>
          </div>
        </SheetHeader>

        <div className="p-6 space-y-6">
          {/* Reviewer Info */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
              {reviewer?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-gray-900 text-base capitalize font-[Inter-Medium]">
                {reviewer?.name}
              </p>
              <p className="text-gray-700 font-[Inter-Regular] text-sm">
                {reviewer?.email}
              </p>
            </div>
          </div>

          {/* Mark */}
          <div className="space-y-2">
            <Label className="text-sm font-[Inter-Regular] text-gray-800">
              Mark
            </Label>
            <div className="text-2xl font-[Inter-Medium]">
              {existingGrade?.verdict ? getVerdictLabel(existingGrade.verdict) : "Not specified"}
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label className="text-sm font-[Inter-Regular] text-gray-800">
              Comments
            </Label>
            <div className="p-4 bg-gray-50 rounded-md text-sm font-[Inter-Regular] text-gray-700">
              {existingGrade?.feedback || "No comments provided"}
            </div>
          </div>

          {/* Last Update Info */}
          {/* <div className="flex items-center gap-2 text-sm font-[Inter-Regular] text-gray-500">
            <span>
              Last Update:{" "}
              {existingGrade?.updatedAt
                ? format(new Date(existingGrade?.updatedAt), "MM/dd/yyyy hh:mm:ss aa")
                : format(new Date(), "MM/dd/yyyy hh:mm:ss aa")}
            </span>
            <span>•</span>
            <span>
              Updated by {existingGrade?.submittedBy?.name || "DHIMS System"}
            </span>
          </div> */}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default GradeProposalViewReviewerMark;