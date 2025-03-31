/* eslint-disable react/prop-types */
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { useMutation } from "@tanstack/react-query";
import { createSupervisorService } from "@/store/tanstackStore/services/api";
import { queryClient } from "@/utils/tanstack";
import { toast } from "sonner";
import SupervisorPersonalInfoForm from "./Forms/SupervisorPersonalInfoForm";
import SupervisorProfessionalSummary from "./Forms/SupervisorProfessionalSummary";
import SupervisorUserAccess from "./Forms/SupervisorUserAccess";

const STEPS = [
  { id: 1, title: "Step 1", description: "Personal information" },
  { id: 2, title: "Step 2", description: "Professional Summary" },
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
          className="w-full h-[72px] py-4 relative"
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

const AddSupervisor = () => {

  const formRef = useRef(null);
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  
  const createSupervisorMutation = useMutation({
    mutationFn: createSupervisorService,
    onSuccess: () => {
      // Clear only form-related items from localStorage
      localStorage.removeItem('supervisorPersonalInfo');
      localStorage.removeItem('supervisorProfessionalSummary');
      localStorage.removeItem('supervisorUserAccess');
      localStorage.removeItem('supervisorFinalData');
      
      toast.success('Supervisor created successfully');
      queryClient.invalidateQueries(['faculty']);
      queryClient.invalidateQueries(['supervisor']);
      navigate('/faculty', { replace: true });
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

  const handleSubmit = () => {
    navigate("/faculty");
  };

  const handleCancel = () => {
    navigate("/faculty");
  };

  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-8);
    setFormData((prev) => ({ ...prev, password }));
  };

  const FormDisplay = (step) => {
    switch (step) {
      case 1:
        return <SupervisorPersonalInfoForm formRef={formRef} handleNext={handleMoveToStep} />;
      case 2:
        return <SupervisorProfessionalSummary formRef={formRef} handleNext={handleMoveToStep} createSupervisorMutation={createSupervisorMutation} />;
      // case 3:
      //     return <SupervisorUserAccess formRef={formRef} handleNext={handleMoveToStep} createSupervisorMutation={createSupervisorMutation} />;
      default:
        return null;
    }
  };
  return (
    <div className="min-h-full bg-[#E5E7EB]">
      <div className="bg-[#E5E7EB] min-h-[55px] border-b border-b-secondary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"></div>
      </div>

      <div className="py-6">
        <div className="max-w-7xl mx-auto mb-8 px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Add New Supervisor
          </h1>
        </div>

        <div className="w-[968] min-h-full mx-8 mb-8 rounded-lg p-6 bg-white shadow-sm overflow-x-hidden">
          <StepTabs currentStep={currentStep} onStepClick={handleStepClick} />
          
          {FormDisplay(currentStep)}

          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
            >
              Cancel
            </button>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Back
              </button>
            )}
            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                onClick={handleNext}
                disabled={createSupervisorMutation.isPending}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createSupervisorMutation.isPending ? 'Saving...' : 'Save'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddSupervisor