import React from 'react';

const SettingsTab = ({ showToast }) => {
  // Function to handle saving settings
  const handleSave = () => {
    // In a real application, you would handle saving the settings here.
    // This is a placeholder to show the toast notification.
    showToast('Settings saved successfully!', 'success');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
      </div>

      <p className="text-gray-600 mb-6">
        Configure application-wide settings, including user permissions,
        and system-wide options.
      </p>

      {/* API Key Management Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">API & Integrations</h3>
        <div className="flex flex-col space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
              Current API Key
            </label>
            <div className="mt-1 flex space-x-2">
              <input
                type="text"
                id="apiKey"
                readOnly
                className="flex-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 bg-white"
                value="***************************"
              />
              <button
                type="button"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => showToast('New API key generated!', 'success')}
              >
                Generate New
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User Management Settings */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-700 border-b pb-2 mb-4">User Permissions</h3>
        <p className="text-gray-600 text-sm mb-4">
          Control the default roles for new users and manage administrator access.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-700">Allow new teachers to register without approval</span>
          </label>
        </div>
      </div>
      
      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white py-2 px-6 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;
