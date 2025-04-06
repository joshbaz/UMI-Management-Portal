/* eslint-disable react/prop-types */
import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { HiX } from 'react-icons/hi'
import { useGetNotifications } from '@/store/tanstackStore/services/queries'
import { format } from 'date-fns'

const NotificationDrawer = ({ isOpen, onClose, notificationId }) => {
  // Fetch notifications data from API
  const { data: notificationsData } = useGetNotifications();
  const notifications = notificationsData?.notifications || [];
  
  // Find the notification data based on the ID
  const notificationData = notifications.find(item => item.id === notificationId) || {
    type: "Notification Unavailable",
    studentName: "Unknown Student",
    priority: "Important",
    remarks: "Details not available",
  }

  // Format date if available
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Calculate time ago
  const getTimeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      
      return formatDate(dateString);
    } catch (e) {
      return 'N/A';
    }
  };

  // Get student name
  const studentName = notificationData?.studentStatus?.student 
    ? `${notificationData.studentStatus.student.firstName} ${notificationData.studentStatus.student.lastName}`
    : notificationData.studentName || 'Unknown Student';

  // Get student initials for avatar
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Prepare data for display
  const data = {
    name: studentName,
    studentId: notificationData.studentStatus?.student?.studentId || 'N/A',
    type: notificationData.studentStatus?.student?.type || 'Student',
    dateOfAdmission: formatDate(notificationData.studentStatus?.student?.createdAt),
    currentStatus: notificationData.studentStatus?.definition?.name || 'Status Unknown',
    totalTime: notificationData.studentStatus?.totalDays 
      ? `${notificationData.studentStatus.totalDays} days` 
      : 'N/A',
    notificationType: notificationData.type,
    notificationDetail: notificationData.remarks,
    message: notificationData.message || 'No message content',
    system: notificationData.system || 'UMI System',
    timeAgo: getTimeAgo(notificationData.createdAt),
    statusType: notificationData.statusType || 'PENDING',
    recipientName: notificationData.recipientName,
    recipientEmail: notificationData.recipientEmail,
    sentAt: formatDate(notificationData.sentAt)
  }

  // Status styling
  const getStatusStyle = (status) => {
    const statusClasses = {
      PENDING: "bg-yellow-100 text-yellow-800",
      SENT: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
      CANCELLED: "bg-gray-100 text-gray-800"
    };
    return statusClasses[status] || "bg-blue-100 text-blue-800";
  };

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
                          Notification Details
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
                    <div className="flex-1 flex flex-col items-center space-y-6 mt-4 pb-8 overflow-y-auto">
                      {/* Profile Container */}
                      <div className="flex justify-center">
                        <div className="flex justify-between items-start bg-white rounded-lg border p-4 w-[460px]">
                          <div className="flex gap-3">
                            <div className="bg-primary-500 rounded-full w-10 h-10 flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {getInitials(data.name)}
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
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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
                            <span className={`px-2 py-1 rounded-sm text-xs font-[Inter-Regular] ${getStatusStyle(data.statusType)}`}>
                              {data.statusType}
                            </span>
                          </div>
                          <div className="mt-4 border-t pt-4">
                            
                            <p className="text-gray-600 text-sm mb-2">Recipient Information</p>
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-700 font-medium">{data.recipientName || 'N/A'}</span>
                              <span className="text-gray-500 text-sm">{data.recipientEmail || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600 text-sm">Sent At:</span>
                              <span className="text-gray-700 text-sm">{data.sentAt}</span>
                            </div>

                            <p className="text-gray-600 text-sm mt-2">Message</p>
                            <div className="bg-gray-50 p-3 rounded-md mb-4">
                              <p className="text-gray-800 text-sm whitespace-pre-wrap">
                                {data.message}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-4">
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
