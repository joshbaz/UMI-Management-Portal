/* eslint-disable react/prop-types */
import { useState, useMemo } from "react";
import { FiSearch } from "react-icons/fi";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import StudentProgressPieChart from "./StudentProgressPieChart";

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

const Tasks = ({ facultyData }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [activeTab, setActiveTab] = useState("assigned");

  // All students data
  const allStudentsData = useMemo(() => [
    {
      fullname: "Jenny Wilson",
      email: "jenny.wilson@mail.com",
      category: "Masters",
      status: "Normal Progress",
      isAssigned: true
    },
    {
      fullname: "Anna Roberts",
      email: "anna.roberts@mail.com",
      category: "Masters",
      status: "Book Submitted",
      isAssigned: true
    },
    {
      fullname: "Lindsay Walton",
      email: "lindsay.walton@mail.com",
      category: "Masters",
      status: "Under Examination",
      isAssigned: true
    },
    {
      fullname: "Benjamin Russel",
      email: "benjamin.russel@mail.com",
      category: "PhD",
      status: "Normal Progress",
      isAssigned: true
    },
    {
      fullname: "Courtney Henry",
      email: "courtney.henry@mail.com",
      category: "Masters",
      status: "Normal Progress",
      isAssigned: true
    },
    {
      fullname: "Tom Cook",
      email: "tom.cook@mail.com",
      category: "PhD",
      status: "Normal Progress",
      isAssigned: false
    },
    {
      fullname: "Michael Foster",
      email: "michael.foster@mail.com",
      category: "Masters",
      status: "Under Examination",
      isAssigned: false
    }
  ], []);

  // Filter data based on active tab
  const studentsData = useMemo(() => {
    return activeTab === "assigned" 
      ? allStudentsData.filter(student => student.isAssigned)
      : allStudentsData;
  }, [activeTab, allStudentsData]);

  const columns = useMemo(() => [
    {
      accessorKey: "fullname",
      header: "Fullname",
      cell: info => <span className="text-xs text-gray-900">{info.getValue()}</span>
    },
    {
      accessorKey: "email",
      header: "Email Address",
      cell: info => <span className="text-xs text-gray-500">{info.getValue()}</span>
    },
    {
      accessorKey: "category",
      header: "Category",
      cell: info => (
        <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">
          {info.getValue()}
        </span>
      )
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: info => {
        const status = info.getValue();
        const colors = {
          "Normal Progress": "bg-semantic-bg-success text-semantic-fg-success",
          "Book Submitted": "bg-semantic-bg-warning text-semantic-fg-warning",
          "Under Examination": "bg-semantic-bg-info text-semantic-fg-info"
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${colors[status] || "bg-gray-100 text-gray-600"}`}>
            {status}
          </span>
        );
      }
    },
    {
      id: "actions",
      header: " ",
      cell: () => (
        <button className="text-xs text-primary-500 hover:text-primary-600">
          View
        </button>
      )
    }
  ], []);

  const table = useReactTable({
    data: studentsData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      pagination: {
        pageSize,
        pageIndex: 0
      },
      globalFilter: searchQuery,
    },
    onGlobalFilterChange: setSearchQuery,
  });

  // Get counts for the tabs
  const assignedCount = allStudentsData.filter(s => s.isAssigned).length;
  const totalCount = allStudentsData.length;

  return (
    <div className="px-6 space-y-6">
      {/* Section 1: Overview Statistics */}
      <div className="grid grid-cols-12 gap-4">
        {/* Total Students Card */}
        <div className="col-span-3 bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Total Students</h3>
          <p className="text-sm text-gray-500">These are the total students assigned to this supervisor</p>
          <div className="mt-4">
            <span className="text-4xl font-bold text-gray-900">{studentsData.length}</span>
            <p className="text-sm text-gray-500 mt-2">Current: Semester 1 2025</p>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="col-span-5 grid grid-cols-2 gap-4">
          {/* Not Submitted Book */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-2xl font-bold text-gray-900">{studentsData.filter(s => s.status === "Normal Progress").length}</span>
                <p className="text-sm text-gray-500 mt-1">Students have not Submitted Book</p>
              </div>
            </div>
            <button className="mt-4 text-sm text-primary-600 hover:text-primary-700">
              View Students
            </button>
          </div>

          {/* Failed Students */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-2xl font-bold text-gray-900">{studentsData.filter(s => s.status === "Under Examination").length}</span>
                <p className="text-sm text-gray-500 mt-1">Students have failed, need to Resubmit</p>
              </div>
            </div>
            <button className="mt-4 text-sm text-primary-600 hover:text-primary-700">
              View Students
            </button>
          </div>

          {/* Scheduled for Viva */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-2xl font-bold text-gray-900">{studentsData.filter(s => s.status === "Book Submitted").length}</span>
                <p className="text-sm text-gray-500 mt-1">Students have been scheduled for Viva</p>
              </div>
            </div>
            <button className="mt-4 text-sm text-primary-600 hover:text-primary-700">
              View Students
            </button>
          </div>

          {/* Deferred Proposal */}
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-2xl font-bold text-gray-900">0</span>
                <p className="text-sm text-gray-500 mt-1">Students have deferred Proposal</p>
              </div>
            </div>
            <button className="mt-4 text-sm text-primary-600 hover:text-primary-700">
              View Students
            </button>
          </div>
        </div>

        {/* Progress Status Chart */}
        <div className="col-span-4 bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Status</h3>
          <StudentProgressPieChart />
        </div>
      </div>

      {/* Section 2: Students Table */}
      <div className="bg-white rounded-lg shadow-sm">
        {/* Table Header */}
        <div className="p-4 border-b">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("assigned")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "assigned"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Students Assigned ({assignedCount})
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 text-sm font-medium ${
                activeTab === "all"
                  ? "text-primary-600 border-b-2 border-primary-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              All Students ({totalCount})
            </button>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="p-4 flex justify-between items-center border-b">
          <div className="w-[240px]">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by Name..."
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Show:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  const newSize = Number(e.target.value);
                  setPageSize(newSize);
                  table.setPageSize(newSize);
                }}
                className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
              >
                {[5, 10, 20, 30, 40, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
            <button className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm hover:bg-primary-600 flex items-center gap-2">
              <span>Assign Student</span>
              <span className="text-lg">+</span>
            </button>
          </div>
        </div>

        {/* Table Structure */}
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
                      {flexRender(
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
                <tr key={row.id} className="hover:bg-gray-50">
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

        {/* Pagination Controls */}
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200 bg-white">
          <div className="flex items-center text-sm text-gray-500">
            Showing{" "}
            <span className="font-medium mx-1">
              {table.getState().pagination.pageSize *
                table.getState().pagination.pageIndex +
                1}
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
              (_, index) => (
                <button
                  key={index}
                  className={`border rounded p-1 text-sm ${
                    table.getState().pagination.pageIndex === index
                      ? "bg-primary-500 text-white"
                      : ""
                  }`}
                  onClick={() => table.setPageIndex(index)}
                >
                  {index + 1}
                </button>
              )
            )}
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
  );
};

export default Tasks;
