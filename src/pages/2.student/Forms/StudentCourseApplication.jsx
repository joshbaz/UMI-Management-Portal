import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { addYears, format } from 'date-fns';

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

  const initialValues = {
    course: storedData.course || '',
    academicYear: storedData.academicYear || '',
    studyMode: storedData.studyMode || '',
    intakePeriod: storedData.intakePeriod || '',
    programLevel: storedData.programLevel || '',
    specialization: storedData.specialization || '',
    completionTime: storedData.completionTime || '',
    expectedCompletionDate: storedData.expectedCompletionDate || ''
  };

  const validationSchema = Yup.object().shape({
    course: Yup.string().required('Course is required'),
    academicYear: Yup.string().required('Academic year is required'),
    studyMode: Yup.string().required('Study mode is required'),
    intakePeriod: Yup.string().required('Intake period is required'),
    programLevel: Yup.string().required('Program level is required'),
    completionTime: Yup.string().required('Completion time is required')
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
                className={`w-full h-9 rounded-md border ${
                  errors?.programLevel ? "border-red-500" : "border-gray-200"
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

            {/** course */}
            <div>
              <label htmlFor="course" className="block text-sm font-medium text-gray-700">
                Course
              </label>
              <input
                type="text"
                id="course"
                name="course"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.course}
                className={`w-full h-9 rounded-md border ${
                  errors?.course ? "border-red-500" : "border-gray-200"
                } shadow-sm px-3 py-2  text-sm bg-gray-50 appearance-none`}

                placeholder="Enter course name"
              />
              {errors.course && touched.course && (
                <div className="text-red-500 text-sm mt-1">{errors.course}</div>
              )}
            </div>

            {/** specialization */}
            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                Specialization (if applicable)
              </label>
              <input
                type="text"
                id="specialization"
                name="specialization"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.specialization}
                className={`w-full h-9 rounded-md border ${
                  errors?.specialization ? "border-red-500" : "border-gray-200"
                } shadow-sm px-3 py-2  text-sm bg-gray-50 appearance-none`}

                placeholder="Enter specialization"
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
                className={`w-full h-9 rounded-md border ${
                  errors?.studyMode ? "border-red-500" : "border-gray-200"
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
                className={`w-full h-9 rounded-md border ${
                  errors?.academicYear ? "border-red-500" : "border-gray-200"
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
                className={`w-full h-9 rounded-md border ${
                  errors?.intakePeriod ? "border-red-500" : "border-gray-200"
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
                className={`w-full h-9 rounded-md border ${
                  errors?.completionTime ? "border-red-500" : "border-gray-200"
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