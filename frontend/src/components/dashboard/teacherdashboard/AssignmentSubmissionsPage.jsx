import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { format } from 'date-fns';
import { ArrowLeft, Save, Eye, CheckCircle, AlertCircle, Clock, XCircle } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const AssignmentSubmissionsPage = ({ showToast }) => {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [assignment, setAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedStudentIndex, setSelectedStudentIndex] = useState(0);
    const [localGrades, setLocalGrades] = useState({});
    const [localFeedback, setLocalFeedback] = useState({});
    const [saving, setSaving] = useState({});

    const fetchSubmissions = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${API_BASE_URL}/teachers/assignments/${assignmentId}/submissions`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setAssignment(response.data.assignment);
            setSubmissions(response.data.submissions);

            // Initialize local state
            const grades = {};
            const feedback = {};
            response.data.submissions.forEach(sub => {
                grades[sub._id] = sub.grade || '';
                feedback[sub._id] = sub.feedback || '';
            });
            setLocalGrades(grades);
            setLocalFeedback(feedback);

        } catch (err) {
            setError('Failed to fetch submissions. Please check the assignment ID and your connection.');
            console.error(err);
            if (showToast) showToast('Failed to load submissions.', 'error');
        } finally {
            setLoading(false);
        }
    }, [assignmentId, token, showToast]);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    const handleGradeChange = (submissionId, value) => {
        setLocalGrades(prev => ({
            ...prev,
            [submissionId]: value
        }));
    };

    const handleFeedbackChange = (submissionId, value) => {
        setLocalFeedback(prev => ({
            ...prev,
            [submissionId]: value
        }));
    };

    const handleSaveGrade = async (submissionId) => {
        try {
            setSaving(prev => ({ ...prev, [submissionId]: true }));
            
            const dataToSave = {
                grade: localGrades[submissionId],
                feedback: localFeedback[submissionId],
            };

            await axios.put(
                `${API_BASE_URL}/teachers/submissions/${submissionId}/grade`, 
                dataToSave,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update submissions state
            setSubmissions(prev => 
                prev.map(sub => 
                    sub._id === submissionId 
                        ? { ...sub, grade: dataToSave.grade, feedback: dataToSave.feedback, status: 'graded' }
                        : sub
                )
            );

            if (showToast) showToast('Grade saved successfully!', 'success');
        } catch (err) {
            console.error('Error saving grade:', err);
            if (showToast) showToast('Failed to save grade.', 'error');
        } finally {
            setSaving(prev => ({ ...prev, [submissionId]: false }));
        }
    };

    const handleQuickSave = async (submissionId, grade) => {
        handleGradeChange(submissionId, grade);
        setTimeout(() => handleSaveGrade(submissionId), 100); // Small delay to ensure state update
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'graded':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'submitted':
                return <AlertCircle className="w-4 h-4 text-blue-500" />;
            case 'in progress':
                return <Clock className="w-4 h-4 text-yellow-500" />;
            default:
                return <XCircle className="w-4 h-4 text-gray-400" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'graded':
                return 'bg-green-50 border-l-green-500 text-green-900';
            case 'submitted':
                return 'bg-blue-50 border-l-blue-500 text-blue-900';
            case 'in progress':
                return 'bg-yellow-50 border-l-yellow-500 text-yellow-900';
            default:
                return 'bg-gray-50 border-l-gray-300 text-gray-600';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-gray-500">Loading submissions...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="text-red-500 mb-4">{error}</div>
                    <button 
                        onClick={() => navigate(-1)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const currentSubmission = submissions[selectedStudentIndex];
    const formattedDueDate = assignment?.dueDate ? format(new Date(assignment.dueDate), 'PPP') : 'Not specified';

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={() => navigate(-1)} 
                            className="flex items-center text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft size={20} className="mr-2" />
                            Back
                        </button>
                        <div>
                            <h1 className="text-xl font-semibold text-gray-900">
                                {assignment?.title}
                            </h1>
                            <div className="text-sm text-gray-500 mt-1">
                                {assignment?.class?.className} • Due: {formattedDueDate} • {submissions.length} students
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Student List Sidebar */}
                <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                    <div className="p-4 border-b border-gray-200">
                        <h2 className="font-medium text-gray-900 mb-2">Students ({submissions.length})</h2>
                        <div className="text-xs text-gray-500">
                            Graded: {submissions.filter(s => s.status === 'graded').length} • 
                            Submitted: {submissions.filter(s => s.status === 'submitted').length} • 
                            Pending: {submissions.filter(s => s.status === 'not started' || s.status === 'in progress').length}
                        </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto">
                        {submissions.map((submission, index) => (
                            <div
                                key={submission._id}
                                className={`border-l-4 border-b border-gray-100 p-3 cursor-pointer transition-colors ${
                                    selectedStudentIndex === index 
                                        ? 'bg-blue-50 border-l-blue-500' 
                                        : getStatusColor(submission.status)
                                } hover:bg-gray-50`}
                                onClick={() => setSelectedStudentIndex(index)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        {getStatusIcon(submission.status)}
                                        <span className="font-medium text-sm text-gray-900">
                                            {submission.student?.name}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={localGrades[submission._id] || ''}
                                            onChange={(e) => handleGradeChange(submission._id, e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Grade"
                                        />
                                        <span className="text-xs text-gray-500">/ 100</span>
                                        
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSaveGrade(submission._id);
                                            }}
                                            disabled={saving[submission._id]}
                                            className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-50"
                                            title="Save Grade"
                                        >
                                            <Save size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col bg-white">
                    {currentSubmission ? (
                        <>
                            {/* Student Header */}
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {currentSubmission.student?.name}
                                        </h3>
                                        <div className="flex items-center space-x-2 mt-1">
                                            {getStatusIcon(currentSubmission.status)}
                                            <span className="text-sm text-gray-500 capitalize">
                                                {currentSubmission.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Student {selectedStudentIndex + 1} of {submissions.length}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 flex overflow-hidden">
                                {/* Student Work Viewer */}
                                <div className="flex-1 p-6">
                                    <div className="h-full">
                                        <div className="mb-4">
                                            <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
                                                <Eye className="w-4 h-4 mr-2" />
                                                Student Work
                                            </h4>
                                        </div>
                                        
                                        <div className="bg-gray-50 rounded-lg p-4 h-96 overflow-y-auto">
                                            {currentSubmission.studentWork ? (
                                                <div className="whitespace-pre-wrap text-gray-700">
                                                    {currentSubmission.studentWork}
                                                </div>
                                            ) : (
                                                <div className="text-center text-gray-500 py-12">
                                                    <div className="text-gray-300 mb-2">
                                                        <Eye size={48} className="mx-auto" />
                                                    </div>
                                                    <p>No work submitted yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Grading Panel */}
                                <div className="w-80 border-l border-gray-200 p-6 bg-gray-50">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Grade (0-100)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={localGrades[currentSubmission._id] || ''}
                                                onChange={(e) => handleGradeChange(currentSubmission._id, e.target.value)}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter grade"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Feedback
                                            </label>
                                            <textarea
                                                rows="6"
                                                value={localFeedback[currentSubmission._id] || ''}
                                                onChange={(e) => handleFeedbackChange(currentSubmission._id, e.target.value)}
                                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Enter feedback for the student..."
                                            />
                                        </div>

                                        <button
                                            onClick={() => handleSaveGrade(currentSubmission._id)}
                                            disabled={saving[currentSubmission._id]}
                                            className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {saving[currentSubmission._id] ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="w-4 h-4 mr-2" />
                                                    Save Grade & Feedback
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center text-gray-500">
                                <p>Select a student to view their submission</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssignmentSubmissionsPage;