import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import SchoolSearch from './SchoolSearch';
import SchoolTable from './SchoolTable';
import SchoolTableTab from './SchoolTableTab';
import { SchoolTableControlPanel, ModifyTableDialog, UsageReportModal } from './SchoolTableControlPanel';
import { schoolData } from './SchoolData';
import { useGetAllSchools } from '../../store/tanstackStore/services/queries';
import { getAllActivitiesService } from '../../store/tanstackStore/services/api';
const SchoolManagement = () => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [isModifyTableOpen, setIsModifyTableOpen] = useState(false);
  const [isUsageReportOpen, setIsUsageReportOpen] = useState(false);
  const [auditData, setAuditData] = useState([]);
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
      <SchoolTableControlPanel 
        onModifyTable={() => setIsModifyTableOpen(true)} 
        onGenerateReport={async () => {
          try {
            const activitiesData = await getAllActivitiesService();
            if (!activitiesData || !activitiesData.activities || activitiesData.activities.length === 0) {
              toast.error('No audit logs available to generate report');
              return;
            }

            const schoolActivities = activitiesData.activities.filter(a => a.entityType?.toLowerCase() === 'school');
            const dataToExport = schoolActivities.length > 0 ? schoolActivities : activitiesData.activities;

            const formattedData = dataToExport.map(activity => {
              let browserAgent = activity.browserAgent || 'Web Browser';
              try {
                if (activity.details && activity.details.startsWith('{')) {
                  const parsed = JSON.parse(activity.details);
                  if (parsed.browserAgent) browserAgent = parsed.browserAgent;
                  if (parsed.userAgent) browserAgent = parsed.userAgent;
                }
              } catch (e) {}

              return {
                user: activity.user?.name || 'Unknown User',
                role: activity.user?.role || 'N/A',
                action: activity.action,
                date: format(new Date(activity.timestamp), 'yyyy-MM-dd HH:mm:ss'),
                browserAgent,
                ipAddress: activity.ipAddress || 'Unknown',
                deviceId: activity.deviceId || 'Unknown',
                details: activity.details || null,
              };
            });

            setAuditData(formattedData);
            setIsUsageReportOpen(true);
          } catch (error) {
            toast.error('Failed to fetch audit logs');
            console.error(error);
          }
        }}
      />

      {/* Modify Table Dialog */}
      <ModifyTableDialog
        isOpen={isModifyTableOpen}
        onClose={() => setIsModifyTableOpen(false)}
        columnVisibility={columnVisibility}
        setColumnVisibility={setColumnVisibility}
      />

      {/* Usage Report Modal */}
      <UsageReportModal
        isOpen={isUsageReportOpen}
        onClose={() => setIsUsageReportOpen(false)}
        auditData={auditData}
        onDownloadCsv={() => {
          if (!auditData || auditData.length === 0) return;
          
          const headers = ['User', 'Role', 'Action', 'Date', 'Browser Agent', 'IP Address', 'Device ID'];
          const csvContent = [
            headers.join(','),
            ...auditData.map(row => 
              [row.user, row.role, row.action, row.date, row.browserAgent, row.ipAddress, row.deviceId]
                .map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`)
                .join(',')
            )
          ].join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', `UMI_School_Management_Audits_${format(new Date(), 'yyyy-MM-dd')}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          toast.success('Audit usage report downloaded successfully');
        }}
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
