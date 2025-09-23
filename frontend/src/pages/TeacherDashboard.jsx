import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, BookOpen, BarChart3, Plus, Calendar, ExternalLink, Trash2, Edit, Menu, X } from 'lucide-react';
import { format } from 'date-fns';
import Sidebar from '../components/layout/Sidebar';
import CreateClassTab from '../components/dashboard/teacherdashboard/CreateClassTab';

const API_BASE_URL = 'http://localhost:5000/api';

const TeacherDashboard = ({ showToast }) => {
    const navigate = useNavigate();
    const { token, logout } = useAuth();
    
    const [sidebarTab, setSidebarTab] = useState('teacherDashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('classes');
    const [classes, setClasses] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClassId, setSelectedClassId] = useState('');

    const handleLogout = () => {
        logout();
    };

    const fetchClasses = useCallback(async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/teachers/classes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setClasses(response.data);
            if (response.data.length > 0 && !selectedClassId) {
                setSelectedClassId(response.data[0]._id);
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
            if (showToast) showToast('Failed to load classes.', 'error');
        }
    }, [token, selectedClassId, showToast]);

    const fetchAssignments = useCallback(async () => {
        if (!selectedClassId) return;
        
        try {
            const response = await axios.get(`${API_BASE_URL}/teachers/assignments/${selectedClassId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAssignments(response.data);
        } catch (error) {
            console.error('Error fetching assignments:', error);
            if (showToast) showToast('Failed to load assignments.', 'error');
        }
    }, [selectedClassId, token, showToast]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchClasses();
            if (activeTab === 'assignments' || activeTab === 'grades') {
                await fetchAssignments();
            }
            setLoading(false);
        };
        
        loadData();
    }, [fetchClasses, fetchAssignments, activeTab]);

    const handleDeleteClass = async (classId) => {
        if (!window.confirm('Are you sure you want to delete this class? This will also delete all students and assignments.')) {
            return;
        }

        try {
            await axios.delete(`${API_BASE_URL}/teachers/classes/${classId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setClasses(prev => prev.filter(cls => cls._id !== classId));
            if (selectedClassId === classId) {
                const remainingClasses = classes.filter(cls => cls._id !== classId);
                setSelectedClassId(remainingClasses.length > 0 ? remainingClasses[0]._id : '');
            }
            
            if (showToast) showToast('Class deleted successfully.', 'success');
        } catch (error) {
            console.error('Error deleting class:', error);
            if (showToast) showToast('Failed to delete class.', 'error');
        }
    };

    const handleDeleteAssignment = async (assignmentId) => {
        if (!window.confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
            return;
        }

        try {
            await axios.delete(`${API_BASE_URL}/teachers/assignments/${assignmentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setAssignments(prev => prev.filter(assignment => assignment._id !== assignmentId));
            if (showToast) showToast('Assignment deleted successfully.', 'success');
        } catch (error) {
            console.error('Error deleting assignment:', error);
            if (showToast) showToast('Failed to delete assignment.', 'error');
        }
    };

    const handleViewSubmissions = (assignmentId) => {
        navigate(`/teacher/assignments/${assignmentId}/submissions`);
    };

    const tabs = [
        { id: 'classes', label: 'Classes', icon: Users },
        { id: 'assignments', label: 'Assignments', icon: BookOpen },
        { id: 'grades', label: 'Grades', icon: BarChart3 }
    ];

    const renderDashboardContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center h-64">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading...</span>
                </div>
            );
        }

        return (
            <div className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
                    <p className="text-gray-600 mt-1">Manage your classes, assignments, and grades</p>
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            activeTab === tab.id
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        <Icon size={16} className="mr-2" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Classes Tab */}
                {activeTab === 'classes' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-900">Your Classes</h2>
                            <button
                                onClick={() => setSidebarTab('createClass')}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus size={16} className="mr-2" />
                                Create Class
                            </button>
                        </div>

                        {classes.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <Users size={48} className="mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No classes yet</h3>
                                <p className="text-gray-500 mb-4">Create your first class to get started</p>
                                <button
                                    onClick={() => setSidebarTab('createClass')}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    <Plus size={16} className="mr-2" />
                                    Create Class
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {classes.map((classItem) => (
                                    <div key={classItem._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900">{classItem.className}</h3>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => navigate(`/teacher/class/${classItem._id}`)}
                                                    className="text-gray-400 hover:text-blue-600"
                                                    title="Manage Class"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClass(classItem._id)}
                                                    className="text-gray-400 hover:text-red-600"
                                                    title="Delete Class"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2 text-sm text-gray-600">
                                            <div className="flex items-center">
                                                <Users size={16} className="mr-2" />
                                                <span>{classItem.students?.length || 0} students</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Assignments Tab */}
                {activeTab === 'assignments' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <h2 className="text-lg font-semibold text-gray-900">Assignments</h2>
                                {classes.length > 1 && (
                                    <select
                                        value={selectedClassId}
                                        onChange={(e) => setSelectedClassId(e.target.value)}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                                    >
                                        {classes.map(cls => (
                                            <option key={cls._id} value={cls._id}>
                                                {cls.className}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <button
                                onClick={() => navigate('/teacher/projects')}
                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Plus size={16} className="mr-2" />
                                Create Assignment
                            </button>
                        </div>

                        {assignments.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
                                <p className="text-gray-500 mb-4">Create your first assignment for this class</p>
                                <button
                                    onClick={() => navigate('/teacher/projects')}
                                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    <Plus size={16} className="mr-2" />
                                    Create Assignment
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {assignments.map((assignment) => (
                                    <div key={assignment._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                    {assignment.title}
                                                </h3>
                                                <p className="text-gray-600 mb-3">{assignment.description}</p>
                                                
                                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                    <div className="flex items-center">
                                                        <BookOpen size={16} className="mr-1" />
                                                        <span>{assignment.project}</span>
                                                    </div>
                                                    {assignment.dueDate && (
                                                        <div className="flex items-center">
                                                            <Calendar size={16} className="mr-1" />
                                                            <span>Due: {format(new Date(assignment.dueDate), 'MMM d, yyyy')}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => navigate(`/teacher/assignments/edit/${assignment._id}`)}
                                                    className="flex items-center px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                    title="Edit Assignment"
                                                >
                                                    <Edit size={16} className="mr-1" />
                                                    Edit
                                                </button>
                                                
                                                <button
                                                    onClick={() => handleViewSubmissions(assignment._id)}
                                                    className="flex items-center px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <ExternalLink size={16} className="mr-2" />
                                                    View Submissions
                                                </button>
                                                
                                                <button
                                                    onClick={() => handleDeleteAssignment(assignment._id)}
                                                    className="flex items-center px-3 py-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                    title="Delete Assignment"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Grades Tab */}
                {activeTab === 'grades' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-4">
                                <h2 className="text-lg font-semibold text-gray-900">Grades</h2>
                                {classes.length > 1 && (
                                    <select
                                        value={selectedClassId}
                                        onChange={(e) => setSelectedClassId(e.target.value)}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                                    >
                                        {classes.map(cls => (
                                            <option key={cls._id} value={cls._id}>
                                                {cls.className}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>

                        {assignments.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments to grade</h3>
                                <p className="text-gray-500 mb-4">Create assignments to start grading student work</p>
                                <button
                                    onClick={() => navigate('/teacher/projects')}
                                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    <Plus size={16} className="mr-2" />
                                    Create Assignment
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {classes.find(c => c._id === selectedClassId)?.className || 'Select a class'}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Click on any assignment to view and grade student submissions
                                    </p>
                                </div>
                                
                                <div className="divide-y divide-gray-200">
                                    {assignments.map((assignment) => (
                                        <div 
                                            key={assignment._id} 
                                            onClick={() => handleViewSubmissions(assignment._id)}
                                            className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <h4 className="font-medium text-gray-900 mb-1">
                                                        {assignment.title}
                                                    </h4>
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <span>{assignment.project}</span>
                                                        {assignment.dueDate && (
                                                            <span>Due: {format(new Date(assignment.dueDate), 'MMM d')}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <ExternalLink size={16} className="mr-2" />
                                                    Grade Submissions
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    };

    const renderCreateClass = () => {
        return (
            <CreateClassTab 
                showToast={showToast} 
                onClassCreated={() => {
                    fetchClasses();
                    setSidebarTab('teacherDashboard');
                }}
                setActiveTab={() => setSidebarTab('teacherDashboard')}
            />
        );
    };

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <Sidebar 
                activeTab={sidebarTab}
                setActiveTab={setSidebarTab}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                handleLogout={handleLogout}
                userType="teacher"
            />
            
            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                        
                        <div className="flex items-center space-x-4">
                            <div className="lg:hidden">
                                <div className="text-xl font-bold text-gray-800" style={{fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em'}}>
                                    Music Mind
                                </div>
                                <div className="text-lg font-light text-blue-500" style={{fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '0.1em', marginTop: '-2px'}}>
                                    ACADEMY
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Header actions can go here */}
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto">
                    {sidebarTab === 'teacherDashboard' && renderDashboardContent()}
                    {sidebarTab === 'createClass' && renderCreateClass()}
                </main>
            </div>
        </div>
    );
};

export default TeacherDashboard;