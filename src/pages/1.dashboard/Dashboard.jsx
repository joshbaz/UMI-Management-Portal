// Import dependencies
import PageHeader from "../../components/common/PageHeader";
import { FiSearch } from "react-icons/fi";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Icon } from "@iconify-icon/react";


import DLineChart from "./DLineChart";
import DPieChart from "./DPieChart";
import DTable from "./DTable";
import DNotificationLog from "./DNotificationLog";

const InfoCardData = [
  {
    title: "All Student 2024/2028",
    stats: "100,000",
    icon: false,
  },
  {
    title: "Recently Enrolled",
    stats: "45",
  },
  {
    title: "Workshop",
    stats: "14",
    icon: true,
    tooltip: "Students currently in workshop",
  },
  {
    title: "Normal Progress",
    stats: "26",
    icon: true,
    tooltip: "Students currently in normal progress",
  },
  {
    title: "Under examination",
    stats: "9",
    icon: true,
    tooltip: "Students currently under examination",
  },
];

const chartData = [
  { date: "2024-05-16", desktop: 338, mobile: 400 },
  { date: "2024-05-17", desktop: 499, mobile: 420 },
  { date: "2024-05-18", desktop: 315, mobile: 350 },
  { date: "2024-05-19", desktop: 235, mobile: 180 },
  { date: "2024-05-20", desktop: 177, mobile: 230 },
  { date: "2024-05-21", desktop: 82, mobile: 140 },
  { date: "2024-05-22", desktop: 81, mobile: 120 },
  { date: "2024-05-23", desktop: 252, mobile: 290 },
]


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

  return (
    <div className="min-h-full">
      {/* Global Search */}
      <div className="p-6 pb-0 w-1/2">
        <SearchBar
          value={globalFilter ?? ""}
          onChange={(value) => setGlobalFilter(String(value))}
          placeholder="Search"
        />
      </div>

      {/* Horizontal Line */}
      <div className="my-6 border-t border-semantic-border-border"></div>

      <div className="p-6">
        <PageHeader title="Dashboard" lastLogin="08-09-2024 15:23:42PM" />
      </div>

      <div>
        {/* Cards */}
        <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4 px-6 mb-6">
          {InfoCardData.map((data) => {
            if (data?.icon) {
              return (
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {data.stats}
                  </h2>
                  <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
                    {data?.title}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Icon
                            icon="tdesign:info-circle-filled"
                            className="w-4 h-4 text-gray-400"
                          />
                        </TooltipTrigger>
                        <TooltipContent>{data?.tooltip}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              );
            } else {
              return (
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {data?.stats}
                  </h2>
                  <p className="text-sm text-gray-500">{data?.title}</p>
                </div>
              );
            }
          })}
        </div>
        
        {/** Charts Start */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 px-6 mb-6">
          {/** Chart 1 - line chart */}
          <div className="bg-white  rounded-lg shadow-sm col-span-3">
            <DLineChart />
          </div>
          {/** Chart 2 - bar chart */}
          <div className="bg-white  rounded-lg shadow-sm col-span-2">
            <DPieChart />
          </div>

        </div>

        {/** Tables */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-6 mb-6">
          <div className="bg-white  rounded-lg shadow-sm col-span-2">
            <DTable />
          </div>
          <div className="bg-white  rounded-lg shadow-sm col-span-1">
            <DNotificationLog />
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
