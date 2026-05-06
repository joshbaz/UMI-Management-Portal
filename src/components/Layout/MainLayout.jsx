// Import dependencies
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useGetLoggedInUserDetails } from '../../store/tanstackStore/services/queries';
import { useSocketUpdates } from '../../hooks/useSocketUpdates';

// Component: Main layout wrapper
const MainLayout = () => {
  const { data } = useGetLoggedInUserDetails();
  const isAuditor = data?.user?.role === 'AUDITOR';
  
  // Initialize socket connection and listeners
  useSocketUpdates();

  return (
    <div className="flex h-screen bg-table-header">
      <Sidebar />
      <main className="flex-1 overflow-auto flex flex-col">
        {isAuditor && (
          <div className="bg-red-100 border-b border-red-200 py-2 px-4 flex justify-center items-center sticky top-0 z-50 shadow-sm">
            <span className="text-red-600 font-bold text-sm uppercase tracking-wide">View only</span>
          </div>
        )}
        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
