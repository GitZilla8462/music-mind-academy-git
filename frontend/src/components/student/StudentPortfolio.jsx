// Student Portfolio
// src/components/student/StudentPortfolio.jsx
// Main Portfolio tab — gallery of compositions with featured curation

import React, { useState, useEffect } from 'react';
import { Loader2, FolderHeart, Star } from 'lucide-react';
import { useStudentAuth } from '../../context/StudentAuthContext';
import {
  getOrCreatePortfolio,
  toggleFeaturedWork,
  getPortfolioWorkItems,
  getPortfolioGrades
} from '../../firebase/portfolios';
import PortfolioWorkCard from './PortfolioWorkCard';
import PortfolioDetailModal from './PortfolioDetailModal';
import PortfolioShareButton from './PortfolioShareButton';

const StudentPortfolio = () => {
  const { currentStudentInfo, isPinAuth } = useStudentAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [workItems, setWorkItems] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedWork, setSelectedWork] = useState(null);

  // Determine student UID
  const getStudentUid = () => {
    if (isPinAuth && currentStudentInfo) {
      return `pin-${currentStudentInfo.classId}-${currentStudentInfo.seatNumber}`;
    }
    return currentStudentInfo?.uid || null;
  };

  const studentUid = getStudentUid();

  useEffect(() => {
    const fetchData = async () => {
      if (!studentUid) {
        setLoading(false);
        return;
      }

      try {
        // Fetch portfolio metadata and work items in parallel
        const [portfolioData, items] = await Promise.all([
          getOrCreatePortfolio(studentUid, {
            displayName: currentStudentInfo?.displayName?.split(' ')[0] || 'Student',
            className: currentStudentInfo?.className || ''
          }),
          getPortfolioWorkItems(studentUid)
        ]);

        setPortfolio(portfolioData);
        setWorkItems(items);

        // Fetch grades if in a class
        if (isPinAuth && currentStudentInfo?.classId) {
          const gradesData = await getPortfolioGrades(currentStudentInfo.classId, studentUid);
          setGrades(gradesData);
        }
      } catch (err) {
        console.error('Error loading portfolio:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentUid]);

  const handleToggleFeatured = async (workKey) => {
    if (!studentUid) return;
    try {
      const updated = await toggleFeaturedWork(studentUid, workKey);
      setPortfolio(prev => ({ ...prev, featuredWork: updated }));
    } catch (err) {
      console.error('Error toggling featured:', err);
    }
  };

  const handlePortfolioUpdate = (updates) => {
    setPortfolio(prev => ({ ...prev, ...updates }));
  };

  const isFeatured = (workKey) => {
    return (portfolio?.featuredWork || []).includes(workKey);
  };

  const getGradeForWork = (work) => {
    // Try to find grade by lessonId
    return grades[work.lessonId] || null;
  };

  const featuredCount = (portfolio?.featuredWork || []).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-purple-50 rounded-lg flex items-center justify-center">
            <FolderHeart size={18} className="text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Portfolio</h2>
            {featuredCount > 0 && (
              <p className="text-xs text-gray-500">{featuredCount} featured piece{featuredCount !== 1 ? 's' : ''}</p>
            )}
          </div>
        </div>

        {workItems.length > 0 && studentUid && (
          <PortfolioShareButton
            studentUid={studentUid}
            portfolio={portfolio}
            onPortfolioUpdate={handlePortfolioUpdate}
          />
        )}
      </div>

      {/* Hint */}
      {workItems.length > 0 && featuredCount === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4 flex items-center gap-2">
          <Star size={14} className="text-blue-600 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            Tap the star on your best work to feature it in your portfolio.
          </p>
        </div>
      )}

      {/* Gallery Grid */}
      {workItems.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-3">
          {workItems.map((work) => (
            <PortfolioWorkCard
              key={work.workId}
              work={work}
              isFeatured={isFeatured(work.workId)}
              onToggleFeatured={handleToggleFeatured}
              onClick={setSelectedWork}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FolderHeart size={24} className="text-gray-400" />
          </div>
          <p className="text-gray-500 mb-1">No compositions yet</p>
          <p className="text-gray-400 text-sm">
            Your compositions will appear here after you save them during lessons.
          </p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedWork && (
        <PortfolioDetailModal
          work={selectedWork}
          grade={getGradeForWork(selectedWork)}
          isFeatured={isFeatured(selectedWork.workId)}
          onToggleFeatured={handleToggleFeatured}
          onClose={() => setSelectedWork(null)}
        />
      )}
    </div>
  );
};

export default StudentPortfolio;
