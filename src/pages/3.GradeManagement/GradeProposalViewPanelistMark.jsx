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
import { X, Pencil, Percent } from "lucide-react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { addPanelistMarkService } from "../../store/tanstackStore/services/api";
import { toast } from "sonner";

const validationSchema = Yup.object({
  mark: Yup.number()
    .required("Mark is required")
    .min(0, "Mark must be at least 0")
    .max(100, "Mark cannot exceed 100"),
  comments: Yup.string().required("Comments are required"),
});

const GradeProposalViewPanelistMark = ({
  isOpen,
  onClose,
  panelist,
  proposalId,
  proposal,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const existingGrade = proposal?.defenseGrades?.find(
    (grade) => grade.gradedById === panelist?.id
  );

  const initialValues = {
    mark: existingGrade?.grade?.toString() || "",
    comments: existingGrade?.feedback || "",
  };

  const submitGradeMutation = useMutation({
    mutationFn: async (gradeData) => addPanelistMarkService(gradeData.proposalId, gradeData.gradedById, gradeData.grade, gradeData.feedback),
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.resetQueries({ queryKey: ["proposal", proposalId] });
      setIsEditModalOpen(false);
    },
  });

  const handleSubmit = (values) => {
    const gradeData = {
      proposalId,
      grade: parseFloat(values.mark),
      feedback: values.comments,
      gradedById: panelist.id,
      submittedById: null,
    };

    submitGradeMutation.mutate(gradeData);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="right" className="min-w-[440px] p-0">
          <SheetHeader className="p-4 border-b ">
            <div className="flex justify-between items-center z-50 bg-white">
              <SheetTitle className="text-base font-[Inter-Medium]">
                Panelist's Report
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

          <div className="p-6 space-y-6">
            {/* Panelist Info */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                {panelist?.name?.charAt(0)}
              </div>
              <div>
                <p className="text-gray-900 text-base capitalize font-[Inter-Medium]">
                  {panelist?.name}
                </p>
                <p className="text-gray-700 font-[Inter-Regular] text-sm">
                  {panelist?.email}
                </p>
              </div>
            </div>

            {/* Mark */}
            <div className="space-y-2">
              <Label className="text-sm font-[Inter-Regular] text-gray-800">
                Mark
              </Label>
              <div className="text-2xl font-[Inter-Medium]">
                {existingGrade?.grade}%
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
            <div className="flex items-center gap-2 text-sm font-[Inter-Regular] text-gray-500">
              <span>
                Last Update:{" "}
                {existingGrade?.updatedAt
                  ? format(new Date(existingGrade.updatedAt), "MM/dd/yyyy hh:mm:ss aa")
                  : format(new Date(), "MM/dd/yyyy hh:mm:ss aa")}
              </span>
              <span>•</span>
              <span>
                Updated by {existingGrade?.submittedBy?.name || "DHIMS System"}
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
            <DialogTitle>Edit Panelist's Report</DialogTitle>
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
                    placeholder="Please enter the panelist's feedback"
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

export default GradeProposalViewPanelistMark;