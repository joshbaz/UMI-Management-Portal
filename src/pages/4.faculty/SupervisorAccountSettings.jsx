/* eslint-disable react/prop-types */
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  updateSupervisorService,
//   changeSupervisorPasswordService,
  deleteSupervisorService,
} from "../../store/tanstackStore/services/api";
import { queryClient } from "@/utils/tanstack";
import { toast } from "sonner";
import EditSupervisorPersonalInfoForm from "./Forms/EditSupervisorPersonalInfoForm";
// import EditSupervisorUserAccess from "./Forms/EditSupervisorUserAccess";
import EditSupervisorProfessionalSummary from "./Forms/EditSupervisorProfessionalSummary";
import { useNavigate } from "react-router-dom";
const TABS = [
  { id: 1, description: "Personal Information" },
  { id: 2, description: "Professional Summary" },
  // { id: 3, description: "User Access" },
];

const SupervisorAccountSettings = ({ supervisorData }) => {
    const [currentStep, setCurrentStep] = useState(1);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const navigate = useNavigate();
  const updateSupervisorMutation = useMutation({
    enabled: !!supervisorData?.supervisor?.id,
    mutationFn: (data) => {
      const { id, studentIds, ...dataWithoutId } = data;
      return updateSupervisorService(supervisorData?.supervisor?.id, dataWithoutId);
    },
    onSuccess: () => {
      toast.success("Supervisor updated successfully");
      queryClient.invalidateQueries({ queryKey: ["supervisor"] });
    },
    onError: (error) => {
      toast.error(error?.message, {
        duration: 3000,
      });
    },
  });

//   const changeSupervisorPasswordMutation = useMutation({
//     mutationFn: (data) => {
//       return changeSupervisorPasswordService(supervisorData?.id, data);
//     },
//     onSuccess: () => {
//       toast.success("Password updated successfully");
//       queryClient.invalidateQueries({ queryKey: ["supervisor"] });
//     },
//     onError: (error) => {
//       toast.error(error?.message, {
//         duration: 3000,
//       });
//     },
//   });

  const deleteSupervisorMutation = useMutation({
    mutationFn: () => deleteSupervisorService(supervisorData?.supervisor?.id),
    onSuccess: () => {
      toast.success("Supervisor deleted successfully");
      navigate("/faculty");
      queryClient.invalidateQueries({ queryKey: ["faculty"] });
    },
    onError: (error) => {
      toast.error(error?.message, { duration: 3000 });
    },
  });
  
  const FormDisplay = (step) => {
    switch (step) {
      case 1:
        return (
          <EditSupervisorPersonalInfoForm
            supervisorData={supervisorData?.supervisor}
            updateSupervisorMutation={updateSupervisorMutation}
          />
        );
      case 2:
        return (
          <EditSupervisorProfessionalSummary
            supervisorData={supervisorData?.supervisor}
            updateSupervisorMutation={updateSupervisorMutation}
          />
        );
    //   case 3:
    //     return (
    //       <EditSupervisorUserAccess
    //         supervisorData={supervisorData}
    //         changeSupervisorPasswordMutation={changeSupervisorPasswordMutation}
    //       />
    //     );
      default:
        return null;
    }
  };

  const handleNext = () => {
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleDeleteAccount = () => {
    deleteSupervisorMutation.mutate();
  };
  return (
    <div className="px-6 mb-6">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentStep(tab.id)}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  currentStep === tab.id
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.description}
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {FormDisplay(currentStep)}

          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={handleBack}
              className={`px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 ${
                currentStep === 1
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-gray-50"
              }`}
              disabled={currentStep === 1}
            >
              Back
            </button>
            {currentStep !== 2 && (
              <button
                onClick={handleNext}
                className={`px-4 py-2 text-sm font-medium text-white rounded-lg bg-primary-500 hover:bg-primary-600`}
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Delete Account Section */}
        <div className="border-t border-gray-200 mt-8">
          <div className="p-6">
            <h3 className="text-lg font-medium text-red-600">
              Delete Supervisor Account
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Once you delete your account, there is no going back. Please be
              certain.
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
      </div>

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900">Delete Supervisor Account</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to delete this supervisor account? This action cannot be undone.
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
                disabled={deleteSupervisorMutation.isPending}
              >
                {deleteSupervisorMutation.isPending ? 'Deleting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorAccountSettings;

