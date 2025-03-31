import React from 'react'

const FormNavigationButtons = ({ currentStep, handleCancel, handleBack, handleNext, STEPS }) => {
  return (
    <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
            >
              Cancel
            </button>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Back
              </button>
            )}
            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600"
              >
                Save
              </button>
            )}
          </div>
  )
}

export default FormNavigationButtons