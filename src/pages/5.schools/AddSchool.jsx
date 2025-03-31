import React, { createContext, useContext, useState, useEffect } from "react";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import SchoolDetailsForm from "./Forms/SchoolDetailsForm";
import SchoolMembersForm from "./Forms/SchoolMembersForm";
import SchoolDepartmentForm from "./Forms/SchoolDepartmentForm";
import FormNavigationButtons from "@/components/FormButton/FormNavigationButtons";


// Create context for form data
export const SchoolFormContext = createContext();

export const useSchoolForm = () => {
  const context = useContext(SchoolFormContext);
  if (!context) {
    throw new Error('useSchoolForm must be used within a SchoolFormProvider');
  }
  return context;
};

const STEPS = [
  { id: 1, title: "Step 1", description: "School details" },
  { id: 2, title: "Step 2", description: "School Members" },
  { id: 3, title: "Step 3", description: "Departments" },
];

// Progress Stepper Component
const StepTabs = ({ currentStep }) => (
  <div className="w-[920px] h-[72px] flex gap-8">
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

const AddSchool = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    schoolDetails: {},
    schoolMembers: {},
    departments: []
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const step = params.get('step');
    if (!step) {
      navigate('/schools/add?step=1', { replace: true });
    } else {
      setCurrentStep(Number(step));
    }
  }, [navigate]);

  const handleCancel = () => {
    navigate("/schools");
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1);
      navigate(`/schools/add?step=${currentStep + 1}`, { replace: true });
    } else {
      // Handle form submission here
      navigate("/schools");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      navigate("/schools");
    }
  };

  const updateFormData = (step, data) => {
    setFormData(prev => {
      switch(step) {
        case 1:
          return { ...prev, schoolDetails: data };
        case 2:
          return { ...prev, schoolMembers: data };
        case 3:
          return { ...prev, departments: data };
        default:
          return prev;
      }
    });
  };

  const FormDisplay = (step) => {
    switch (step) {
      case 1:
        return <SchoolDetailsForm  handleNext={handleNext} />;
      case 2:
        return <SchoolMembersForm  handleNext={handleNext} />;
      case 3:
        return <SchoolDepartmentForm  />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-full bg-[#E5E7EB]">
      {/* Page Header */}
      <div className="bg-[#E5E7EB] min-h-[55px] border-b border-b-secondary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"></div>
      </div>
      {/* Page Content */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Schools</h1>
        </div>

        {/* Table Control Panel */}
        <div className="px-6 py-4 mb-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex gap-7 items-center">
              <button
                onClick={() => {
                  localStorage.removeItem('currentSchoolId');
                  navigate("/schools", { replace: true });
                }}
                className="inline-flex items-center px-4 py-2 bg-[#27357E] text-white rounded-lg text-sm font-medium hover:bg-[#1F2861]"
              >
                <IoArrowBack className="mr-2" size={24} />
                Back
              </button>
              <div className="flex items-center gap-4">
                <h2 className="text-base font-medium text-gray-900">
                  Add New School
                </h2>
              </div>
            </div>
          </div>
        </div>  

        {/* Form Container */}
        <div className="w-[968] min-h-full mx-8 mb-8 rounded-lg p-6 bg-white shadow-sm overflow-x-hidden">
          {/* Tabs section */}
          <StepTabs currentStep={currentStep} />
          
          {/* Form Content */}
          <SchoolFormContext.Provider value={{ formData, updateFormData }}>
            {FormDisplay(currentStep)}
          </SchoolFormContext.Provider>

          {/* Navigation Buttons */}
          {/* <FormNavigationButtons
            currentStep={currentStep}
            handleCancel={handleCancel}
            handleBack={handleBack}
            handleNext={handleNext}
            STEPS={STEPS}
          /> */}
        </div>
      </div>
    </div>
  );
};

export default AddSchool;
