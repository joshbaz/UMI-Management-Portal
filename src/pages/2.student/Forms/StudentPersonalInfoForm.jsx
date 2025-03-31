import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { useGetAllCampuses, useGetAllSchools, useGetAllDepartments } from "@/store/tanstackStore/services/queries";
import FormErrorHandler from "@/components/FormErrorHandler/FormErrorHandler";



const StudentPersonalInfoForm = ({ formRef, handleNext }) => {
  const [storedSchoolId, setStoredSchoolId] = useState('')
  const { data: campuses } = useGetAllCampuses();
  const { data: schools } = useGetAllSchools();
  const { data: departments } = useGetAllDepartments(storedSchoolId || '');

   // Encryption/decryption functions
   const encryptData = (data) => {
    return btoa(JSON.stringify(data)) // Simple base64 encoding for demo
  }

  const decryptData = (encryptedData) => {
    try {
      return JSON.parse(atob(encryptedData)) // Decode base64
    } catch {
      return {}
    }
  }

    // Get and decrypt stored data
    const encryptedData = localStorage.getItem('studentPersonalInfo')
    const storedData = encryptedData ? decryptData(encryptedData) : {}

  const initialValues = {
    title: storedData.title || "",
    firstName: storedData.firstName || "",
    lastName: storedData.lastName || "",
    email: storedData.email || "",
    phoneNumber: storedData.phoneNumber || "",
    dateOfBirth: storedData.dateOfBirth || "",
    gender: storedData.gender || "",
    nationality: storedData.nationality || "",
    address: storedData.address || "",
    city: storedData.city || "",
    country: storedData.country || "",
    schoolId: storedData.schoolId || "",
    campusId: storedData.campusId || "",
    departmentId: storedData.departmentId || null,
  };

  const validationSchema = Yup.object().shape({
    title: Yup.string().required("Title is required"),
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    phoneNumber: Yup.string().required("Phone number is required"),
    dateOfBirth: Yup.date().required("Date of birth is required"),
    gender: Yup.string().required("Gender is required"),
    schoolId: Yup.string().required("School is required"),
    campusId: Yup.string().required("Campus is required"),
    departmentId: Yup.string().nullable(),
  });

  React.useEffect(() => {
    if (storedData?.schoolId) {
      setStoredSchoolId(storedData.schoolId)
    }
  }, [storedData?.schoolId])



  return (
    <Formik
      innerRef={formRef}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        // Encrypt data before storing
        const encryptedValues = encryptData(values)
        localStorage.setItem('studentPersonalInfo', encryptedValues)
        handleNext()
      }}
    >
      {({ errors, touched, handleChange, handleBlur, values, setFieldValue }) => (
        <Form className="space-y-6">
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-3 gap-6">
              {/** title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700"
                >
                  Title
                </label>
                <select
                  id="title"
                  name="title"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.title}
                  className={`w-full h-9 rounded-md border ${
                    errors?.title ? "border-red-500" : "border-gray-200"
                  } shadow-sm px-3 py-2  text-sm bg-gray-50 appearance-none`}

                  style={{
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="2" d="M7 10l5 5 5-5"/></svg>')`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.5rem center',
                    backgroundSize: '1rem',
                  }}
                >
                  <option value="">Select Title</option>
                  <option value="Mr">Mr.</option>
                  <option value="Ms">Ms.</option>
                  <option value="Mrs">Mrs.</option>
                  <option value="Dr">Dr.</option>
                  <option value="Prof">Prof.</option>
                </select>
                <FormErrorHandler
                  errors={errors?.title}
                  message={errors?.title}
                />
              </div>

              {/** first name */} 
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.firstName}
                  className={`w-full h-9 rounded-md border ${
                    errors?.firstName ? "border-red-500" : "border-gray-200"
                  } shadow-sm px-3 py-2  text-sm bg-gray-50 appearance-none`} 
                />
                <FormErrorHandler
                  errors={errors?.firstName}
                  message={errors?.firstName}
                />
              </div>

              {/** last name */}
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.lastName}
                  className={`w-full h-9 rounded-md border ${
                    errors?.lastName ? "border-red-500" : "border-gray-200"
                  } shadow-sm px-3 py-2  text-sm bg-gray-50 appearance-none`} 
                />
                <FormErrorHandler
                  errors={errors?.lastName}
                  message={errors?.lastName}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.email}
                  className={`w-full h-9 rounded-md border ${
                    errors?.email ? "border-red-500" : "border-gray-200"
                  } shadow-sm px-3 py-2  text-sm bg-gray-50 appearance-none`} 
                />
                <FormErrorHandler
                  errors={errors?.email}
                  message={errors?.email}
                />
              </div>

              <div>
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone Number
                </label>
                <input
                  type="text"
                  id="phoneNumber"
                  name="phoneNumber"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.phoneNumber}
                  className={`w-full h-9 rounded-md border ${
                    errors?.phoneNumber ? "border-red-500" : "border-gray-200"
                  } shadow-sm px-3 py-2  text-sm bg-gray-50 appearance-none`} 
                />
                <FormErrorHandler
                  errors={errors?.phoneNumber}
                  message={errors?.phoneNumber}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/** date of birth */}
              <div>
                <label
                  htmlFor="dateOfBirth" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.dateOfBirth}
                  className={`w-full h-9 rounded-md border ${
                    errors?.dateOfBirth ? "border-red-500" : "border-gray-200"
                  } shadow-sm px-3 py-2  text-sm bg-gray-50 appearance-none`} 
                />
                <FormErrorHandler
                  errors={errors?.dateOfBirth}
                  message={errors?.dateOfBirth}
                />
              </div>

              {/** gender */}
              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-gray-700"
                >
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.gender}
                  className={`w-full h-9 rounded-md border ${
                    errors?.gender ? "border-red-500" : "border-gray-200"
                  } shadow-sm px-3 py-2  text-sm bg-gray-50 appearance-none`} 

                  style={{
                    backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeWidth="2" d="M7 10l5 5 5-5"/></svg>')`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 0.5rem center',
                    backgroundSize: '1rem',
                  }}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
                <FormErrorHandler
                  errors={errors?.gender}
                  message={errors?.gender}
                />
              </div>
            </div>

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
                    setFieldValue('schoolId', '') // Reset school when campus changes
                    setFieldValue('departmentId', '') // Reset department when campus changes
                  }}
                  onBlur={handleBlur}
                  value={values.campusId}
                  className={`w-full h-9 rounded-md border ${
                    errors?.campusId ? "border-red-500" : "border-gray-200"
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
                    setStoredSchoolId(e.target.value)
                
                    setFieldValue('departmentId', '') // Reset department when campus changes
                  }}
                  onBlur={handleBlur}
                  value={values.schoolId}
                  className={`w-full h-9 rounded-md border ${
                    errors?.schoolId ? "border-red-500" : "border-gray-200"
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
                        {school.name}
                      </option>
                    ))}
                </select>
                <FormErrorHandler
                  errors={errors?.schoolId}
                  message={errors?.schoolId}
                />
              </div>

              {/** department */}
              <div className="col-span-2">
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
                  className={`w-full h-9 rounded-md border ${
                    errors?.departmentId ? "border-red-500" : "border-gray-200"
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
                        {department.name}
                      </option>
                    ))}
                </select>
                <FormErrorHandler
                  errors={errors?.departmentId}
                  message={errors?.departmentId}
                />
              </div>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default StudentPersonalInfoForm;
