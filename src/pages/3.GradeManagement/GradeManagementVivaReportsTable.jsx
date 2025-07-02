import React, { useState, useMemo } from 'react';
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import * as XLSX from 'xlsx';

const columnHelper = createColumnHelper();

const getStudentMarks = (row) => {
  let textMarks = { internal: 0, external: 0 };
  const currentAssignments = row.examinerAssignments?.filter(a => a.isCurrent);
  currentAssignments?.forEach(a => {
    if (a.examiner?.type === 'Internal') textMarks.internal = a.grade || 0;
    if (a.examiner?.type === 'External') textMarks.external = a.grade || 0;
  });

  const currentViva = row.vivaHistory?.find(v => v.isCurrent);
  const vivaMarks = {
    internal: currentViva?.internalMark || 0,
    external: currentViva?.externalMark || 0
  };

  return { textMarks, vivaMarks };
};

function groupBy(arr, keyFn) {
  return arr.reduce((acc, item) => {
    const key = keyFn(item) || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

const GradeManagementVivaReportsTable = ({ data, proposalsData, pageSize, setPageSize, currentPage, setCurrentPage, totalCount }) => {
  const [activeTab, setActiveTab] = useState("proposal-defense-completed");
  // Date range filter state for Proposal Defense Completed tab
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // --- All filtered data and columns at top level ---
  // Proposals
  const filteredProposalsData = useMemo(() => (proposalsData || []).filter(proposal => proposal.isCurrent === true), [proposalsData]);
  const completedProposals = useMemo(() => filteredProposalsData.filter(proposal => {
    const currentDefense = proposal.defenses?.find(d => d.isCurrent);
    return currentDefense && currentDefense.verdict;
  }), [filteredProposalsData]);
  const pendingProposals = useMemo(() => filteredProposalsData.filter(proposal => {
    const currentDefense = proposal.defenses?.find(d => d.isCurrent);
    return !currentDefense || !currentDefense.verdict;
  }), [filteredProposalsData]);
  // Date range filter for completed proposals
  const completedProposalsFiltered = useMemo(() => {
    if (!startDate && !endDate) return completedProposals;
    return completedProposals.filter(proposal => {
      const currentDefense = proposal.defenses?.find(d => d.isCurrent);
      const dateStr = currentDefense?.scheduledDate;
      if (!dateStr) return false;
      const date = new Date(dateStr);
      if (startDate && date < new Date(startDate)) return false;
      if (endDate && date > new Date(endDate)) return false;
      return true;
    });
  }, [completedProposals, startDate, endDate]);

  // Books (Viva)
  const filteredBooksData = useMemo(() => data.filter(book => {
    const isCurrentBook = book.isCurrent === true;
    const hasFinalStatus = book.student?.statuses?.some(status =>
       status.definition?.name === 'final dissertation & compliance report received'
    );
    const isNotGraduated = !book.student?.statuses?.some(status =>
      status.isCurrent &&
      status.definition?.name === 'graduated'
    );
    return isCurrentBook && hasFinalStatus && isNotGraduated;
  }), [data]);
  const completedBooks = useMemo(() => filteredBooksData.filter(book => {
    const hasVivaHistory = book.vivaHistory && book.vivaHistory.length > 0;
    const hasCurrentViva = book.vivaHistory?.some(v => v.isCurrent);
    return hasVivaHistory && hasCurrentViva;
  }), [filteredBooksData]);
  const pendingBooks = useMemo(() => filteredBooksData.filter(book => {
    const hasVivaHistory = book.vivaHistory && book.vivaHistory.length > 0;
    const hasCurrentViva = book.vivaHistory?.some(v => v.isCurrent);
    return !hasVivaHistory || !hasCurrentViva;
  }), [filteredBooksData]);

  // Columns for proposals
  const proposalColumns = useMemo(() => [
    columnHelper.accessor("student.registrationNumber", {
      header: "REGISTRATION NUMBER",
      id: "registrationNo",
      cell: info => info.getValue() || "N/A",
      size: 120,
    }),
    columnHelper.accessor(row => `${row.student?.firstName || ""} ${row.student?.lastName || ""}`, {
      header: "NAME",
      id: "studentName",
      size: 160,
    }),
    columnHelper.accessor(row => row.researchTopic || row.title || "N/A", {
      header: "RESEARCH TOPIC",
      id: "researchTopic",
      size: 220,
    }),
    columnHelper.accessor(row => row.defenses?.find(d => d.isCurrent)?.scheduledDate, {
      header: "Defense Date",
      id: "defenseDate",
      cell: info => info.getValue() ? format(new Date(info.getValue()), "dd-MMM-yyyy") : "-",
      size: 120,
    }),
    columnHelper.accessor(row => row.mainSupervisor?.name || row.mainSupervisor || "N/A", {
      header: "MAIN SUPERVISOR",
      id: "mainSupervisor",
      size: 140,
    }),
    columnHelper.accessor(row => row.coSupervisor?.name || row.coSupervisor || "N/A", {
      header: "CO-SUPERVISOR",
      id: "coSupervisor",
      size: 140,
    }),
    columnHelper.accessor(row => {
      const currentDefense = row.defenses?.find(d => d.isCurrent);
      if (currentDefense && currentDefense.verdict) {
        return currentDefense.verdict.includes('PASS') ? 'PASSED' : 'FAILED';
      }
      return 'NOT GRADED';
    }, {
      header: 'STATUS',
      id: 'defenseStatus',
      size: 100,
    })
  ], []);
  // Columns for viva
  const vivaColumns = useMemo(() => [
    columnHelper.accessor((row, index) => index + 1, {
      header: "No",
      id: "no",
      size: 40,
    }),
    columnHelper.accessor(row => `${row.student?.firstName || ""} ${row.student?.lastName || ""}`, {
      header: "NAME",
      id: "studentName",
      size: 160,
    }),
    columnHelper.accessor("student.registrationNumber", {
      header: "REG. NO",
      id: "registrationNo",
      cell: info => info.getValue() || "N/A",
      size: 120,
    }),
    columnHelper.accessor(row => row?.student?.gender === "male" ? "M" : "F" || "N/A", {
      header: "GENDER",
      id: "gender",
      size: 60,
    }),
    columnHelper.accessor(row => row.student?.course || "N/A", {
      header: "COURSE",
      id: "course",
      size: 80,
    }),
    columnHelper.accessor(row => `${row.student?.academicYear}` || "N/A", {
      header: "YEAR OF ENROLLMENT",
      id: "yearOfEnrollment",
      size: 120,
    }),
    columnHelper.accessor(row => row.student?.school?.name || "N/A", {
      header: "SCHOOL",
      id: "school",
      size: 120,
    }),
    columnHelper.accessor(row => {
      const currentViva = row.vivaHistory?.find(v => v.isCurrent);
      return currentViva?.vivaDate ? format(new Date(currentViva.vivaDate), "dd/MM/yyyy") : "N/A";
    }, {
      header: "VIVA DATE",
      id: "vivaDate",
      size: 100,
    }),
    columnHelper.group({
      header: 'VIVA MARKS',
      columns: [
        columnHelper.accessor(row => getStudentMarks(row).vivaMarks.internal, {
          header: 'Internal (100%)',
          id: 'viva_internal_100',
          cell: info => info.getValue()?.toFixed(0) || "N/A",
          size: 80,
        }),
        columnHelper.accessor(row => getStudentMarks(row).vivaMarks.internal * 0.2, {
          header: 'Internal (20%)',
          id: 'viva_internal_20',
          cell: info => info.getValue()?.toFixed(0) || "N/A",
          size: 80,
        }),
        columnHelper.accessor(row => getStudentMarks(row).vivaMarks.external, {
          header: 'External (100%)',
          id: 'viva_external_100',
          cell: info => info.getValue()?.toFixed(0) || "N/A",
          size: 80,
        }),
        columnHelper.accessor(row => getStudentMarks(row).vivaMarks.external * 0.2, {
          header: 'External (20%)',
          id: 'viva_external_20',
          cell: info => info.getValue()?.toFixed(0) || "N/A",
          size: 80,
        }),
      ]
    }),
    columnHelper.accessor(row => (getStudentMarks(row).vivaMarks.internal * 0.2) + (getStudentMarks(row).vivaMarks.external * 0.2), {
      header: 'Total Viva Mark (out of 40)',
      id: 'total_viva_mark',
      cell: info => info.getValue()?.toFixed(0) || "N/A",
      size: 120,
    }),
    columnHelper.accessor(row => row.vivaHistory?.find(v => v.isCurrent)?.status || 'N/A', {
      header: 'VIVA STATUS',
      id: 'vivaStatus',
      size: 100,
    })
  ], []);

  // Export headers and row logic for each tab
  const proposalExportHeaders = [
    "REGISTRATION NUMBER", "NAME", "RESEARCH TOPIC", "DEFENSE DATE", "MAIN SUPERVISOR", "CO-SUPERVISOR", "STATUS"
  ];
  const vivaExportHeaders = [
    "No", "NAME", "REG. NO", "GENDER", "COURSE", "YEAR OF ENROLLMENT", "SCHOOL", "VIVA DATE", "Internal (100%)", "Internal (20%)", "External (100%)", "External (20%)", "Total Viva Mark (out of 40)", "VIVA STATUS"
  ];
  const getProposalExportRow = (item) => {
    const currentDefense = item.defenses?.find(d => d.isCurrent);
    let status = 'NOT GRADED';
    if (currentDefense && currentDefense.verdict) {
      status = currentDefense.verdict.includes('PASS') ? 'PASSED' : 'FAILED';
    }
    return [
      item.student?.registrationNumber || "N/A",
      `${item.student?.firstName || ""} ${item.student?.lastName || ""}`,
      item.researchTopic || item.title || "N/A",
      currentDefense?.scheduledDate ? format(new Date(currentDefense.scheduledDate), "dd-MMM-yyyy") : "-",
      item.mainSupervisor?.name || item.mainSupervisor || "N/A",
      item.coSupervisor?.name || item.coSupervisor || "N/A",
      status
    ];
  };
  const getVivaExportRow = (item, index) => {
    const { vivaMarks } = getStudentMarks(item);
    const currentViva = item.vivaHistory?.find(v => v.isCurrent);
    const vivaTotal = (vivaMarks.internal * 0.2) + (vivaMarks.external * 0.2);
    return [
      index + 1,
      `${item.student?.firstName || ""} ${item.student?.lastName || ""}`,
      item.student?.registrationNumber || "N/A",
      item.student?.gender === "male" ? "M" : "F" || "N/A",
      item.student?.course || "N/A",
      item.student?.academicYear || "N/A",
      item.student?.school?.name || "N/A",
      currentViva?.vivaDate ? format(new Date(currentViva.vivaDate), "dd/MM/yyyy") : "N/A",
      vivaMarks.internal.toFixed(0),
      (vivaMarks.internal * 0.2).toFixed(0),
      vivaMarks.external.toFixed(0),
      (vivaMarks.external * 0.2).toFixed(0),
      vivaTotal.toFixed(0),
      currentViva?.status || 'N/A'
    ];
  };

  // --- Select correct data/columns/export logic for activeTab ---
  let tabData, columnsForTab, exportHeaders, getExportRow;
  if (activeTab === "proposal-defense-completed") {
    tabData = completedProposalsFiltered;
    columnsForTab = proposalColumns;
    exportHeaders = proposalExportHeaders;
    getExportRow = getProposalExportRow;
  } else if (activeTab === "proposal-defense-pending") {
    tabData = pendingProposals;
    columnsForTab = proposalColumns;
    exportHeaders = proposalExportHeaders;
    getExportRow = getProposalExportRow;
  } else if (activeTab === "viva-completed") {
    tabData = completedBooks;
    columnsForTab = vivaColumns;
    exportHeaders = vivaExportHeaders;
    getExportRow = getVivaExportRow;
  } else {
    tabData = pendingBooks;
    columnsForTab = vivaColumns;
    exportHeaders = vivaExportHeaders;
    getExportRow = getVivaExportRow;
  }

  // Group by school for the current tab
  const groupedBySchool = useMemo(() => groupBy(tabData, row => row.student?.school?.name || row.student?.campus?.location || 'Unknown'), [tabData]);
  const flatTabData = useMemo(() => Object.values(groupedBySchool).flat(), [groupedBySchool]);
  const table = useReactTable({
    data: flatTabData,
    columns: columnsForTab,
    getCoreRowModel: getCoreRowModel(),
  });

  // Export only current tab's data
  const handleExportAll = () => {
    let ws_data = [];
    ws_data.push(["UGANDA MANAGEMENT INSTITUTE"]);
    ws_data.push([`PROPOSAL DEFENSE & VIVA REPORTS FOR THE ACADEMIC YEAR`]);
    ws_data.push([]);
    let rowIndex = 0;
    const formatInstructions = [];
    ws_data.push([activeTab.replace(/-/g, ' ').toUpperCase()]);
    formatInstructions.push({ type: 'section', row: rowIndex });
    rowIndex++;
    Object.entries(groupedBySchool).forEach(([school, items]) => {
      ws_data.push([`School: ${school}`]);
      formatInstructions.push({ type: 'school', row: rowIndex });
      rowIndex++;
      ws_data.push(exportHeaders);
      formatInstructions.push({ type: 'header', row: rowIndex });
      rowIndex++;
      items.forEach((item, idx) => {
        ws_data.push(getExportRow(item, idx));
        formatInstructions.push({ type: 'row', row: rowIndex });
        rowIndex++;
      });
      ws_data.push([]);
      rowIndex++;
    });
    formatInstructions.unshift({ type: 'title', row: 0 });
    formatInstructions.unshift({ type: 'subtitle', row: 1 });
    const ws = XLSX.utils.aoa_to_sheet(ws_data);
    ws['!cols'] = Array(exportHeaders.length).fill({ wch: 18 });
    formatInstructions.forEach(({ type, row }) => {
      if (!ws_data[row]) return;
      const isHeader = type === 'header';
      const isTitle = type === 'title';
      const isSubtitle = type === 'subtitle';
      const isSchool = type === 'school';
      const isRow = type === 'row';
      const isSection = type === 'section';
      for (let c = 0; c < ws_data[row].length; c++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c });
        if (!ws[cellRef]) continue;
        if (isTitle) {
          ws[cellRef].s = {
            font: { bold: true, sz: 16 },
            alignment: { horizontal: 'center', vertical: 'center' },
          };
        } else if (isSubtitle) {
          ws[cellRef].s = {
            font: { bold: true, sz: 13 },
            alignment: { horizontal: 'center', vertical: 'center' },
          };
        } else if (isSection) {
          ws[cellRef].s = {
            font: { bold: true, sz: 14 },
            alignment: { horizontal: 'center', vertical: 'center' },
            fill: { fgColor: { rgb: 'E6E6FA' } },
          };
        } else if (isHeader) {
          ws[cellRef].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: 'D9E1F2' } },
            border: {
              top: { style: 'thin', color: { rgb: '000000' } },
              bottom: { style: 'thin', color: { rgb: '000000' } },
              left: { style: 'thin', color: { rgb: '000000' } },
              right: { style: 'thin', color: { rgb: '000000' } },
            },
            alignment: { horizontal: 'center', vertical: 'center' },
          };
        } else if (isSchool) {
          ws[cellRef].s = {
            font: { bold: true, sz: 12 },
            alignment: { horizontal: 'left', vertical: 'center' },
          };
        } else if (isRow) {
          ws[cellRef].s = {
            border: {
              top: { style: 'thin', color: { rgb: '000000' } },
              bottom: { style: 'thin', color: { rgb: '000000' } },
              left: { style: 'thin', color: { rgb: '000000' } },
              right: { style: 'thin', color: { rgb: '000000' } },
            },
            alignment: { horizontal: 'center', vertical: 'center' },
          };
        }
      }
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Tab Export");
    XLSX.writeFile(wb, `tab_export_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 pb-4">
        <nav className="flex -mb-px gap-4 justify-end">
          <button
            onClick={() => setActiveTab("proposal-defense-completed")}
            className={`py-2 px-4 text-xs font-medium rounded-lg ${activeTab === "proposal-defense-completed" ? "bg-primary-50 text-primary-600 border-2 border-primary-600" : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-2 border-gray-200"}`}
          >
            Proposal Defense Completed
          </button>
          <button
            onClick={() => setActiveTab("proposal-defense-pending")}
            className={`py-2 px-4 text-xs font-medium rounded-lg ${activeTab === "proposal-defense-pending" ? "bg-primary-50 text-primary-600 border-2 border-primary-600" : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-2 border-gray-200"}`}
          >
            Proposal Defense Pending
          </button>
          <button
            onClick={() => setActiveTab("viva-completed")}
            className={`py-2 px-4 text-xs font-medium rounded-lg ${activeTab === "viva-completed" ? "bg-primary-50 text-primary-600 border-2 border-primary-600" : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-2 border-gray-200"}`}
          >
            Viva Completed
          </button>
          <button
            onClick={() => setActiveTab("viva-pending")}
            className={`py-2 px-4 text-xs font-medium rounded-lg ${activeTab === "viva-pending" ? "bg-primary-50 text-primary-600 border-2 border-primary-600" : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-2 border-gray-200"}`}
          >
            Viva Pending
          </button>
        </nav>
      </div>
      <div>
        {/* Date range filter for Proposal Defense Completed tab */}
        {activeTab === "proposal-defense-completed" && (
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2">
                <span className="text-sm">Start Date:</span>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded px-2 py-1" />
              </label>
              <label className="flex items-center gap-2">
                <span className="text-sm">End Date:</span>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded px-2 py-1" />
              </label>
              {(startDate || endDate) && (
                <button onClick={() => { setStartDate(""); setEndDate(""); }} className="text-xs text-blue-600 underline ml-2">Clear</button>
              )}
            </div>
            <span className="text-xs text-gray-500 ml-1">Showing proposals with defense dates between Start Date and End Date (inclusive).</span>
          </div>
        )}
        <div className="flex justify-end mb-4">
          <Button onClick={handleExportAll} className="flex items-center gap-2" disabled={tabData.length === 0}>
            <Download className="h-4 w-4" />
            Export to Excel
          </Button>
        </div>
        <div className="text-center mb-4">
          <h1 className="font-bold text-lg">UGANDA MANAGEMENT INSTITUTE</h1>
          <h2 className="font-semibold">
            PROPOSAL DEFENSE & VIVA REPORTS FOR THE ACADEMIC YEAR
          </h2>
        </div>
        {/* Grouped by school for the current tab */}
        {Object.entries(groupedBySchool).map(([school, items]) => {
          if (!items || items.length === 0) return null;
          // Create a filtered table for this group using the main table instance
          const rowIds = new Set(items.map(item => item.id));
          const groupRows = table.getRowModel().rows.filter(row => rowIds.has(row.original.id));
          if (groupRows.length === 0) return null;
          return (
            <div key={school} className="mb-6">
              <h4 className="text-base font-semibold mb-1">School: {school}</h4>
              <div className="overflow-x-auto rounded-md border">
                <table className="w-full border-collapse" style={{ tableLayout: 'fixed' }}>
                  <thead className="bg-gray-50">
                    {table.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <th 
                            key={header.id} 
                            colSpan={header.colSpan} 
                            className="px-2 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-600 border border-gray-200"
                            style={{ width: header.getSize() }}
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
                    {groupRows.length > 0 ? (
                      groupRows.map(row => (
                        <tr key={row.id} className="hover:bg-gray-50">
                          {row.getVisibleCells().map(cell => (
                            <td 
                              key={cell.id} 
                              className="px-2 py-2 text-xs border border-gray-200 text-center"
                              style={{ width: cell.column.getSize() }}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={table.getAllColumns().length} className="text-center py-8 text-gray-500">
                          No data available for this tab.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
        {/* End grouped tables */}
      </div>
    </div>
  );
};

export default GradeManagementVivaReportsTable; 