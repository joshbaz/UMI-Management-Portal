/* eslint-disable react/prop-types */
import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { HiX, HiMinusSm } from 'react-icons/hi';
import { IoFilterSharp } from 'react-icons/io5';
import { HiOutlineDocumentDuplicate } from 'react-icons/hi';
import { FiSearch } from 'react-icons/fi';
import { useGetAllFaculty } from '../../store/tanstackStore/services/queries';
import FacultyTable from './FacultyTable.jsx';
import FacultyTableTab from './FacultyTableTab';

// Utility Components
const SearchBar = ({ value, onChange, placeholder = "Search" }) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <FiSearch className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        placeholder={placeholder}
      />
    </div>
  );
};

// Main Component
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
        {/* Dialog Header */}
        <div
          className="flex justify-between items-center px-7 py-8 mt-8 mb-5 mx-7 border-b rounded border"
          style={{ height: "68px", gap: "8px" }}
        >
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

        {/* Dialog Content */}
        <div className="p-7 border rounded mb-9 mx-7">
          <div className="mb-4">
            <h3 className="text-base font-medium text-gray-900">
              Select Data Fields to Display
            </h3>
            <p className="text-sm text-gray-500">
              please select the fields in the table
            </p>
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
                  {isVisible && (
                    <HiMinusSm className="w-3 h-3 text-white font-bold" />
                  )}
                </button>
                <span className="ml-3 text-gray-700">
                  {columnId === "fullname"
                    ? "Fullname"
                    : columnId === "email"
                    ? "Email"
                    : columnId.charAt(0).toUpperCase() + columnId.slice(1)}
                </span>
              </div>
            ))}
          </div>
          {/* Dialog Footer */}
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

const FacultyManagement = () => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [isModifyTableOpen, setIsModifyTableOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState('All Staff');
  const [columnVisibility, setColumnVisibility] = useState({
    name: true,
    workEmail: true,
    schoolCode: true,
    facultyType: true,
    campus: true,
    actions: true
  });

  const { data: facultyData, isLoading, error } = useGetAllFaculty();

  const filteredData = useMemo(() => {
    if (!facultyData?.facultyMembers) return [];
    
    return facultyData?.facultyMembers?.filter(item => {
      if (selectedStaff === 'All Staff') return true;
      return item.facultyType === selectedStaff;
    });
  }, [facultyData?.facultyMembers, selectedStaff]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-semibold text-gray-600">Loading faculty data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg font-semibold text-red-600">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Global Search */}
      <div className="flex items-center justify-between py-6 px-6 pb-0 w-full h-[64px]">
        <p className="text-sm font-[Inter-Medium]  text-gray-900">Research Centre Portal</p>
        <p className="text-sm font-[Inter-Medium]  text-gray-600">Digital Research Information Management System</p>
      </div>

      {/* Horizontal Line */}
      <div className="my-6 border-t border-gray-200"></div>

      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">Manage Faculty & Supervisors</h1>
        <div className="text-sm text-gray-500">
          Last login: {format(new Date(), 'MM-dd-yyyy hh:mm:ssaa')}
        </div>
      </div>

      {/* Table Control Panel */}
      <div className="px-6 py-4 mb-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-medium text-gray-900">Table Control Panel</h2>
            <div className="flex items-center gap-4">
              <button className="inline-flex items-center px-4 py-2 bg-[#27357E] text-white rounded-lg text-sm font-medium hover:bg-[#1F2861]">
                Filter
                <IoFilterSharp className="ml-2" />
              </button>
              <button 
                onClick={() => setIsModifyTableOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-[#27357E] text-white rounded-lg text-sm font-medium hover:bg-[#1F2861]"
              >
                Modify Table
                <HiOutlineDocumentDuplicate className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modify Table Dialog */}
      <ModifyTableDialog
        isOpen={isModifyTableOpen}
        onClose={() => setIsModifyTableOpen(false)}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
      />

      {/* Table Container */}
      <div className="px-6 pb-6">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Tabs */}
          <FacultyTableTab 
            selectedStaff={selectedStaff}
            setSelectedStaff={setSelectedStaff}
            facultyData={facultyData?.facultyMembers}
          />

          {/* Faculty Table Component */}
          <FacultyTable 
            data={filteredData}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
          />
        </div>
      </div>
    </div>
  );
};

export default FacultyManagement;
