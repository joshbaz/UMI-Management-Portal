/* eslint-disable react/prop-types */
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { createStudentService } from "@/store/tanstackStore/services/api";
import { queryClient } from "@/utils/tanstack";
import { toast } from "sonner";
import StudentPersonalInfoForm from "./Forms/StudentPersonalInfoForm";
import StudentCourseApplication from "./Forms/StudentCourseApplication";
import StudentUserAccess from "./Forms/StudentUserAccess";

const STEPS = [
  { id: 1, title: "Step 1", description: "Personal information" },
  { id: 2, title: "Step 2", description: "Course Application Summary" },
  // { id: 3, title: "Step 3", description: "User Access" },
];

// Progress Steps Component
const StepTabs = ({ currentStep, onStepClick }) => (
  <div className="w-full h-[72px] flex gap-8">
    {STEPS.map((step) => {
      const isActive = currentStep === step.id;
      const isCompleted = currentStep > step.id;
      return (
        <div
          key={step.id}
          className="w-[285.33px] h-[72px] py-4 relative"
          style={{
            borderTopWidth: "4px",
            borderTopStyle: "solid",
            borderTopColor: isActive || isCompleted ? "transparent" : "#D3D7E9",
          }}
        >
          {(isActive || isCompleted) && (
            <div
              className={`absolute top-0 left-0 right-0 ${
                isCompleted ? "bg-primary-500" : "bg-[#F59E0B]"
              }`}
              style={{ height: "4px", top: "-4px" }}
            />
          )}
          <div
            className={`text-sm font-medium ${
              isCompleted
                ? "text-primary-500"
                : isActive
                ? "text-[#F59E0B]"
                : "text-gray-500"
            }`}
          >
            {step.title}
          </div>
          <div className="text-sm text-gray-500">{step.description}</div>
        </div>
      );
    })}
  </div>
);

const AddStudent = () => {
  const formRef = useRef(null);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const createStudentMutation = useMutation({
    mutationFn: createStudentService,
    onSuccess: () => {
      // Clear form data from localStorage
      localStorage.removeItem('studentPersonalInfo');
      localStorage.removeItem('studentCourseApplication');
      localStorage.removeItem('studentUserAccess');
      
      toast.success('Student registered successfully');
      queryClient.invalidateQueries(['students']);
      navigate('/students', { replace: true });
    },
    onError: (error) => {
      toast.error(error.message, {
        duration: 5000,
        position: 'center',
        icon: '🚨',
        action: {
          label: 'Close',
          onClick: () => toast.dismiss()
        }
      });
    }
  });

  const handleStepClick = (stepId) => {
    setCurrentStep(stepId);
  };

  const handleNext = () => {
    if (formRef.current) {
      formRef.current.handleSubmit();
    }
  };

  const handleMoveToStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleFinalSubmit = (finalData) => {
    createStudentMutation.mutate(finalData);
  };

  const FormDisplay = () => {
    switch (currentStep) {
      case 1:
        return <StudentPersonalInfoForm formRef={formRef} handleNext={handleMoveToStep} />;
      case 2:
        return <StudentCourseApplication formRef={formRef} handleNext={handleMoveToStep} createStudentMutation={createStudentMutation} />;
      // case 3:
      //   return <StudentUserAccess formRef={formRef} handleNext={handleMoveToStep} createStudentMutation={createStudentMutation} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-full bg-[#F9FAFB] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-8">
            <div className="flex gap-4 items-center">
            <button
              onClick={() => navigate('/students')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Back
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Add New Student</h2>
            </div>
          
            <p className="mt-1 text-sm text-gray-500">
              Please fill in the student information to register a new student.
            </p>
          </div>

          <StepTabs currentStep={currentStep} onStepClick={handleStepClick} />

          <div className="mt-8">
            <FormDisplay />
          </div>

          <div className="mt-8 flex justify-end gap-4">
            
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Previous Step
              </button>
            )}
            {currentStep < 2 ? (
              <button
                onClick={handleNext}
               className="px-4 py-2 text-sm font-medium justify-end text-gray-700 border-2 border-gray-200 rounded-md hover:text-gray-500 bg-gray-50"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleNext}
                disabled={createStudentMutation.isPending}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createStudentMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStudent;
