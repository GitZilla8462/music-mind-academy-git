// src/components/layout/ProfileMenu.jsx - Expected structure
import React from 'react';
import { ChevronDown, User, LogOut } from 'lucide-react';

const ProfileMenu = ({ 
  teacherName, 
  profileOpen, 
  toggleProfile, 
  handleLogout,
  isAuthenticated = true  // [OK] Add isAuthenticated prop
}) => {
  return (
    <div className="relative">
      {/* Profile Button */}
      <button
        onClick={toggleProfile}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
      >
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <User size={16} className="text-white" />
        </div>
        <span className="hidden md:block">
          {isAuthenticated ? teacherName : "Not Authenticated"}  {/* [OK] Use isAuthenticated */}
        </span>
        <ChevronDown size={16} />
      </button>

      {/* Dropdown Menu */}
      {profileOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
          <div className="py-1">
            {isAuthenticated ? (
              <>
                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                  Signed in as <strong>{teacherName}</strong>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <LogOut size={16} className="mr-2" />
                  Sign out
                </button>
              </>
            ) : (
              <div className="px-4 py-2 text-sm text-red-600">
                Not authenticated
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileMenu;