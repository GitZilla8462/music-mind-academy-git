// Student Work List Component
// src/components/student/StudentWorkList.jsx
// Displays a list of student's saved work with status indicators

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, FileText, ExternalLink, Loader2 } from 'lucide-react';
import { useStudentAuth } from '../../context/StudentAuthContext';
import { getAllStudentWorkAsync } from '../../utils/studentWorkStorage';

const StudentWorkList = () => {
  const navigate = useNavigate();
  const { isAuthenticated, currentStudentInfo, isGoogleAuth, isPinAuth } = useStudentAuth();
  const [work, setWork] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWork = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        // Get auth info based on auth method
        const authInfo = isGoogleAuth
          ? { uid: currentStudentInfo.uid }
          : isPinAuth
          ? { uid: `pin-${currentStudentInfo.classId}-${currentStudentInfo.seatNumber}` }
          : null;

        const workItems = await getAllStudentWorkAsync(authInfo);
        setWork(workItems);
      } catch (error) {
        console.error('Error fetching student work:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWork();
  }, [isAuthenticated, currentStudentInfo, isGoogleAuth, isPinAuth]);

  const handleViewWork = (item) => {
    if (item.viewRoute) {
      navigate(item.viewRoute);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (work.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-500" />
        </div>
        <p className="text-gray-400 mb-2">No saved work yet</p>
        <p className="text-gray-500 text-sm">
          Your compositions and activities will appear here after you save them.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {work.map((item, index) => (
        <div
          key={item.activityId || index}
          className="bg-gray-700 rounded-lg p-4 hover:bg-gray-650 transition-colors"
        >
          <div className="flex items-start gap-3">
            {/* Emoji/Icon */}
            <div className="text-2xl flex-shrink-0">
              {item.emoji || '📁'}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-medium text-white truncate">{item.title}</h4>
                  {item.subtitle && (
                    <p className="text-sm text-gray-400">{item.subtitle}</p>
                  )}
                  {item.category && (
                    <span className="inline-block mt-1 text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  )}
                </div>

                {/* Status Badge */}
                <div className="flex-shrink-0">
                  {item.status === 'submitted' ? (
                    <span className="flex items-center gap-1 text-xs bg-yellow-900/50 text-yellow-400 px-2 py-1 rounded">
                      <Clock className="w-3 h-3" />
                      Submitted
                    </span>
                  ) : item.status === 'graded' ? (
                    <span className="flex items-center gap-1 text-xs bg-green-900/50 text-green-400 px-2 py-1 rounded">
                      <CheckCircle className="w-3 h-3" />
                      Graded
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                      Draft
                    </span>
                  )}
                </div>
              </div>

              {/* Last saved */}
              {item.lastSaved && (
                <p className="text-xs text-gray-500 mt-2">
                  Last saved: {formatDate(item.lastSaved)}
                </p>
              )}
            </div>

            {/* View Button */}
            {item.viewRoute && (
              <button
                onClick={() => handleViewWork(item)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors flex-shrink-0"
                title="View work"
              >
                <ExternalLink className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentWorkList;
