import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';

const ProjectSelectionCard = ({ project, onSelectProject, isSelected }) => {
  const navigate = useNavigate();

  const handleDemo = () => {
    if (project.demoUrl) {
      navigate(project.demoUrl);
    }
  };

  return (
    <div
      className={`relative bg-white p-6 rounded-lg shadow-md border-2 transition-all duration-200 
                  ${isSelected ? 'border-blue-600 shadow-lg scale-105' : 'border-gray-200 hover:border-blue-300'}`}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1 shadow-md">
          <Check size={16} />
        </div>
      )}

      <h3 className="text-lg font-semibold text-gray-800">{project.projectTitle}</h3>
      <p className="mt-2 text-sm text-gray-600">{project.description}</p>
      <div className="mt-4 flex space-x-4">
        <button
          onClick={handleDemo}
          className="flex-1 py-2 px-4 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Demo
        </button>
        {/* CORRECTED: The onClick handler now directly calls the onSelectProject prop with the project object */}
        <button
          onClick={() => onSelectProject(project)}
          className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Select for Assignment
        </button>
      </div>
    </div>
  );
};

ProjectSelectionCard.propTypes = {
  project: PropTypes.shape({
    projectId: PropTypes.string.isRequired,
    projectTitle: PropTypes.string.isRequired,
    projectType: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    demoUrl: PropTypes.string,
  }).isRequired,
  onSelectProject: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
};

export default ProjectSelectionCard;