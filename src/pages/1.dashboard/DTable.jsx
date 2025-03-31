import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CirclePlus, ChevronsUpDown } from "lucide-react";
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
  } from "@tanstack/react-table";

// Sample student data
export const DUMMY_DATA = [
  {
    id: 1,
    fullname: "Jenny Wilson",
    email: "jenny.wilson@example.com",
    phone: "+254 712 345 678",
    schoolCode: "SBM",
    userAccess: "Student",
    campus: "Main Campus",
    category: "Masters",
    status: "Workshop",
    supervisor: "Prof. Benjamin Russel",
    dateOfAdmission: "29/01/2025",
    currentStatus: "Under Examination",
    totalTime: "120 days",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    fullname: "Robert Fox",
    email: "robert.fox@example.com",
    phone: "+254 723 456 789",
    schoolCode: "SDLIT",
    userAccess: "Student",
    campus: "Main Campus",
    category: "PhD",
    status: "Normal Progress",
    supervisor: "Dr. Sarah Connor",
    dateOfAdmission: "15/01/2025",
    currentStatus: "Normal Progress",
    totalTime: "90 days",
    createdAt: "2024-01-15",
  },
  {
    id: 3,
    fullname: "Alice Johnson",
    email: "alice.johnson@example.com",
    phone: "+254 734 567 890",
    schoolCode: "SCPAG",
    userAccess: "Student",
    campus: "Main Campus",
    category: "Masters",
    status: "Workshop",
    supervisor: "Prof. John Smith",
    dateOfAdmission: "20/01/2025",
    currentStatus: "Under Examination",
    totalTime: "100 days",
    createdAt: "2024-01-15",
  },
  {
    id: 4,
    fullname: "Bob Wilson",
    email: "bob.wilson@example.com",
    phone: "+254 745 678 901",
    schoolCode: "SMS",
    userAccess: "Student",
    campus: "Main Campus",
    category: "PhD",
    status: "Normal Progress",
    supervisor: "Dr. Jane Doe",
    dateOfAdmission: "10/01/2025",
    currentStatus: "Normal Progress",
    totalTime: "80 days",
    createdAt: "2024-01-15",
  },
  {
    id: 5,
    fullname: "Carol Brown",
    email: "carol.brown@example.com",
    phone: "+254 756 789 012",
    schoolCode: "RC",
    userAccess: "Student",
    campus: "Main Campus",
    category: "Masters",
    status: "Workshop",
    supervisor: "Prof. Michael Davis",
    dateOfAdmission: "25/01/2025",
    currentStatus: "Under Examination",
    totalTime: "110 days",
    createdAt: "2024-01-15",
  },
  {
    id: 6,
    fullname: "David Kumar",
    email: "davidr@example.com",
    phone: "+254 767 890 123",
    schoolCode: "SBM",
    userAccess: "Student",
    campus: "Main Campus",
    category: "PhD",
    status: "Normal Progress",
    supervisor: "Dr. Emily Chen",
    dateOfAdmission: "05/01/2025",
    currentStatus: "Normal Progress",
    totalTime: "70 days",
    createdAt: "2024-01-16",
  },
  
];

// Table column definitions
const columns = [
  {
    accessorKey: "fullname",
    header: () => <span className="text-sm">Fullname</span>,
    cell: (info) => <div className="text-sm">{info.getValue()}</div>,
  },
  
  {
    accessorKey: "campus",
    header: () => <span className="text-sm">Campus</span>,
    cell: (info) => <div className="text-sm">{info.getValue()}</div>,
  },
  
  {
    accessorKey: "category",
    header: () => <span className="text-sm">Category</span>,
    cell: (info) => (
      <div className="inline-flex h-hug24px rounded-md border py-4px px-9px bg-accent2-300 items-center justify-center whitespace-nowrap text-sm">
        {info.getValue()}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: () => <span className="text-sm">Status</span>,
    cell: (info) => {
      const status = info.getValue();
      return (
        <div
          className={`${
            status === "Workshop"
              ? "w-hug74px bg-global-gray-100 border-semantic-fg-disabled"
              : "w-hug112px bg-semantic-bg-success border-semantic-fg-success"
          } h-hug24px rounded-md border py-4px px-8px flex items-center justify-center whitespace-nowrap text-sm`}
        >
          {status}
        </div>
      );
    },
  },
  
];

const DTable = () => {
  const [columnVisibility, setColumnVisibility] = useState({
    fullname: true,
    email: true,
    category: true,
    campus: true,
    status: true,
  });

  const table = useReactTable({
    data: DUMMY_DATA,
    columns,
    state: {
     
      columnVisibility,
   
    },
    onColumnVisibilityChange: setColumnVisibility,
   
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: false,
   
  });
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex  items-start  gap-6 space-y-0  py-5 sm:flex-col">
        <CardTitle className="text-lg font-medium text-gray-900">
          Recently Added
        </CardTitle>

        <div className="flex items-center gap-4">
          <Button
            variant=""
            className="text-sm text-white bg-primary-500 hover:bg-primary-500 hover:bg-opacity-70"
          >
            <span>View More</span>{" "}
            <ChevronsUpDown className="text-white w-4 h-4" />
          </Button>
          <Button variant="outline" className="text-sm flex items-center">
            <span>Add Student</span>{" "}
            <CirclePlus className="text-gray-500 w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-0">

          {/* Table Structure */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm divide-y divide-gray-200">
              {/* Table Header */}
              <thead className="bg-gray-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 capitalize tracking-wider"
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
              {/* Table Body */}
              <tbody className="bg-white divide-y divide-gray-200">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-1 whitespace-nowrap text-xs text-gray-900">
                        {cell.column.columnDef.cell
                          ? flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )
                          : cell.renderCell()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      </CardContent>
    </Card>
  );
};

export default DTable;
