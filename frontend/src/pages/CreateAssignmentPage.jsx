import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ClassSelect from '../components/ClassSelect';
import ProjectSelectionCard from '../components/ProjectSelectionCard';
import { PlusCircle, ArrowLeft } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const availableActivities = [
  {
    projectId: 'film-music-score',
    projectTitle: 'Film Music Score',
    projectType: 'project',
    description: 'Students compose music for a short film clip using a loop library and a video player.',
    demoUrl: '/teacher/projects/film-music-score-demo',
  },
  {
    projectId: 'solfege-id',
    projectTitle: 'Solfege Identification',
    projectType: 'exercise',
    description: 'Students practice identifying solfege pitches by listening to and naming musical intervals.',
    demoUrl: '/exercises/solfege-id-demo',
  },
];

const CreateAssignmentPage = ({ onAssignmentCreated, showToast }) => {
    const navigate = useNavigate();
    const { token } = useAuth();
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedProject, setSelectedProject] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!title || !selectedClass || !selectedProject) {
            showToast('Please fill in all required fields.', 'error');
            setIsSubmitting(false);
            return;
        }

        try {
            const assignmentData = {
                title,
                description,
                dueDate,
                classId: selectedClass,
                project: {
                    projectId: selectedProject.projectId,
                    projectTitle: selectedProject.projectTitle,
                    projectType: selectedProject.projectType,
                }
            };
            
            await axios.post(`${API_BASE_URL}/teachers/assignments/create`, assignmentData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            showToast('Assignment created successfully!', 'success');
            onAssignmentCreated();

        } catch (error) {
            console.error('Error creating assignment:', error);
            const errorMessage = error.response?.data?.error || 'Failed to create assignment. Please try again.';
            showToast(errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex items-center mb-6">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors mr-4"
              >
                <ArrowLeft size={20} className="mr-2" />
                <span className="font-medium">Back to Assignments</span>
              </button>
              <h1 className="text-3xl font-bold text-gray-800">Create New Assignment</h1>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Assignment Title</label>
                        <input
                            type="text"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="3"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        ></textarea>
                    </div>
                    <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
                        <input
                            type="date"
                            id="dueDate"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <ClassSelect
                        selectedClass={selectedClass}
                        onSelectClass={setSelectedClass}
                        showToast={showToast}
                    />
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Select a Project</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {availableActivities.map((project) => (
                            <ProjectSelectionCard
                                key={project.projectId}
                                project={project}
                                isSelected={selectedProject?.projectId === project.projectId}
                                onSelectProject={setSelectedProject}
                            />
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSubmitting || !title || !selectedClass || !selectedProject}
                        className={`flex items-center px-6 py-3 rounded-md shadow-sm font-medium text-white transition-colors
                          ${isSubmitting || !title || !selectedClass || !selectedProject ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
                        `}
                    >
                        <PlusCircle size={20} className="mr-2" />
                        {isSubmitting ? 'Creating...' : 'Create Assignment'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateAssignmentPage;