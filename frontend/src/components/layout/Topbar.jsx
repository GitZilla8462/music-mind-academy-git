// src/components/layout/Topbar.jsx

import React from 'react';
import { Bell } from 'lucide-react';
import ProfileMenu from './ProfileMenu';

const Topbar = ({ 
  activeTab, 
  toggleSidebar, 
  teacherName, // This prop is now dynamic
  notifications, 
  profileOpen, 
  toggleProfile, 
  handleLogout,
  isAuthenticated = true
}) => {
  return (
    <div className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      {/* Mobile Menu Button */}
      <button 
        className="lg:hidden"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      {/* Page Title */}
      <div className="lg:ml-64 font-semibold text-gray-700">
        {activeTab === 'projects' && 'Projects'}
        {activeTab === 'assignments' && 'Assignments'}
        {activeTab === 'classes' && 'Classes'}
        {activeTab === 'createClass' && 'Create a Class'}
        {activeTab === 'compliance' && 'ED Law 2D Compliance'}
      </div>
      
      <div className="flex items-center">
        {/* Notifications */}
        <div className="relative mr-4">
          <Bell size={20} className="text-gray-600 cursor-pointer" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              {notifications.length}
            </span>
          )}
        </div>
        
        {/* Profile */}
        <ProfileMenu 
          teacherName={teacherName} // The name will now come from the `TeacherDashboard` component
          profileOpen={profileOpen}
          toggleProfile={toggleProfile}
          handleLogout={handleLogout}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </div>
  );
};

export default Topbar;