// Public Portfolio Page
// src/pages/PublicPortfolio.jsx
// Shareable, no-auth-required view of a student's featured work

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Lock, FolderHeart, Award, MessageSquare } from 'lucide-react';
import { getPortfolioByToken } from '../firebase/portfolios';
import { getAllStudentWork } from '../firebase/studentWork';
import StaticTimelinePreview from '../components/shared/StaticTimelinePreview';

const PublicPortfolio = () => {
  const { shareToken } = useParams();
  const isEduSite = import.meta.env.VITE_SITE_MODE === 'edu';
  const [portfolio, setPortfolio] = useState(null);
  const [studentUid, setStudentUid] = useState(null);
  const [workItems, setWorkItems] = useState([]);
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        const result = await getPortfolioByToken(shareToken);

        if (!result) {
          setError('notfound');
          setLoading(false);
          return;
        }

        const { portfolio: portfolioData, studentUid: uid } = result;

        if (!portfolioData.isPublic) {
          setError('private');
          setLoading(false);
          return;
        }

        setPortfolio(portfolioData);
        setStudentUid(uid);

        // Load all student work
        const allWork = await getAllStudentWork(uid);

        // Filter to only featured items
        const featured = (portfolioData.featuredWork || []);
        const featuredItems = allWork.filter(w => featured.includes(w.workId));
        setWorkItems(featuredItems);

        // Load grades if we can determine classId from work items
        if (featuredItems.length > 0 && featuredItems[0].classId) {
          try {
            const { getDatabase, ref, get } = await import('firebase/database');
            const db = getDatabase();
            const gradesRef = ref(db, `grades/${featuredItems[0].classId}/${uid}`);
            const snapshot = await get(gradesRef);
            if (snapshot.exists()) {
              setGrades(snapshot.val());
            }
          } catch (err) {
            // Grades are optional — don't fail the page
            console.error('Could not load grades:', err);
          }
        }

        // Generate QR code
        try {
          const QRCode = (await import('qrcode')).default;
          const url = window.location.href;
          const dataUrl = await QRCode.toDataURL(url, {
            width: 160,
            margin: 2,
            color: { dark: '#1f2937', light: '#ffffff' }
          });
          setQrDataUrl(dataUrl);
        } catch {
          // QR is optional
        }
      } catch (err) {
        console.error('Error loading portfolio:', err);
        setError('error');
      } finally {
        setLoading(false);
      }
    };

    loadPortfolio();
  }, [shareToken]);

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    return new Date(typeof timestamp === 'number' ? timestamp : timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (error === 'notfound') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderHeart size={28} className="text-gray-400" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Portfolio Not Found</h1>
          <p className="text-gray-500">This portfolio link may have expired or doesn't exist.</p>
        </div>
      </div>
    );
  }

  if (error === 'private') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={28} className="text-gray-400" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Portfolio is Private</h1>
          <p className="text-gray-500">The owner has made this portfolio private.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-500">Could not load this portfolio. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {!isEduSite && (
              <img
                src="/MusicMindAcademyLogo.png"
                alt="Music Mind Academy"
                className="h-7 w-auto"
              />
            )}
            <span className="text-sm text-gray-400 font-medium">{isEduSite ? 'Music Room Tools' : 'Music Mind Academy'}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {portfolio?.title || 'My Music Portfolio'}
          </h1>
          <p className="text-gray-500 mt-1">
            {portfolio?.displayName}
            {portfolio?.className && ` · ${portfolio.className}`}
          </p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {workItems.length === 0 ? (
          <div className="text-center py-12">
            <FolderHeart size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No featured work yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {workItems.map((work) => {
              const placedLoops = work.data?.placedLoops || work.data?.composition?.placedLoops || [];
              const duration = work.data?.compositionDuration || work.data?.composition?.compositionDuration || 60;
              const reflection = work.data?.reflection || work.data?.composition?.reflection || null;
              const grade = grades[work.lessonId] || null;
              const instruments = [...new Set(placedLoops.map(l => l.category || l.instrument).filter(Boolean))];

              return (
                <div
                  key={work.workId}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* Timeline Preview */}
                  <StaticTimelinePreview
                    placedLoops={placedLoops}
                    duration={duration}
                    height={160}
                    theme="light"
                    className="rounded-none border-0"
                  />

                  {/* Details */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <span>{work.emoji || '🎵'}</span>
                          {work.title}
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {placedLoops.length} loops
                          {instruments.length > 0 && ` · ${instruments.slice(0, 3).join(', ')}`}
                          {' · '}{formatDate(work.updatedAt || work.createdAt)}
                        </p>
                      </div>

                      {grade && (
                        <span className="text-2xl font-bold text-green-600 flex-shrink-0">
                          {grade.grade}
                        </span>
                      )}
                    </div>

                    {/* Reflection */}
                    {reflection && (reflection.star1 || reflection.star2 || reflection.wish) && (
                      <div className="bg-blue-50 rounded-lg p-4 mb-3">
                        <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-2">Student Reflection</p>
                        <div className="text-sm text-gray-700 space-y-1.5">
                          {reflection.star1 && <p>&#9733; {reflection.star1}</p>}
                          {reflection.star2 && <p>&#9733; {reflection.star2}</p>}
                          {reflection.wish && <p>&#10024; <em>I wish... {reflection.wish}</em></p>}
                        </div>
                      </div>
                    )}

                    {/* Teacher Feedback */}
                    {grade?.feedback && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare size={14} className="text-green-600" />
                          <p className="text-xs text-green-600 font-medium uppercase tracking-wide">Teacher Feedback</p>
                        </div>
                        <p className="text-sm text-gray-700">{grade.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* QR Code footer */}
        {qrDataUrl && (
          <div className="mt-10 text-center border-t border-gray-200 pt-8 pb-4">
            <img
              src={qrDataUrl}
              alt="Portfolio QR Code"
              className="w-28 h-28 mx-auto mb-2"
            />
            <p className="text-xs text-gray-400">
              Scan to view this portfolio
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-6 pb-8">
          <p className="text-xs text-gray-400">
            Made with {isEduSite ? 'Music Room Tools' : 'Music Mind Academy'}
          </p>
        </div>
      </main>
    </div>
  );
};

export default PublicPortfolio;
