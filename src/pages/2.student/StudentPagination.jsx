const StudentPagination = ({ totalItems, pageSize, currentPage, setCurrentPage }) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  // Handle Previous Button Click
  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Handle Next Button Click
  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      // If total pages is 5 or less, show all pages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage <= 3) {
        // If current page is near the start
        pages.push(2, 3, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        // If current page is near the end
        pages.push('...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        // If current page is in the middle
        pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="px-6 py-4 border-t bg-white shadow rounded-lg">
      <div className="flex items-center justify-between">
        {/* Showing X of Y Results */}
        <div className="text-sm text-gray-500">
          Showing {Math.min(pageSize, totalItems - (currentPage - 1) * pageSize)} of {totalItems} Results
        </div>

        {/* Pagination Buttons */}
        <div className="flex space-x-2">
          <button
            className={`px-3 py-1 border rounded text-sm ${currentPage === 1 ? "text-gray-400 cursor-not-allowed" : ""}`}
            onClick={handlePrevious}
            disabled={currentPage === 1}
          >
            Previous
          </button>

          {/* Page Numbers */}
          {getPageNumbers().map((pageNum, index) => (
            <button
              key={index}
              className={`px-3 py-1 rounded text-sm ${
                pageNum === '...' 
                  ? 'text-[#939495] cursor-default' 
                  : pageNum === currentPage
                    ? 'bg-[#ECF6FB] text-[#070B1D]'
                    : 'text-[#939495]'
              }`}
              onClick={() => pageNum !== '...' && setCurrentPage(pageNum)}
              disabled={pageNum === '...'}
            >
              {pageNum}
            </button>
          ))}

          <button
            className={`px-3 py-1 border rounded text-sm ${currentPage === totalPages ? "text-gray-400 cursor-not-allowed" : ""}`}
            onClick={handleNext}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentPagination;
