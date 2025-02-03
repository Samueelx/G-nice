import React, { useState } from 'react';
import Sidebar from '@/components/common/Sidebar'; // Adjust import path as needed

interface AppLayoutProps {
  children: React.ReactElement; // Use React.ReactElement instead of React.ReactNode
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Pass setIsSidebarOpen to children
  const childrenWithProps = React.cloneElement(children, {
    setIsSidebarOpen,
  });

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="fixed h-screen z-50"> {/* Add fixed positioning */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          avatarUrl="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 ml-0 md:ml-64 transition-all duration-300">
        {childrenWithProps}
      </main>
    </div>
  );
};

export default AppLayout;