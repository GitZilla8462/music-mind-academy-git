// src/components/dashboard/teacherdashboard/ClassesAndAssignmentsTab.jsx

import React from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import AssignmentsSubTab from './AssignmentsSubTab';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'http://localhost:5000/api';

// A simple component to show the classes list
const ClassesSubTab = ({ classes, onManageClass }) => (
    <div className="space-y-4">
        {classes.length === 0 ? (
            <div className="text-gray-500 text-center py-8">
                <p>You have not created any classes yet.</p>
            </div>
        ) : (
            classes.map(cls => (
                <div 
                    key={cls._id} 
                    className="p-4 bg-white rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onManageClass(cls._id)}
                >
                    <h3 className="text-lg font-semibold text-gray-800">{cls.className}</h3>
                    <p className="text-sm text-gray-500">{cls.students.length} students</p>
                </div>
            ))
        )}
    </div>
);

const ClassesAndAssignmentsTab = ({ 
    assignments, 
    classes, 
    onCreateAssignment, 
    onManageClass, 
    onCreateClass,
    activeSubTab,
    onSubTabChange,
    showToast,
    refreshAssignments // [OK] NEW: Prop to refresh assignments
}) => {
    const { token } = useAuth();

    const handleDeleteAllAssignments = async () => {
        if (window.confirm('Are you sure you want to delete ALL assignments? This cannot be undone.')) {
            try {
                const response = await axios.delete(`${API_BASE_URL}/teachers/assignments/all`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                showToast(response.data.message, 'success');
                refreshAssignments(); // [OK] FIX: Call the refresh function here
            } catch (error) {
                console.error('Error deleting all assignments:', error);
                const errorMessage = error.response?.data?.error || 'Failed to delete all assignments. Please try again.';
                showToast(errorMessage, 'error');
            }
        }
    };

    const subTabs = [
        { name: 'classes', label: 'Classes' },
        { name: 'assignments', label: 'Assignments' },
    ];

    const renderSubTabContent = () => {
        switch(activeSubTab) {
            case 'classes':
                return <ClassesSubTab classes={classes} onManageClass={onManageClass} />;
            case 'assignments':
                return <AssignmentsSubTab assignments={assignments} onDeleteAllAssignments={handleDeleteAllAssignments} />;
            default:
                return <div>Select a sub-tab</div>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">My Classes & Assignments</h1>
                <div className="flex items-center space-x-4">
                    {activeSubTab === 'classes' && (
                        <button
                            onClick={onCreateClass}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 transition-colors"
                        >
                            <PlusCircle size={20} className="mr-2" />
                            Create Class
                        </button>
                    )}
                    {activeSubTab === 'assignments' && (
                        <div className="flex space-x-4">
                            <button
                                onClick={handleDeleteAllAssignments}
                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md shadow-sm hover:bg-red-700 transition-colors"
                            >
                                <Trash2 size={20} className="mr-2" />
                                Delete All
                            </button>
                            <button
                                onClick={onCreateAssignment}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition-colors"
                            >
                                <PlusCircle size={20} className="mr-2" />
                                Create Assignment
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {subTabs.map((tab) => (
                        <button
                            key={tab.name}
                            onClick={() => onSubTabChange(tab.name)}
                            className={`
                                whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm
                                ${activeSubTab === tab.name
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="mt-4">
                {renderSubTabContent()}
            </div>
        </div>
    );
};

export default ClassesAndAssignmentsTab;