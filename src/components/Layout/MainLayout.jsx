// Import dependencies
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

// Component: Main layout wrapper
const MainLayout = () => {
  return (
    <div className="flex h-screen bg-table-header">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
