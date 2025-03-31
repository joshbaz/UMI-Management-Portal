const SchoolTablePageSize = ({ pageSize, setPageSize, setPageIndex }) => {
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPageIndex(0); // Reset to first page when changing page size
    localStorage.setItem('schoolTablePageSize', newSize.toString());
    localStorage.setItem('schoolTablePageIndex', '0');
  };

  return (
    <div className="flex items-center">
      <span className="text-sm text-gray-600 mr-2">Show:</span>
      <select
        value={pageSize}
        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
        className="border border-gray-300 rounded-lg px-2 py-1 text-sm"
      >
        {[5, 10, 20, 30, 40, 50].map(size => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SchoolTablePageSize;
