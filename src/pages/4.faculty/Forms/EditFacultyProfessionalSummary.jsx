import React from "react";
import { Formik, Form } from "formik";
import * as yup from "yup";
import FormErrorHandler from "../../../components/FormErrorHandler/FormErrorHandler";
import {
  useGetAllCampuses,
  useGetAllSchools,
} from "../../../store/tanstackStore/services/queries";
import { HiOutlineDocumentDuplicate } from "react-icons/hi";

const EditFacultyProfessionalSummary = ({
  handleNext,
  formRef,
  facultyData,
  updateFacultyMutation,
}) => {
  const { data: campuses } = useGetAllCampuses();
  const { data: schools } = useGetAllSchools();

  const initialValues = {
    ...facultyData,
    employeeId: facultyData.employeeId || "",
    designation: facultyData.designation || "",
    schoolId: facultyData.schoolId || "",
    campusId: facultyData.campusId || "",
  };

  console.log(initialValues);

  const validationSchema = yup.object().shape({
    designation: yup.string().required("Designation is required"),
    schoolId: yup.string().required("School is required"),
    campusId: yup.string().required("Campus is required"),
  });

  

  return (
    <Formik
      innerRef={formRef}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        // Encrypt data before storing
        updateFacultyMutation.mutate(values);
      }}
    >
      {({ values, handleChange, errors, touched, setFieldValue }) => (
        <Form>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Professional Summary
            </h2>
            <button
              disabled={updateFacultyMutation.isPending}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 ${
                updateFacultyMutation.isPending
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <HiOutlineDocumentDuplicate className="w-4 h-4 mr-2" />
              {updateFacultyMutation.isPending ? "Saving..." : "Save Details"}
            </button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Employee ID (if applicable)
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={values.employeeId}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Designation
                </label>
                <input
                  type="text"
                  name="designation"
                  value={values.designation}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.designation && touched.designation
                      ? "border-red-500"
                      : "border-gray-300"
                  } p-2`}
                />
                <FormErrorHandler
                  errors={errors?.designation}
                  message={errors?.designation}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Campus
                </label>
                <select
                  name="campusId"
                  value={values.campusId}
                  onChange={(e) => {
                    handleChange(e);
                    setFieldValue("schoolId", ""); // Reset school when campus changes
                  }}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.campusId && touched.campusId
                      ? "border-red-500"
                      : "border-gray-300"
                  } p-2`}
                >
                  <option value="">Select campus</option>
                  {campuses?.campuses?.map((campus) => (
                    <option key={campus.id} value={campus.id}>
                      {campus.name}
                    </option>
                  ))}
                </select>
                <FormErrorHandler
                  errors={errors?.campusId}
                  message={errors?.campusId}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  School
                </label>
                <select
                  name="schoolId"
                  value={values.schoolId}
                  onChange={handleChange}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.schoolId && touched.schoolId
                      ? "border-red-500"
                      : "border-gray-300"
                  } p-2`}
                  disabled={!values.campusId}
                >
                  <option value="">Select school</option>
                  {schools?.schools
                    ?.filter((school) => school.campusId === values.campusId)
                    .map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                </select>
                <FormErrorHandler
                  errors={errors?.schoolId}
                  message={errors?.schoolId}
                />
              </div>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default EditFacultyProfessionalSummary;
