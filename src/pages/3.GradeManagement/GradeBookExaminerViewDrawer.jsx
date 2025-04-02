import React, { useState } from "react";
import {
  Sheet,
  SheetContent, 
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Pencil, Percent, Download, FileText } from "lucide-react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";

const validationSchema = Yup.object({
  mark: Yup.number()
    .required("Mark is required")
    .min(0, "Mark must be at least 0")
    .max(100, "Mark cannot exceed 100"),
  comments: Yup.string().required("Comments are required"),
});

const GradeBookExaminerViewDrawer = ({ selectedAssignment, isOpen, onClose }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const examiner = selectedAssignment?.examiner;
  const existingGrade = selectedAssignment?.grade;
  const reportSubmitted = selectedAssignment?.reportSubmittedAt;

  const initialValues = {
    mark: existingGrade?.mark?.toString() || "",
    comments: existingGrade?.comments || "",
  };

  const submitGradeMutation = useMutation({
    mutationFn: async (gradeData) => {
      // Replace with actual service call
      return { message: "Grade updated successfully" };
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["book"] });
      setIsEditModalOpen(false);
    },
  });

  const handleSubmit = (values) => {
    const gradeData = {
      assignmentId: selectedAssignment?.id,
      mark: parseFloat(values.mark),
      comments: values.comments,
      examinerId: examiner?.id,
    };

    submitGradeMutation.mutate(gradeData);
  };

  const handleDownloadReport = () => {
    // Implement report download functionality
    toast.success("Report download started");
  };

  if (!selectedAssignment) return null;

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="min-w-[440px] p-0">
          <SheetHeader className="p-4 border-b ">
            <div className="flex justify-between items-center z-50 bg-white">
              <SheetTitle className="text-base font-[Inter-Medium]">
                Examiner's Report
              </SheetTitle>
              <Button
                className="bg-primary-500 hover:bg-primary-800 text-white"
                onClick={onClose}
              >
                <X className="w-4 h-4 " />
                Close Window
              </Button>
            </div>
          </SheetHeader>

          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)]">
            {/* Examiner Info */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                {examiner?.name?.charAt(0) || "E"}
              </div>
              <div>
                <p className="text-gray-900 text-base capitalize font-[Inter-Medium]">
                  {examiner?.name || "Examiner Name"}
                </p>
                <p className="text-gray-700 font-[Inter-Regular] text-sm">
                  {examiner?.primaryEmail || examiner?.email || "examiner@example.com"}
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="text-sm font-[Inter-Regular] text-gray-800">
                Status
              </Label>
              <div>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    selectedAssignment?.status === "Completed"
                      ? "bg-green-100 text-green-800"
                      : selectedAssignment?.status === "Accepted"
                      ? "bg-blue-100 text-blue-800"
                      : selectedAssignment?.status === "Rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {selectedAssignment?.status || "Pending"}
                </span>
              </div>
            </div>

            {/* Mark */}
            <div className="space-y-2">
              <Label className="text-sm font-[Inter-Regular] text-gray-800">
                Mark
              </Label>
              <div className="text-2xl font-[Inter-Medium]">
                {existingGrade?.mark || "N/A"}%
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-2">
              <Label className="text-sm font-[Inter-Regular] text-gray-800">
                Comments
              </Label>
              <div className="p-4 bg-gray-50 rounded-md text-sm font-[Inter-Regular] text-gray-700">
                {existingGrade?.comments || "No comments provided"}
              </div>
            </div>

            {/* Report */}
            <div className="space-y-2">
              <Label className="text-sm font-[Inter-Regular] text-gray-800">
                Report
              </Label>
              {reportSubmitted ? (
                <div className="flex flex-col gap-2">
                  <div className="p-4 bg-gray-50 rounded-md text-sm font-[Inter-Regular] text-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span>Examiner Report.pdf</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary-600 hover:text-primary-800"
                      onClick={handleDownloadReport}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500">
                    Submitted on {format(new Date(selectedAssignment.reportSubmittedAt), "MMM dd, yyyy")}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-md text-sm font-[Inter-Regular] text-gray-700">
                  No report submitted yet
                </div>
              )}
            </div>

            {/* Submission Type */}
            <div className="space-y-2">
              <Label className="text-sm font-[Inter-Regular] text-gray-800">
                Submission Type
              </Label>
              <div className="text-sm font-[Inter-Regular] capitalize">
                {selectedAssignment?.submissionType || "First Submission"}
              </div>
            </div>

            {/* Last Update Info */}
            <div className="flex items-center gap-2 text-sm font-[Inter-Regular] text-gray-500">
              <span>
                Last Update:{" "}
                {existingGrade?.updatedAt
                  ? format(new Date(existingGrade.updatedAt), "MM/dd/yyyy hh:mm:ss aa")
                  : format(new Date(), "MM/dd/yyyy hh:mm:ss aa")}
              </span>
              <span>•</span>
              <span>
                Updated by {existingGrade?.updatedBy?.name || "System"}
              </span>
            </div>

            {/* Edit Button */}
            <Button
              onClick={() => setIsEditModalOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit Report
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Examiner's Report</DialogTitle>
          </DialogHeader>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ errors, touched, isSubmitting }) => (
              <Form className="space-y-6">
                {/* Mark Range */}
                <div className="space-y-2">
                  <Label className="text-sm font-[Inter-Regular] text-gray-800">
                    Mark Range
                  </Label>
                  <div className="relative">
                    <Field
                      as={Input}
                      type="number"
                      name="mark"
                      min="0"
                      max="100"
                      placeholder="0"
                      className="w-full pr-8 text-sm !ring-0 !ring-offset-0 !outline-none"
                    />
                    <div className="absolute right-[1px] top-[1px] bottom-[1px] bg-primary-100 flex items-center px-3 rounded-r-[7px]">
                      <Percent className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  {errors.mark && touched.mark && (
                    <div className="text-red-500 text-sm">{errors.mark}</div>
                  )}
                </div>

                {/* Comments */}
                <div className="space-y-2">
                  <Label className="text-sm font-[Inter-Regular] text-gray-800">
                    Comments
                  </Label>
                  <Field
                    as={Textarea}
                    name="comments"
                    placeholder="Please enter the examiner's feedback"
                    rows={4}
                    className="text-sm font-[Inter-Regular] !ring-0 !ring-offset-0 !outline-none"
                  />
                  {errors.comments && touched.comments && (
                    <div className="text-red-500 text-sm">{errors.comments}</div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={isSubmitting || submitGradeMutation.isPending}
                >
                  {submitGradeMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GradeBookExaminerViewDrawer;