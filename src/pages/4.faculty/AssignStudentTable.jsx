import React, { useState } from "react";
import { useReactTable, getCoreRowModel, flexRender,  getPaginationRowModel,
  getFilteredRowModel, createColumnHelper } from "@tanstack/react-table";
import { useNavigate } from 'react-router-dom';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Icon } from "@iconify-icon/react";

const AssignStudentTable = ({
  students,
  columnVisibility,
  setColumnVisibility,
  selectedStudents,
  onAssignToggle,
}) => {
  const navigate = useNavigate();
  const [globalFilter, setGlobalFilter] = React.useState("");

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "workshop":
        return "text-[#6B7280] bg-[#F3F4F6] border border-[#6B7280] rounded-md px-2 py-1 capitalize";
      case "normal progress":
        return "text-[#0F766E] bg-[#CCFBF1] border border-[#0F766E] rounded-md px-2 py-1 capitalize";
      case "admitted":
        return "text-[#15803D] bg-[#DCFCE7] border border-[#15803D] rounded-md px-2 py-1 capitalize";
      default:
        return "px-2 py-1";
    }
  };

  const handleOpenProfile = (studentId) => {
    console.log("Navigating to student:", studentId);
    navigate(`/students/profile/${studentId}`);
  };

  

  const columnHelper = createColumnHelper();
  const columns = [
    columnVisibility?.fullname && {
      accessorKey: "firstName",
      header: "Fullname",
      cell: ({ row }) => (
        <span>
          {row.original.firstName} {row.original.lastName}
        </span>
      ),
    },
    columnVisibility?.email && {
      accessorKey: "email",
      header: "Email Address",
    },
    columnVisibility?.campus && {
      accessorKey: "campus",
      header: "Campus",
      cell: (info) => {
        return <span>{info.row.original.campus?.name}</span>;
      },
    },
    columnVisibility?.schoolCode && {
      accessorKey: "schoolCode",
      header: "School Code",
      cell: (info) => {
        return (
          <div className="text-sm flex flex-row text-center items-center gap-1 justify-start">
            {" "}
            <span>{info.row.original.school?.code}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Icon
                    icon="tdesign:info-circle-filled"
                    className="w-4 h-4 mt-1 text-gray-400"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {info.row.original.school?.name}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        );
      },
    },
    columnVisibility?.program && {
      accessorKey: "programLevel",
      header: "Program",
      cell: ({ row }) => (
        <span className="bg-[#FDD388] flex flex-row justify-center items-center gap-1 px-2 py-1 rounded-md capitalize">
          {row.original.programLevel}
        </span>
      ),
    },
    columnVisibility?.status && {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          style={{
            color:
              row.original.statuses?.find((s) => s.isCurrent)?.definition
                ?.color || "#000",
            backgroundColor:
              `${
                row.original.statuses?.find((s) => s.isCurrent)?.definition
                  ?.color
              }18` || "#00000018",
            border: `1px solid ${
              row.original.statuses?.find((s) => s.isCurrent)?.definition
                ?.color || "#000"
            }`,
            padding: "0.25rem 0.5rem",
            borderRadius: "0.375rem",
            display: "inline-block",
          }}
          className="capitalize"
        >
          {row.original.statuses
            ?.find((s) => s.isCurrent)
            ?.definition?.name?.toLowerCase() || "Unknown"}
        </span>
      ),
    },
    {
      accessorKey: "actions",
      header: "",
      cell: ({ row }) => {
        const isAssigned = selectedStudents.some(student => student.id === row.original.id);
        return (
          <button
            className={`w-max px-4 py-1 rounded border text-sm font-inter font-semibold shadow-[0px_1px_2px_0px_#0000000D] hover:bg-gray-50 ${
              isAssigned 
                ? "border-red-500 text-red-500 hover:bg-red-50" 
                : "border-[#E5E7EB] text-[#111827]"
            }`}
            onClick={() => onAssignToggle(row.original)}
          >
            {isAssigned ? "Unassign" : "Assign"}
          </button>
        );
      },
    },
  ].filter(Boolean);

  const effectiveColumnVisibility = columnVisibility;

  const table = useReactTable({
    data: students, // Use filtered students
    columns,
    state: {
      globalFilter,
      columnVisibility: effectiveColumnVisibility,
    },
    getFilteredRowModel: getFilteredRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="overflow-x-auto bg-white shadow-md ">
         <div className="overflow-x-auto">
         <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-4 py-3 text-left text-[#111827] font-inter font-semibold text-[14px] leading-[20px]"
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
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-4 py-2 whitespace-nowrap text-[#111827] font-inter font-normal text-[14px] leading-[20px]"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
        Showing{' '}
        <span className="font-medium mx-1">
          {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
        </span>
        to{' '}
        <span className="font-medium mx-1">
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getPrePaginationRowModel().rows.length
          )}
        </span>
        of{' '}
        <span className="font-medium mx-1">{table.getPrePaginationRowModel().rows.length}</span>{' '}
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
        {Array.from({ length: table.getPageCount() }, (_, i) => i + 1).map(pageNumber => (
          <button
            key={pageNumber}
            className={`w-8 h-8 rounded text-sm ${
              pageNumber === table.getState().pagination.pageIndex + 1
                ? 'bg-blue-50 text-blue-600 font-medium'
                : 'text-gray-500'
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
  );
};

export default AssignStudentTable;
