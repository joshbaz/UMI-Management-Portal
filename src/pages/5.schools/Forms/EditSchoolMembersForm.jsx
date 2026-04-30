import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetSchool } from "@/store/tanstackStore/services/queries";

// Custom Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  {title}
                </h3>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EditSchoolMembersForm = ({ handleNext, handlePrevious, schoolData }) => {
  const { id } = useParams();

  let navigate = useNavigate();

  // Get school members query
  const { data: schoolMembers, isLoading } = useGetSchool(id);

  console.log("schoolMembers", schoolMembers);



  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {/* List current members */}
      <div className="mt-8 space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Current School Members</h2>
        </div>

        <div className="divide-y divide-gray-200">
          {schoolMembers?.school?.members?.map((member) => (
            <div
              key={member.id}
              className="py-4 flex justify-between items-center"
            >
              <div>
                <h3 className="font-medium">{member.name}</h3>
                <p className="text-sm text-gray-500">{member.role}</p>
                <p className="text-sm text-gray-500">{member.email}</p>
                <p className="text-sm text-gray-500">{member.contact}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-end gap-4">
        <button
          onClick={handlePrevious}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border-2 border-gray-200 hover:bg-gray-100 rounded-md shadow-sm flex items-center gap-1"
        >
          Previous Step
        </button>
        <button
          onClick={handleNext}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border-2 border-gray-200 hover:bg-gray-100 rounded-md shadow-sm flex items-center gap-1"
        >
          Next Step
        </button>

        <button
          type="button"
          onClick={() => navigate("/schools", { replace: true })}
          className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-md shadow-sm"
        >
          Done, Leave School
        </button>
      </div>


    </>
  );
};

export default EditSchoolMembersForm;
