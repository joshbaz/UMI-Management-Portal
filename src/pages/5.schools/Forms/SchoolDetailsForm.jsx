import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as yup from "yup";
import { HiPencilAlt, HiPlus, HiTrash, HiX } from "react-icons/hi";
import FormErrorHandler from "../../../components/FormErrorHandler/FormErrorHandler";
import { useGetAllCampuses } from "@/store/tanstackStore/services/queries";
import {
  createCampusService,
  updateCampusService,
  deleteCampusService,
  addSchoolService,
} from "@/store/tanstackStore/services/api";
import { queryClient } from "@/utils/tanstack";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const SchoolDetailsForm = ({  handleNext }) => {
  const { data: campuses, isPending: campusesLoading } = useGetAllCampuses();
  const [isModifyTableOpen, setIsModifyTableOpen] = useState(false);

  // Add school mutation
  const addSchoolMutation = useMutation({
    mutationFn: addSchoolService, 
    onSuccess: (data) => {
      toast.success("School created successfully", {
        duration: 3000,
        action: {
          label: "Dismiss",
          onClick: () => toast.dismiss(),
        },
      });
       // Store the school ID for next step
      localStorage.setItem("currentSchoolId", data?.school?.id);
      queryClient.invalidateQueries({ queryKey: ["schools"] });
     
      // Navigate to next step
      handleNext();
    },
    onError: (error) => {
      toast.error(error.message || "Error creating school", {
        duration: 3000,
        action: {
          label: "Dismiss",
          onClick: () => toast.dismiss(),
        },
      });
    }
  });

  let initialValues = {
    name: "",
    code: "", 
    url: "",
    campusId: "",
  };

  const validationSchema = yup.object().shape({
    name: yup
      .string()
      .required("School name is required")
      .min(3, "School name must be at least 3 characters")
      .max(100, "School name cannot exceed 100 characters"),
    code: yup
      .string()
      .required("School code is required")
      .matches(
        /^[A-Z0-9]+$/,
        "School code must contain only uppercase letters and numbers"
      )
      .min(2, "School code must be at least 2 characters")
      .max(10, "School code cannot exceed 10 characters"),
    url: yup
      .string()
      .url("Please enter a valid URL")
      .required("URL is required"),
    campusId: yup.string().required("Campus selection is required"),
  });

  return (
    <>
      {/* Formik Form */}
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          addSchoolMutation.mutate(values);
        }}
      >
        {({ values, handleChange, handleSubmit, errors, touched }) => (
          <Form>
            <div className="mt-8">
              <div className="grid grid-cols-2 gap-x-6 gap-y-8">
                {/** school name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    School Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={values?.name}
                    onChange={handleChange}
                    className={`w-full h-9 rounded-md border ${
                      errors?.name ? "border-red-500" : "border-gray-200"
                    } shadow-sm px-3 py-2 text-sm bg-gray-50`}
                    placeholder="Please enter the school name"
                  />

                  <FormErrorHandler
                    errors={errors?.name}
                    message={errors?.name}
                  />
                </div>
                {/** school code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    School Code
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={values?.code}
                    onChange={handleChange}
                    className={`w-full h-9 rounded-md border ${
                      errors?.code ? "border-red-500" : "border-gray-200"
                    } shadow-sm px-3 py-2 text-sm bg-gray-50`}
                    placeholder="e.g SBM"
                  />
                  <FormErrorHandler
                    errors={errors?.code}
                    message={errors?.code}
                  />
                </div>
                {/** school url */}
                <div className="col-span-2 pb-4 border-b border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Url
                  </label>
                  <input
                    type="text"
                    name="url"
                    value={values?.url}
                    onChange={handleChange}
                    className={`w-full h-9 rounded-md border ${
                      errors?.url ? "border-red-500" : "border-gray-200"
                    } shadow-sm px-3 py-2 text-sm bg-gray-50`}
                    placeholder="Please enter the school url"
                  />
                  <FormErrorHandler
                    errors={errors?.url}
                    message={errors?.url}
                  />
                </div>

                <div className="col-span-2 space-y-5">
                  <div className="flex flex-row justify-between items-center">
                    <h1>Regional Centres</h1>

                    <button
                      type="button"
                      onClick={() => setIsModifyTableOpen(true)}
                      className="flex gap-1  px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600"
                    >
                      Update
                      <HiPencilAlt className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-0">
                      <h5 className="text-base font-semibold">Select Campus</h5>
                      <p className="text-sm text-normal text-[#6B7280]">
                        Select the campus you want to add this school to
                      </p>
                    </div>

                    <div className="flex flex-row items-center gap-10">
                      {campuses?.campuses?.length === 0 ? (
                        <p className="text-sm text-red-500">
                          Please add a campus first before creating a school
                        </p>
                      ) : (
                        campuses?.campuses?.map((campus, index) => (
                          <div
                            className="flex flex-row gap-2 items-center"
                            key={index}
                          >
                            <input
                              type="radio"
                              name="campusId"
                              value={campus.id}
                              onChange={handleChange}
                              className="w-4 h-4 border border-gray-300 rounded-full shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            />
                            <label className="text-sm font-medium text-gray-700 ml-2">
                              {campus.name}
                            </label>
                          </div>
                        ))
                      )}
                    </div>

                    <FormErrorHandler
                      errors={errors?.campusId}
                      message={errors?.campusId}
                    />
                  </div>
                </div>

                {/** navigation buttons */}
                <div className="col-span-2 mt-8 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => navigate("/schools")}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addSchoolMutation.isPending}
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      addSchoolMutation.isPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-500 hover:bg-primary-600'
                    }`}
                  >
                    {addSchoolMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                </div>
                
              </div>
            </div>
          </Form>
        )}
      </Formik>

      {/** update school regions */}
      <UpdateRegionDialog
        isOpen={isModifyTableOpen}
        onClose={() => setIsModifyTableOpen(false)}
        campuses={campuses}
      />
    </>
  );
};

export default SchoolDetailsForm;

// Update Regional Centres Dialog
const UpdateRegionDialog = ({ isOpen, onClose, campuses }) => {
  if (!isOpen) return null;
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddCampusOpen, setIsAddCampusOpen] = useState(false);
  const [isEditCampusOpen, setIsEditCampusOpen] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState(null);

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl" style={{ width: "670px", maxHeight: "90vh", overflowY: "auto" }}>
        {/* Dialog Header */}
        <div
          className="flex justify-between items-center px-7 py-8 mt-8 mb-5 mx-7 border-b rounded border"
          style={{ height: "68px", gap: "8px" }}
        >
          <h2 className="text-lg font-semibold text-gray-900">
            Update Regional Centres
          </h2>
          <button
            onClick={onClose}
            className="bg-primary-500 text-white rounded-lg hover:bg-primary-800 flex items-center justify-center whitespace-nowrap text-sm"
            style={{ width: "148px", height: "36px", gap: "8px" }}
          >
            <HiX className="w-4 h-4 flex-shrink-0" />
            <span className="flex-shrink-0">Close Window</span>
          </button>
        </div>

        {/* Dialog Content */}
        <div className="p-7 border rounded mb-5 mx-7 overflow-y-auto" style={{ maxHeight: "calc(90vh - 200px)" }}>
          <div className="space-y-6">
            {/** Regional content */}
            <div className="w-full flex flex-col gap-3">
              {campuses?.campuses?.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No campuses available. Please add a campus using the button
                  below.
                </div>
              ) : (
                campuses?.campuses?.map((campus) => (
                  <div key={campus.id} className="w-full flex flex-col gap-3">
                    <div className="w-full grid grid-cols-2 gap-x-6 gap-y-8">
                      <div className="flex flex-col gap-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Campus Name
                        </label>

                        <input
                          type="text"
                          name="name"
                          value={campus.name}
                          disabled
                          className={`w-full h-9 rounded-md border border-gray-200 shadow-sm px-3 py-2 text-sm bg-gray-50`}
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Location
                        </label>

                        <input
                          type="text"
                          name="location"
                          value={campus.location}
                          disabled
                          className={`w-full h-9 rounded-md border border-gray-200 shadow-sm px-3 py-2 text-sm bg-gray-50`}
                        />
                      </div>
                    </div>

                    <div className="flex flex-row justify-end items-center gap-4">
                      {/** delete button */}
                      <button
                        onClick={() => {
                          setIsDeleteOpen(true);
                          setSelectedCampus(campus);
                        }}
                        className="flex gap-1  px-4 py-2 border border-secondary-600 rounded-md shadow-sm text-sm font-medium text-secondary-800 bg-secondary-500 hover:bg-secondary-100"
                      >
                        Delete
                        <HiTrash className="w-4 h-4 text-secondary-800" />
                      </button>
                      {/** edit button */}
                      <button
                        onClick={() => {
                          setIsEditCampusOpen(true);
                          setSelectedCampus(campus);
                        }}
                        className="flex gap-1  px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600"
                      >
                        Edit
                        <HiPencilAlt className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/** Add Region */}
            <div className="grid grid-cols-3 gap-x-2 gap-y-8  w-full items-center justify-self-center">
              <hr className=" bg-black w-full " />
              <button
                onClick={() => setIsAddCampusOpen(true)}
                className="h-7 px-2 py-1  flex justify-center items-center gap-2 text-sm text-semantic-text-primary bg-transparent border border-secondary-700 rounded-full"
              >
                <HiPlus className=" w-4 h-4" />

                <span>Add Campus</span>
              </button>
              <hr className=" bg-black !w-full" />
            </div>
          </div>
        </div>
      </div>

      <AddCampusModal
        isOpen={isAddCampusOpen}
        onClose={() => setIsAddCampusOpen(false)}
      />

      <EditCampusModal
        isOpen={isEditCampusOpen}
        onClose={() => setIsEditCampusOpen(false)}
        campus={selectedCampus}
      />

      {/** Delete Region */}
      <DeleteRegionDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        selectedCampus={selectedCampus}
      />
    </div>
  );
};

// Add Campus Modal
const AddCampusModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const createCampusMutation = useMutation({
    mutationFn: createCampusService,
    onSuccess: () => {
      queryClient.invalidateQueries(["campuses"]);
      onClose();
      toast.success("Campus added successfully");
    },
    onError: (error) => {
      // console.error('Error adding campus:', error);
      toast.error(`${error?.message}`, {
        duration: 3000,
        action: {
          label: "Dismiss",
          onClick: () => toast.dismiss(),
        },
      });
    },
  });

  const validationSchema = yup.object().shape({
    name: yup
      .string()
      .required("Campus name is required")
      .min(3, "Campus name must be at least 3 characters")
      .max(100, "Campus name cannot exceed 100 characters"),
    location: yup
      .string()
      .required("Campus location is required")
      .min(3, "Campus location must be at least 3 characters")
      .max(100, "Campus location cannot exceed 100 characters"),
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium leading-6 text-gray-900">
            Add New Campus
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <HiX className="w-5 h-5" />
          </button>
        </div>

        <Formik
          initialValues={{
            name: "",
            location: "",
          }}
          validationSchema={validationSchema}
          onSubmit={(values, { setSubmitting }) => {
            createCampusMutation.mutate(values);
            setSubmitting(false);
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleSubmit,
            isSubmitting,
          }) => (
            <Form>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campus Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    className={`w-full h-9 rounded-md border ${
                      errors.name && touched.name
                        ? "border-red-500"
                        : "border-gray-200"
                    } shadow-sm px-3 py-2 text-sm bg-gray-50`}
                    placeholder="Enter campus name"
                  />
                  {errors.name && touched.name && (
                    <FormErrorHandler
                      errors={errors.name}
                      message={errors.name}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campus Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={values.location}
                    onChange={handleChange}
                    className={`w-full h-9 rounded-md border ${
                      errors.location && touched.location
                        ? "border-red-500"
                        : "border-gray-200"
                    } shadow-sm px-3 py-2 text-sm bg-gray-50`}
                    placeholder="Enter campus location"
                  />
                  {errors.location && touched.location && (
                    <FormErrorHandler
                      errors={errors.location}
                      message={errors.location}
                    />
                  )}
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || createCampusMutation.isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-500 border border-transparent rounded-md hover:bg-primary-600"
                  >
                    {createCampusMutation.isPending
                      ? "Adding..."
                      : "Add Campus"}
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

// Edit Campus Modal
const EditCampusModal = ({ isOpen, onClose, campus }) => {
  const updateCampusMutation = useMutation({
    mutationFn: (data) => updateCampusService(campus.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campuses"] });
      onClose();
      toast.success("Campus updated successfully");
    },
    onError: (error) => {
      toast.error(`${error?.message}`, {
        duration: 10000,
        action: {
          label: "Dismiss",
          onClick: () => toast.dismiss(),
        },
      });
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
        <h2 className="text-lg font-medium leading-6 text-gray-900 mb-6">
          Edit Campus
        </h2>

        <Formik
          initialValues={{
            name: campus?.name || "",
            location: campus?.location || "",
          }}
          validationSchema={yup.object({
            name: yup.string().required("Campus name is required"),
            location: yup.string().required("Location is required"),
          })}
          onSubmit={(values, { setSubmitting }) => {
            updateCampusMutation.mutate(values);
            setSubmitting(false);
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleSubmit,
            isSubmitting,
          }) => (
            <Form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campus Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    className={`w-full h-9 rounded-md border ${
                      errors.name && touched.name
                        ? "border-red-500"
                        : "border-gray-200"
                    } shadow-sm px-3 py-2 text-sm bg-gray-50`}
                    placeholder="Enter campus name"
                  />
                  {errors.name && touched.name && (
                    <FormErrorHandler
                      errors={errors.name}
                      message={errors.name}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campus Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={values.location}
                    onChange={handleChange}
                    className={`w-full h-9 rounded-md border ${
                      errors.location && touched.location
                        ? "border-red-500"
                        : "border-gray-200"
                    } shadow-sm px-3 py-2 text-sm bg-gray-50`}
                    placeholder="Enter campus location"
                  />
                  {errors.location && touched.location && (
                    <FormErrorHandler
                      errors={errors.location}
                      message={errors.location}
                    />
                  )}
                </div>

                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || updateCampusMutation.isPending}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-500 border border-transparent rounded-md hover:bg-primary-600"
                  >
                    {updateCampusMutation.isPending
                      ? "Updating..."
                      : "Update Campus"}
                  </button>
                </div>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

// Delete Campus Dialog
const DeleteRegionDialog = ({ isOpen, onClose, selectedCampus }) => {
  if (!isOpen) return null;

  const deleteCampusMutation = useMutation({
    mutationFn: deleteCampusService,
    onSuccess: () => {
      queryClient.invalidateQueries(["campuses"]);
      onClose();
      toast.success("Campus deleted successfully");
    },
    onError: (error) => {
      toast.error(`${error?.message}`, {
        duration: 3000,
        action: {
          label: "Dismiss",
          onClick: () => toast.dismiss(),
        },
      });
    },
  });

  const handleDelete = () => {
    deleteCampusMutation.mutate(selectedCampus.id);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      {/** title */}
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg">
        <h2 className="text-lg font-medium leading-6 text-gray-900">
          Confirm Deletion
        </h2>
        <p
          className={`mt-1 text-base text-secondary-800 text-normal font-["Roboto-Regular"]`}
        >
          You are about to permanently delete{" "}
          <span className={`text-secondary-900 text-bold font-["Roboto-Bold"]`}>
            {selectedCampus?.name}
          </span>
          . This action cannot be undone. Do you wish to continue?
        </p>
        <div className="mt-4 flex flex-row gap-4 w-full">
          <button
            type="button"
            className="flex w-1/3 justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:text-gray-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            onClick={() => onClose(false)}
            disabled={deleteCampusMutation.isPending}
          >
            Close
          </button>
          <button
            type="button"
            className="flex w-2/3 justify-center px-4 py-2 text-sm font-medium text-white bg-semantic-error border border-transparent rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500"
            onClick={handleDelete}
            disabled={deleteCampusMutation.isPending}
          >
            {deleteCampusMutation.isPending
              ? "Deleting..."
              : "Yes, Delete it forever"}
          </button>
        </div>
      </div>
    </div>
  );
};
