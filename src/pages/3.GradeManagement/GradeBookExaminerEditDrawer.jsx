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
import { updateExternalExaminerMarkService } from "@/store/tanstackStore/services/api";
import { toast } from "sonner";
const validationSchema = Yup.object({
  mark: Yup.number()
    .required("Mark is required")
    .min(0, "Mark must be at least 0")
    .max(100, "Mark cannot exceed 100"),
  // comments: Yup.string().required("Comments are required"),
});

const GradeBookExaminerEditDrawer = ({
  isOpen,
  onClose,
  selectedAssignment,
  refetchBook,
}) => {
  const queryClient = useQueryClient();

  const initialValues = {
    mark: "",
    comments: "",
  };

  useEffect(() => {
    if (selectedAssignment?.grade) {
      initialValues.mark = selectedAssignment.grade.toString();
      initialValues.comments = selectedAssignment.comments || "";
    }
  }, [selectedAssignment]);

  const submitGradeMutation = useMutation({
    mutationFn: async (gradeData) => {
      return await updateExternalExaminerMarkService(
        gradeData.assignmentId,
        gradeData.grade,
        gradeData.comments,
        "COMPLETED"
      );
    },
    onSuccess: () => {
      toast.success("Examiner mark updated successfully");
      queryClient.resetQueries({ queryKey: ["book", selectedAssignment?.bookId] });
      onClose();
    },
    onError: (error) => {
      toast.error(error?.message);
    },
  });

  const handleSubmit = (values) => {
    const gradeData = {
      assignmentId: selectedAssignment?.id,
      grade: parseFloat(values.mark),
      comments: values.comments,
    };

    submitGradeMutation.mutate(gradeData);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="min-w-[440px] p-0">
        <SheetHeader className=" border-b">
          <div className="p-4 flex justify-between items-center z-50 bg-white">
            <SheetTitle className="text-base font-[Inter-Medium]">
              Update Examiner's Report
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
              {/* Examiner Info */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 ">
                  {selectedAssignment?.examiner?.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-gray-900 text-base capitalize font-[Inter-Medium]">
                    {selectedAssignment?.examiner?.name}
                  </p>
                  <p className="text-gray-700 font-[Inter-Regular] text-sm">
                    {selectedAssignment?.examiner?.email}
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
                    className="w-full pr-8 text-sm !ring-0 !ring-offset-0 !outline-none focus:!ring-0 focus:!outline-none focus-visible:!ring-0 focus-visible:!outline-none focus:border-gray-300 font-[Inter-Regular] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
                  Comments (Optional)
                </Label>
                <Field
                  as={Textarea}
                  name="comments"
                  placeholder="Please enter the examiner's feedback"
                  rows={4}
                  className="text-sm font-[Inter-Regular] !ring-0 !ring-offset-0 !outline-none focus:!ring-0 focus:!outline-none focus-visible:!ring-0 focus-visible:!outline-none"
                />
                {errors.comments && touched.comments && (
                  <div className="text-red-500 text-sm">{errors.comments}</div>
                )}
              </div>

            

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                disabled={ submitGradeMutation.isPending}
              >
                {submitGradeMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </Form>
          )}
        </Formik>
      </SheetContent>
    </Sheet>
  );
};

export default GradeBookExaminerEditDrawer;