import React, { useState, useMemo, useEffect, useRef } from 'react';
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar, Download } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "../../utils/tanstack";
import {
  updateResultsApprovalDateService,
  updateResultsSentDateService,
  updateSenateApprovalDateService
} from "../../store/tanstackStore/services/api";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { IndeterminateCheckbox } from "@/components/ui/indeterminate-checkbox.jsx";
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

const GroupedReportTable = ({ items, reportsColumns, TableComponent }) => {
  const table = useReactTable({
    data: items,
    columns: reportsColumns,
    getCoreRowModel: getCoreRowModel(),
  });
  return <TableComponent table={table} />;
};

const GradeManagementFinalSubmissionTable = ({ data, pageSize, setPageSize, currentPage, setCurrentPage, totalCount }) => {
  const [activeTab, setActiveTab] = useState("results-pending-approval");
  const [selectedBook, setSelectedBook] = useState(null);
  const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [rowSelection, setRowSelection] = useState({});

  useEffect(() => {
    setRowSelection({});
  }, [activeTab]);

  // Filter books based on criteria
  const filteredData = useMemo(() => {
    return data.filter(book => {
      const isCurrentBook = book.isCurrent === true;
      const hasFinalStatus = book.student?.statuses?.some(status =>
        status.definition?.name === 'final dissertation & compliance report received'
      );
      const isNotGraduated = !book.student?.statuses?.some(status =>
        status.isCurrent &&
        status.definition?.name === 'graduated'
      );
      return isCurrentBook && hasFinalStatus && isNotGraduated;
    });
  }, [data]);

  // Data subsets for each tab
  const pendingApprovalData = useMemo(() => {
    return filteredData.filter(book => !book.student?.resultsApprovedDate);
  }, [filteredData]);

  const approvedAtCentreData = useMemo(() => {
    return filteredData.filter(book => book.student?.resultsApprovedDate && !book.student?.resultsSentDate);
  }, [filteredData]);

  const resultsSentData = useMemo(() => {
    return filteredData.filter(book => book.student?.resultsSentDate && !book.student?.senateApprovalDate);
  }, [filteredData]);

  const senateApprovalData = useMemo(() => {
    return filteredData.filter(book => book.student?.senateApprovalDate);
  }, [filteredData]);

  // Group data for reports tab
  const groupedReportsData = useMemo(() => {
    // Use student.course and student.school if available, fallback to registrationNumber and campus.location
    return groupBy(filteredData, row => row.student?.course || row.student?.registrationNumber?.split('/')[2] || 'Unknown');
  }, [filteredData]);

  // For each course, group by school (or campus/location)
  const groupedByCourseAndSchool = useMemo(() => {
    const result = {};
    Object.entries(groupedReportsData).forEach(([course, items]) => {
      result[course] = groupBy(items, row => row.student?.school?.name || row.student?.campus?.location || 'Unknown');
    });
    return result;
  }, [groupedReportsData]);

  // Compute the current academic year from filteredData
  const currentAcademicYear = useMemo(() => {
    // Get all academic years from filteredData
    const years = filteredData
      .map(book => book.student?.academicYear)
      .filter(Boolean);
    if (years.length === 0) return '';
    // Option 1: Use the most common year
    const freq = {};
    years.forEach(y => { freq[y] = (freq[y] || 0) + 1; });
    const mostCommon = Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
    return mostCommon;
  }, [filteredData]);

   // Reports table columns based on the image
   const reportsColumns = useMemo(() => [
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
    columnHelper.accessor(row => row.student?.registrationNumber?.split('/')[3] || "N/A", {
      header: "BRANCH",
      id: "branch",
      size: 80,
    }),
    columnHelper.group({
      header: 'L.E. text',
      columns: [
        columnHelper.accessor(row => getStudentMarks(row).textMarks.internal, {
          header: '(100%)',
          id: 'le_text_100',
          cell: info => info.getValue()?.toFixed(0),
          size: 60,
        }),
        columnHelper.accessor(row => getStudentMarks(row).textMarks.internal * 0.2, {
          header: '(20%)',
          id: 'le_text_20',
          cell: info => info.getValue()?.toFixed(0),
          size: 60,
        }),
      ]
    }),
    columnHelper.group({
      header: 'E.E. text',
      columns: [
        columnHelper.accessor(row => getStudentMarks(row).textMarks.external, {
          header: '(100%)',
          id: 'ee_text_100',
          cell: info => info.getValue()?.toFixed(0),
          size: 60,
        }),
        columnHelper.accessor(row => getStudentMarks(row).textMarks.external * 0.4, {
          header: '(40%)',
          id: 'ee_text_40',
          cell: info => info.getValue()?.toFixed(0),
          size: 60,
        }),
      ]
    }),
    columnHelper.accessor(row => (getStudentMarks(row).textMarks.internal * 0.2) + (getStudentMarks(row).textMarks.external * 0.4), {
      header: 'Total text mark (out of 60)',
      id: 'total_text_mark',
      cell: info => info.getValue()?.toFixed(0),
      size: 100,
    }),
    columnHelper.group({
      header: 'L.E. viva',
      columns: [
        columnHelper.accessor(row => getStudentMarks(row).vivaMarks.internal, {
          header: '(100%)',
          id: 'le_viva_100',
          cell: info => info.getValue()?.toFixed(0),
          size: 60,
        }),
        columnHelper.accessor(row => getStudentMarks(row).vivaMarks.internal * 0.2, {
          header: '(20%)',
          id: 'le_viva_20',
          cell: info => info.getValue()?.toFixed(0),
          size: 60,
        }),
      ]
    }),
    columnHelper.group({
      header: 'E.E. viva',
      columns: [
        columnHelper.accessor(row => getStudentMarks(row).vivaMarks.external, {
          header: '(100%)',
          id: 'ee_viva_100',
          cell: info => info.getValue()?.toFixed(0),
          size: 60,
        }),
        columnHelper.accessor(row => getStudentMarks(row).vivaMarks.external * 0.2, {
          header: '(20%)',
          id: 'ee_viva_20',
          cell: info => info.getValue()?.toFixed(0),
          size: 60,
        }),
      ]
    }),
    columnHelper.accessor(row => (getStudentMarks(row).vivaMarks.internal * 0.2) + (getStudentMarks(row).vivaMarks.external * 0.2), {
      header: 'Total viva mark (out of 40)',
      id: 'total_viva_mark',
      cell: info => info.getValue()?.toFixed(0),
      size: 100,
    }),
    columnHelper.accessor(row => {
      const { textMarks, vivaMarks } = getStudentMarks(row);
      const textTotal = (textMarks.internal * 0.2) + (textMarks.external * 0.4);
      const vivaTotal = (vivaMarks.internal * 0.2) + (vivaMarks.external * 0.2);
      return textTotal + vivaTotal;
    }, {
      header: 'Final Dissertation mark (out of 100)',
      id: 'final_dissertation_mark',
      cell: info => info.getValue()?.toFixed(0),
      size: 120,
    }),
    columnHelper.accessor(row => row.vivaHistory?.find(v => v.isCurrent)?.status || 'Complete', {
      header: 'Status',
      id: 'status',
      size: 100,
    })
  ], []);

  // Mutations
  const updateResultsApprovalMutation = useMutation({
    mutationFn: (data) => updateResultsApprovalDateService(selectedBook.student.id, data),
    onSuccess: () => {
      toast.success("Results approval date updated successfully");
      setIsDateDialogOpen(false);
      queryClient.invalidateQueries(['books']);
    },
    onError: (error) => toast.error(`Error: ${error.message}`)
  });

  const updateResultsSentMutation = useMutation({
    mutationFn: (data) => updateResultsSentDateService(selectedBook.student.id, data),
    onSuccess: () => {
      toast.success("Results sent date updated successfully");
      setIsDateDialogOpen(false);
      queryClient.invalidateQueries(['books']);
    },
    onError: (error) => toast.error(`Error: ${error.message}`)
  });

  const updateSenateApprovalMutation = useMutation({
    mutationFn: (data) => updateSenateApprovalDateService(selectedBook.student.id, data),
    onSuccess: () => {
      toast.success("Senate approval date updated successfully");
      setIsDateDialogOpen(false);
      queryClient.invalidateQueries(['books']);
    },
    onError: (error) => toast.error(`Error: ${error.message}`)
  });

  const approveMultipleMutation = useMutation({
    mutationFn: (booksToApprove) => {
      const approvalDate = new Date().toISOString().split('T')[0];
      const promises = booksToApprove.map(book =>
        updateResultsApprovalDateService(book.student.id, { resultsApprovedDate: approvalDate })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast.success("Selected results approved successfully.");
      setRowSelection({});
      queryClient.invalidateQueries(['books']);
    },
    onError: (error) => toast.error(`Error during approval: ${error.message}`)
  });

  const sendToSchoolMultipleMutation = useMutation({
    mutationFn: (booksToSend) => {
      const sentDate = new Date().toISOString().split('T')[0];
      const promises = booksToSend.map(book =>
        updateResultsSentDateService(book.student.id, { resultsSentDate: sentDate })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast.success("Selected results sent to school successfully.");
      setRowSelection({});
      queryClient.invalidateQueries(['books']);
    },
    onError: (error) => toast.error(`Error sending to school: ${error.message}`)
  });

  const senateApproveMultipleMutation = useMutation({
    mutationFn: (booksToApprove) => {
      const approvalDate = new Date().toISOString().split('T')[0];
      const promises = booksToApprove.map(book =>
        updateSenateApprovalDateService(book.student.id, { senateApprovalDate: approvalDate })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast.success("Selected results marked as senate approved.");
      setRowSelection({});
      queryClient.invalidateQueries(['books']);
    },
    onError: (error) => toast.error(`Error during senate approval: ${error.message}`)
  });

  const handleDateUpdate = (e) => {
    e.preventDefault();
    const payload = { [getDateField(selectedBook).key]: selectedDate };
    switch (activeTab) {
      case "results-approved-at-centre":
        updateResultsSentMutation.mutate(payload);
        break;
      case "results-sent":
        updateSenateApprovalMutation.mutate(payload);
        break;
      default:
        break;
    }
  };

  const handleBulkApprove = () => {
    const selectedBooks = Object.keys(rowSelection).map(index => pendingApprovalData[parseInt(index, 10)]);
    if (selectedBooks.length > 0) approveMultipleMutation.mutate(selectedBooks);
    else toast.info("No items selected for approval.");
  };

  const handleBulkSendToSchool = () => {
    const selectedBooks = Object.keys(rowSelection).map(index => approvedAtCentreData[parseInt(index, 10)]);
    if (selectedBooks.length > 0) sendToSchoolMultipleMutation.mutate(selectedBooks);
    else toast.info("No items selected to send.");
  };

  const handleBulkSenateApprove = () => {
    const selectedBooks = Object.keys(rowSelection).map(index => resultsSentData[parseInt(index, 10)]);
    if (selectedBooks.length > 0) senateApproveMultipleMutation.mutate(selectedBooks);
    else toast.info("No items selected for senate approval.");
  };

  const getDateField = (book) => {
    switch (activeTab) {
      case "results-approved-at-centre":
        return { key: 'resultsSentDate', value: book.student?.resultsSentDate };
      case "results-sent":
        return { key: 'senateApprovalDate', value: book.student?.senateApprovalDate };
      default:
        return { key: '', value: null };
    }
  };

  const getDialogTitle = () => {
    switch (activeTab) {
      case "results-approved-at-centre":
        return "Update Results Sent Date";
      case "results-sent":
        return "Update Senate Approval Date";
      default:
        return "Update Date";
    }
  };

  const calculateFinalMarks = (examinerAssignment) => {
    if (!examinerAssignment) return { total: 0 };
    let marks = { externalMark: 0, internalMark: 0 };
    const currentAssignments = examinerAssignment?.filter(assignment => assignment.isCurrent);
    currentAssignments?.forEach(assignment => {
      if (assignment.examiner?.type === 'External') marks.externalMark = assignment.grade || 0;
      else if (assignment.examiner?.type === 'Internal') marks.internalMark = assignment.grade || 0;
    });
    const externalFinal = (marks.externalMark || 0) * 0.6;
    const internalFinal = (marks.internalMark || 0) * 0.4;
    return {
      externalMark: marks.externalMark,
      internalMark: marks.internalMark,
      external: externalFinal,
      internal: internalFinal,
      total: externalFinal + internalFinal
    };
  };

  // Column definitions for each tab
  const pendingApprovalColumns = useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => <IndeterminateCheckbox {...{ checked: table.getIsAllRowsSelected(), indeterminate: table.getIsSomeRowsSelected(), onChange: table.getToggleAllRowsSelectedHandler() }} />,
      cell: ({ row }) => <IndeterminateCheckbox {...{ checked: row.getIsSelected(), disabled: !row.getCanSelect(), indeterminate: row.getIsSomeSelected(), onChange: row.getToggleSelectedHandler() }} />,
      size: 40,
    },
    columnHelper.accessor("student.registrationNumber", { header: "Registration No", id: "registrationNo" }),
    columnHelper.accessor(row => `${row.student?.firstName || ""} ${row.student?.lastName || ""}`, { header: "Student Name", id: "studentName" }),
    columnHelper.accessor("bookCode", { header: "Book Code", id: "bookCode" }),
    columnHelper.accessor(row => {
      const { textMarks } = getStudentMarks(row);
      const textTotal = (textMarks.internal * 0.2) + (textMarks.external * 0.4);
      return textTotal;
    }, {
      header: "Text Exam Total",
      id: "textExamTotal",
      cell: info => info.getValue() ? `${info.getValue().toFixed(2)}%` : "N/A"
    }),
    columnHelper.accessor(row => {
      const { vivaMarks } = getStudentMarks(row);
      const vivaTotal = (vivaMarks.internal * 0.2) + (vivaMarks.external * 0.2);
      return vivaTotal;
    }, {
      header: "Viva Total",
      id: "vivaTotal",
      cell: info => `${info.getValue().toFixed(2)}%`
    }),
    columnHelper.accessor(row => row.finalGrade, {
      header: "Final Grade",
      id: "finalGrade",
      cell: info => info.getValue() ? `${info.getValue().toFixed(2)}%` : "Not Available"
    })
  ], []);

  const approvedAtCentreColumns = useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => <IndeterminateCheckbox {...{ checked: table.getIsAllRowsSelected(), indeterminate: table.getIsSomeRowsSelected(), onChange: table.getToggleAllRowsSelectedHandler() }} />,
      cell: ({ row }) => <IndeterminateCheckbox {...{ checked: row.getIsSelected(), disabled: !row.getCanSelect(), indeterminate: row.getIsSomeSelected(), onChange: row.getToggleSelectedHandler() }} />,
      size: 40,
    },
    columnHelper.accessor("student.registrationNumber", { header: "Registration No", id: "registrationNo" }),
    columnHelper.accessor(row => `${row.student?.firstName || ""} ${row.student?.lastName || ""}`, { header: "Student Name", id: "studentName" }),
    columnHelper.accessor("bookCode", { header: "Book Code", id: "bookCode" }),
    columnHelper.accessor(row => row.finalGrade, { header: "Final Grade", id: "finalGrade", cell: info => info.getValue() ? `${info.getValue().toFixed(2)}%` : "Not Available" }),
    columnHelper.accessor(row => row.student?.resultsApprovedDate, { header: "Approval Date", id: "approvalDate", cell: info => info.getValue() ? format(new Date(info.getValue()), "dd-MMM-yyyy") : "Not Set" }),
  ], []);

  console.log("data", data)
  const resultsSentColumns = useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => <IndeterminateCheckbox {...{ checked: table.getIsAllRowsSelected(), indeterminate: table.getIsSomeRowsSelected(), onChange: table.getToggleAllRowsSelectedHandler() }} />,
      cell: ({ row }) => <IndeterminateCheckbox {...{ checked: row.getIsSelected(), disabled: !row.getCanSelect(), indeterminate: row.getIsSomeSelected(), onChange: row.getToggleSelectedHandler() }} />,
      size: 40,
    },
    columnHelper.accessor("student.registrationNumber", { header: "Registration No", id: "registrationNo" }),
    columnHelper.accessor(row => `${row.student?.firstName || ""} ${row.student?.lastName || ""}`, { header: "Student Name", id: "studentName" }),
    columnHelper.accessor("bookCode", { header: "Book Code", id: "bookCode" }),
    columnHelper.accessor(row => row.finalGrade, { header: "Final Grade", id: "finalGrade", cell: info => info.getValue() ? `${info.getValue().toFixed(2)}%` : "Not Available" }),
    columnHelper.accessor(row => row.student?.resultsSentDate, { header: "Sent Date", id: "sentDate", cell: info => info.getValue() ? format(new Date(info.getValue()), "dd-MMM-yyyy") : "Not Set" }),
  ], []);

  const senateApprovalColumns = useMemo(() => [
    columnHelper.accessor("student.registrationNumber", { header: "Registration No", id: "registrationNo" }),
    columnHelper.accessor(row => `${row.student?.firstName || ""} ${row.student?.lastName || ""}`, { header: "Student Name", id: "studentName" }),
    columnHelper.accessor("bookCode", { header: "Book Code", id: "bookCode" }),
    columnHelper.accessor(row => row.finalGrade, { header: "Final Grade", id: "finalGrade", cell: info => info.getValue() ? `${info.getValue().toFixed(2)}%` : "Not Available" }),
    columnHelper.accessor(row => row.student?.senateApprovalDate, { header: "Senate Approval Date", id: "senateApprovalDate", cell: info => info.getValue() ? format(new Date(info.getValue()), "dd-MMM-yyyy") : "Not Set" })
  ], []);
  
  const tableInstances = {
    "results-pending-approval": useReactTable({
      data: pendingApprovalData,
      columns: pendingApprovalColumns,
      state: { rowSelection },
      onRowSelectionChange: setRowSelection,
      enableRowSelection: true,
      getCoreRowModel: getCoreRowModel(),
    }),
    "results-approved-at-centre": useReactTable({
      data: approvedAtCentreData,
      columns: approvedAtCentreColumns,
      getCoreRowModel: getCoreRowModel(),
    }),
    "results-sent": useReactTable({
      data: resultsSentData,
      columns: resultsSentColumns,
      getCoreRowModel: getCoreRowModel(),
    }),
    "senate-approval": useReactTable({
      data: senateApprovalData,
      columns: senateApprovalColumns,
      getCoreRowModel: getCoreRowModel(),
    }),
    "reports": useReactTable({
      data: filteredData,
      columns: reportsColumns,
      getCoreRowModel: getCoreRowModel(),
    }),
  };

  const currentTable = tableInstances[activeTab];

  const handleExportAll = () => {
    // Excel export logic
    const headers = [
      "No", "NAME", "REG. NO", "GENDER", "COURSE", "YEAR OF ENROLLMENT", "BRANCH",
      "L.E. text (100%)", "L.E. text (20%)", "E.E. text (100%)", "E.E. text (40%)", "Total text mark (out of 60)",
      "L.E. viva (100%)", "L.E. viva (20%)", "E.E. viva (100%)", "E.E. viva (20%)", "Total viva mark (out of 40)",
      "Final Dissertation mark (out of 100)", "Status"
    ];

    let ws_data = [];
    // Title and academic year
    ws_data.push(["UGANDA MANAGEMENT INSTITUTE"]);
    ws_data.push([`PROVISIONAL DISSERTATION EXAMINATION RESULTS FOR THE ACADEMIC YEAR ${currentAcademicYear || '_____/_____'}`]);
    ws_data.push([]);

    // Track row indices for formatting
    let rowIndex = 0;
    const formatInstructions = [];

    // Grouped by course and school
    Object.entries(groupedByCourseAndSchool).forEach(([course, schools]) => {
      ws_data.push([`Course: ${course}`]);
      formatInstructions.push({ type: 'course', row: rowIndex });
      rowIndex++;
      Object.entries(schools).forEach(([school, items]) => {
        ws_data.push([`School: ${school}`]);
        formatInstructions.push({ type: 'school', row: rowIndex });
        rowIndex++;
        ws_data.push(headers);
        formatInstructions.push({ type: 'header', row: rowIndex });
        rowIndex++;
        items.forEach((book, index) => {
          const { textMarks, vivaMarks } = getStudentMarks(book);
          const regNo = book.student?.registrationNumber || "";
          const textTotal = (textMarks.internal * 0.2) + (textMarks.external * 0.4);
          const vivaTotal = (vivaMarks.internal * 0.2) + (vivaMarks.external * 0.2);
          const finalMark = textTotal + vivaTotal;
          ws_data.push([
            index + 1,
            `${book.student?.firstName || ""} ${book.student?.lastName || ""}`,
            regNo, book.student?.gender === "male" ? "M" : "F" || "N/A",
            book.student?.course || regNo.split('/')[2] || "N/A",
            book.student?.academicYear || `20${regNo.split('/')[0]}` || "N/A",
            regNo.split('/')[3] || "N/A",
            textMarks.internal.toFixed(0),
            (textMarks.internal * 0.2).toFixed(0),
            textMarks.external.toFixed(0),
            (textMarks.external * 0.4).toFixed(0),
            textTotal.toFixed(0),
            vivaMarks.internal.toFixed(0),
            (vivaMarks.internal * 0.2).toFixed(0),
            vivaMarks.external.toFixed(0),
            (vivaMarks.external * 0.2).toFixed(0),
            vivaTotal.toFixed(0),
            finalMark.toFixed(0),
            book.vivaHistory?.find(v => v.isCurrent)?.status || 'Complete'
          ]);
          formatInstructions.push({ type: 'row', row: rowIndex });
          rowIndex++;
        });
        ws_data.push([]);
        rowIndex++;
      });
      ws_data.push([]);
      rowIndex++;
    });

    // Add formatting for title and academic year
    formatInstructions.unshift({ type: 'title', row: 0 });
    formatInstructions.unshift({ type: 'subtitle', row: 1 });

    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Set column widths for readability
    ws['!cols'] = [
      { wch: 5 },   // No
      { wch: 22 },  // Name
      { wch: 14 },  // Reg No
      { wch: 8 },   // Gender
      { wch: 18 },  // Course
      { wch: 18 },  // Year
      { wch: 12 },  // Branch
      { wch: 12 },  // L.E. text (100%)
      { wch: 12 },  // L.E. text (20%)
      { wch: 12 },  // E.E. text (100%)
      { wch: 12 },  // E.E. text (40%)
      { wch: 18 },  // Total text mark
      { wch: 12 },  // L.E. viva (100%)
      { wch: 12 },  // L.E. viva (20%)
      { wch: 12 },  // E.E. viva (100%)
      { wch: 12 },  // E.E. viva (20%)
      { wch: 18 },  // Total viva mark
      { wch: 22 },  // Final Dissertation mark
      { wch: 14 },  // Status
    ];

    // Apply cell styles
    formatInstructions.forEach(({ type, row }) => {
      if (!ws_data[row]) return;
      const isHeader = type === 'header';
      const isTitle = type === 'title';
      const isSubtitle = type === 'subtitle';
      const isCourse = type === 'course';
      const isSchool = type === 'school';
      const isRow = type === 'row';
      for (let c = 0; c < ws_data[row].length; c++) {
        const cellRef = XLSX.utils.encode_cell({ r: row, c });
        if (!ws[cellRef]) continue;
        // Title
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
        } else if (isCourse || isSchool) {
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
    XLSX.utils.book_append_sheet(wb, ws, "Report");
    XLSX.writeFile(wb, `grade_report_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  };

  const handleExportSelected = () => {
    const selectedIndices = Object.keys(rowSelection);
    if (selectedIndices.length === 0) {
      toast.info("No items selected for export.");
      return;
    }

    let dataToExport;
    switch (activeTab) {
      case 'results-pending-approval':
        dataToExport = selectedIndices.map(index => pendingApprovalData[parseInt(index, 10)]);
        break;
      case 'results-approved-at-centre':
        dataToExport = selectedIndices.map(index => approvedAtCentreData[parseInt(index, 10)]);
        break;
      case 'results-sent':
        dataToExport = selectedIndices.map(index => resultsSentData[parseInt(index, 10)]);
        break;
      default:
        dataToExport = [];
    }
    generateReportCSV(dataToExport);
  };

  const TableComponent = ({ table }) => (
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
                {table.getRowModel().rows.length > 0 ? (
                  table.getRowModel().rows.map(row => (
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
  );

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 pb-4">
        <nav className="flex -mb-px gap-4 justify-end">
          <button
            onClick={() => setActiveTab("results-pending-approval")}
            className={`py-2 px-4 text-xs font-medium rounded-lg ${activeTab === "results-pending-approval" ? "bg-primary-50 text-primary-600 border-2 border-primary-600" : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-2 border-gray-200"}`}
          >
            Results Pending Approval
          </button>
          <button
            onClick={() => setActiveTab("results-approved-at-centre")}
            className={`py-2 px-4 text-xs font-medium rounded-lg ${activeTab === "results-approved-at-centre" ? "bg-primary-50 text-primary-600 border-2 border-primary-600" : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-2 border-gray-200"}`}
          >
            Results Approved at Centre
          </button>
          <button
            onClick={() => setActiveTab("results-sent")}
            className={`py-2 px-4 text-xs font-medium rounded-lg ${activeTab === "results-sent" ? "bg-primary-50 text-primary-600 border-2 border-primary-600" : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-2 border-gray-200"}`}
          >
            Results Sent to School
          </button>
          <button
            onClick={() => setActiveTab("senate-approval")}
            className={`py-2 px-4 text-xs font-medium rounded-lg ${activeTab === "senate-approval" ? "bg-primary-50 text-primary-600 border-2 border-primary-600" : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-2 border-gray-200"}`}
          >
            Senate Approval
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`py-2 px-4 text-xs font-medium rounded-lg ${activeTab === "reports" ? "bg-primary-50 text-primary-600 border-2 border-primary-600" : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-2 border-gray-200"}`}
          >
            Reports
          </button>
        </nav>
      </div>

      <div>
        {activeTab === 'reports' ? (
          <div className="space-y-4">
            <div className="text-center">
              <h1 className="font-bold text-lg">UGANDA MANAGEMENT INSTITUTE</h1>
              <h2 className="font-semibold">
                PROVISIONAL DISSERTATION EXAMINATION RESULTS FOR THE ACADEMIC YEAR {currentAcademicYear || '_____/_____'}
              </h2>
            </div>
            <div className="flex justify-end mb-4">
              <Button onClick={handleExportAll} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export to Excel
              </Button>
            </div>

            {/* Grouped tables by Course and School (using child component) */}
            {Object.entries(groupedByCourseAndSchool).map(([course, schools]) => (
              <div key={course} className="mb-8">
                <h3 className="text-lg font-bold mb-2">Course: {course}</h3>
                {Object.entries(schools).map(([school, items]) => (
                  <div key={school} className="mb-6">
                    <h4 className="text-base font-semibold mb-1">School: {school}</h4>
                    <GroupedReportTable items={items} reportsColumns={reportsColumns} TableComponent={TableComponent} />
                  </div>
                ))}
              </div>
            ))}

            <div className="text-sm mt-4">
              <p><strong>From August 2014 - Marking Dissertations:</strong> Moderation = 20% and External Examinations = 40%</p>
              <p><strong>From August 2014 - VIVA VOCES:</strong> Moderation = 20% and External Examinations = 20%</p>
            </div>
          </div>
        ) : (
          <div>
            <TableComponent table={currentTable} />
            
            <div className="flex justify-end mt-4 space-x-2">
              {['results-pending-approval', 'results-approved-at-centre', 'results-sent'].includes(activeTab) && (
                <Button 
                  onClick={handleExportSelected} 
                  disabled={Object.keys(rowSelection).length === 0}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Selected ({Object.keys(rowSelection).length})
                </Button>
              )}

              {activeTab === 'results-pending-approval' && (
                <Button onClick={handleBulkApprove} disabled={Object.keys(rowSelection).length === 0 || approveMultipleMutation.isPending}>
                  {approveMultipleMutation.isPending ? "Approving..." : "Approve Selected"}
                </Button>
              )}

              {activeTab === 'results-approved-at-centre' && (
                <Button onClick={handleBulkSendToSchool} disabled={Object.keys(rowSelection).length === 0 || sendToSchoolMultipleMutation.isPending}>
                  {sendToSchoolMultipleMutation.isPending ? "Sending..." : "Send Selected to School"}
                </Button>
              )}

              {activeTab === 'results-sent' && (
                <Button onClick={handleBulkSenateApprove} disabled={Object.keys(rowSelection).length === 0 || senateApproveMultipleMutation.isPending}>
                  {senateApproveMultipleMutation.isPending ? "Approving..." : "Mark as Senate Approved"}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <Dialog open={isDateDialogOpen} onOpenChange={setIsDateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{getDialogTitle()}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDateUpdate} className="grid gap-6 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium leading-none">
                Date
              </label>
              <input
                type="date"
                value={selectedDate || ''}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!selectedDate || 
                  updateResultsApprovalMutation.isPending || 
                  updateResultsSentMutation.isPending || 
                  updateSenateApprovalMutation.isPending}
              >
                {updateResultsApprovalMutation.isPending || 
                 updateResultsSentMutation.isPending || 
                 updateSenateApprovalMutation.isPending 
                  ? "Updating..." 
                  : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GradeManagementFinalSubmissionTable;