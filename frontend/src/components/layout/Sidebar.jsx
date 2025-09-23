import React from 'react';
import { 
  Book, 
  Users, 
  LogOut, 
  Shield, 
  FolderOpen, 
  Home, 
  GraduationCap, 
  School, 
  Settings,
  Plus,
  LayoutDashboard
} from 'lucide-react';

const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  sidebarOpen, 
  setSidebarOpen, 
  handleLogout, 
  userType = 'teacher' 
}) => {
  
  const getNavigationItems = (userType) => {
    if (userType === 'admin') {
      return [
        { id: 'overview', name: 'Overview', icon: Home, section: 'main' },
        { id: 'teachers', name: 'Teachers', icon: GraduationCap, section: 'main' },
        { id: 'students', name: 'Students', icon: Users, section: 'main' },
        { id: 'schools', name: 'Schools', icon: School, section: 'main' },
        { id: 'settings', name: 'Settings', icon: Settings, section: 'settings' }
      ];
    }
    
    return [
      { id: 'teacherDashboard', name: 'Teacher Dashboard', icon: LayoutDashboard, section: 'main' },
      { id: 'createClass', name: 'Create Class', icon: Plus, section: 'main' },
      { id: 'compliance', name: 'ED Law 2D Compliance', icon: Shield, section: 'settings' }
    ];
  };

  const getPortalLabel = (userType) => {
    if (userType === 'admin') return 'ADMIN PORTAL';
    if (userType === 'student') return 'STUDENT PORTAL';
    return 'TEACHER PORTAL';
  };

  const navigationItems = getNavigationItems(userType);
  const mainItems = navigationItems.filter(item => item.section === 'main');
  const settingsItems = navigationItems.filter(item => item.section === 'settings');

  const handleItemClick = (tabId) => {
    setActiveTab(tabId);
    setSidebarOpen(false);
  };

  const renderNavButton = (item) => (
    <button
      key={item.id}
      className={`w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium mb-2 transition-all duration-200 ${
        activeTab === item.id 
          ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700' 
          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
      }`}
      onClick={() => handleItemClick(item.id)}
    >
      <item.icon className="mr-3" size={20} />
      {item.name}
    </button>
  );

  return (
    <div 
      className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed top-0 left-0 h-full w-64 bg-white shadow-xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out z-30 lg:translate-x-0 lg:static lg:z-0`}
    >
      {/* Header with Music Mind Academy Branding */}
      <div className="p-6 flex flex-col border-b border-gray-200 bg-white">
        <div>
          <div className="text-2xl font-bold text-gray-800" style={{fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em'}}>
            Music Mind
          </div>
          <div className="text-xl font-light text-blue-500" style={{fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.1em', marginTop: '-4px'}}>
            ACADEMY
          </div>
          <div className="text-sm font-light text-gray-500 mt-2" style={{fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.05em'}}>
            {getPortalLabel(userType)}
          </div>
        </div>
      </div>
      
      <nav className="mt-6 bg-white">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
            {userType === 'admin' ? 'Management' : 'Navigation'}
          </h2>
        </div>
        
        <div className="px-3 py-2">
          {mainItems.map(renderNavButton)}
        </div>
        
        {settingsItems.length > 0 && (
          <div className="mt-6">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
                Settings
              </h2>
            </div>
            <div className="px-3 py-2">
              {settingsItems.map(renderNavButton)}
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div className="mt-auto px-3 py-4 border-t border-gray-100">
          <button
            className="w-full flex items-center px-3 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-700 transition-all duration-200"
            onClick={handleLogout}
          >
            <LogOut className="mr-3" size={20} />
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;