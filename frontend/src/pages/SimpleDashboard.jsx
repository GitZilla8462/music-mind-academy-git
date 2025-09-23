import React from 'react';

const SimpleDashboard = () => {
  const assignments = [
    {
      id: 1,
      title: 'Vocal Exercise 3',
      description: 'Practice singing major scales with proper breath control',
      dueDate: '2025-05-13',
      submissions: 12,
      status: 'active'
    },
    {
      id: 2,
      title: 'Pitch Practice',
      description: 'Record yourself singing the provided melody with accurate pitch',
      dueDate: '2025-05-17',
      submissions: 5,
      status: 'active'
    }
  ];

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="bg-white shadow rounded-lg mb-6 p-4">
          <h1 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h1>
          <p className="text-gray-600">Welcome to VocalGrid</p>
        </header>
        
        {/* Main Content */}
        <main className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Current Assignments</h2>
          
          {/* Assignment Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map(assignment => (
              <div key={assignment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-medium text-lg text-blue-700">{assignment.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{assignment.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">Due: {assignment.dueDate}</span>
                  <span className="text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded">
                    {assignment.submissions} submissions
                  </span>
                </div>
                <div className="mt-4">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Action Buttons */}
          <div className="mt-8 flex justify-end">
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
              Create New Assignment
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SimpleDashboard;