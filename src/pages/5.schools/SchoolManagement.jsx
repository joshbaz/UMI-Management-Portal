import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import SchoolSearch from './SchoolSearch';
import SchoolTable from './SchoolTable';
import SchoolTableTab from './SchoolTableTab';
import { SchoolTableControlPanel, ModifyTableDialog } from './SchoolTableControlPanel';
import { schoolData } from './SchoolData';
import { useGetAllSchools } from '../../store/tanstackStore/services/queries';
const SchoolManagement = () => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [isModifyTableOpen, setIsModifyTableOpen] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState('All Campuses');
  const [columnVisibility, setColumnVisibility] = useState({
    name: true,
    code: true,
    location: true,
    campus: true,
    url: true,
    actions: true
  });

  // Query to fetch all schools
  const { data: schools, isLoading, error } = useGetAllSchools();

  // Filter schools based on selected campus using useMemo
  const filteredSchools = useMemo(() => {
    if (!schools?.schools) return [];
    
    return schools.schools.filter(school => {
      if (selectedCampus === 'All Campuses') {
        return true;
      }
      return school.campus?.name === selectedCampus;
    });
  }, [selectedCampus, schools?.schools]);

  if (isLoading) {
    return <div className="p-6">Loading schools...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error loading schools: {error.message}</div>;
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
        <h1 className="text-2xl font-semibold text-gray-900">Schools</h1>
        <div className="text-sm text-gray-500">
          Last login: {format(new Date(), 'MM-dd-yyyy hh:mm:ssaa')}
        </div>
      </div>

      {/* Table Control Panel */}
      <SchoolTableControlPanel onModifyTable={() => setIsModifyTableOpen(true)} />

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
          {/* Campus Tabs */}
          <div className="px-6 pt-6">
            <SchoolTableTab
              selectedCampus={selectedCampus}
              setSelectedCampus={setSelectedCampus}
              schools={schools?.schools || []}
            />
          </div>

          {/* School Table */}
          <SchoolTable 
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            columnVisibility={columnVisibility}
            setColumnVisibility={setColumnVisibility}
            data={filteredSchools}
          />
        </div>
      </div>
    </div>
  );
};

export default SchoolManagement;
