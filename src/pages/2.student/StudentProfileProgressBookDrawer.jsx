import React, { useState, useCallback, memo, useMemo } from "react";
import { Icon } from "@iconify-icon/react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useParams } from "react-router-dom";
import { useGetStudentBooks } from "../../store/tanstackStore/services/queries";

const getCategoryStyle = (status) => {
    switch (status) {
      case 'PASSED':
        return 'text-[#15803D] bg-[#DCFCE7] border border-[#15803D] rounded-md px-2 py-1 text-xs font-medium';
      case 'FAILED':
        return 'text-[#DC2626] bg-[#FEE2E2] border border-[#DC2626] rounded-md px-2 py-1 text-xs font-medium';
      case 'NOT GRADED':
        return 'text-[#6B7280] bg-[#F3F4F6] border border-[#6B7280] rounded-md px-2 py-1 text-xs font-medium';
      default:
        return 'px-2 py-1';
    }
  };

const StudentProfileProgressBookDrawer = ({ isOpen, onClose, bookData }) => {
  let {id:studentId} = useParams();

  const { data: books } = useGetStudentBooks(studentId);

  const book = useMemo(() => {
    if (!bookData || !books?.books) return null;
    const foundBook = books.books.find(b => b.id === bookData?.id);
    return foundBook || bookData;
  }, [bookData, books]);

  return (
    <Sheet open={isOpen} onOpenChange={onClose} className="h-screen">
      <SheetContent side="right" className="min-w-[600px] min-h-screen overflow-hidden p-0 pb-20">
        <SheetHeader className="p-4 border-b">
          <div className="flex justify-between items-center z-50">
            <SheetTitle>Book Details</SheetTitle>
            <Button className="bg-primary-500 hover:bg-primary-800 text-white" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Close Window
            </Button>
          </div>
        </SheetHeader>

        <div className="overflow-y-scroll h-full min-h-[calc(100vh-100px)] p-6">
          {book ? (
            <div className="space-y-6">
              {/* Title */}
              <div>
                <Label className="text-sm font-[Inter-Regular] text-gray-500">Title</Label>
                <p className="text-gray-900 text-base font-[Inter-Regular]">{book.title}</p>
              </div>

              {/* Status */}
              <div className="flex flex-col gap-2 items-start">
                <Label className="text-sm font-[Inter-Regular] text-gray-500">Status</Label>
                {book.statuses?.length > 0 && (
                  <span
                    style={{
                      color: book.statuses[book.statuses.length - 1]?.definition?.color || "#000",
                      backgroundColor: `${book.statuses[book.statuses.length - 1]?.definition?.color}18` || "#00000018",
                      border: `1px solid ${book.statuses[book.statuses.length - 1]?.definition?.color || "#000"}`,
                    }}
                    className="px-2 py-1 rounded-md text-sm font-[Inter-Regular] capitalize inline-block"
                  >
                    {book.statuses[book.statuses.length - 1]?.definition?.name?.toLowerCase() || "Pending"}
                  </span>
                )}
              </div>

              {/* Dates and Submitted By */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-[Inter-Regular] text-gray-500">Submitted Date</Label>
                  <p className="text-gray-900 text-base font-[Inter-Regular]">
                    {book.submittedAt ? new Date(book.submittedAt).toLocaleDateString() : "-"}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-[Inter-Regular] text-gray-500">Submitted By</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 text-base font-[Inter-Regular]">{book.submittedBy?.name}</span>
                    {book.submittedBy && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Icon icon="tdesign:info-circle-filled" className="w-4 h-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>{book.submittedBy.email}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              </div>

              {/* Viva Date */}
              <div>
                <Label className="text-sm font-[Inter-Regular] text-gray-500">Viva Date</Label>
                <p className="text-gray-900 text-base font-[Inter-Regular]">
                  {book.vivaDate ? new Date(book.vivaDate).toLocaleDateString() : "-"}
                </p>
              </div>

              {/* Grade */}
              <div className="flex flex-col gap-2 w-max">
                <Label className="text-sm font-[Inter-Regular] text-gray-500">Grade</Label>
                <span className={getCategoryStyle(book.averageDefenseMark >= 60 ? 'PASSED' : book.averageDefenseMark ? 'FAILED' : 'NOT GRADED')}>
                  {book.averageDefenseMark >= 60 ? 'PASSED' : book.averageDefenseMark ? 'FAILED' : 'NOT GRADED'}
                </span>
              </div>

              {/* Internal Examiners */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm font-[Inter-Regular] text-gray-500">Internal Examiners</Label>
                </div>
                <div className="space-y-2">
                  {book.reviewers?.filter(r => r.type === 'internal')?.length > 0 ? (
                    book.reviewers.filter(r => r.type === 'internal').map((reviewer) => (
                      <div key={reviewer.id} className="flex items-center gap-2">
                        <span className="text-gray-900 text-base font-[Inter-Regular]">{reviewer.name}</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Icon icon="tdesign:info-circle-filled" className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>{reviewer.email}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic">No internal examiners assigned</p>
                  )}
                </div>
              </div>

              {/* External Examiners */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-sm font-[Inter-Regular] text-gray-500">External Examiners</Label>
                </div>
                <div className="space-y-2">
                  {book.reviewers?.filter(r => r.type === 'external')?.length > 0 ? (
                    book.reviewers.filter(r => r.type === 'external').map((reviewer) => (
                      <div key={reviewer.id} className="flex items-center gap-2">
                        <span className="text-gray-900 text-base font-[Inter-Regular]">{reviewer.name}</span>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Icon icon="tdesign:info-circle-filled" className="w-4 h-4 text-gray-400" />
                            </TooltipTrigger>
                            <TooltipContent>{reviewer.email}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm italic">No external examiners assigned</p>
                  )}
                </div>
              </div>

              {/* More Details Button */}
              <div className="mt-5 w-full flex justify-center mx-auto">
                <Button
                  variant="outline"
                  className="bg-primary-500 text-white hover:text-primary-500 hover:border-primary-500"
                >
                  View More Details
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">No book selected</div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default StudentProfileProgressBookDrawer;