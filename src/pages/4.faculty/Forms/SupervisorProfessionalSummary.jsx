import React, { useState } from 'react'
import { Formik, Form } from 'formik'
import * as yup from 'yup'
import FormErrorHandler from '../../../components/FormErrorHandler/FormErrorHandler'
import { useGetAllCampuses, useGetAllSchools, useGetAllDepartments } from '../../../store/tanstackStore/services/queries'

const SupervisorProfessionalSummary = ({ handleNext, formRef, createSupervisorMutation }) => {
    const [storedSchoolId, setStoredSchoolId] = useState('')
     // Get all campuses and schools
  const { data: campuses } = useGetAllCampuses()
  const { data: schools } = useGetAllSchools()
  

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
  const encryptedData = localStorage.getItem('supervisorProfessionalSummary')
  const storedData = encryptedData ? decryptData(encryptedData) : {}

  const { data: departments } = useGetAllDepartments(storedSchoolId || '')
  const initialValues = {
    employeeId: storedData.employeeId || '',
    designation: storedData.designation || '',
    schoolId: storedData.schoolId || '',
    campusId: storedData.campusId || '',
    departmentId: storedData.departmentId || ''
  }

  console.log(initialValues)

  const validationSchema = yup.object().shape({
    designation: yup.string().required('Designation is required'),
    schoolId: yup.string().required('School is required'),
    campusId: yup.string().required('Campus is required')
  })

  React.useEffect(() => {
    if (storedData?.schoolId) {
      setStoredSchoolId(storedData.schoolId)
    }
  }, [storedData?.schoolId])

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
        const encryptedValues = encryptData(values)
        localStorage.setItem('supervisorProfessionalSummary', encryptedValues)
         // Get and decrypt stored data from previous steps
        const personalInfo = decryptData(localStorage.getItem('supervisorPersonalInfo') || '')

        // Combine all data
        const finalFormData = {
          ...personalInfo,
          ...values,
          password: generatePassword()
        }
          // Call mutation to create supervisor
      createSupervisorMutation.mutate(finalFormData);
      }}
    >
      {({ values, handleChange, errors, touched, setFieldValue }) => (
        <Form>
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
                    errors.designation && touched.designation ? "border-red-500" : "border-gray-300"
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
                    handleChange(e)
                    setFieldValue('schoolId', '') // Reset school when campus changes
                    setFieldValue('departmentId', '') // Reset department when campus changes
                  }}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.campusId && touched.campusId ? "border-red-500" : "border-gray-300"
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
                  onChange={(e) => {
                    handleChange(e)
                    setStoredSchoolId(e.target.value)
                    setFieldValue('departmentId', '') // Reset department when school changes
                  }}
                  className={`mt-1 block w-full rounded-md border ${
                    errors.schoolId && touched.schoolId ? "border-red-500" : "border-gray-300"
                  } p-2`}
                  disabled={!values.campusId}
                >
                  <option value="">Select school</option>
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
            </div>

            {departments?.departments?.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Department (if applicable)
                </label>
                <select
                  name="departmentId"
                  value={values.departmentId}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2"
                  disabled={!values.schoolId}
                >
                  <option value="">Select department</option>
                  {departments?.departments?.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default SupervisorProfessionalSummary