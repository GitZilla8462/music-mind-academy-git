import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';

const AssignmentsSubTab = ({ assignments, onDeleteAllAssignments }) => {
    const navigate = useNavigate();

    const handleEdit = (e, assignmentId) => {
        e.stopPropagation(); 
        navigate(`/teacher/assignments/edit/${assignmentId}`);
    };

    const handleDelete = (e, assignmentId) => {
        e.stopPropagation(); 
        if (window.confirm('Are you sure you want to delete this assignment?')) {
            console.log(`Deleting assignment with ID: ${assignmentId}`);
            // Call API to delete assignment
        }
    };
    
    const handleViewStudents = (assignmentId) => {
        navigate(`/teacher/assignments/${assignmentId}/submissions`);
    };

    // [OK] FIX: Removed the grouping logic entirely. The 'assignments' prop is already the correct, full list.
    const assignmentsToDisplay = assignments;

    return (
        <div>
            {assignmentsToDisplay.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                    <p>No assignments found. Click 'Create Assignment' to get started!</p>
                </div>
            ) : (
                <ul className="space-y-4">
                    {assignmentsToDisplay.map(assignment => {
                        const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;
                        const formattedDueDate = dueDate && !isNaN(dueDate.getTime()) 
                            ? format(dueDate, 'PPP') 
                            : 'No due date';

                        return (
                            <li key={assignment._id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <div 
                                  className="flex justify-between items-start cursor-pointer transition-colors duration-200 hover:bg-gray-50"
                                  onClick={() => handleViewStudents(assignment._id)}
                                >
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800">{assignment.title}</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Project: {assignment.project}
                                        </p>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Class: {assignment.class?.className || assignment.class}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Due: {formattedDueDate}
                                        </p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={(e) => handleEdit(e, assignment._id)}
                                            className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
                                            aria-label="Edit assignment"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDelete(e, assignment._id)}
                                            className="p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                                            aria-label="Delete assignment"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export default AssignmentsSubTab;