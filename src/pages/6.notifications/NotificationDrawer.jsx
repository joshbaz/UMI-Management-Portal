/* eslint-disable react/prop-types */
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { HiX } from 'react-icons/hi'
import { DUMMY_DATA } from './NotificationsManagement'

const NotificationDrawer = ({ isOpen, onClose, notificationId }) => {
  // Find the notification data based on the ID
  const notificationData = DUMMY_DATA.find(item => item.id === notificationId) || {
    id: 2,
    type: "Proposal Submission Delayed",
    studentName: "Apio Asiimwe",
    priority: "Important",
    remarks: "Submission overdue by 7 days",
  }

  // Default student data
  const data = {
    name: notificationData.studentName,
    studentId: 'C5X2Q4Y3V',
    type: 'Masters Student',
    dateOfAdmission: '29/01/2025',
    currentStatus: 'Normal Progress',
    totalTime: '120 days',
    notificationType: notificationData.type,
    notificationDetail: notificationData.remarks,
    system: 'DRIMS System',
    timeAgo: '2 hours ago'
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
                    {/* Header */}
                    <div className="flex justify-center py-4 mt-8 mb-5">
                      <div className="flex justify-between items-center bg-white rounded-lg border p-4 w-[460px]">
                        <Dialog.Title className="text-sm font-medium text-gray-900">
                          Notification
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

                    {/* Content */}
                    <div className="flex-1 flex flex-col items-center space-y-6 mt-4">
                      {/* Profile Container */}
                      <div className="flex justify-center">
                        <div className="flex justify-between items-start bg-white rounded-lg border p-4 w-[460px]">
                          <div className="flex gap-3">
                            <div className="bg-gray-400 rounded-full w-10 h-10 flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {data.name?.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-gray-900 font-medium">{data.name}</h3>
                              <p className="text-gray-600 text-sm">{data.type}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-600 text-sm">Student ID</p>
                            <p className="text-gray-900">{data.studentId}</p>
                          </div>
                        </div>
                      </div>

                      {/* Details Container */}
                      <div className="flex justify-center">
                        <div className="bg-white rounded-lg border p-4 w-[460px]">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <p className="text-gray-600 text-sm">Date of Admission</p>
                              <p className="text-gray-900">{data.dateOfAdmission}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 text-sm">Current Status</p>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                {data.currentStatus}
                              </span>
                            </div>
                            <div>
                              <p className="text-gray-600 text-sm">Total Time</p>
                              <p className="text-gray-900">{data.totalTime}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Notification Container */}
                      <div className="flex justify-center">
                        <div className="bg-white rounded-lg border p-4 w-[460px]">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className="text-[#111827] font-medium mb-1">
                                {data.notificationType}
                              </h4>
                              <p className="text-gray-600 text-sm">
                                {data.notificationDetail}
                              </p>
                            </div>
                            <button
                              className="rounded bg-white px-4 py-2 text-sm border border-gray-200 hover:bg-gray-50"
                              onClick={onClose}
                            >
                              Notify Admin
                            </button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="bg-yellow-100 rounded-full w-6 h-6 flex items-center justify-center">
                                <span className="text-yellow-800 text-xs">⚠</span>
                              </div>
                              <span className="text-gray-600 text-sm">{data.system}</span>
                            </div>
                            <span className="text-gray-500 text-sm">{data.timeAgo}</span>
                          </div>
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

export default NotificationDrawer
