import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ClassSelect from '../components/ClassSelect';
import ProjectSelectionCard from '../components/ProjectSelectionCard';
import { PlusCircle, ArrowLeft, BookOpen, Play } from 'lucide-react';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? '/api' 
    : 'http://localhost:5000/api';

// Static projects - MOVED OUTSIDE the component
export const staticProjects = [
    {
        projectId: 'film-music-unit-lesson-1',
        projectTitle: 'Intro to the DAW',
        projectType: 'lesson',
        description: 'Students will be introduced to their film music project and learn about tempo, dynamics, harmony and instrumentation in relation to their project.',
        demoUrl: '/lessons/film-music-1',
    },
    {
        projectId: 'film-music-score',
        projectTitle: 'Film Trailer Loops - Sandbox Mode',
        projectType: 'project',
        description: 'Students compose music for a short film clip using a loop library and a video player.',
        demoUrl: '/teacher/projects/film-music-score-demo',
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
    const [availableLessons, setAvailableLessons] = useState([]);
    const [loadingLessons, setLoadingLessons] = useState(true);

    // Fetch available lessons from your API
    useEffect(() => {
        const fetchLessons = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/lessons`);
                const result = await response.json();
                if (result.success) {
                    setAvailableLessons(result.data);
                }
            } catch (error) {
                console.error('Error fetching lessons:', error);
                showToast('Failed to load lessons', 'error');
            } finally {
                setLoadingLessons(false);
            }
        };

        fetchLessons();
    }, [showToast]);

    // Convert lessons to project format
    const lessonProjects = availableLessons.map(lesson => ({
        projectId: `lesson-${lesson.id}`,
        projectTitle: lesson.title,
        projectType: 'lesson',
        description: lesson.description,
        demoUrl: `/lessons/${lesson.id}`,
        lessonData: lesson, // Include full lesson data
        estimatedTime: lesson.estimatedTime,
        difficulty: lesson.difficulty,
        activities: lesson.activities?.length || 0
    }));

    // Combine all available activities
    const availableActivities = [...staticProjects];

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

            // Add lesson-specific data if it's a lesson assignment
            if (selectedProject.projectType === 'lesson') {
                assignmentData.project.lessonId = selectedProject.lessonData.id;
                assignmentData.project.estimatedTime = selectedProject.estimatedTime;
                assignmentData.project.difficulty = selectedProject.difficulty;
            }
            
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

    const LessonCard = ({ project, isSelected, onSelectProject }) => (
        <div 
            onClick={() => onSelectProject(project)}
            className={`cursor-pointer p-6 rounded-lg border-2 transition-all duration-200 ${
                isSelected 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
        >
            <div className="flex items-start space-x-3 mb-3">
                <div className={`p-2 rounded-lg ${
                    project.projectType === 'lesson' 
                        ? 'bg-green-100 text-green-600' 
                        : project.projectType === 'project'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-purple-100 text-purple-600'
                }`}>
                    {project.projectType === 'lesson' ? <BookOpen size={20} /> : <Play size={20} />}
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{project.projectTitle}</h3>
                    <div className="flex items-center space-x-3 text-xs text-gray-500 mb-2">
                        <span className={`px-2 py-1 rounded-full ${
                            project.projectType === 'lesson' 
                                ? 'bg-green-100 text-green-700' 
                                : project.projectType === 'project'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                        }`}>
                            {project.projectType}
                        </span>
                        {project.estimatedTime && (
                            <span>{project.estimatedTime} min</span>
                        )}
                        {project.difficulty && (
                            <span className="capitalize">{project.difficulty}</span>
                        )}
                        {project.activities > 0 && (
                            <span>{project.activities} activities</span>
                        )}
                    </div>
                </div>
            </div>
            <p className="text-gray-600 text-sm mb-3">{project.description}</p>
            
            {project.lessonData?.learningObjectives && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                    <h4 className="text-xs font-medium text-gray-700 mb-2">Learning Objectives:</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                        {project.lessonData.learningObjectives.slice(0, 2).map((objective, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-green-500 mr-1">•</span>
                                <span>{objective}</span>
                            </li>
                        ))}
                        {project.lessonData.learningObjectives.length > 2 && (
                            <li className="text-gray-400">
                                +{project.lessonData.learningObjectives.length - 2} more...
                            </li>
                        )}
                    </ul>
                </div>
            )}
            
            <div className="mt-4 flex justify-between items-center">
                <a 
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    onClick={(e) => e.stopPropagation()}
                >
                    Preview →
                </a>
                {isSelected && (
                    <div className="text-blue-600 text-sm font-medium">Selected</div>
                )}
            </div>
        </div>
    );

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
                        {staticProjects.map((project) => (
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