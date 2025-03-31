/* eslint-disable react/prop-types */
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { HiX } from 'react-icons/hi'
import { useNavigate } from 'react-router-dom';

const StudentDetailDrawer = ({ isOpen, onClose, studentId, studentData }) => {
    let navigate = useNavigate();
  // Find the student data based on the ID
  const student = studentData.find(item => item.id === studentId) || {
    id: '',
    fullname: '',
    email: '',
    category: '',
    status: 'Unknown',
    statusColor: '#000',
    createdAt: '',
    timeFromAdmission: '',
    previousStatus: ''
  }

  // Format student data
  const data = {
    name: student.fullname,
    studentId: student.id,
    type: student.category,
    email: student.email,
    currentStatus: student.status,
    statusColor: student.statusColor,
    admissionDate: new Date(student.createdAt).toLocaleDateString(), // Using actual admission date
    totalTime: student.timeFromAdmission, // Using calculated time
    previousStatus: student.previousStatus // Using actual previous status
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
    <Dialog as="div" className="relative z-50" onClose={onClose}>
      <Transition.Child
        as={Fragment}
        enter="ease-in-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in-out duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity" />
      </Transition.Child>
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-300"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-300"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="pointer-events-auto w-[500px] bg-gray-100">
                <div className="flex h-full flex-col">
                  {/* Header - Fixed */}
                  <div className="flex justify-center py-4 mt-3 mb-0">
                    <div className="flex justify-between items-center bg-white rounded-lg border p-4 w-[460px]">
                      <Dialog.Title className="text-base font-[Inter-Medium] text-gray-900">
                        Student Details
                      </Dialog.Title>
                      <button
                        onClick={onClose}
                        className="bg-primary-500 text-white rounded-lg hover:bg-primary-800 flex items-center justify-center whitespace-nowrap text-sm"
                        style={{ width: "148px", height: "36px", gap: "8px" }}
                      >
                        <HiX className="w-4 h-4 flex-shrink-0" />
                        <span className="flex-shrink-0 text-sm">Close Window</span>
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="flex flex-col items-center space-y-6 px-4 pb-6">
                      {/* Profile Container */}
                      <div className="flex justify-center">
                        <div className="flex justify-between items-start bg-transparent py-2  px-2 w-[460px]">
                          <div className="flex gap-3">
                            <div className="bg-gray-400 rounded-full w-10 h-10 flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {data.name?.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-gray-900 font-[Inter-Medium]">{data.name}</h3>
                              <p className="text-gray-600 text-sm font-[Inter-Regular] capitalize">{data.type}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm font-[Inter-Regular]">Student ID</p>
                            <p className="text-gray-900 text-sm font-[Inter-Medium]">{data.studentId}</p>
                          </div>
                        </div>
                      </div>

                      {/* Details Container */}
                      <div className="flex justify-center">
                        <div className="bg-tansparent rounded-lg  px-2 w-[460px]">
                          <div className="grid grid-cols-3 gap-4 place-items-center ">
                            <div>
                              <p className="text-gray-600 text-sm font-[Inter-Regular]">Admission Date</p>
                              <div className="flex items-center gap-2">
                                <p className="text-gray-900 text-sm font-[Inter-Medium]">{data.admissionDate}</p>
                                
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-600 text-sm font-[Inter-Regular]">Current Status</p>
                              <span 
                                className="inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-[Inter-Medium] capitalize"
                                style={{
                                  color: data.statusColor,
                                  backgroundColor: `${data.statusColor}18`,
                                  border: `1px solid ${data.statusColor}`
                                }}
                              >
                                {data.currentStatus}
                              </span>
                            </div>

                            <div>
                              <p className="text-gray-600 text-sm font-[Inter-Regular]">Total Time</p>
                              <span className="text-gray-500 font-[Inter-Medium] text-sm">{data.totalTime}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Timeline Container */}
                      <div className="flex justify-center">
                        <div className="bg-white rounded-lg border p-4 w-[460px]">
                          <h4 className="text-gray-900 font-[Inter-Medium] mb-4">Timeline</h4>
                          <div className="space-y-4">
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-primary-500 mt-2"></div>
                              <div>
                                <p className="text-gray-900 font-[Inter-Medium]">Started Program</p>
                                <p className="text-gray-500 font-[Inter-Regular] text-sm">{data.admissionDate}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-primary-500 mt-2"></div>
                              <div>
                                <p className="text-gray-900 font-[Inter-Medium]">Previous Status</p>
                                <p className="text-gray-500 font-[Inter-Regular] text-sm">{data.previousStatus}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-3">
                              <div className="w-2 h-2 rounded-full bg-primary-500 mt-2"></div>
                              <div>
                                <p className="text-gray-900 font-[Inter-Medium]">Current Status</p>
                                <p className="text-gray-500 font-[Inter-Regular] text-sm">{data.currentStatus}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* More Details Button */}
                      <div className="flex justify-center">
                        <button
                          onClick={() => navigate(`/students/profile/${data.studentId}`)}
                          className="bg-primary-500 text-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-[Inter-SemiBold] hover:text-primary-500 hover:border-primary-500 hover:bg-gray-50"
                        >
                          View More Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </div>
    </Dialog>
  </Transition.Root>
  )
}

export default StudentDetailDrawer