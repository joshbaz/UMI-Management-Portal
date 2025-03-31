import { IoFilterSharp } from 'react-icons/io5';
import { HiOutlineDocumentDuplicate, HiX, HiMinusSm } from 'react-icons/hi';

const ModifyTableDialog = ({ isOpen, onClose, columnVisibility, setColumnVisibility }) => {
  if (!isOpen) return null;

  const handleToggleColumn = (columnId) => {
    setColumnVisibility(prev => ({
      ...prev,
      [columnId]: !prev[columnId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl" style={{ width: "670px" }}>
        <div className="flex justify-between items-center px-7 py-8 mt-8 mb-5 mx-7 border-b rounded border">
          <h2 className="text-lg font-semibold text-gray-900">Modify Table</h2>
          <button
            onClick={onClose}
            className="bg-primary-500 text-white rounded-lg hover:bg-primary-800 flex items-center justify-center whitespace-nowrap text-sm"
            style={{ width: "148px", height: "36px", gap: "8px" }}
          >
            <HiX className="w-4 h-4 flex-shrink-0" />
            <span className="flex-shrink-0">Close Window</span>
          </button>
        </div>

        <div className="p-7 border rounded mb-9 mx-7">
          <div className="mb-4">
            <h3 className="text-base font-medium text-gray-900">Select Data Fields to Display</h3>
            <p className="text-sm text-gray-500">please select the fields in the table</p>
          </div>

          <div className="space-y-3">
            {Object.entries(columnVisibility).map(([columnId, isVisible]) => (
              <div key={columnId} className="flex items-center">
                <button
                  onClick={() => handleToggleColumn(columnId)}
                  className={`flex items-center justify-center w-4 h-4 rounded p-[2.5px] ${
                    isVisible ? "bg-accent2-600" : "bg-gray-200"
                  }`}
                >
                  {isVisible && <HiMinusSm className="w-3 h-3 text-white font-bold" />}
                </button>
                <span className="ml-3 text-gray-700">
                  {columnId.charAt(0).toUpperCase() + columnId.slice(1)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full bg-primary-500 text-white py-2 px-4 rounded-lg hover:bg-primary-900"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SchoolTableControlPanel = ({ onModifyTable }) => {
  return (
    <div className="px-6 py-4 mb-4">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center">
          <h2 className="text-base font-medium text-gray-900">Table Control Panel</h2>
          <div className="flex items-center gap-4">
            {/* <button className="inline-flex items-center px-4 py-2 bg-[#27357E] text-white rounded-lg text-sm font-medium hover:bg-[#1F2861]">
              Filter
              <IoFilterSharp className="ml-2" />
            </button> */}
            <button 
              onClick={onModifyTable}
              className="inline-flex items-center px-4 py-2 bg-[#27357E] text-white rounded-lg text-sm font-medium hover:bg-[#1F2861]"
            >
              Modify Table
              <HiOutlineDocumentDuplicate className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { SchoolTableControlPanel, ModifyTableDialog };
