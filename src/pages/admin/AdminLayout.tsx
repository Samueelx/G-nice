import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Calendar, Smile } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming this exists for tailwind classes

const AdminLayout: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center space-x-3 text-indigo-600">
          <LayoutDashboard className="h-6 w-6" />
          <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavLink
            to="/admin/jokes"
            className={({ isActive }) =>
              cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )
            }
          >
            <Smile className="h-5 w-5" />
            <span>Jokes</span>
          </NavLink>
          
          <NavLink
            to="/admin/events"
            className={({ isActive }) =>
              cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-700 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )
            }
          >
            <Calendar className="h-5 w-5" />
            <span>Events</span>
          </NavLink>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
