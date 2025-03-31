import React, { useState } from "react";
import { Formik, Form } from "formik";
import * as yup from "yup";
import { HiPencilAlt, HiPlus, HiTrash, HiX } from "react-icons/hi";
import FormErrorHandler from "../../../components/FormErrorHandler/FormErrorHandler";
import { useGetAllCampuses } from "@/store/tanstackStore/services/queries";
import {
 
  updateSchoolService,
} from "@/store/tanstackStore/services/api";
import { queryClient } from "@/utils/tanstack";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const EditSchoolDetailsForm = ({ handleNext, schoolData }) => {

    let navigate = useNavigate();
  // Update school mutation
  const updateSchoolMutation = useMutation({
    mutationFn: (data) => updateSchoolService(schoolData?.school?.id, data),
    onSuccess: (data) => {
      toast.success("School updated successfully", {
        duration: 3000,
        action: {
          label: "Dismiss",
          onClick: () => toast.dismiss(),
        },
      });
      queryClient.invalidateQueries({ queryKey: ["schools"] });
      
      // Navigate to next step
    //   handleNext();
    },
    onError: (error) => {
      toast.error(error.message || "Error updating school", {
        duration: 3000,
        action: {
          label: "Dismiss",
          onClick: () => toast.dismiss(),
        },
      });
    }
  });

  let initialValues = {
    name: schoolData?.school?.name || "",
    code: schoolData?.school?.code || "",
    url: schoolData?.school?.url || "",
    campusId: schoolData?.school?.campusId || "",
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
        enableReinitialize
        onSubmit={(values) => {
          updateSchoolMutation.mutate({
            ...values
          });
        }}
      >
        {({ values, handleChange, handleSubmit, errors, touched }) => (
          <Form>
            <div className="mt-8">
                <div className="flex justify-end mb-2 gap-4">
                <button
                    type="submit"
                    disabled={updateSchoolMutation.isPending}
                    className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                      updateSchoolMutation.isPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-500 hover:bg-primary-600'
                    }`}
                  >
                    {updateSchoolMutation.isPending ? 'Updating...' : 'Update'}
                  </button>

                </div>
           
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

                {/** navigation buttons */}
                <div className="col-span-2 mt-8 flex justify-end gap-4">
                
              

                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-4 py-2 text-sm font-medium text-gray-700 border-2 border-gray-200 rounded-md hover:text-gray-500 bg-gray-50"
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
                
              </div>
            </div>
          </Form>
        )}
      </Formik>

      
    </>
  );
}

export default EditSchoolDetailsForm