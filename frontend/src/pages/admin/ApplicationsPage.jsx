import React, { useState } from 'react';
import { Inbox, ChevronDown, ChevronUp } from 'lucide-react';
import { useAdminData } from './AdminDataContext';

const ApplicationsPage = () => {
  const { applications, approvingId, handleApproveApplication, handleRejectApplication } = useAdminData();
  const [expandedApplications, setExpandedApplications] = useState({});

  return (
    <div className="rounded-xl border border-green-200 overflow-hidden bg-white">
      <div className="px-6 py-4 bg-green-50 border-b border-green-200 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Inbox size={20} />
          Pilot Applications
        </h2>
        <span className="text-sm text-gray-500">
          {applications.filter(a => a.status === 'pending').length} pending / {applications.length} total
        </span>
      </div>

      {applications.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          No applications yet. Teachers will apply at musicmindacademy.com/apply
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {applications.map((app) => {
            const isPending = app.status === 'pending';
            const isApproved = app.status === 'approved';
            const isRejected = app.status === 'rejected';
            const expanded = expandedApplications[app.id];

            return (
              <div key={app.id} className={`px-6 py-4 ${isRejected ? 'bg-gray-50 opacity-60' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-gray-800">
                        {app.firstName} {app.lastName}
                      </span>
                      {isPending && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Pending</span>
                      )}
                      {isApproved && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">Approved</span>
                      )}
                      {isRejected && (
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full font-medium">Declined</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {app.schoolEmail} &middot; {app.schoolName}
                      {app.city && ` \u00B7 ${app.city}${app.state ? ', ' + app.state : ''}`}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Applied {new Date(app.submittedAt).toLocaleDateString()} at {new Date(app.submittedAt).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setExpandedApplications(prev => ({ ...prev, [app.id]: !prev[app.id] }))}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleApproveApplication(app)}
                          disabled={approvingId === app.id}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50"
                        >
                          {approvingId === app.id ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleRejectApplication(app)}
                          className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-300"
                        >
                          Decline
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {expanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">Personal Email:</span> <span className="text-gray-800">{app.personalEmail}</span></div>
                    <div><span className="text-gray-500">School Email:</span> <span className="text-gray-800">{app.schoolEmail}</span></div>
                    {app.grades?.length > 0 && <div><span className="text-gray-500">Grades:</span> <span className="text-gray-800">{app.grades.join(', ')}</span></div>}
                    {app.devices?.length > 0 && <div><span className="text-gray-500">Devices:</span> <span className="text-gray-800">{app.devices.join(', ')}</span></div>}
                    {app.classSize && <div><span className="text-gray-500">Class Size:</span> <span className="text-gray-800">{app.classSize}</span></div>}
                    {app.toolsUsed?.length > 0 && <div><span className="text-gray-500">Tools Used:</span> <span className="text-gray-800">{app.toolsUsed.join(', ')}</span></div>}
                    {app.biggestChallenge && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Biggest Challenge:</span>
                        <p className="text-gray-800 mt-1">{app.biggestChallenge}</p>
                      </div>
                    )}
                    {app.whyPilot && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Why Pilot:</span>
                        <p className="text-gray-800 mt-1">{app.whyPilot}</p>
                      </div>
                    )}
                    {app.anythingElse && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Other:</span>
                        <p className="text-gray-800 mt-1">{app.anythingElse}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ApplicationsPage;
