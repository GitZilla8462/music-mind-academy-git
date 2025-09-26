// src/components/dashboard/admindashboard/OverviewTab.jsx
import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, School, Activity } from 'lucide-react';

const OverviewTab = ({ showToast }) => {
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalStudents: 0,
    totalSchools: 0,
    activeAssignments: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      setLoading(true);
      // Replace with actual API calls
      const mockStats = {
        totalTeachers: 45,
        totalStudents: 1203,
        totalSchools: 8,
        activeAssignments: 267
      };

      const mockActivity = [
        { id: 1, type: 'teacher_created', message: 'New teacher account created: Jane Smith', timestamp: '2 hours ago' },
        { id: 2, type: 'student_registered', message: '15 students registered for Music Theory 101', timestamp: '4 hours ago' },
        { id: 3, type: 'assignment_completed', message: 'Assignment "Vocal Exercises" completed by 23 students', timestamp: '6 hours ago' },
        { id: 4, type: 'school_added', message: 'New school added: Riverside Elementary', timestamp: '1 day ago' },
      ];

      setStats(mockStats);
      setRecentActivity(mockActivity);
    } catch (error) {
      console.error('Error fetching overview data:', error);
      showToast('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className="h-8 w-8" style={{ color }} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const getActivityIcon = (type) => {
      switch (type) {
        case 'teacher_created':
          return <GraduationCap className="h-5 w-5 text-blue-500" />;
        case 'student_registered':
          return <Users className="h-5 w-5 text-green-500" />;
        case 'assignment_completed':
          return <Activity className="h-5 w-5 text-purple-500" />;
        case 'school_added':
          return <School className="h-5 w-5 text-orange-500" />;
        default:
          return <Activity className="h-5 w-5 text-gray-500" />;
      }
    };

    return (
      <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
        <div className="flex-shrink-0 mt-1">
          {getActivityIcon(activity.type)}
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-900">{activity.message}</p>
          <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your administrative control panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={GraduationCap}
          title="Total Teachers"
          value={stats.totalTeachers}
          color="#3B82F6"
        />
        <StatCard 
          icon={Users}
          title="Total Students"
          value={stats.totalStudents}
          color="#10B981"
        />
        <StatCard 
          icon={School}
          title="Schools"
          value={stats.totalSchools}
          color="#F59E0B"
        />
        <StatCard 
          icon={Activity}
          title="Active Assignments"
          value={stats.activeAssignments}
          color="#8B5CF6"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
        </div>
        <div className="p-6">
          {recentActivity.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent activity</p>
          ) : (
            <div className="space-y-1">
              {recentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => showToast('Navigate to create teacher', 'info')}
            className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            <GraduationCap className="h-5 w-5 mr-2" />
            Create Teacher Account
          </button>
          <button 
            onClick={() => showToast('Navigate to create student', 'info')}
            className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
          >
            <Users className="h-5 w-5 mr-2" />
            Create Student Account
          </button>
          <button 
            onClick={() => showToast('Navigate to add school', 'info')}
            className="flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 transition-colors"
          >
            <School className="h-5 w-5 mr-2" />
            Add New School
          </button>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;