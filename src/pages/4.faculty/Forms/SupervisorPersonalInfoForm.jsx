import React from 'react'
import { Formik, Form } from 'formik'
import * as yup from 'yup'
import FormErrorHandler from '../../../components/FormErrorHandler/FormErrorHandler'

const SupervisorPersonalInfoForm = ({ formRef, handleNext }) => {
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
  const encryptedData = localStorage.getItem('supervisorPersonalInfo')
  const storedData = encryptedData ? decryptData(encryptedData) : {}

  const initialValues = {
    facultyType: storedData.facultyType || '',
    title: storedData.title || '',
    name: storedData.name || '',
    workEmail: storedData.workEmail || '',
    personalEmail: storedData.personalEmail || '',
    primaryPhone: storedData.primaryPhone || '',
    secondaryPhone: storedData.secondaryPhone || ''
  }

  const validationSchema = yup.object().shape({
    facultyType: yup.string().required('Faculty type is required'),
    title: yup.string().required('Title is required'),
    name: yup.string().required('Full name is required'),
    workEmail: yup.string().email('Invalid email').required('Work email is required'),
    personalEmail: yup.string().email('Invalid email'),
    primaryPhone: yup.string().required('Primary phone number is required'),
    secondaryPhone: yup.string()
  })
  return (
    <Formik
    innerRef={formRef}
    initialValues={initialValues}
    validationSchema={validationSchema}
    onSubmit={(values) => {
      // Encrypt data before storing
      const encryptedValues = encryptData(values)
      localStorage.setItem('supervisorPersonalInfo', encryptedValues)
      handleNext()  
    }}  
  >
    {({ values, handleChange, errors, touched }) => (
      <Form>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Faculty Type
            </label>
            <select
              name="facultyType"
              value={values.facultyType}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md border ${
                errors.facultyType && touched.facultyType ? "border-red-500" : "border-gray-300"
              } p-2`}
            >
              <option value="">Select faculty type</option>
              
              <option  value="supervisor">Supervisor</option>
            </select>
            <FormErrorHandler
              errors={errors?.facultyType}
              message={errors?.facultyType}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <select
                name="title"
                value={values.title}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.title && touched.title ? "border-red-500" : "border-gray-300"
                } p-2`}
              >
                <option value="">Select title</option>
                <option value="Dr.">Dr.</option>
                <option value="Prof.">Prof.</option>
                <option value="Mr.">Mr.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Ms.">Ms.</option>
              </select>
              <FormErrorHandler
                errors={errors?.title}
                message={errors?.title}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={values.name}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.name && touched.name ? "border-red-500" : "border-gray-300"
                } p-2`}
              />
              <FormErrorHandler
                errors={errors?.name}
                message={errors?.name}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Work Email Address
              </label>
              <input
                type="email"
                name="workEmail"
                value={values.workEmail}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.workEmail && touched.workEmail ? "border-red-500" : "border-gray-300"
                } p-2`}
              />
              <FormErrorHandler
                errors={errors?.workEmail}
                message={errors?.workEmail}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Personal Email Address (Optional)
              </label>
              <input
                type="email"
                name="personalEmail"
                value={values.personalEmail}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.personalEmail && touched.personalEmail ? "border-red-500" : "border-gray-300"
                } p-2`}
              />
              <FormErrorHandler
                errors={errors?.personalEmail}
                message={errors?.personalEmail}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Primary Phone Number
              </label>
              <input
                type="text"
                name="primaryPhone"
                value={values.primaryPhone}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.primaryPhone && touched.primaryPhone ? "border-red-500" : "border-gray-300"
                } p-2`}
              />  
              <FormErrorHandler
                errors={errors?.primaryPhone}
                message={errors?.primaryPhone}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Secondary Phone Number (Optional)
              </label>
              <input
                type="text"
                name="secondaryPhone"
                value={values.secondaryPhone}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md border ${
                  errors.secondaryPhone && touched.secondaryPhone ? "border-red-500" : "border-gray-300"
                } p-2`}
              />
              <FormErrorHandler
                errors={errors?.secondaryPhone}
                message={errors?.secondaryPhone}
                  />
            </div>
          </div>

         
        </div>
      </Form>
    )}
  </Formik>
  )
}

export default SupervisorPersonalInfoForm