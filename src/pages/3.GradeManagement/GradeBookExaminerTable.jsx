import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, Eye, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GradeBookExaminerTable = ({
  examiners,
  bookId,
  refetchBook,
  book,
  examinerAssignments,
  handleViewAssignment,
  handleEditAssignment,
}) => {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const data = useMemo(() => {
    if (!examinerAssignments || examinerAssignments.length === 0) return [];

    // Sort assignments by isCurrent (current assignments first)
    const sortedAssignments = [...examinerAssignments].sort((a, b) => {
      if (a.isCurrent && !b.isCurrent) return -1;
      if (!a.isCurrent && b.isCurrent) return 1;
      return 0;
    });

    return sortedAssignments.map((assignment) => ({
      id: assignment.examiner.id,
      name: assignment.examiner.name,
      email: assignment.examiner.primaryEmail,
      type: assignment.examiner.type,
      status: assignment.status,
      grade: assignment.grade,
      isCurrent: assignment.isCurrent,
      submissionType: assignment.submissionType,
      reportSubmitted: assignment.reportSubmittedAt ? true : false,
      assignmentId: assignment.id,
      assignment: assignment, // Store the full assignment object for the drawer
    }));
  }, [examinerAssignments]);

  // Rest of the component remains the same...
  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: (info) => <span className="capitalize">{info.getValue()}</span>,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => (
          <span
            className={`capitalize px-2 py-1 rounded-full text-xs ${
              info.getValue() === "Completed"
                ? "bg-green-100 text-green-800"
                : info.getValue() === "Accepted"
                ? "bg-blue-100 text-blue-800"
                : info.getValue() === "Rejected"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {info.getValue()}
          </span>
        ),
      },
      {
        accessorKey: "grade",
        header: "Grade",
        cell: (info) => info.getValue() || "Not Graded",
      },
      {
        accessorKey: "reportSubmitted",
        header: "Report",
        cell: (info) => (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              info.getValue()
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {info.getValue() ? "Submitted" : "Pending"}
          </span>
        ),
      },
      {
        accessorKey: "submissionType",
        header: "Submission",
        cell: (info) => <span className="capitalize">{info.getValue()}</span>,
      },
      {
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <div className="flex flex-col gap-2">
            <button
              className="px-2 py-1 text-xs font-[Inter-Medium] text-white bg-accent2-600 rounded hover:bg-accent2-700 flex items-center"
              onClick={() => handleViewAssignment(info.row.original.assignment)}
            >
              <Eye className="h-3 w-3 mr-1" />
              View
            </button>
            {
              info.row.original.isCurrent && (
                <button
                className="px-2 py-1 text-xs font-[Inter-Medium] text-white bg-primary-600 rounded hover:bg-primary-700 flex items-center"
                onClick={() => handleEditAssignment(info.row.original.assignment)}
              >
                <Edit className="h-3 w-3 mr-1" />
                Update
              </button>
              )
            }
        
          </div>
        ),
      },
    ],
    [bookId, navigate, handleViewAssignment, handleEditAssignment]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      pagination,
    },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="bg-gray-50 border-y border-gray-200"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left text-sm font-[Inter-Medium] text-gray-500 capitalize tracking-wider"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() === "asc" ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : header.column.getIsSorted() === "desc" ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : null}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-4 text-sm font-[Inter-Medium] text-gray-500 text-center"
                >
                  No examiners assigned to this book
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-4 text-sm text-gray-900"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
        <div className="text-sm text-gray-600 font-[Inter-Regular]">
          Showing {pagination.pageIndex * pagination.pageSize + 1} to{" "}
          {Math.min(
            (pagination.pageIndex + 1) * pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{" "}
          of {table.getFilteredRowModel().rows.length} entries
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 text-sm font-[Inter-Medium] border border-gray-300 rounded-md disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 text-sm font-[Inter-Medium] border border-gray-300 rounded-md disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default GradeBookExaminerTable;
