import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { useGetAllProposals, useGetAllBooks } from "../../store/tanstackStore/services/queries";
import { Loader2, Search } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";
import GradeManagementTableTabs from "./GradeManagementTableTabs";

import GradeManagementBookTable from "./GradeManagementBookTable";
import GradeManagementProposalTable from "./GradeManagementProposalTable";

const GradeManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [pageSize, setPageSize] = useState(
    parseInt(localStorage.getItem("pageSize")) || 10
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("Proposal Grading");

  // Get all proposals
  const { data: proposalsData, isLoading, error } = useGetAllProposals();

  // Get all books
  const { data: booksData, isLoading: isLoadingBooks, error: errorBooks } = useGetAllBooks();

  // Filter data based on search
  const filteredProposals = useMemo(() => {
    return (proposalsData?.proposals || []).filter(
      (proposal) =>
        activeTab === "Proposal Grading" &&
        (proposal?.student?.firstName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
          proposal?.student?.lastName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          proposal?.student?.email
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()))
    );
  }, [proposalsData?.proposals, activeTab, searchTerm]);

  // Filter books data based on search
  const filteredBooks = useMemo(() => {
    return (booksData?.books || []).filter(
      (book) =>
        activeTab === "Book Examination" &&
        (book?.student?.firstName
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
          book?.student?.lastName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          book?.student?.email
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()))
    );
  }, [booksData?.books, activeTab, searchTerm]);

  // Pagination logic
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProposals = filteredProposals.slice(
    startIndex,
    startIndex + pageSize
  );
  const paginatedBooks = filteredBooks.slice(
    startIndex,
    startIndex + pageSize
  );

  // Reset pagination when switching tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Calculate stats from actual data based on active tab
  const totalProposals = proposalsData?.proposals?.length || 0;
  const totalBooks = booksData?.books?.length || 0;
  
  const passedProposals = useMemo(() => {
    return (proposalsData?.proposals || []).filter(proposal => {
      return proposal.statuses?.some(status => 
        status.definition?.name?.includes("passed-proposal graded")
      );
    }).length;
  }, [proposalsData?.proposals]);
  
  const failedProposals = useMemo(() => {
    return (proposalsData?.proposals || []).filter(proposal => {
      return proposal.statuses?.some(status => 
        status.definition?.name?.includes("failed-proposal graded")
      );
    }).length;
  }, [proposalsData?.proposals]);

  const passedBooks = useMemo(() => {
    return (booksData?.books || []).filter(book => {
      return book.statuses?.some(status =>
        status.definition?.name?.includes("passed-book graded")  
      );
    }).length;
  }, [booksData?.books]);

  const failedBooks = useMemo(() => {
    return (booksData?.books || []).filter(book => {
      return book.statuses?.some(status =>
        status.definition?.name?.includes("failed-book graded")
      );
    }).length;
  }, [booksData?.books]);

  if (isLoading || isLoadingBooks) {
    return (
      <div className="flex items-center justify-center h-screen gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-green-900" />
        <div className="text-lg font-[Inter-Medium] text-gray-600">
          {" "}
          Loading grading data...
        </div>
      </div>
    );
  }

  if (error || errorBooks) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-[Inter-Medium] text-red-600">
          Error: {error?.message || errorBooks?.message}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Top Search Bar */}
      <div className="flex px-6 justify-between items-center border-b border-gray-300 h-[89px]">
        {/* Search Bar */}
        <div className="relative w-1/2">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-semantic-text-secondary"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-semantic-surface text-sm font-[Inter-Regular]  border border-semantic-bg-border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-200"
          />
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center px-6 py-3">
        <h1 className="text-2xl font-[Inter-Medium]">Grading Records</h1>
        <span className="text-sm font-[Inter-Regular] text-gray-500">
          Last login: {format(new Date(), "MM-dd-yyyy hh:mm:ssaa")}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 px-6">
        <div className="bg-white flex flex-col gap-2 items-center justify-center p-4 rounded-lg shadow-md">
          <p className=" text-3xl font-[Inter-Medium]">
            {activeTab === "Proposal Grading" ? totalProposals : totalBooks}
          </p>
          <h3 className="text-sm font-[Inter-Medium] text-gray-500">
            {activeTab === "Proposal Grading" ? "Proposals Submitted" : "Books Submitted"}
          </h3>
        </div>

        <div className="bg-white flex flex-col gap-2 items-center justify-center p-4 rounded-lg shadow-md">
          <p className="mt-2 text-3xl font-[Inter-Medium]">
            {activeTab === "Proposal Grading" ? passedProposals : passedBooks}
          </p>
          <h3 className="text-sm font-[Inter-Medium] text-gray-500">
            <div className="flex items-center gap-1">
              Status: {activeTab === "Proposal Grading" ? "Proposal" : "Book"} Graded - Passed
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{activeTab === "Proposal Grading" ? "Proposal" : "Book"} Graded - Passed</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </h3>
        </div>

        <div className="bg-white flex flex-col gap-2 items-center justify-center p-4 rounded-lg shadow-md">
          <p className="mt-2 text-3xl font-[Inter-Medium]">
            {activeTab === "Proposal Grading" ? failedProposals : failedBooks}
          </p>
          <h3 className="text-sm font-[Inter-Medium] text-gray-500">
            <div className="flex items-center gap-1">
              Status: {activeTab === "Proposal Grading" ? "Proposal" : "Book"} Graded - Failed
              <TooltipProvider className="z-[9999] h-full">
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{activeTab === "Proposal Grading" ? "Proposal" : "Book"} Graded - Failed</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </h3>
        </div>
      </div>

      {/* Tab, Search, Table and Pagination */}
      <div className="bg-white py-4 rounded-lg shadow-md mx-6 mb-8">
        <GradeManagementTableTabs
          selectedCategory={activeTab}
          setSelectedCategory={setActiveTab}
        />

        <div className="px-4 mt-4">
          {activeTab === "Proposal Grading" ? (
            <GradeManagementProposalTable 
              data={paginatedProposals}
              pageSize={pageSize}
              setPageSize={setPageSize}
              currentPage={currentPage} 
              setCurrentPage={setCurrentPage}
              totalCount={filteredProposals.length}
            />
          ) : activeTab === "Book Examination" ? (
            <GradeManagementBookTable 
              data={paginatedBooks}
              pageSize={pageSize}
              setPageSize={setPageSize}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalCount={filteredBooks.length}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default GradeManagement;
