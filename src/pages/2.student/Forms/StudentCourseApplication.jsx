import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { addYears, format } from 'date-fns';
import { useGetAllCampuses, useGetAllSchools, useGetAllDepartments, useGetAllCourses, useGetAllSpecializations } from "@/store/tanstackStore/services/queries";
import FormErrorHandler from "@/components/FormErrorHandler/FormErrorHandler";
import { useState, useEffect } from 'react';

const StudentCourseApplication = ({ formRef, handleNext, createStudentMutation }) => {
  // Encryption/decryption functions
  const encryptData = (data) => {
    return btoa(JSON.stringify(data)); // Simple base64 encoding for demo
  };

  const decryptData = (encryptedData) => {
    try {
      return JSON.parse(atob(encryptedData)); // Decode base64
    } catch {
      return {};
    }
  };

  // Get and decrypt stored data
  const encryptedData = localStorage.getItem('studentCourseApplication');
  const storedData = encryptedData ? decryptData(encryptedData) : {};

  const [selectedCampusId, setSelectedCampusId] = useState(storedData?.campusId || '')
  const [selectedSchoolId, setSelectedSchoolId] = useState(storedData?.schoolId || '')
  const [selectedCourseId, setSelectedCourseId] = useState(storedData?.course || '')

  const { data: campuses } = useGetAllCampuses();
  const { data: schools } = useGetAllSchools();
  const { data: departments } = useGetAllDepartments(selectedSchoolId || '');

  const { data: courses } = useGetAllCourses({
    campusId: selectedCampusId
  });
  const { data: specializations } = useGetAllSpecializations({
    courseId: selectedCourseId
  });
  console.log(courses)
  const initialValues = {
    course: storedData.course || '',
    academicYear: storedData.academicYear || '',
    studyMode: storedData.studyMode || '',
    intakePeriod: storedData.intakePeriod || '',
    programLevel: storedData.programLevel || '',
    specialization: storedData.specialization || '',
    completionTime: storedData.completionTime || '',
    expectedCompletionDate: storedData.expectedCompletionDate || '',
    schoolId: storedData.schoolId || "",
    campusId: storedData.campusId || "",
    departmentId: storedData.departmentId || null,
  };

  const validationSchema = Yup.object().shape({
    course: Yup.string().required('Course is required'),
    academicYear: Yup.string().required('Academic year is required'),
    studyMode: Yup.string().required('Study mode is required'),
    intakePeriod: Yup.string().required('Intake period is required'),
    programLevel: Yup.string().required('Program level is required'),
    completionTime: Yup.string().required('Completion time is required'),
    schoolId: Yup.string().required("School is required"),
    campusId: Yup.string().required("Campus is required"),
    departmentId: Yup.string().nullable(),
  });

  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-8);
    return password;
  };

  return (
    <Formik
      innerRef={formRef}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        // Encrypt data before storing
        const encryptedValues = encryptData(values);
        localStorage.setItem('studentCourseApplication', encryptedValues);
        const personalInfo = decryptData(localStorage.getItem('studentPersonalInfo') || '')
        const finalFormData = {
          ...personalInfo,
          ...values,
          password: generatePassword()
        }
        createStudentMutation.mutate(finalFormData);
        // handleNext();
      }}
    >
      {({ errors, touched, handleChange, handleBlur, values, setFieldValue }) => (
        <Form className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/** campus */}
            <div>
              <label
                htmlFor="campusId"
                className="block text-sm font-medium text-gray-700"
              >
                Campus
              </label>
              <select
                id="campusId"
                name="campusId"
                onChange={(e) => {
                  handleChange(e);
                  setSelectedCampusId(e.target.value);
                  setFieldValue('schoolId', '')
                  setSelectedSchoolId('');
                  setFieldValue('departmentId', '')
                }}
                onBlur={handleBlur}
                value={values.campusId}
                className={`w-full h-9 rounded-md border ${errors?.campusId ? "border-red-500" : "border-gray-200"
                  } shadow-sm px-3 py-2  text-sm bg-gray-50 appearance-none`}

                style={{
                  backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="2" d="M7 10l5 5 5-5"/></svg>')`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1rem',
                }}
              >
                <option value="">Select Campus</option>
                {campuses?.campuses?.map(campus => (
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

            {/** program level */}
            <div>
              <label htmlFor="programLevel" className="block text-sm font-medium text-gray-700">
                Program Level
              </label>
              <select
                id="programLevel"
                name="programLevel"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.programLevel}
                className={`w-full h-9 rounded-md border ${errors?.programLevel ? "border-red-500" : "border-gray-200"
                  } shadow-sm px-3 py-2  text-sm bg-gray-50 appearance-none`}

                style={{
                  backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="2" d="M7 10l5 5 5-5"/></svg>')`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1rem',
                }}
              >
                <option value="">Select Program Level</option>
                {/* <option value="certificate">Certificate</option> */}
                {/* <option value="diploma">Diploma</option> */}
                {/* <option value="bachelors">Bachelor's Degree</option> */}
                {/* <option value="postgraduate">Post Graduate</option> */}
                <option value="masters">Master's Degree</option>
                {/* <option value="phd">PhD</option> */}
              </select>
              {errors.programLevel && touched.programLevel && (
                <div className="text-red-500 text-sm mt-1">{errors.programLevel}</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/** course */}
            <div>
              <label htmlFor="course" className="block text-sm font-medium text-gray-700">
                Course
              </label>
              <select
                id="course"
                name="course"
                onChange={(e) => {
                  handleChange(e);
                  setSelectedCourseId(e.target.value);
                  setFieldValue('specialization', ''); // Reset specialization when course changes
                }}
                onBlur={handleBlur}
                value={values.course}
                className={`w-full h-9 rounded-md border ${errors?.course ? "border-red-500" : "border-gray-200"
                  } shadow-sm px-3 py-2  text-sm bg-gray-50 appearance-none`}
                style={{
                  backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="2" d="M7 10l5 5 5-5"/></svg>')`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1rem',
                }}
                disabled={!values.campusId}
              >
                <option value="">Select Course</option>
                {courses?.courses?.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.title}
                  </option>
                ))}
              </select>
              {errors.course && touched.course && (
                <div className="text-red-500 text-sm mt-1">{errors.course}</div>
              )}
            </div>


            {/** specialization */}
            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                Specialization (if applicable)
              </label>
              <select
                id="specialization"
                name="specialization"
                onChange={(e) => {
                  handleChange(e);
                  const specId = e.target.value;
                  const selectedSpec = specializations?.specializations?.find(s => s.id === specId);

                  if (selectedSpec?.duration) {
                    const years = selectedSpec.duration;
                    setFieldValue('completionTime', years.toString());
                    const completionDate = addYears(new Date(), years);
                    setFieldValue('expectedCompletionDate', format(completionDate, 'yyyy-MM-dd'));
                  }
                }}
                onBlur={handleBlur}
                value={values.specialization}
                className={`w-full h-9 rounded-md border ${errors?.specialization ? "border-red-500" : "border-gray-200"
                  } shadow-sm px-3 py-2  text-sm bg-gray-50 appearance-none`}
                style={{
                  backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="2" d="M7 10l5 5 5-5"/></svg>')`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1rem',
                }}
                disabled={!values.course}
              >
                <option value="">Select Specialization</option>
                {specializations?.specializations?.map((spec) => (
                  <option key={spec.id} value={spec.id}>
                    {spec.code ? `${spec.code} - ` : ''}{spec.name}
                  </option>
                ))}
              </select>
            </div>

            {/** school */}
            <div>
              <label
                htmlFor="schoolId"
                className="block text-sm font-medium text-gray-700"
              >
                School
              </label>
              <select
                id="schoolId"
                name="schoolId"
                onChange={(e) => {
                  handleChange(e);
                  setSelectedSchoolId(e.target.value)

                  setFieldValue('departmentId', '') // Reset department when campus changes
                }}
                onBlur={handleBlur}
                value={values.schoolId}
                className={`w-full h-9 rounded-md border ${errors?.schoolId ? "border-red-500" : "border-gray-200"
                  } shadow-sm px-3 py-2  text-sm bg-gray-50 appearance-none`}

                style={{
                  backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="2" d="M7 10l5 5 5-5"/></svg>')`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1rem',
                }}
                disabled={!values.campusId}
              >
                <option value="">Select School</option>
                {schools?.schools
                  ?.filter(school => school.campusId === values.campusId)
                  .map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.code} - {school.name}
                    </option>
                  ))}
              </select>
              <FormErrorHandler
                errors={errors?.schoolId}
                message={errors?.schoolId}
              />
            </div>

            {/** department */}
            <div>
              <label
                htmlFor="departmentId"
                className="block text-sm font-medium text-gray-700"
              >
                Department (if applicable)
              </label>
              <select
                id="departmentId"
                name="departmentId"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.departmentId || ""}
                className={`w-full h-9 rounded-md border ${errors?.departmentId ? "border-red-500" : "border-gray-200"
                  } shadow-sm px-3 py-2  text-sm bg-gray-50 appearance-none`}

                style={{
                  backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="2" d="M7 10l5 5 5-5"/></svg>')`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1rem',
                }}
                disabled={!values.schoolId}
              >
                <option value="">Select Department</option>
                {departments?.departments
                  ?.filter(department => department.schoolId === values.schoolId)
                  .map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.code} - {department.name}
                    </option>
                  ))}
              </select>
              <FormErrorHandler
                errors={errors?.departmentId}
                message={errors?.departmentId}
              />
            </div>



            {/** study mode */}
            <div>
              <label htmlFor="studyMode" className="block text-sm font-medium text-gray-700">
                Study Mode
              </label>
              <select
                id="studyMode"
                name="studyMode"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.studyMode}
                className={`w-full h-9 rounded-md border ${errors?.studyMode ? "border-red-500" : "border-gray-200"
                  } shadow-sm px-3 py-2  text-sm bg-gray-50 appearance-none`}

                style={{
                  backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="2" d="M7 10l5 5 5-5"/></svg>')`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1rem',
                }}
              >
                <option value="">Select Study Mode</option>
                <option value="fullTime">Full Time</option>
                <option value="partTime">Part Time</option>
                <option value="distance">Distance Learning</option>
              </select>
              {errors.studyMode && touched.studyMode && (
                <div className="text-red-500 text-sm mt-1">{errors.studyMode}</div>
              )}
            </div>

            {/** academic year */}
            <div>
              <label htmlFor="academicYear" className="block text-sm font-medium text-gray-700">
                Academic Year
              </label>
              <input
                type="text"
                id="academicYear"
                name="academicYear"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.academicYear}
                className={`w-full h-9 rounded-md border ${errors?.academicYear ? "border-red-500" : "border-gray-200"
                  } shadow-sm px-3 py-2  text-sm bg-gray-50 appearance-none`}

                placeholder="e.g. 2023/2024"
              />
              {errors.academicYear && touched.academicYear && (
                <div className="text-red-500 text-sm mt-1">{errors.academicYear}</div>
              )}
            </div>

            {/** intake period */}
            <div>
              <label htmlFor="intakePeriod" className="block text-sm font-medium text-gray-700">
                Intake Period
              </label>
              <select
                id="intakePeriod"
                name="intakePeriod"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.intakePeriod}
                className={`w-full h-9 rounded-md border ${errors?.intakePeriod ? "border-red-500" : "border-gray-200"
                  } shadow-sm px-3 py-2  text-sm bg-gray-50 appearance-none`}

                style={{
                  backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="2" d="M7 10l5 5 5-5"/></svg>')`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1rem',
                }}
              >
                <option value="">Select Intake Period</option>
                <option value="january">January</option>
                <option value="may">May</option>
                <option value="september">September</option>
              </select>
              {errors.intakePeriod && touched.intakePeriod && (
                <div className="text-red-500 text-sm mt-1">{errors.intakePeriod}</div>
              )}
            </div>

            {/** completion time */}
            <div>
              <label htmlFor="completionTime" className="block text-sm font-medium text-gray-700">
                Completion Time
              </label>
              <select
                id="completionTime"
                name="completionTime"
                onChange={(e) => {
                  handleChange(e);
                  const years = parseInt(e.target.value);
                  const completionDate = addYears(new Date(), years);
                  setFieldValue('expectedCompletionDate', format(completionDate, 'yyyy-MM-dd'));
                }}
                onBlur={handleBlur}
                value={values.completionTime}
                className={`w-full h-9 rounded-md border ${errors?.completionTime ? "border-red-500" : "border-gray-200"
                  } shadow-sm px-3 py-2  text-sm bg-gray-50 appearance-none`}
                style={{
                  backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="2" d="M7 10l5 5 5-5"/></svg>')`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 0.5rem center',
                  backgroundSize: '1rem',
                }}
              >
                <option value="">Select Completion Time</option>

                <option value="2">2 Years</option>

                <option value="4">4 Years</option>

                <option value="6">6 Years</option>

              </select>
              {errors.completionTime && touched.completionTime && (
                <div className="text-red-500 text-sm mt-1">{errors.completionTime}</div>
              )}
            </div>

            {/** expected completion date */}
            <div>
              <label htmlFor="expectedCompletionDate" className="block text-sm font-medium text-gray-700">
                Expected Completion Date
              </label>
              <input
                type="date"
                id="expectedCompletionDate"
                name="expectedCompletionDate"
                value={values.expectedCompletionDate}
                disabled
                className="w-full h-9 rounded-md border border-gray-200 shadow-sm px-3 py-2 text-sm bg-gray-50"
              />
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default StudentCourseApplication;