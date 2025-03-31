import React, { useState } from 'react'
import { Formik, Form } from 'formik'
import * as yup from 'yup'
import FormErrorHandler from '../../../components/FormErrorHandler/FormErrorHandler'
import { Eye, EyeOff } from 'lucide-react'
import { HiOutlineDocumentDuplicate } from 'react-icons/hi'

const EditFacultyUserAccess = ({ formRef, changeFacultyPasswordMutation, facultyData }) => {
  const [showPassword, setShowPassword] = useState(false);

  const generatePassword = () => {
    return Math.random().toString(36).slice(-8);
  };

  const initialValues = {
    newPassword: '',
   
  }

  const validationSchema = yup.object().shape({
    newPassword: yup.string().required('Password is required'),
   
  })  

  return (
     <Formik
      innerRef={formRef}
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        changeFacultyPasswordMutation.mutate(values);
      }}
    >
      {({ values, setFieldValue, handleChange, errors, touched }) => (
        <Form>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              User Access
            </h2>
            <button
              disabled={changeFacultyPasswordMutation.isPending}
              className={`inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 ${
                changeFacultyPasswordMutation.isPending
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              <HiOutlineDocumentDuplicate className="w-4 h-4 mr-2" />
              {changeFacultyPasswordMutation.isPending ? "Saving..." : "Save Details"}
            </button>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Faculty Type
                </label>
                <input
                  type="text"
                  value={facultyData.facultyType || ''}
                  disabled
                  className="mt-1 block w-full text-gray-500 rounded-md border border-gray-300 bg-gray-100 p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Username (Work Email)
                </label>
                <input
                  type="text"
                  value={facultyData.workEmail || ''}
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
                    name="newPassword"
                    value={values.newPassword}
                    onChange={handleChange}
                    className={`mt-1 block w-full rounded-md border ${
                      errors.newPassword && touched.newPassword ? "border-red-500" : "border-gray-300"
                    } p-2`}
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
                  onClick={() => setFieldValue('newPassword', generatePassword())}
                  className="mt-1 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Generate Password
                </button>
              </div>
              <FormErrorHandler
                errors={errors.newPassword}
                touched={touched.newPassword}
              />
            </div>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default EditFacultyUserAccess