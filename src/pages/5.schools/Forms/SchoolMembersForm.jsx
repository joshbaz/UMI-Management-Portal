import { addSchoolMembersService } from "@/store/tanstackStore/services/api";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik } from "formik";
import React from "react";
import { HiPencilAlt, HiPlus } from "react-icons/hi";
import { toast } from "sonner";
import * as yup from "yup";

const SchoolMembersForm = ({ handleNext }) => {
  const schoolId = localStorage.getItem("currentSchoolId");

  // Add school members mutation
  const addSchoolMembersMutation = useMutation({
    mutationFn: (data) => addSchoolMembersService(schoolId, data),
    onSuccess: () => {
      toast.success("School members added successfully", {
        duration: 3000,
        action: {
          label: "Dismiss",
          onClick: () => toast.dismiss(),
        },
      });
      handleNext();
    },
    onError: (error) => {
      toast.error(error.message || "Error adding school members", {
        duration: 3000,
        action: {
          label: "Dismiss", 
          onClick: () => toast.dismiss(),
        },
      });
    }
  });

  let initialValues = {
    dean: {
      name: "",
      email: "",
      contact: "",
      role: "Dean"
    },
    pa: {
      name: "",
      email: "", 
      contact: "",
      role: "Personal Assistant"
    }
  };

  const validationSchema = yup.object().shape({
    dean: yup.object().shape({
      name: yup.string().required("Dean name is required"),
      email: yup.string().email("Invalid email").required("Dean email is required"),
      contact: yup.string()
        .matches(/^[0-9]+$/, "Must be only digits")
        .min(9, "Must be at least 9 digits")
        .max(12, "Must be at most 12 digits")
        .required("Dean contact is required")
    })
  });

  return (
    <>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          // Only include PA if all fields are filled
          const data = {
            dean: values.dean,
            pa: values.pa.name && values.pa.email && values.pa.contact ? values.pa : undefined
          };
          addSchoolMembersMutation.mutate(data);
        }}
      >
        {({ values, handleChange, handleSubmit, errors, touched }) => (
          <Form>
            <div className="mt-8 space-y-8">
              {/** Form - Deans office */}
              <div className="flex flex-col gap-4 pb-4 border-b border-gray-200">
                <h1 className="text-base text-center">Dean's Office</h1>
                {/** dean */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dean
                    </label>
                    <input
                      type="text"
                      name="dean.name"
                      value={values.dean.name}
                      onChange={handleChange}
                      className={`w-full h-9 rounded-md border ${touched.dean?.name && errors.dean?.name ? "border-red-500" : "border-gray-200"} shadow-sm px-3 py-2 text-sm bg-gray-50`}
                      placeholder="Please enter the school dean"
                    />
                    {touched.dean?.name && errors.dean?.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.dean.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deans Contact (Phone Number)
                    </label>
                    <div className="flex">
                      <select
                        name="countryCode"
                        className=" rounded-l-md border border-r-0 border-gray-300 bg-gray-50 h-9"
                      >
                        <option value="+256">+256</option>
                      </select>
                      <input
                        type="tel"
                        name="dean.contact"
                        value={values.dean.contact}
                        onChange={handleChange}
                        className={`block w-full rounded-r-md border ${touched.dean?.contact && errors.dean?.contact ? "border-red-500" : "border-gray-300"} h-9`}
                      />
                    </div>
                    {touched.dean?.contact && errors.dean?.contact && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.dean.contact}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dean's Email
                    </label>
                    <input
                      type="email"
                      name="dean.email"
                      value={values.dean.email}
                      onChange={handleChange}
                      className={`w-full h-9 rounded-md border ${touched.dean?.email && errors.dean?.email ? "border-red-500" : "border-gray-200"} shadow-sm px-3 py-2 text-sm bg-gray-50`}
                      placeholder="Enter dean's email"
                    />
                    {touched.dean?.email && errors.dean?.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.dean.email}
                      </p>
                    )}
                  </div>

                {/** personal assistant */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Personal Assistant (Optional)
                    </label>
                    <input
                      type="text"
                      name="pa.name"
                      value={values.pa.name}
                      onChange={handleChange}
                      className={`w-full h-9 rounded-md border ${touched.pa?.name && errors.pa?.name ? "border-red-500" : "border-gray-200"} shadow-sm px-3 py-2 text-sm bg-gray-50`}
                      placeholder="Please enter the school personal assistant"
                    />
                    {touched.pa?.name && errors.pa?.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.pa.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Personal Assist. Contact (Optional)
                    </label>
                    <div className="flex">
                      <select
                        name="countryCode"
                        className=" rounded-l-md border border-r-0 border-gray-300 bg-gray-50 h-9"
                      >
                        <option value="+256">+256</option>
                      </select>
                      <input
                        type="tel"
                        name="pa.contact"
                        value={values.pa.contact}
                        onChange={handleChange}
                        className={`block w-full rounded-r-md border ${touched.pa?.contact && errors.pa?.contact ? "border-red-500" : "border-gray-300"} h-9`}
                      />
                    </div>
                    {touched.pa?.contact && errors.pa?.contact && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.pa.contact}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email fields */}
                <div className="grid grid-cols-1 gap-x-6 gap-y-8">
                

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PA's Email (Optional)
                    </label>
                    <input
                      type="email"
                      name="pa.email"
                      value={values.pa.email}
                      onChange={handleChange}
                      className={`w-full h-9 rounded-md border ${touched.pa?.email && errors.pa?.email ? "border-red-500" : "border-gray-200"} shadow-sm px-3 py-2 text-sm bg-gray-50`}
                      placeholder="Enter PA's email"
                    />
                    {touched.pa?.email && errors.pa?.email && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.pa.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/** Form - Administrator */}
              <div className="flex flex-col gap-4 pb-4">
                <h1 className="text-base text-center">School Administrator</h1>
                <div className="text-center text-gray-500 italic">
                  School administrators will be automatically added when managing faculty members
                </div>
              </div>

              {/** navigation buttons */}
              <div className="flex justify-end gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => navigate("/schools")}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addSchoolMembersMutation.isPending}
                  className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                    addSchoolMembersMutation.isPending ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary-500 hover:bg-primary-600'
                  }`}
                >
                  {addSchoolMembersMutation.isPending ? 'Saving...' : 'Save & Continue'}
                </button>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default SchoolMembersForm;
