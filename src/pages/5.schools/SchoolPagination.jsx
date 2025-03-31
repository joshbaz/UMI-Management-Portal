const SchoolPagination = ({ table }) => {
  return (
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
  );
};

export default SchoolPagination;
