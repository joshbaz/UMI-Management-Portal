import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetNotifications } from "@/store/tanstackStore/services/queries";
import NotificationDrawer from "../6.notifications/NotificationDrawer";
import { useNavigate } from "react-router-dom";

const DNotificationLog = () => {
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();

  // Fetch notifications data from API
  const { data: notificationsData, isLoading } = useGetNotifications();
  const notifications = notificationsData?.notifications || [];
  
  // Filter notifications by status
  const upcomingNotifications = notifications.filter(n => n.statusType === 'PENDING' || n.statusType === 'NEW').slice(0, 3);
  const sentNotifications = notifications.filter(n => n.statusType === 'SENT' || n.statusType === 'READ').slice(0, 3);

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
  };

  const handleOpenDrawer = (notificationId) => {
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'urgent': return 'bg-red-500';
      case 'important': return 'bg-orange-500';
      case 'anytime': return 'bg-green-500';
      default: return 'bg-sky-500';
    }
  };

  // Format notification message
  const formatMessage = (notification) => {
    const studentName = notification?.studentStatus?.student 
      ? `${notification.studentStatus.student.firstName} ${notification.studentStatus.student.lastName}`
      : 'A student';
    
    switch(notification.type) {
      case 'STUDENT_ADDED':
        return `${studentName} has been added to the database`;
      case 'STATUS_CHANGE':
        return `${studentName}'s status has been updated`;
      case 'DOCUMENT_UPLOADED':
        return `${studentName} has uploaded a new document`;
      default:
        return notification?.message || 'New notification received';
    }
  };

  // Get notification title
  const getNotificationTitle = (notification) => {
    switch(notification.type) {
      case 'STUDENT_ADDED':
        return 'New Student Added';
      case 'STATUS_CHANGE':
        return 'Status Update';
      case 'DOCUMENT_UPLOADED':
        return 'Document Upload';
      default:
        return notification.type || 'Notification';
    }
  };

  // Get time ago
  const getTimeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 30) return `${diffDays}d`;
      
      return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`;
    } catch (e) {
      return 'N/A';
    }
  };

  // Render notification list
  const renderNotificationList = (notificationList) => {
    if (notificationList.length === 0) {
      return <div className="text-center  py-6 text-gray-500">No notifications available</div>;
    }

    return notificationList.map((notification) => (
      <div
        key={notification.id}
        onClick={() => handleNotificationClick(notification)}
        className={`flex cursor-pointer select-none items-start justify-between px-2 gap-1 py-4 ${
          selectedNotification?.id === notification.id
            ? "bg-[#E5E7EB]/40"
            : "bg-white"
        }`}
      >
        <div className="flex flex-row items-baseline gap-2">
          <div className={`flex h-2 w-2 rounded-full ${getPriorityColor(notification.priority)}`} />

          <div className="flex flex-col justify-start m-0 start-0 ">
            <div className="text-sm font-medium text-gray-500 align-text-top">
              {notification?.title || "Notification"}
            </div>
            <div className="text-sm text-gray-500">
              {formatMessage(notification)}
            </div>

            <div className="mt-2 min-h-4">
              <Button
                onClick={() => handleOpenDrawer(notification.id)}
                className={`${
                  selectedNotification?.id === notification.id
                    ? "flex"
                    : "hidden"
                } text-sm text-white bg-primary-500 hover:bg-primary-500 hover:bg-opacity-70`}
              >
                open
              </Button>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500">{getTimeAgo(notification.createdAt)}</div>
      </div>
    ));
  };

  return (
    <Tabs defaultValue="upcoming">
      <Card className="flex flex-col h-full">
        <CardHeader className="flex items-start gap-2 space-y-0 py-5 sm:flex-col">
          <div className="flex flex-row w-full justify-between items-start gap-6 space-y-0">
            <CardTitle className="text-lg font-medium text-gray-900">
              Notification Log
            </CardTitle>
            <Button
              onClick={() => navigate('/notifications')}
              variant=""
              className="text-sm text-white bg-primary-500 hover:bg-primary-500 hover:bg-opacity-70"
            >
              <span>View More</span>{" "}
              <ChevronsUpDown className="text-white w-4 h-4" />
            </Button>
          </div>

          <div className="flex items-center gap-4 w-full">
            <TabsList className="flex justify-start w-full px-0 py-0 h-max rounded-none !bg-transparent border-b border-gray-200">
              <TabsTrigger value="upcoming" className="flex rounded-none !bg-transparent outline-none !shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500 ">
                <div className="flex items-center w-max gap-2 bg-transparent py-2 ">
                  <span className="text-sm text-primary-500">Upcoming</span>
                  <div className="rounded-lg bg-[#FEF2F2] text-red-900 px-2 text-sm ">
                    {upcomingNotifications.length}
                  </div>
                </div>
              </TabsTrigger>
              <TabsTrigger value="sent" className="flex rounded-none !bg-transparent outline-none !shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500 ">
                <div className="flex items-center w-max gap-2 bg-transparent py-2 ">
                  <span className="text-sm text-primary-500">Sent</span>
                  <div className="rounded-lg bg-[#F0F9FF] text-blue-900 px-2 text-sm ">
                    {sentNotifications.length}
                  </div>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>

        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-0">
          <TabsContent value="upcoming">
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-16 bg-gray-200 rounded w-full"></div>
                <div className="h-16 bg-gray-200 rounded w-full"></div>
                <div className="h-16 bg-gray-200 rounded w-full"></div>
              </div>
            ) : (
              <div>
                {renderNotificationList(upcomingNotifications)}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="sent">
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-16 bg-gray-200 rounded w-full"></div>
                <div className="h-16 bg-gray-200 rounded w-full"></div>
                <div className="h-16 bg-gray-200 rounded w-full"></div>
              </div>
            ) : (
              <div>
                {renderNotificationList(sentNotifications)}
              </div>
            )}
          </TabsContent>
        </CardContent>
      </Card>
      
      {/* Notification Drawer */}
      {selectedNotification && (
        <NotificationDrawer 
          isOpen={isDrawerOpen} 
          onClose={handleCloseDrawer} 
          notificationId={selectedNotification.id} 
        />
      )}
    </Tabs>
  );
};

export default DNotificationLog;
