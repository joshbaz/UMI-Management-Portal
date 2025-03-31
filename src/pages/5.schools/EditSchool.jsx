import React, { createContext, useRef, useState } from "react";
import { IoFilterSharp, IoArrowBack } from "react-icons/io5";
import { Form, useNavigate, useParams } from "react-router-dom";
import FormNavigationButtons from "@/components/FormButton/FormNavigationButtons";
import { useGetSchool } from "@/store/tanstackStore/services/queries";
import EditSchoolDetailsForm from "./Forms/EditSchoolDetailsForm";
import EditSchoolMembersForm from "./Forms/EditSchoolMembersForm";
import EditSchoolDepartmentForm from "./Forms/EditSchoolDepartmentForm";


const schoolFormContext = createContext();

const STEPS = [
  { id: 1, title: "Step 1", description: "School details" },
  { id: 2, title: "Step 2", description: "School Members" },
  { id: 3, title: "Step 3", description: "Departments" },
];

// Progress Stepper Component
const StepTabs = ({ currentStep }) => (
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

const EditSchool = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  let formRef = useRef();
  const { id } = useParams(); // Get school id from URL params
  
  // Query to fetch school details
  const { data: schoolData, isLoading, error } = useGetSchool(id);
  const school = schoolData?.school || {};

  const handlePrevStep = () => {};

  const handleNextStep = () => {};
  const handleCancel = () => {
    navigate("/students");
  };
  const handleNext = () => {
    if (currentStep) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  //handle display form
  const FormDisplay = (step) => {
    switch (step) {
      case 1:
        return <EditSchoolDetailsForm handleNext={handleNext} schoolData={schoolData} />;
      case 2:
        return <EditSchoolMembersForm handleNext={handleNext} handlePrevious={handleBack} schoolData={schoolData} />;
      case 3:
        return <EditSchoolDepartmentForm  handlePrevious={handleBack}  />;  
      default:
        return null;
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error loading school: {error.message}</div>;
  }

  return (
    <div className="min-h-full bg-[#E5E7EB] ">
      {/** bg-[#f6f8fa] or bg-[#E5E7EB]*/}
      {/** Page Header */}
      <div className="bg-[#E5E7EB] min-h-[55px] border-b border-b-secondary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"></div>
      </div>
      {/** Page Content */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Edit School</h1>
        </div>

        {/* Table Control Panel */}
        <div className="px-6 py-4 mb-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex  gap-7 items-center">
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-4 py-2 bg-[#27357E] text-white rounded-lg text-sm font-medium hover:bg-[#1F2861]"
              >
                <IoArrowBack className="mr-2" size={24} />
                Back
              </button>
              <div className="flex items-center gap-4">
                <h2 className="text-base font-medium text-gray-900">
                  {school.name} ({school.campus?.name})
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* All three steps of school forms */}
        <div className="w-[968] min-h-full mx-8 mb-8 rounded-lg p-6 bg-white shadow-sm ">
          {/* Tabs section */}
        
          <StepTabs currentStep={currentStep} />

         
          
          {/** Form Display */}
          {FormDisplay(currentStep)}

          {/** Navigation Buttons */}
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

export default EditSchool;
