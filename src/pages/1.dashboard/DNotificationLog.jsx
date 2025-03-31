import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CirclePlus, ChevronsUpDown } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

let notifications = [
  {
    id: 1,
    title: "New Student Added",
    message: "John Doe has been added to the database",
    date: "2h",
    type: "success",
  },
  {
    id: 2,
    title: "New Student Added",
    message: "John Doe has been added to the database",
    date: "14 feb",
    type: "success",
  },
  {
    id: 3,
    title: "New Student Added",
    message: "John Doe has been added to the database",
    date: "8 feb",
    type: "error",
  },
];

const DNotificationLog = () => {
  const [selectedNotification, setSelectedNotification] = React.useState(null);

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
  };
  return (
    <Tabs defaultValue="feed" >
      <Card className="flex flex-col h-full">
        <CardHeader className="flex  items-start  gap-6 space-y-0  py-5 sm:flex-col">
          <CardTitle className="text-lg font-medium text-gray-900">
            Notification Log
          </CardTitle>

          <div className="flex items-center gap-4 w-full">
            <TabsList   className="flex  justify-start w-full px-0 py-0 h-max rounded-none !bg-transparent border-b border-gray-200">
              <TabsTrigger   value="feed" className="flex rounded-none !bg-transparent outline-none !shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary-500 data-[state=active]:text-primary-500 ">
                <div className="flex items-center w-max gap-2 bg-transparent py-2 ">
                  <span className="text-sm text-primary-500">Feed</span>
                  {/** total notifications */}
                  <div className=" rounded-lg bg-[#FEF2F2] text-red-900 px-2 text-sm ">
                    {notifications.length}
                  </div>
                </div>
              </TabsTrigger>
            </TabsList>
            <Button
              variant=""
              className="text-sm text-white bg-primary-500 hover:bg-primary-500 hover:bg-opacity-70"
            >
              <span>View More</span>{" "}
              <ChevronsUpDown className="text-white w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-0">
        <TabsContent value="feed">
        <div>
            {notifications.map((notification, index) => (
              <div
                key={index}
                onClick={() => handleNotificationClick(notification)}
                className={`flex cursor-pointer select-none  items-start justify-between px-2  gap-1 py-4    ${
                  selectedNotification?.id === notification.id
                    ? "bg-[#E5E7EB]"
                    : "bg-white"
                }`}
              >
                <div className="flex flex-row items-baseline gap-2">
                  <div className="flex h-2 w-2   rounded-full bg-sky-500" />

                  <div className="flex flex-col justify-start m-0 start-0 ">
                    <div className="text-sm font-medium text-gray-500 align-text-top">
                      {notification.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {notification.message}
                    </div>

                    <div className="mt-2 min-h-4">
                      <Button
                        className={` ${
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

                <div className="text-sm text-gray-500">{notification.date}</div>
              </div>
            ))}
          </div>

        </TabsContent>
        
        </CardContent>
      </Card>
    </Tabs>
  );
};

export default DNotificationLog;
