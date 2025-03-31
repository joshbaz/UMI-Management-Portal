import {
  addSchoolMembersService,
  updateSchoolMembersService,
} from "@/store/tanstackStore/services/api";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import React, { useState } from "react";
import { HiPencilAlt, HiPlus } from "react-icons/hi";
import { toast } from "sonner";
import * as yup from "yup";
import { useNavigate, useParams } from "react-router-dom";
import { useGetSchool } from "@/store/tanstackStore/services/queries";
import { queryClient } from "@/utils/tanstack";

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  let navigate = useNavigate();

  // Get school members query
  const { data: schoolMembers, isLoading } = useGetSchool(id);

  console.log("schoolMembers", schoolMembers);

  // Add school members mutation
  const addSchoolMembersMutation = useMutation({
    mutationFn: (data) => addSchoolMembersService(id, data),
    onSuccess: () => {
      toast.success("School members added successfully", {
        duration: 3000,
        action: {
          label: "Dismiss",
          onClick: () => toast.dismiss(),
        },
      });
      queryClient.invalidateQueries({ queryKey: ["school", id] });
      setShowAddModal(false);
    },
    onError: (error) => {
      toast.error(error.message || "Error adding school members", {
        duration: 3000,
        action: {
          label: "Dismiss",
          onClick: () => toast.dismiss(),
        },
      });
    },
  });

  // Update school members mutation
  const updateSchoolMembersMutation = useMutation({
    mutationFn: (data) => updateSchoolMembersService(id, data),
    onSuccess: () => {
      toast.success("School members updated successfully", {
        duration: 3000,
        action: {
          label: "Dismiss",
          onClick: () => toast.dismiss(),
        },
      });
      queryClient.invalidateQueries({ queryKey: ["school", id] });
      setShowUpdateModal(false);
    },
    onError: (error) => {
      toast.error(error.message || "Error updating school members", {
        duration: 3000,
        action: {
          label: "Dismiss",
          onClick: () => toast.dismiss(),
        },
      });
    },
  });

  let initialValues = {
    dean: {
      name: "",
      email: "",
      contact: "",
      role: "Dean",
    },
    pa: {
      name: "",
      email: "",
      contact: "",
      role: "Personal Assistant",
    },
  };

  const validationSchema = yup.object().shape({
    dean: yup.object().shape({
      name: yup.string(),
      email: yup.string().email("Invalid email"),
      contact: yup
        .string()
        .matches(/^[0-9]+$/, "Must be only digits")
        .min(9, "Must be at least 9 digits")
        .max(12, "Must be at most 12 digits"),
    }),
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {/* List current members */}
      <div className="mt-8 space-y-8">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium">Current School Members</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600"
          >
            <HiPlus /> Add Member
          </button>
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
              <button
                onClick={() => {
                  setSelectedMember(member);
                  setShowUpdateModal(true);
                }}
                className="p-2 text-gray-400 hover:text-gray-500"
              >
                <HiPencilAlt className="h-5 w-5" />
              </button>
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

      {/* Add Member Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New School Member"
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            const data = {
              dean:
                values.dean.name && values.dean.email && values.dean.contact
                  ? values.dean
                  : undefined,
              pa:
                values.pa.name && values.pa.email && values.pa.contact
                  ? values.pa
                  : undefined,
            };
            addSchoolMembersMutation.mutate(data);
          }}
        >
          {({ values, handleChange, handleSubmit, errors, touched }) => (
            <Form>
              <div className="space-y-6">
                {/* Dean Fields */}
                <div className="space-y-4">
                  <h3 className="font-medium">Dean Details (Optional)</h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      name="dean.name"
                      value={values.dean.name}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md border ${
                        touched.dean?.name && errors.dean?.name
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {touched.dean?.name && errors.dean?.name && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.dean.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="dean.email"
                      value={values.dean.email}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md border ${
                        touched.dean?.email && errors.dean?.email
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {touched.dean?.email && errors.dean?.email && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.dean.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Contact
                    </label>
                    <input
                      type="tel"
                      name="dean.contact"
                      value={values.dean.contact}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md border ${
                        touched.dean?.contact && errors.dean?.contact
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {touched.dean?.contact && errors.dean?.contact && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.dean.contact}
                      </p>
                    )}
                  </div>
                </div>

                {/* PA Fields */}
                <div className="space-y-4">
                  <h3 className="font-medium">
                    Personal Assistant Details (Optional)
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      name="pa.name"
                      value={values.pa.name}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="pa.email"
                      value={values.pa.email}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Contact
                    </label>
                    <input
                      type="tel"
                      name="pa.contact"
                      value={values.pa.contact}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border border-gray-300"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addSchoolMembersMutation.isPending}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                      addSchoolMembersMutation.isPending
                        ? "bg-gray-400"
                        : "bg-primary-500 hover:bg-primary-600"
                    }`}
                  >
                    {addSchoolMembersMutation.isPending
                      ? "Adding..."
                      : "Add Member"}
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>

      {/* Update Member Modal */}
      <Modal
        isOpen={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        title="Update School Member"
      >
        <Formik
          initialValues={{
            [selectedMember?.role.toLowerCase()]: {
              name: selectedMember?.name || "",
              email: selectedMember?.email || "",
              contact: selectedMember?.contact || "",
              role: selectedMember?.role || "",
            },
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            updateSchoolMembersMutation.mutate({
              [selectedMember?.role.toLowerCase()]: {
                ...values[selectedMember?.role.toLowerCase()],
                isCurrent: false,
              },
            });
          }}
        >
          {({ values, handleChange, handleSubmit, errors, touched }) => (
            <Form>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">
                    {selectedMember?.role} Details
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      name={`${selectedMember?.role.toLowerCase()}.name`}
                      value={values[selectedMember?.role.toLowerCase()]?.name}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md border ${
                        touched[selectedMember?.role.toLowerCase()]?.name &&
                        errors[selectedMember?.role.toLowerCase()]?.name
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {touched[selectedMember?.role.toLowerCase()]?.name &&
                      errors[selectedMember?.role.toLowerCase()]?.name && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors[selectedMember?.role.toLowerCase()].name}
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name={`${selectedMember?.role.toLowerCase()}.email`}
                      value={values[selectedMember?.role.toLowerCase()]?.email}
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md border ${
                        touched[selectedMember?.role.toLowerCase()]?.email &&
                        errors[selectedMember?.role.toLowerCase()]?.email
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {touched[selectedMember?.role.toLowerCase()]?.email &&
                      errors[selectedMember?.role.toLowerCase()]?.email && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors[selectedMember?.role.toLowerCase()].email}
                        </p>
                      )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Contact
                    </label>
                    <input
                      type="tel"
                      name={`${selectedMember?.role.toLowerCase()}.contact`}
                      value={
                        values[selectedMember?.role.toLowerCase()]?.contact
                      }
                      onChange={handleChange}
                      className={`mt-1 block w-full rounded-md border ${
                        touched[selectedMember?.role.toLowerCase()]?.contact &&
                        errors[selectedMember?.role.toLowerCase()]?.contact
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {touched[selectedMember?.role.toLowerCase()]?.contact &&
                      errors[selectedMember?.role.toLowerCase()]?.contact && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors[selectedMember?.role.toLowerCase()].contact}
                        </p>
                      )}
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowUpdateModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updateSchoolMembersMutation.isPending}
                    className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                      updateSchoolMembersMutation.isPending
                        ? "bg-gray-400"
                        : "bg-primary-500 hover:bg-primary-600"
                    }`}
                  >
                    {updateSchoolMembersMutation.isPending
                      ? "Updating..."
                      : "Update Member"}
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
    </>
  );
};

export default EditSchoolMembersForm;
