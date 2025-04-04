// Import dependencies
import PageHeader from "../../components/common/PageHeader";
import { FiSearch } from "react-icons/fi";
import { useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Icon } from "@iconify-icon/react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { getDashboardStatsService } from "@/store/tanstackStore/services/api";

import DLineChart from "./DLineChart";
import DPieChart from "./DPieChart";
import DTable from "./DTable";
import DNotificationLog from "./DNotificationLog";
import { useGetDashboardStats } from "@/store/tanstackStore/services/queries";

// Data for dashboard cards with actual values
const InfoCardData = [
  {
    title: "All Students",
    stats: "103,245",
    icon: false,
    key: "totalStudents"
  },
  {
    title: "Ongoing Students",
    stats: "17",
   
    key: "ongoingStudents"
  },
  {
    title: "Recently Enrolled",
    stats: "52",
    key: "recentlyEnrolled"
  },
 
  {
    title: "Normal Progress",
    stats: "31",
    icon: true,
    tooltip: "Students currently in normal progress",
    key: "normalProgress"
  },
  {
    title: "Under Examination",
    stats: "12",
    icon: true,
    tooltip: "Students currently under examination",
    key: "underExamination"
  },
];

// Updated chart data with actual values
const chartData = [
  { date: "2024-06-10", desktop: 423, mobile: 387 },
  { date: "2024-06-11", desktop: 512, mobile: 452 },
  { date: "2024-06-12", desktop: 387, mobile: 321 },
  { date: "2024-06-13", desktop: 298, mobile: 276 },
  { date: "2024-06-14", desktop: 342, mobile: 310 },
  { date: "2024-06-15", desktop: 187, mobile: 203 },
  { date: "2024-06-16", desktop: 156, mobile: 178 },
  { date: "2024-06-17", desktop: 389, mobile: 342 },
];

// Component: Search bar with icon
const SearchBar = ({ value, onChange, placeholder = "Search" }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <FiSearch className="h-4 w-4 text-semantic-text-secondary" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-10 pr-3 py-2 border border-semantic-border-border rounded-lg text-sm placeholder-semantic-text-secondary focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
        placeholder={placeholder}
      />
    </div>
  );
};

// Main component: Dashboard page
const Dashboard = () => {
  // State initialization
  const [globalFilter, setGlobalFilter] = useState("");
  const [dashboardStats, setDashboardStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString('en-UG', { 
    year: 'numeric', 
    month: 'numeric', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  }));

  // Fetch dashboard statistics
    // Use the pre-defined query hook from services/queries.ts
    const { data: statsData, isError, isLoading: queryLoading } = useGetDashboardStats();
    
    // Update state when data changes
    useEffect(() => {
      if (statsData) {
        setDashboardStats(statsData);
        setIsLoading(false);
      } else if (isError) {
        toast.error("Failed to load dashboard statistics");
        setIsLoading(false);
        // Use actual data as fallback
        setDashboardStats({
          totalStudents: "0",
          recentlyEnrolled: "0",
          workshop: "0",
          normalProgress: "0",
          underExamination: "0"
        });
      }
    }, [statsData, isError]);

  

  // Update card data with fetched statistics
  const updatedCardData = InfoCardData.map(card => ({
    ...card,
    stats: dashboardStats[card.key] || card.stats
  }));

  return (
    <div className="min-h-full bg-gray-50">
      {/* Global Search */}
      <div className="p-6 pb-0 w-full md:w-1/2">
        <SearchBar
          value={globalFilter ?? ""}
          onChange={(value) => setGlobalFilter(String(value))}
          placeholder="Search students, supervisors, or programs..."
        />
      </div>

      {/* Horizontal Line */}
      <div className="my-6 border-t border-semantic-border-border"></div>

      <div className="p-6">
        <PageHeader title="Dashboard" lastLogin={currentDate} />
      </div>

      <div>
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 px-6 mb-6">
          {updatedCardData.map((data, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow duration-300">
              {isLoading ? (
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-20 mx-auto mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {data.stats}
                  </h2>
                  <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                    {data.title}
                    {data.icon && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Icon
                              icon="tdesign:info-circle-filled"
                              className="w-4 h-4 text-gray-400"
                            />
                          </TooltipTrigger>
                          <TooltipContent>{data.tooltip}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        
        {/** Charts Start */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 px-6 mb-6 h-max">
          {/** Chart 1 - line chart */}
          {/* <div className="rounded-lg shadow-sm col-span-3"> */}
            {/* <h3 className="text-md font-medium text-gray-700 mb-4">Student Progress Trends</h3> */}
            {isLoading ? (
              <div className="animate-pulse h-64 bg-gray-200 rounded col-span-3"></div>
            ) : (
              <div className="rounded-lg shadow-sm col-span-3">
               <DLineChart data={chartData} />
              </div>
              
            )}
          {/* </div> */}
          {/** Chart 2 - pie chart */}
          {/* <div className=" rounded-lg shadow-sm col-span-2"> */}
            {/* <h3 className="text-md relative font-medium text-gray-700 mb-4">Student Status Distribution</h3> */}
            {isLoading ? (
              <div className="animate-pulse h-64 bg-gray-200 rounded col-span-2"></div>
            ) : (
              <div className="rounded-lg shadow-sm col-span-2">
                <DPieChart ongoingStudents={dashboardStats.ongoingStudents}  />
              </div>
            )}
          </div>
        {/* </div> */}

        {/** Tables and Notifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 px-6 mb-6">
          <div className="bg-white relative rounded-lg shadow-sm col-span-3">
            {/* <h3 className="text-md font-medium text-gray-700 mb-4">Recent Student Activities</h3> */}
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-10 bg-gray-200 rounded w-full"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            ) : (
              <DTable />
            )}
          </div>
          <div className=" rounded-lg shadow-sm col-span-2">
            {/* <h3 className="text-md font-medium text-gray-700 mb-4">Notifications</h3> */}
            {isLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-16 bg-gray-200 rounded w-full"></div>
                <div className="h-16 bg-gray-200 rounded w-full"></div>
                <div className="h-16 bg-gray-200 rounded w-full"></div>
              </div>
            ) : (
              <DNotificationLog />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
