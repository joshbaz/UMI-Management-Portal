const SPageSize = ({ pageSize, setPageSize }) => {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">Show:</span>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="px-2 py-1 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          {[5, 10, 15, 20, 25].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    );
  };
  
  export default SPageSize;
  