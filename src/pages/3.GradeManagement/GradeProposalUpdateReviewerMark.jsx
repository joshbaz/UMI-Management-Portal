import React, { useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Percent, X } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { addReviewerMarkService } from "../../store/tanstackStore/services/api"; // Import the service

const validationSchema = Yup.object({
  mark: Yup.number()
    .required("Mark is required")
    .min(0, "Mark must be at least 0")
    .max(100, "Mark cannot exceed 100"),
  comments: Yup.string().required("Comments are required"),
});

const GradeProposalUpdateReviewerMark = ({
  isOpen,
  onClose,
  reviewer,
  proposalId,
  proposal,
}) => {
  const queryClient = useQueryClient();

  
  const initialValues = {
    mark: "",
    comments: "",
  };

  useEffect(() => {
    const existingGrade = proposal?.reviewGrades?.find(
      (grade) => grade.gradedById === reviewer?.id
    );
    if (existingGrade) {
      initialValues.mark = existingGrade.grade.toString();
      initialValues.comments = existingGrade.feedback || "";
    }
  }, [reviewer, proposal?.reviewGrades]);

  const submitGradeMutation = useMutation({
    mutationFn: async (gradeData) => addReviewerMarkService(gradeData.proposalId, gradeData.gradedById, gradeData.grade, gradeData.feedback)
    ,
    onSuccess: () => {
      queryClient.resetQueries({ queryKey: ["proposal", proposalId] });
      onClose();
    },
  });

  const updateGradeMutation = useMutation({
    mutationFn: async (gradeData) => {
      const response = await fetch(
        `/api/proposal-review-grades/${gradeData.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(gradeData),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to update grade");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["proposal", proposalId]);
      onClose();
    },
  });

  const handleSubmit = (values) => {
    const gradeData = {
      proposalId,
      grade: parseFloat(values.mark),
      feedback: values.comments,
      gradedById: reviewer.id,
      submittedById: null,
    };

    const existingGrade = proposal?.reviewGrades?.find(
      (grade) => grade.gradedById === reviewer?.id
    );

    if (existingGrade) {
      updateGradeMutation.mutate({
        ...gradeData,
        id: existingGrade.id,
      });
    } else {
      submitGradeMutation.mutate(gradeData);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="min-w-[440px] p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex justify-between items-center z-50">
            <SheetTitle className="text-base font-[Inter-Medium]">
              Update Reviewer's Report
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

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="p-6 space-y-6">
              {/* Reviewer Info */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 ">
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
                    className="w-full pr-8 text-sm  !ring-0 
    !ring-offset-0 
    !outline-none
    focus:!ring-0 
    focus:!outline-none
    focus-visible:!ring-0 
    focus-visible:!outline-none 
    focus:border-gray-300 font-[Inter-Regular] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none "
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
                  placeholder="Please enter the reviewer's feedback"
                  rows={4}
                  className="text-sm font-[Inter-Regular] !ring-0 
    !ring-offset-0 
    !outline-none
    focus:!ring-0 
    focus:!outline-none
    focus-visible:!ring-0 
    focus-visible:!outline-none "
                />
                {errors.comments && touched.comments && (
                  <div className="text-red-500 text-sm">{errors.comments}</div>
                )}
              </div>

              {/* Last Update Info */}
              <div className="flex items-center gap-2 text-sm font-[Inter-Regular] text-gray-500">
                <span>
                  Last Update: {format(new Date(), "MM/dd/yyyy hh:mm:ss aa")}
                </span>
                <span>•</span>
                <span>
                  Updated by DHIMS System
                </span>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={
                  isSubmitting ||
                  submitGradeMutation.isPending ||
                  updateGradeMutation.isPending
                }
              >
                {submitGradeMutation.isPending || updateGradeMutation.isPending
                  ? "Saving..."
                  : "Confirm"}
              </Button>
            </Form>
          )}
        </Formik>
      </SheetContent>
    </Sheet>
  );
};

export default GradeProposalUpdateReviewerMark;
