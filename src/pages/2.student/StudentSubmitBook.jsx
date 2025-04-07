import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { submitStudentBookService } from '../../store/tanstackStore/services/api';
import { toast } from 'sonner';
import { queryClient } from '../../utils/tanstack';

const validationSchema = Yup.object().shape({
  title: Yup.string()
    .required('Title is required'),
  description: Yup.string(),
  submissionDate: Yup.date()
    .required('Submission date is required')
});

const StudentSubmitBook = () => {

    const { id } = useParams();
    let navigate = useNavigate();
      const submitBookMutation = useMutation({
        enabled: !!id,
        mutationFn: (values) => submitStudentBookService(id, values),
        onSuccess: (data) => {
          toast.success(data?.message, {
            duration: 5000,
            action: {
              label: 'Close',
              onClick: () => toast.dismiss()
            }
          });
          navigate(`/students/profile/${id}`);
          queryClient.resetQueries({ queryKey: ['student', id] });
          queryClient.invalidateQueries({ queryKey: ['student', id] });
        },
        onError: (error) => {
          toast.error( error?.message, {
            duration: 10000,
            action: {
              label: 'Close',
              onClick: () => toast.dismiss()
            }
          });
        }
      });
    
      const initialValues = {
        title: '',
        description: '',
        submissionDate: '',
        submissionCondition: "Normal"
      };
    
      const handleSubmit = async (values, { setSubmitting }) => {
        try {
          await submitBookMutation.mutateAsync(values);
          console.log('Book submitted successfully');
         
        } catch (error) {
          console.error('Error submitting book:', error);
        } finally {
          setSubmitting(false);
        }
      };
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Submit Research Book</h1>
      
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            let formData = new FormData();
            formData.append('title', values.title);
            formData.append('description', values.description);
            formData.append('submissionDate', values.submissionDate);
            formData.append('submissionCondition', values.submissionCondition);
            submitBookMutation.mutate(formData);
          }}
        >
          {({ errors, touched, setFieldValue, isSubmitting }) => (
            <Form className="space-y-6">
              <div>
                <label htmlFor="submissionDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Submission Date
                </label>
                <Field
                  type="date"
                  id="submissionDate"
                  name="submissionDate"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.submissionDate && touched.submissionDate && (
                  <div className="text-red-500 text-sm mt-1">{errors.submissionDate}</div>
                )}
              </div>

              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Book Title
                </label>
                <Field
                  type="text"
                  id="title"
                  name="title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.title && touched.title && (
                  <div className="text-red-500 text-sm mt-1">{errors.title}</div>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Book Abstract (Optional)
                </label>
                <Field
                  as="textarea"
                  id="description"
                  name="description"
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                {errors.description && touched.description && (
                  <div className="text-red-500 text-sm mt-1">{errors.description}</div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={ submitBookMutation.isPending}
                  className="px-4 py-2 bg-[#23388F] text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                    { submitBookMutation.isPending ? 'Submitting...' : 'Submit Book'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}

export default StudentSubmitBook