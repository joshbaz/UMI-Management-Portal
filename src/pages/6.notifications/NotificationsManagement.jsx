/* eslint-disable react/prop-types */
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { FiSearch } from "react-icons/fi";
import { HiOutlineInformationCircle } from "react-icons/hi";
import NotificationDrawer from "./NotificationDrawer";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";

// Priority types and their colors
const PRIORITY_TYPES = {
  Urgent: "text-red-500",
  Important: "text-orange-500",
  Anytime: "text-green-500",
};

// Sample notification data
export const DUMMY_DATA = [
  {
    id: 1,
    type: "Supervisor Not Assigned",
    studentName: "Ntale Kilza",
    priority: "Anytime",
    remarks: "Supervisor allocation pending",
  },
  {
    id: 2,
    type: "Proposal Submission Delayed",
    studentName: "Apio Asiimwe",
    priority: "Important",
    remarks: "Submission overdue by 7 days",
  },
  {
    id: 3,
    type: "Supervisor Not Assigned",
    studentName: "Musani Anyango",
    priority: "Anytime",
    remarks: "Supervisor allocation pending",
  },
  {
    id: 4,
    type: "Supervisor Not Assigned",
    studentName: "Apio Kato",
    priority: "Anytime",
    remarks: "Supervisor allocation pending",
  },
  {
    id: 5,
    type: "Proposal Submission Delayed",
    studentName: "Ntale Acan",
    priority: "Urgent",
    remarks: "Submission overdue by 13 days",
  },
  {
    id: 6,
    type: "Proposal Review Delayed",
    studentName: "Apio Ocen",
    priority: "Important",
    remarks: "No reviewers assigned yet",
  },
  {
    id: 7,
    type: "Proposal Review Pending Reminder",
    studentName: "Egonu Birungi",
    priority: "Urgent",
    remarks: "Review overdue by 4 days",
  },
  {
    id: 8,
    type: "Proposal Defense Not Conducted",
    studentName: "Chepyegon Tumusiime",
    priority: "Important",
    remarks: "Defense pending past deadline",
  },
  {
    id: 9,
    type: "Letter to Field Not Issued",
    studentName: "Nabbanja Muhumuza",
    priority: "Urgent",
    remarks: "No letter issued in 2 weeks",
  },
  {
    id: 10,
    type: "Book Examination Delayed",
    studentName: "Rukundo Nakate",
    priority: "Important",
    remarks: "Review pending past 2 weeks",
  },
];

// Sample status report data
const STATUS_REPORT_DATA = [
  {
    id: 1,
    previousStatus: "Waiting for Supervisor Alloca",
    currentStatus: "Normal Progress",
    studentName: "Ntale Kilza",
    statusUpdatedOn: "2024-10-11 08:40 AM",
  },
  {
    id: 2,
    previousStatus: "Proposal Received",
    currentStatus: "Proposal in Review",
    studentName: "Apio Asiimwe",
    statusUpdatedOn: "2025-02-21 12:11 PM",
  },
  {
    id: 3,
    previousStatus: "Under Examination",
    currentStatus: "Failed & Resubmission Required",
    studentName: "Musani Anyango",
    statusUpdatedOn: "2025-08-03 12:07 AM",
  },
  {
    id: 4,
    previousStatus: "Book Submitted",
    currentStatus: "Under Examination",
    studentName: "Apio Kato",
    statusUpdatedOn: "2024-09-08 08:17 AM",
  },
  {
    id: 5,
    previousStatus: "Minutes Pending",
    currentStatus: "Minutes Sent",
    studentName: "Ntale Acan",
    statusUpdatedOn: "2025-09-15 11:56 PM",
  },
  {
    id: 6,
    previousStatus: "Fieldwork",
    currentStatus: "Book Submitted",
    studentName: "Apio Ocen",
    statusUpdatedOn: "2024-03-26 10:45 AM",
  },
  {
    id: 7,
    previousStatus: "Proposal Defense Graded - P",
    currentStatus: "Compliance Report & Revised Proposal",
    studentName: "Egonu Birungi",
    statusUpdatedOn: "2025-05-13 06:40 AM",
  },
  {
    id: 8,
    previousStatus: "Waiting for Supervisor Alloca",
    currentStatus: "Normal Progress",
    studentName: "Chepyegon Tumusiime",
    statusUpdatedOn: "2024-05-11 10:02 PM",
  },
  {
    id: 9,
    previousStatus: "Online",
    currentStatus: "Proposal Defense Graded - Passed",
    studentName: "Nabbaala Muhumuza",
    statusUpdatedOn: "2024-12-18 08:35 AM",
  },
  {
    id: 10,
    previousStatus: "Online",
    currentStatus: "Waiting for Reviewer Assignment",
    studentName: "Rukundo Nakate",
    statusUpdatedOn: "2025-09-14 01:13 PM",
  },
];

// Component: Search bar with icon
const SearchBar = ({ value, onChange, placeholder = "Search" }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <FiSearch className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        placeholder={placeholder}
      />
    </div>
  );
};

// Component: Info icon helper for tooltips
const InfoIconHelper = ({ tooltip }) => {
  return (
    <div className="relative flex items-center group">
      <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 ml-2 cursor-help">
        <HiOutlineInformationCircle className="w-4 h-4 text-gray-600" />
      </div>
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block">
        <div className="bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
          {tooltip}
        </div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
          <div className="border-4 border-transparent border-t-gray-800"></div>
        </div>
      </div>
    </div>
  );
};

// Main component: Notifications management page
const NotificationsManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("notifications");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);

  const handleRowClick = (notificationId) => {
    setSelectedNotificationId(notificationId);
    setIsDrawerOpen(true);
  };

  // Table columns definition
  const columns = useMemo(
    () => [
      {
        accessorKey: "type",
        header: "Type",
        cell: (info) => (
          <button
            onClick={() => handleRowClick(info.row.original.id)}
            className="text-left hover:text-primary-600"
          >
            {info.getValue()}
          </button>
        ),
      },
      {
        accessorKey: "studentName",
        header: "Student Name",
        cell: (info) => (
          <button
            onClick={() => handleRowClick(info.row.original.id)}
            className="text-left hover:text-primary-600"
          >
            {info.getValue()}
          </button>
        ),
      },
      {
        accessorKey: "priority",
        header: "Priority",
        cell: (info) => (
          <span className={PRIORITY_TYPES[info.getValue()]}>
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
        cell: (info) => (
          <button
            onClick={() => handleRowClick(info.row.original.id)}
            className="text-left hover:text-primary-600"
          >
            {info.getValue()}
          </button>
        ),
      },
      {
        accessorKey: "actions",
        header: " ",
        cell: (info) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(info.row.original.id);
            }}
            className="rounded border border-semantic-bg-border shadow-sm py-1 px-3 hover:bg-gray-50"
          >
            Open
          </button>
        ),
      },
    ],
    []
  );

  // Status Report columns
  const statusReportColumns = useMemo(
    () => [
      {
        accessorKey: "previousStatus",
        header: "Previous Status",
        cell: (info) => {
          const status = info.getValue();
          const randomStyle = Math.random() < 0.5;
          return (
            <div
              className={`${
                randomStyle
                  ? "bg-[#F3F4F6] border-[#6B7280]"
                  : "bg-[#CCFBF1] border-[#0F766E]"
              } inline-block h-hug24px rounded-md border px-2 py-1 text-sm text-left`}
            >
              {status}
            </div>
          );
        },
      },
      {
        accessorKey: "currentStatus",
        header: "Current Status",
        cell: (info) => {
          const status = info.getValue();
          const randomStyle = Math.random() < 0.5;
          return (
            <div
              className={`${
                randomStyle
                  ? "bg-[#F3F4F6] border-[#6B7280]"
                  : "bg-[#CCFBF1] border-[#0F766E]"
              } inline-block h-hug24px rounded-md border px-2 py-1 text-sm text-left`}
            >
              {status}
            </div>
          );
        },
      },
      {
        accessorKey: "studentName",
        header: "Student Name",
        cell: (info) => (
          <button
            onClick={() => handleRowClick(info.row.original.id)}
            className="text-left hover:text-primary-600"
          >
            {info.getValue()}
          </button>
        ),
      },
      {
        accessorKey: "statusUpdatedOn",
        header: "Status Updated On",
        cell: (info) => (
          <button
            onClick={() => handleRowClick(info.row.original.id)}
            className="text-left hover:text-primary-600"
          >
            {info.getValue()}
          </button>
        ),
      },
      {
        accessorKey: "actions",
        header: " ",
        cell: (info) => (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(info.row.original.id);
            }}
            className="rounded border border-semantic-bg-border shadow-sm py-1 px-3 hover:bg-gray-50"
          >
            Open
          </button>
        ),
      },
    ],
    []
  );

  // Filter data based on search query
  const filteredNotificationsData = useMemo(() => {
    let filtered = DUMMY_DATA;
    
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.remarks.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [searchQuery]);

  const filteredStatusData = useMemo(() => {
    let filtered = STATUS_REPORT_DATA;
    
    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.currentStatus.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.previousStatus.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [searchQuery]);

  // Initialize table
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data: activeTab === "notifications" ? filteredNotificationsData : filteredStatusData,
    columns: activeTab === "notifications" ? columns : statusReportColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      globalFilter: searchQuery,
      pagination,
    },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setSearchQuery,
  });

  return (
    <div className="min-h-full">
      {/* Global Search */}
      <div className="p-6 pb-0 w-1/2">
        <SearchBar
          value={searchQuery}
          onChange={(value) => setSearchQuery(value)}
          placeholder="Search notifications..."
        />
      </div>

      {/* Horizontal Line */}
      <div className="my-6 border-t border-gray-200"></div>

      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          Notifications Management
        </h1>
        <div className="text-sm text-gray-500">
          Last login: {format(new Date(), "MM-dd-yyyy hh:mm:ssaa")}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-4 gap-4 px-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <h2 className="text-lg font-semibold text-gray-900">{DUMMY_DATA.length}</h2>
          <p className="text-sm text-gray-500">Total Notifications</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            {DUMMY_DATA.filter(item => item.priority === 'Urgent').length}
          </h2>
          <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
            Urgent Priority
            <InfoIconHelper tooltip="Notifications requiring immediate attention" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            {DUMMY_DATA.filter(item => item.priority === 'Important').length}
          </h2>
          <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
            Important Priority
            <InfoIconHelper tooltip="Notifications requiring attention soon" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            {DUMMY_DATA.filter(item => item.priority === 'Anytime').length}
          </h2>
          <div className="text-sm text-gray-500 flex items-center justify-center gap-1">
            Regular Priority
            <InfoIconHelper tooltip="Notifications that can be handled at any time" />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="px-6 py-4">
        <div className="bg-white rounded-lg shadow">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <div className="flex gap-8 px-4">
              <button
                onClick={() => setActiveTab("notifications")}
                className={`py-4 px-1 border-b-2 ${
                  activeTab === "notifications"
                    ? "border-primary-500 text-primary-500"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } font-medium text-sm focus:outline-none`}
              >
                System Notifications
              </button>
              <button
                onClick={() => setActiveTab("status")}
                className={`py-4 px-1 border-b-2 ${
                  activeTab === "status"
                    ? "border-primary-500 text-primary-500"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } font-medium text-sm focus:outline-none`}
              >
                Status Report
              </button>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="p-4 flex justify-between items-center border-b">
            <div className="w-[240px]">
              <SearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder={activeTab === "notifications" ? "Search notifications" : "Search status"}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Show:</span>
              <select
                value={pagination.pageSize}
                onChange={e => {
                  setPagination(old => ({
                    ...old,
                    pageSize: Number(e.target.value)
                  }))
                }}
                className="border border-gray-300 rounded shadow-sm py-1 px-2 text-sm text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              >
                {[5, 10, 15, 20].map(pageSize => (
                  <option key={pageSize} value={pageSize}>
                    {pageSize}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm divide-y divide-gray-200">
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="px-3 py-1.5 whitespace-nowrap text-xs text-gray-900"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 bg-white">
            <div className="flex items-center text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium mx-1">
                {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
              </span>
              to{" "}
              <span className="font-medium mx-1">
                {Math.min(
                  (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                  table.getPrePaginationRowModel().rows.length
                )}
              </span>
              of{" "}
              <span className="font-medium mx-1">
                {table.getPrePaginationRowModel().rows.length}
              </span>{" "}
              results
            </div>
            <div className="flex items-center gap-2">
              <button
                className="border rounded p-1 text-sm disabled:opacity-50"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </button>
              {Array.from(
                { length: table.getPageCount() },
                (_, i) => i + 1
              ).map((pageNumber) => (
                <button
                  key={pageNumber}
                  className={`w-8 h-8 rounded text-sm ${
                    pageNumber === table.getState().pagination.pageIndex + 1
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : "text-gray-500"
                  }`}
                  onClick={() => table.setPageIndex(pageNumber - 1)}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                className="border rounded p-1 text-sm disabled:opacity-50"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
      <NotificationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        notificationId={selectedNotificationId}
      />
    </div>
  );
};

export default NotificationsManagement;
