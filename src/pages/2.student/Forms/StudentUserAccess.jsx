import React, { useState } from 'react'
import { Formik, Form } from 'formik'
import * as yup from 'yup'
import FormErrorHandler from '../../../components/FormErrorHandler/FormErrorHandler'
import { Eye, EyeOff } from 'lucide-react'

const StudentUserAccess = ({ formRef, createStudentMutation }) => {
  const [showPassword, setShowPassword] = useState(false);

  const generatePassword = () => {
    return Math.random().toString(36).slice(-8);
  };

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

  const savedUserAccess = decryptData(localStorage.getItem('studentUserAccess'))
  const personalInfo = decryptData(localStorage.getItem('studentPersonalInfo') || '')

  const initialValues = {
    password: savedUserAccess.password || ''
  }

  const validationSchema = yup.object().shape({
    password: yup.string().required('Password is required')
  })
  return (
    <Formik
    innerRef={formRef}
    initialValues={initialValues}
    validationSchema={validationSchema}
    onSubmit={(values) => {
      // Get and decrypt stored data from previous steps
      const personalInfo = decryptData(localStorage.getItem('studentPersonalInfo') || '')
      const courseInfo = decryptData(localStorage.getItem('studentCourseApplication') || '')

      // Combine all data
      const finalFormData = {
        ...personalInfo,
        ...courseInfo,
        ...values
      }

      // Encrypt and store current step data
      localStorage.setItem('studentUserAccess', encryptData(values))
      
      // Store encrypted final data
      localStorage.setItem('studentFinalData', encryptData(finalFormData))
      console.log('Final form data:', finalFormData)

      // Call mutation to create faculty
      createStudentMutation.mutate(finalFormData);
    }}
  >
    {({ values, setFieldValue, handleChange, errors, touched }) => (
      <Form>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Access Type
              </label>
              <input
                type="text"
                value={ 'Student'}
                disabled
                className="mt-1 block w-full text-gray-500 rounded-md border border-gray-300 bg-gray-100 p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username ( Email)
              </label>
              <input
                type="text"
                value={personalInfo.email || ''}
                disabled
                className="mt-1 block w-full text-gray-500 rounded-md border border-gray-300 bg-gray-100 p-2"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  className={`w-full h-9 rounded-md border ${
                    errors?.password ? "border-red-500" : "border-gray-200"
                  } shadow-sm px-3 py-2  text-sm bg-gray-50 appearance-none`} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => setFieldValue('password', generatePassword())}
                className=" inline-flex items-center px-4 py-1 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Generate Password
              </button>
            </div>
            <FormErrorHandler
              errors={errors.password}
              touched={touched.password}
            />
          </div>
        </div>
      </Form>
    )}
  </Formik>
  )
}

export default StudentUserAccess;