// src/pages/AdminDashboard.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import TeachersTab from '../components/dashboard/admindashboard/TeachersTab';
import StudentsTab from '../components/dashboard/admindashboard/StudentsTab';
import OverviewTab from '../components/dashboard/admindashboard/OverviewTab';
import SchoolsTab from '../components/dashboard/admindashboard/SchoolsTab';
import SettingsTab from '../components/dashboard/admindashboard/SettingsTab';
import ToastNotification from '../components/layout/ToastNotification';

const AdminDashboard = ({ showToast }) => {
  // Use the centralized authentication state from AuthContext
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  // Tab state
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem('adminActiveTab') || 'overview';
  });

  // Save tab selection to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('adminActiveTab', activeTab);
  }, [activeTab]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // This can be left as a separate loading state
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Admin data
  const adminName = user?.name || "Administrator";
  const notifications = [
    { id: 1, message: '3 new teacher registration requests', type: 'info' },
    { id: 2, message: 'System backup completed successfully', type: 'success' },
    { id: 3, message: '15 new student accounts created today', type: 'info' }
  ];

  // Helper functions
  const showToastLocal = showToast || useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Use the logout function from AuthContext to handle all logout logic
  const handleLogout = useCallback(() => {
    logout();
    showToastLocal('Logged out successfully', 'success');
  }, [logout, showToastLocal]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const toggleProfile = useCallback(() => {
    setProfileOpen(prev => !prev);
  }, []);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Render tab content
  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview':
        return <OverviewTab showToast={showToastLocal} />;
      case 'teachers':
        return <TeachersTab showToast={showToastLocal} />;
      case 'students':
        return <StudentsTab showToast={showToastLocal} />;
      case 'schools':
        return <SchoolsTab showToast={showToastLocal} />;
      case 'settings':
        return <SettingsTab showToast={showToastLocal} />;
      default:
        return <OverviewTab showToast={showToastLocal} />;
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      
      <Sidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleLogout={handleLogout}
        isAuthenticated={isAuthenticated}
        userType="admin"
      />
      
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <Topbar 
          activeTab={activeTab}
          toggleSidebar={toggleSidebar}
          teacherName={adminName}
          notifications={notifications}
          profileOpen={profileOpen}
          toggleProfile={toggleProfile}
          handleLogout={handleLogout}
          isAuthenticated={isAuthenticated}
          userType="admin"
        />
        
        <div className="flex-1 overflow-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                  <div className="flex">
                    <div>
                      <p className="font-bold">Error</p>
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              )}
              {renderTabContent()}
            </>
          )}
        </div>
      </div>
      {(toast || showToast) && <ToastNotification toast={toast} setToast={setToast} />}
    </div>
  );
};

export default AdminDashboard;