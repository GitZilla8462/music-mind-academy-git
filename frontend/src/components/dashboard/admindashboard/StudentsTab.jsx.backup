import React from 'react';

const StudentsTab = ({ showToast }) => {
  const students = [
    { id: 1, name: "Emily Johnson", email: "emily.j@example.edu", status: "Active" },
    { id: 2, name: "Daniel Lee", email: "dlee@example.edu", status: "Pending" },
    { id: 3, name: "Sarah Miller", email: "sarah.m@example.edu", status: "Active" },
    { id: 4, name: "Michael Chen", email: "mchen@example.edu", status: "Inactive" },
  ];

  const handleApprove = (studentName) => {
    showToast(`Approved ${studentName}'s account.`, 'success');
  };

  const handleDelete = (studentName) => {
    showToast(`Deleted ${studentName}'s account.`, 'error');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Student Accounts</h2>
      </div>

      <p className="text-gray-600 mb-6">
        Manage student accounts, view registration status, and approve new users.
      </p>

      <div className="overflow-x-auto rounded-lg shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {student.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    student.status === 'Active' ? 'bg-green-100 text-green-800' :
                    student.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {student.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {student.status === 'Pending' ? (
                    <button
                      onClick={() => handleApprove(student.name)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Approve
                    </button>
                  ) : null}
                  <button
                    onClick={() => handleDelete(student.name)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsTab;