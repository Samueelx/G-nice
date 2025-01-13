// AppLayout.tsx
import React, { useState } from 'react';
import Sidebar from '@/components/common/Sidebar'; // Adjust import path as needed

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
};

export default AppLayout;