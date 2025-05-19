import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    getFilteredRowModel,
    getPaginationRowModel,
} from '@tanstack/react-table';
import { Download, Eye, Loader2, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { useGetProposalDefenseReports } from "../../store/tanstackStore/services/queries";
import { downloadProposalDefenseReportService } from '../../store/tanstackStore/services/api.ts';
import { renderAsync } from 'docx-preview';
import { toast } from 'sonner';

const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'completed':
            return 'bg-green-100 text-green-800';
        case 'pending':
        case 'in progress':
            return 'bg-yellow-100 text-yellow-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
};

const PreviewModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                    <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                </div>

                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-[Inter-Medium]">{title}</h3>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="mt-2">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const previewDocx = async (fileData, container) => {
    try {
        const blob = new Blob([fileData], { 
            type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
        });
        
        // Clear previous content
        container.innerHTML = '';
        
        // Render the document
        await renderAsync(blob, container, null, {
            className: 'docx-preview',
            inWrapper: true,
            ignoreWidth: false,
            ignoreHeight: false,
            ignoreFonts: false,
            breakPages: true,
            useBase64URL: true,
            useMathMLPolyfill: true,
            renderEndnotes: true,
            renderFootnotes: true,
            renderFooters: true,
            renderHeaders: true,
        });
    } catch (error) {
        console.error('Error previewing document:', error);
        toast.error('Failed to preview document');
    }
};

const GradeProposalReportsTable = ({ 
    reports = [], 
    isLoading = false,
    onGenerateReportClick
}) => {
    const { id: proposalId } = useParams();
    const queryClient = useQueryClient();
    const [previewData, setPreviewData] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);

    const { data: proposalDefenseReports } = useGetProposalDefenseReports(proposalId);

    const downloadReportMutation = useMutation({
        mutationFn: async ({ reportId }) => {
            const response = await downloadProposalDefenseReportService(reportId);
            return {
                blob: response.data,
                filename: response.headers?.['content-disposition']?.match(/filename="(.+)"/)?.[1] || 'defense_report.docx'
            };
        },
        onSuccess: (data, variables) => {
            const { fileName } = variables;
            // Create a URL for the blob
            const url = window.URL.createObjectURL(data.blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName || data.filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url); // Clean up the URL object
            
            toast.success('Report downloaded successfully');
        },
        onError: (error) => {
            console.error('Error downloading report:', error);
            toast.error(error.message);
        },
    });

    const previewReportMutation = useMutation({
        mutationFn: async ({ reportId }) => {
            const response = await downloadProposalDefenseReportService(reportId);
            return {
                blob: response.data,
                filename: response.headers?.['content-disposition']?.match(/filename="(.+)"/)?.[1] || 'defense_report.docx'
            };
        },
        onError: (error) => {
            console.error('Error previewing report:', error);
            toast.error('Failed to preview report');
        },
    });

    const handleDownloadReport = (reportId, fileName) => {
        downloadReportMutation.mutate({ reportId, fileName });
    };

    const handlePreviewReport = async (reportId, fileName) => {
        setIsPreviewLoading(true);
        setIsPreviewOpen(true);
        
        try {
            const data = await previewReportMutation.mutateAsync({ reportId });
            setPreviewData({
                ...data,
                filename: fileName || data.filename
            });
            
            // Wait for the DOM to update
            setTimeout(() => {
                const container = document.getElementById('docx-preview');
                if (container) {
                    previewDocx(data.blob, container);
                }
            }, 100);
        } catch (error) {
            console.error('Error previewing report:', error);
            toast.error('Failed to preview report');
            setIsPreviewOpen(false);
        } finally {
            setIsPreviewLoading(false);
        }
    };

    // Define columns for TanStack Table
    const columns = useMemo(() => [
        {
            accessorKey: 'type',
            header: 'Report Type',
            cell: ({ row }) => <span>{row.original.type}</span>
        },
        {
            accessorKey: 'generatedAt',
            header: 'Generated Date',
            cell: ({ row }) => row.original.generatedAt ? 
                format(new Date(row.original.generatedAt), "dd-MMM-yyyy") : "N/A"
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => (
                <span className={`px-2 py-1 rounded-sm font-[Inter-Medium] text-xs ${getStatusColor(row.original.status)}`}>
                    {row.original.status}
                </span>
            )
        },
        {
            accessorKey: 'fileName',
            header: 'File Name',
            cell: ({ row }) => row.original.fileName || 'N/A'
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => (
                <div className="flex gap-2">
                    <button
                        onClick={() => handleDownloadReport(row.original.id, row.original.fileName)}
                        className="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white text-xs rounded hover:bg-primary-700 disabled:opacity-50"
                        disabled={downloadReportMutation.isLoading || !row.original.id}
                    >
                        {downloadReportMutation.isLoading ? (
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                            <Download className="w-3 h-3 mr-1" />
                        )}
                        {downloadReportMutation.isLoading ? 'Downloading...' : 'Download'}
                    </button>
                    <button
                        onClick={() => handlePreviewReport(row.original.id, row.original.fileName)}
                        className="inline-flex items-center px-3 py-1.5 bg-secondary-600/60 text-black text-xs rounded hover:bg-secondary-700"
                    >
                        <Eye className="w-3 h-3 mr-1" />
                        Preview
                    </button>
                </div>
            )
        }
    ], []);

    // Initialize TanStack Table
    const table = useReactTable({
        data: proposalDefenseReports?.defenseReports || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        initialState: {
            pagination: {
                pageSize: 5,
            },
        },
    });

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-[Inter-Medium]">Reports</h3>
                <button
                    className="inline-flex items-center text-sm font-[Inter-SemiBold] px-4 py-2 bg-primary-600 text-white rounded-[6px] gap-2 hover:bg-primary-700"
                    onClick={onGenerateReportClick}
                >
                    {/* <Download className="w-4 h-4" /> */}
                    Generate Defense Report
                </button>
            </div>

            {/* Reports Table using TanStack Table */}
            <div className="mt-4 rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th 
                                        key={header.id}
                                        className="px-4 py-2 text-left text-sm font-[Inter-Regular] text-gray-900"
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
                    <tbody className="divide-y divide-gray-200">
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-4 text-sm text-center">
                                    <Loader2 className="h-5 w-5 animate-spin mx-auto text-gray-400" />
                                </td>
                            </tr>
                        ) : table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map(row => (
                                <tr key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <td key={cell.id} className="px-4 py-2 text-sm font-[Inter-Regular]">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-4 text-sm font-[Inter-Regular] text-center text-gray-500">
                                    No reports available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
                
                {/* Pagination Controls */}
                {reports?.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t">
                        <div className="flex items-center gap-2">
                            <button
                                className="px-2 py-1 text-sm border rounded disabled:opacity-50"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                Previous
                            </button>
                            <button
                                className="px-2 py-1 text-sm border rounded disabled:opacity-50"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                Next
                            </button>
                        </div>
                        <span className="text-sm text-gray-700">
                            Page {table.getState().pagination.pageIndex + 1} of{' '}
                            {table.getPageCount()}
                        </span>
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            <PreviewModal
                isOpen={isPreviewOpen}
                onClose={() => {
                    setIsPreviewOpen(false);
                    setPreviewData(null);
                }}
                title={previewData?.filename || 'Document Preview'}
            >
                {isPreviewLoading ? (
                    <div className="flex items-center justify-center h-96">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                    </div>
                ) : (
                    <div 
                        id="docx-preview" 
                        className="border rounded p-4 bg-gray-50 min-h-[500px] max-h-[700px] overflow-y-auto"
                    />
                )}
            </PreviewModal>
        </div>
    );
};

export default React.memo(GradeProposalReportsTable);