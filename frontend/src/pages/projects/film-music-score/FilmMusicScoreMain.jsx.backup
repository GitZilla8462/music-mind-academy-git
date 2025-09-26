import React from 'react';
import { ArrowLeft, Play, Music, Film, Users, Clock } from 'lucide-react';

const FilmMusicScoreMain = ({ onBack, onStartComposing }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Projects
          </button>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Title Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-4 rounded-full">
                <Film className="text-white" size={48} />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Film Music Score</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Compose and analyze musical scores for film scenes, focusing on mood, timing, and orchestration techniques
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Play className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Video Selection</h3>
              <p className="text-gray-600">Choose from 6 different film scenes to score</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Music className="text-green-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Music Loops</h3>
              <p className="text-gray-600">Drag and drop musical loops to create your score</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Clock className="text-purple-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2">Timeline</h3>
              <p className="text-gray-600">Precisely time your music to match the action</p>
            </div>
          </div>

          {/* Project Info */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Project Overview</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Learning Objectives</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Understand how music enhances visual storytelling</li>
                  <li>• Practice timing music to visual cues</li>
                  <li>• Explore different musical moods and genres</li>
                  <li>• Learn about layering and orchestration</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Project Details</h4>
                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center">
                    <Clock size={16} className="mr-2" />
                    <span>Duration: 30-45 minutes</span>
                  </div>
                  <div className="flex items-center">
                    <Users size={16} className="mr-2" />
                    <span>Level: Advanced Music Composition</span>
                  </div>
                  <div className="flex items-center">
                    <Film size={16} className="mr-2" />
                    <span>6 video scenes available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-xl p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4 text-blue-900">How It Works</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="bg-blue-200 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 font-bold">1</div>
                <p className="text-sm text-blue-800">Select a video scene</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-200 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 font-bold">2</div>
                <p className="text-sm text-blue-800">Watch and analyze</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-200 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 font-bold">3</div>
                <p className="text-sm text-blue-800">Drag music loops</p>
              </div>
              <div className="text-center">
                <div className="bg-blue-200 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mx-auto mb-2 font-bold">4</div>
                <p className="text-sm text-blue-800">Create your score</p>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <button
              onClick={onStartComposing}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Start Composing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilmMusicScoreMain;