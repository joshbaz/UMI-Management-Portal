import { useState, useEffect, useCallback } from "react";
import EditStudentPersonalInfoForm from "./Forms/EditStudentPersonalInfoForm";
import EditStudentCourseApplication from "./Forms/EditStudentCourseApplication";
import EditStudentUserAccess from "./Forms/EditStudentUserAccess";
import { useMutation } from "@tanstack/react-query";
import { updateStudentService, changeStudentPasswordService, deleteStudentService } from "../../store/tanstackStore/services/api";
import { queryClient } from "@/utils/tanstack";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
const STEPS = [
  { id: 1, description: "Personal Information" },
  { id: 2, description: "Course Application Summary" },
  { id: 3, description: "User Access" },
];

const AccountSettings = ({ studentData }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    courseDetails: studentData?.courseDetails || {
      courseName: "",
      startDate: "",
      expectedEndDate: "",
      status: ""
    }
  });

  const updateStudentMutation = useMutation({
    enabled: !!studentData?.student?.id,
    mutationFn: (data) => {
      const { id, statuses, supervisors, proposals, vivas, notifications, fieldWork, ...dataWithoutId } = data;
      return updateStudentService(studentData?.student?.id, dataWithoutId);
    },
    onSuccess: () => {
      // Handle success
      console.log("Student updated successfully");
      toast.success("Student updated successfully");
      queryClient.resetQueries({ queryKey: ["student"] });
    },
    onError: (error) => {
      // Handle error
      console.error("Error updating student:", error);
      toast.error(error?.message, {
        duration: 3000,
        
      });
    }
  });

  const changeStudentPasswordMutation = useMutation({
      mutationFn: (data) => changeStudentPasswordService(studentData?.student?.id, data),
    onSuccess: () => {
      // Handle success
      console.log("Student password updated successfully");
      toast.success("Student password updated successfully");
      queryClient.resetQueries({ queryKey: ["student"] });
    },
    onError: (error) => {
      // Handle error
      console.error("Error updating student password:", error);
      toast.error(error?.message, {
        duration: 3000,
      });
    }
  });

  const deleteStudentMutation = useMutation({
    mutationFn: () => deleteStudentService(studentData?.student?.id),
    onSuccess: () => {
    
      toast.success("Student account deleted successfully");
      navigate("/students", { replace: true });
      queryClient.resetQueries({ queryKey: ["student"] });
   
    },
    onError: (error) => {
      console.error("Error deleting student:", error);
      toast.error(error?.message, {
        duration: 3000,
        action: {
          label: "Undo",
          onClick: () => toast.dismiss()
        }
      });
    }
  });

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleDeleteAccount = () => {
    deleteStudentMutation.mutate();
    
  };

  const handleStepClick = useCallback((stepId) => {
    setCurrentStep(stepId);
  }, []);

  //handle display form
  const FormDisplay = (step) => {
    switch (step) {
      case 1:
        return <EditStudentPersonalInfoForm studentData={studentData} updateStudentMutation={updateStudentMutation} />;
      case 2:
        return <EditStudentCourseApplication studentData={studentData} updateStudentMutation={updateStudentMutation} />;
      case 3:
        return <EditStudentUserAccess studentData={studentData}  changeStudentPasswordMutation={changeStudentPasswordMutation} />;  
      default:
        return null;
    }
  };

  return (
    <div className="mt-6 mb-8 bg-white rounded-lg shadow mx-6">
      <div className="w-full  flex gap-8 px-6 pt-4  border-b">
        {STEPS.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          return (
            <button
                key={step.id}
                onClick={() => handleStepClick(step.id)}
                className={`px-6 py-3 text-sm font-[Inter-Medium] border-b-2 ${
                  currentStep === step.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {step.description}
              </button>
          );
        })}
      </div>
      <div className="p-6">
         {/** Form Display */}
         {FormDisplay(currentStep)}

        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={handleBack}
            className={`px-4 py-2 text-sm font-medium text-gray-900 rounded-lg border border-gray-300 ${
              currentStep === 1
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-50"
            }`}
            disabled={currentStep === 1}
          >
            Previous Step
          </button>
          {
            currentStep !== 3 && (
              <button
              onClick={handleNext}
              className={`px-4 py-2 text-sm font-medium text-gray-900 rounded-lg border border-gray-300 ${
                currentStep === 3
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={currentStep === 3}
            >
              Next Step
            </button>
            )
          }
        
        </div>
      </div>

      {/* Delete Account Section */}
      <div className="border-t border-gray-200 mt-8">
        <div className="p-6">
          <h3 className="text-lg font-medium text-red-600">Delete Student Account</h3>
          <p className="mt-1 text-sm text-gray-500">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-red-600 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 bg-red-400/20"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900">Delete Student Account</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete this student account? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                disabled={deleteStudentMutation.isPending}
              >
                {deleteStudentMutation.isPending ? 'Deleting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;
