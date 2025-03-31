import React, { useState, useMemo, useCallback } from "react";
import { useReactTable, getCoreRowModel, flexRender, getPaginationRowModel,
  getFilteredRowModel, createColumnHelper } from "@tanstack/react-table";
import { useNavigate } from 'react-router-dom';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Icon } from "@iconify-icon/react";
import { format } from "date-fns";

const StudentProfileProgressStatusTable = ({statuses, isLoading, setIsStatusDrawerOpen, setSelectedStatus}) => {
    const [globalFilter, setGlobalFilter] = React.useState("");
    
    const columnHelper = createColumnHelper();

    const handleStatusClick = useCallback((status) => {
      setSelectedStatus(status);
      setIsStatusDrawerOpen(true);
    }, [setSelectedStatus, setIsStatusDrawerOpen]);

    const handleFilterChange = useCallback((e) => {
      setGlobalFilter(e.target.value);
    }, []);

    const handlePageSizeChange = useCallback((e, table) => {
      table.setPageSize(Number(e.target.value));
    }, []);

    const columns = useMemo(() => [
        columnHelper.accessor("definition.name", {
          header: "Student Status",
          cell: (info) => (
            <span
              style={{
                color: info.row.original.definition?.color || '#000',
                backgroundColor: `${info.row.original.definition?.color}18` || '#00000018',
                border: `1px solid ${info.row.original.definition?.color || '#000'}`,
                padding: '0.25rem 0.5rem',
                borderRadius: '0.375rem',
                display: 'inline-block'
              }}
              className="capitalize"
            >
              {info.getValue()?.toLowerCase() || 'Unknown'}
            </span>
          )
        }),
        columnHelper.accessor("startDate", {
          header: "Start Date",
          cell: (info) => format(new Date(info.getValue()), 'dd-MMM-yyyy')
        }),
        columnHelper.accessor("endDate", {
          header: "End Date", 
          cell: (info) => info.getValue() ? format(new Date(info.getValue()), 'dd-MMM-yyyy') : '-'
        }),
        columnHelper.accessor("duration", {
          header: "Duration (Days)",
          cell: (info) => {
            const startDate = new Date(info.row.original.startDate);
            const endDate = info.row.original.endDate ? new Date(info.row.original.endDate) : new Date();
            const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            return daysDiff || '-';
          }
        }),
        columnHelper.accessor("notificationsSent", {
          header: "Notifications",
          cell: (info) => {
            const notifications = info.getValue();
            if (!notifications?.length) return 'N/A';
            return (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex items-center gap-1">
                      <span>{notifications.length}</span>
                      <Icon icon="mdi:bell" className="w-4 h-4 text-gray-400" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {notifications.map((notification, i) => (
                      <div key={i} className="text-sm">
                        {notification.type}: {notification.message}
                      </div>
                    ))}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          }
        }),
        columnHelper.accessor("updatedBy.name", {
          header: "Updated By",
          cell: (info) => {
            const updatedBy = info.row.original.updatedBy;
            return (
              <div className="flex items-center gap-1">
                <span>{updatedBy?.name || '-'}</span>
                {updatedBy && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Icon
                          icon="tdesign:info-circle-filled"
                          className="w-4 h-4 text-gray-400"
                        />
                      </TooltipTrigger>
                      <TooltipContent>{updatedBy.email}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            );
          }
        }),
        columnHelper.accessor("id", {
          header: "",
          cell: (info) => (
            <button
              onClick={() => handleStatusClick(info.row.original)}
              className="rounded border text-gray-700 border-semantic-bg-border shadow-sm py-1 px-2 hover:bg-gray-50 font-[Inter-Medium] text-sm cursor-pointer"
            >
              Open
            </button>
          )
        })
    ], [handleStatusClick]);

    const table = useReactTable({
      data: statuses || [],
      columns,
      state: {
        globalFilter,
      },
      getFilteredRowModel: getFilteredRowModel(),
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
    });

    if (!statuses || statuses.length === 0) {
      return (
        <div className="p-8 text-center">
          <p className="text-gray-500">No Student Statuses</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <div className="p-4 flex items-center justify-between border-b">
          <div className="relative">
            <input
              type="text"
              value={globalFilter ?? ''}
              onChange={handleFilterChange}
              placeholder="Search..."
              className="px-4 py-2 border rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Icon icon="mdi:search" className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => handlePageSizeChange(e, table)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>

        <table className="w-full">
          <thead className="bg-[#f9fafd]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th 
                    key={header.id} 
                    className="px-4 py-3 text-left text-[#111827] text-opacity-90 font-[Inter-SemiBold] text-sm"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
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
                    className="px-4 py-2 whitespace-nowrap text-[#111827] font-[Inter-Regular] text-[14px] leading-[20px]"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="px-6 py-3  flex items-center justify-between border-t border-gray-200 bg-white">
          <div className="flex font-[Roboto-Regular] items-center text-sm text-gray-500">
            Showing{" "}
            <span className="font-[Roboto-Medium] mx-1">
              {table.getState().pagination.pageSize *
                table.getState().pagination.pageIndex +
                1}
            </span>
            to{" "}
            <span className="font-[Roboto-Medium] mx-1">
              {Math.min(
                (table.getState().pagination.pageIndex + 1) *
                  table.getState().pagination.pageSize,
                table.getPrePaginationRowModel().rows.length
              )}
            </span>
            of{" "}
              <span className="font-[Roboto-Medium] mx-1">
              {table.getPrePaginationRowModel().rows.length}
            </span>{" "}
            results
          </div>
          <div className="flex items-center gap-2">
          <button
          className="border border-gray-300 rounded p-1 font-[Roboto-Regular] text-sm disabled:opacity-50"
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
                ? 'bg-blue-50 text-blue-600 font-[Roboto-Medium]'
                : 'text-gray-500'
            }`}
            onClick={() => table.setPageIndex(pageNumber - 1)}
          >
            {pageNumber}
          </button>
        ))}
             <button
          className="border border-gray-300 rounded p-1 font-[Roboto-Regular] text-sm disabled:opacity-50"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </button>
          </div>
        </div>
    </div>
    )
}

export default StudentProfileProgressStatusTable;