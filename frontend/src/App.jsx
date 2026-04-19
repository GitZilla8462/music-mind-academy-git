import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ClassProvider } from './context/ClassContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SessionProvider } from './context/SessionContext';
import { FirebaseAuthProvider } from './context/FirebaseAuthContext';
import { StudentAuthProvider } from './context/StudentAuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import lazyWithRetry from './utils/lazyWithRetry';

// Import styles - including snap guide styles
import './App.css';

// ===========================================
// LOADING COMPONENT - Shows while lazy components load
// ===========================================
const PageLoader = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
      <p className="text-gray-400">Loading...</p>
    </div>
  </div>
);

// ===========================================
// LIGHTWEIGHT IMPORTS - Load immediately (small components)
// ===========================================
import FirebaseProtectedRoute from './components/FirebaseProtectedRoute';
import StudentProtectedRoute from './components/shared/StudentProtectedRoute';
import ErrorLogger from './components/ErrorLogger';

// ===========================================
// LAZY IMPORTS - Load on demand (heavy components)
// Uses lazyWithRetry to auto-reload on stale chunk errors after deploys
// ===========================================

// Landing pages (light, but lazy load for code splitting)
const LandingPage = lazyWithRetry(() => import('./pages/LandingPage'));
const EduLandingPage = lazyWithRetry(() => import('./pages/EduLandingPage'));
const TeacherLoginPage = lazyWithRetry(() => import('./pages/TeacherLoginPage'));
const ResetPasswordPage = lazyWithRetry(() => import('./pages/ResetPasswordPage'));

// Legal/Privacy pages
const StudentPrivacy = lazyWithRetry(() => import('./pages/StudentPrivacy'));
const PrivacyPolicy = lazyWithRetry(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazyWithRetry(() => import('./pages/TermsOfService'));
const DataPrivacyAgreement = lazyWithRetry(() => import('./pages/DataPrivacyAgreement'));
const SecurityPractices = lazyWithRetry(() => import('./pages/SecurityPractices'));

// Dashboard pages
const AdminLoginPage = lazyWithRetry(() => import('./pages/AdminLoginPage'));
const AdminDashboard = lazyWithRetry(() => import('./pages/AdminDashboard'));
const TeacherDashboard = lazyWithRetry(() => import('./pages/TeacherDashboard'));
const StudentDashboard = lazyWithRetry(() => import('./pages/StudentDashboard'));
const FirebaseTeacherDashboard = lazyWithRetry(() => import('./pages/FirebaseTeacherDashboard'));
// Admin dashboard (sidebar layout with nested routes)
const AdminLayout = lazyWithRetry(() => import('./pages/admin/AdminLayout'));
const AdminDashboardPage = lazyWithRetry(() => import('./pages/admin/DashboardPage'));
const AdminApplicationsPage = lazyWithRetry(() => import('./pages/admin/ApplicationsPage'));
const AdminApprovedEmailsPage = lazyWithRetry(() => import('./pages/admin/ApprovedEmailsPage'));
const AdminRegisteredUsersPage = lazyWithRetry(() => import('./pages/admin/RegisteredUsersPage'));
const AdminTeacherAnalyticsPage = lazyWithRetry(() => import('./pages/admin/TeacherAnalyticsPage'));
const AdminLessonAnalyticsPage = lazyWithRetry(() => import('./pages/admin/LessonAnalyticsPage'));
const AdminSessionsPage = lazyWithRetry(() => import('./pages/admin/SessionsPage'));
const AdminSurveysPage = lazyWithRetry(() => import('./pages/admin/SurveysPage'));
const AdminEmailsPage = lazyWithRetry(() => import('./pages/admin/EmailsPage'));
const AdminErrorLogsPage = lazyWithRetry(() => import('./pages/admin/ErrorLogsPage'));
const MidPilotSurveyPage = lazyWithRetry(() => import('./pages/MidPilotSurveyPage'));
const FinalPilotSurveyPage = lazyWithRetry(() => import('./pages/FinalPilotSurveyPage'));
const PilotApplicationPage = lazyWithRetry(() => import('./pages/PilotApplicationPage'));

// Student Account pages (NEW)
const StudentLogin = lazyWithRetry(() => import('./pages/StudentLogin'));
const StudentHome = lazyWithRetry(() => import('./pages/StudentHome'));

// Teacher Gradebook (NEW)
const TeacherGradebook = lazyWithRetry(() => import('./pages/TeacherGradebook'));

// Class Detail Page (NEW)
const ClassDetailPage = lazyWithRetry(() => import('./pages/ClassDetailPage'));

// Classroom and hub pages
const MusicClassroomResources = lazyWithRetry(() => import('./pages/MusicClassroomResources'));
const MusicLoopsInMediaHub = lazyWithRetry(() => import('./pages/MusicLoopsInMediaHub'));
const ListeningLabHub = lazyWithRetry(() => import('./pages/ListeningLabHub'));
const FilmMusicHub = lazyWithRetry(() => import('./pages/FilmMusicHub'));
const CurriculumGuide = lazyWithRetry(() => import('./pages/CurriculumGuide'));

// Assignment/class management pages
const CreateAssignmentPage = lazyWithRetry(() => import('./pages/CreateAssignmentPage'));
const ClassManagementPage = lazyWithRetry(() => import('./pages/ClassManagementPage'));
const EditClassPage = lazyWithRetry(() => import('./pages/EditClassPage'));
const StudentProfilePage = lazyWithRetry(() => import('./pages/StudentProfilePage'));
const AssignmentGradingPage = lazyWithRetry(() => import('./components/dashboard/teacherdashboard/AssignmentGradingPage'));
const StudentSubmissionView = lazyWithRetry(() => import('./components/dashboard/teacherdashboard/StudentSubmissionView'));
const EditAssignmentPage = lazyWithRetry(() => import('./components/dashboard/teacherdashboard/EditAssignmentPage'));
const TeacherSubmissionViewer = lazyWithRetry(() => import('./components/dashboard/teacherdashboard/TeacherSubmissionViewer'));

// Film music score project (HEAVY - uses Pixi.js, Tone.js)
const VideoSelection = lazyWithRetry(() => import('./pages/projects/film-music-score/shared/VideoSelection'));
const MusicComposer = lazyWithRetry(() => import('./pages/projects/film-music-score/composer/MusicComposer'));
const FilmMusicScoreMain = lazyWithRetry(() => import('./pages/projects/film-music-score/FilmMusicScoreMain'));

// Lesson components (HEAVY - use Tone.js, etc.)
const SimpleLessonPlaceholder = lazyWithRetry(() => import('./lessons/shared/components/LessonPlayer'));
const Lesson1 = lazyWithRetry(() => import('./lessons/film-music-project/lesson1/Lesson1'));
const Lesson2 = lazyWithRetry(() => import('./lessons/film-music-project/lesson2/Lesson2'));
const Lesson3 = lazyWithRetry(() => import('./lessons/film-music-project/lesson3/Lesson3'));
const Lesson4 = lazyWithRetry(() => import('./lessons/film-music-project/lesson4/Lesson4'));
const Lesson5 = lazyWithRetry(() => import('./lessons/film-music-project/lesson5/Lesson5'));

// Film Music Unit Lessons (NEW - Leitmotif-based curriculum)
const FMLesson1 = lazyWithRetry(() => import('./lessons/film-music/lesson1/Lesson1'));
const FMLesson2 = lazyWithRetry(() => import('./lessons/film-music/lesson2/Lesson2'));
const FMLesson3 = lazyWithRetry(() => import('./lessons/film-music/lesson3/Lesson3'));
const FMLesson4 = lazyWithRetry(() => import('./lessons/film-music/lesson4/Lesson4'));
const FMLesson5 = lazyWithRetry(() => import('./lessons/film-music/lesson5/Lesson5'));

// Listening Lab Unit Lessons (Unit 2 - Elements of Music)
const ListeningLabLesson1 = lazyWithRetry(() => import('./lessons/listening-lab/lesson1/Lesson1'));
const ListeningLabLesson2 = lazyWithRetry(() => import('./lessons/listening-lab/lesson2/Lesson2'));
const ListeningLabLesson3 = lazyWithRetry(() => import('./lessons/listening-lab/lesson3/Lesson3'));
const ListeningLabLesson4 = lazyWithRetry(() => import('./lessons/listening-lab/lesson4/Lesson4'));
const ListeningLabLesson5 = lazyWithRetry(() => import('./lessons/listening-lab/lesson5/Lesson5'));

// Music Journalist Unit Lessons (Unit 3 - Read, Research & Report)
const MusicJournalistHub = lazyWithRetry(() => import('./pages/MusicJournalistHub'));
const MJLesson1 = lazyWithRetry(() => import('./lessons/music-journalist/lesson1/Lesson1'));
const MJLesson2 = lazyWithRetry(() => import('./lessons/music-journalist/lesson2/Lesson2'));
const MJLesson3 = lazyWithRetry(() => import('./lessons/music-journalist/lesson3/Lesson3'));
const MJLesson4 = lazyWithRetry(() => import('./lessons/music-journalist/lesson4/Lesson4'));
const MJLesson5 = lazyWithRetry(() => import('./lessons/music-journalist/lesson5/Lesson5'));

// Lesson plan PDFs
const LessonPlanPDF = lazyWithRetry(() => import('./lessons/film-music-project/lesson1/LessonPlanPDF'));
const LessonPlan2PDF = lazyWithRetry(() => import('./lessons/film-music-project/lesson2/LessonPlan2PDF'));
const LessonPlan3PDF = lazyWithRetry(() => import('./lessons/film-music-project/lesson3/LessonPlan3PDF'));
const LessonPlan4PDF = lazyWithRetry(() => import('./lessons/film-music-project/lesson4/LessonPlan4PDF'));
const LessonPlan5PDF = lazyWithRetry(() => import('./lessons/film-music-project/lesson5/LessonPlan5PDF'));
const LLLessonPlan1PDF = lazyWithRetry(() => import('./lessons/listening-lab/lesson1/LessonPlanPDF'));
const LLLessonPlan2PDF = lazyWithRetry(() => import('./lessons/listening-lab/lesson2/LessonPlanPDF'));
const LLLessonPlan3PDF = lazyWithRetry(() => import('./lessons/listening-lab/lesson3/LessonPlanPDF'));
const LLLessonPlan4PDF = lazyWithRetry(() => import('./lessons/listening-lab/lesson4/LessonPlanPDF'));
const LLLessonPlan5PDF = lazyWithRetry(() => import('./lessons/listening-lab/lesson5/LessonPlanPDF'));
const MJLessonPlan1PDF = lazyWithRetry(() => import('./lessons/music-journalist/lesson1/LessonPlanPDF'));
const MJLessonPlan2PDF = lazyWithRetry(() => import('./lessons/music-journalist/lesson2/LessonPlanPDF'));
const MJLessonPlan3PDF = lazyWithRetry(() => import('./lessons/music-journalist/lesson3/LessonPlanPDF'));
const MJLessonPlan4PDF = lazyWithRetry(() => import('./lessons/music-journalist/lesson4/LessonPlanPDF'));
const MJLessonPlan5PDF = lazyWithRetry(() => import('./lessons/music-journalist/lesson5/LessonPlanPDF'));

// Presentation and session pages
const PresentationView = lazyWithRetry(() => import('./components/PresentationView'));
const SessionStartPage = lazyWithRetry(() => import('./pages/SessionStartPage'));
const JoinWithCode = lazyWithRetry(() => import('./pages/JoinWithCode'));
const CompositionViewer = lazyWithRetry(() => import('./pages/CompositionViewer'));
const PublicPortfolio = lazyWithRetry(() => import('./pages/PublicPortfolio'));

// Debug and admin tools
const FirebaseSessionInspector = lazyWithRetry(() => import('./components/FirebaseSessionInspector'));
const AdminAllProblems = lazyWithRetry(() => import('./pages/AdminAllProblems'));

// Activity pages
const DemoActivity = lazyWithRetry(() => import('./pages/DemoActivity'));
const ListeningMapViewer = lazyWithRetry(() => import('./pages/ListeningMapViewer'));

// Dev tools
const HotspotEditor = lazyWithRetry(() => import('./pages/dev/HotspotEditor'));

// Add global styles for snap guide
const snapGuideStyles = `
  /* Snap guide line (blue line that appears when snapping) */
  #snap-guide {
    position: absolute !important;
    top: 0 !important;
    bottom: 0 !important;
    width: 3px !important;
    background: linear-gradient(
      to bottom, 
      rgba(59, 130, 246, 0.3),
      rgba(59, 130, 246, 1),
      rgba(59, 130, 246, 1),
      rgba(59, 130, 246, 0.3)
    ) !important;
    box-shadow: 
      0 0 12px rgba(59, 130, 246, 1),
      0 0 24px rgba(59, 130, 246, 0.6),
      inset 0 0 4px rgba(255, 255, 255, 0.5) !important;
    z-index: 1000 !important;
    pointer-events: none !important;
    transition: opacity 0.15s ease !important;
    border-left: 1px solid rgba(255, 255, 255, 0.3);
    border-right: 1px solid rgba(255, 255, 255, 0.3);
  }

  /* Pulsing animation for active snap guide */
  @keyframes snap-guide-pulse {
    0%, 100% {
      opacity: 0.8;
      box-shadow: 
        0 0 12px rgba(59, 130, 246, 1),
        0 0 24px rgba(59, 130, 246, 0.6);
    }
    50% {
      opacity: 1;
      box-shadow: 
        0 0 16px rgba(59, 130, 246, 1),
        0 0 32px rgba(59, 130, 246, 0.8),
        0 0 48px rgba(59, 130, 246, 0.4);
    }
  }

  /* Apply animation when visible */
  #snap-guide[style*="opacity: 0.9"] {
    animation: snap-guide-pulse 1s ease-in-out infinite;
  }

  /* ============================================================
     CHROMEBOOK SWIPE PROTECTION
     Prevents two-finger swipe back gesture on Chromebooks
     ============================================================ */
  
  /* Prevent horizontal overscroll on the entire app */
  html, body {
    overscroll-behavior-x: none;
  }

  /* Specifically target composition/DAW pages (dark background) */
  .bg-gray-900 {
    overscroll-behavior-x: none;
    overscroll-behavior-y: auto;
    touch-action: pan-y pinch-zoom;
  }

  /* Prevent overscroll on the main composition container */
  .min-h-screen.bg-gray-900 {
    overscroll-behavior: none;
    -webkit-overflow-scrolling: auto;
  }

  /* Timeline and loop areas - prevent any horizontal swipe interpretation */
  .timeline-container,
  .loop-library,
  .track-container {
    overscroll-behavior-x: none;
    touch-action: pan-y pinch-zoom;
  }

  /* For draggable elements, be more permissive */
  .draggable-loop,
  [draggable="true"] {
    touch-action: none;
  }

  /* Modal overlays should block all gestures */
  .fixed.inset-0 {
    overscroll-behavior: contain;
  }

  /* Chrome on ChromeOS specific */
  @supports (-webkit-touch-callout: none) {
    body {
      overscroll-behavior-x: none;
    }
  }

  /* Prevent elastic scroll on touch devices */
  @media (hover: none) and (pointer: coarse) {
    .bg-gray-900 {
      overflow-x: hidden;
      overscroll-behavior-x: none;
    }
  }
`;

// Protected Route Component with better error handling
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    console.log('ProtectedRoute: User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  if (requiredRole && user?.role !== requiredRole) {
    console.log(`ProtectedRoute: User role ${user?.role} does not match required role ${requiredRole}`);
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Main App content (needs to be inside AuthProvider to use useAuth)
const AppContent = () => {
  const { isAuthenticated, user, loading } = useAuth();
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  // Check if we're in classroom mode
  const isClassroomMode = import.meta.env.VITE_SITE_MODE === 'edu';

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  const handleAssignmentCreated = () => {
    showToast('Assignment created successfully!', 'success');
    navigate('/teacher'); 
  };

  // Inject snap guide styles on mount
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = snapGuideStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // IF CLASSROOM MODE (musicroomtools.org), SHOW ONLY CLASSROOM ROUTES
  if (isClassroomMode) {
    return (
      <StudentAuthProvider>
      <SessionProvider>
        <Suspense fallback={<PageLoader />}>
        <Routes>
        {/* Landing page for edu site */}
        <Route path="/" element={<EduLandingPage />} />

        {/* Legal/Privacy pages */}
        <Route path="/student-privacy" element={<StudentPrivacy />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/security" element={<SecurityPractices />} />

        {/* Teacher login page for approved pilot teachers */}
        <Route path="/login" element={<TeacherLoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Firebase-authenticated teacher dashboard */}
        <Route path="/teacher/dashboard" element={
          <FirebaseProtectedRoute>
            <FirebaseTeacherDashboard />
          </FirebaseProtectedRoute>
        } />

        {/* Class Detail Page (NEW) */}
        <Route path="/teacher/class/:classId" element={
          <FirebaseProtectedRoute>
            <ClassDetailPage />
          </FirebaseProtectedRoute>
        } />

        {/* Admin dashboard with sidebar navigation */}
        <Route path="/admin" element={
          <FirebaseProtectedRoute>
            <AdminLayout />
          </FirebaseProtectedRoute>
        }>
          <Route index element={<AdminDashboardPage />} />
          <Route path="applications" element={<AdminApplicationsPage />} />
          <Route path="approved" element={<AdminApprovedEmailsPage />} />
          <Route path="registered" element={<AdminRegisteredUsersPage />} />
          <Route path="teachers" element={<AdminTeacherAnalyticsPage />} />
          <Route path="lessons" element={<AdminLessonAnalyticsPage />} />
          <Route path="sessions" element={<AdminSessionsPage />} />
          <Route path="surveys" element={<AdminSurveysPage />} />
          <Route path="emails" element={<AdminEmailsPage />} />
          <Route path="errors" element={<AdminErrorLogsPage />} />
        </Route>
        {/* Redirect old admin URL */}
        <Route path="/admin/pilot" element={<Navigate to="/admin" replace />} />

        {/* Backend JWT admin login + dashboard (same as commercial site) */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Teacher Gradebook (NEW) */}
        <Route path="/teacher/gradebook/:classId" element={
          <FirebaseProtectedRoute>
            <TeacherGradebook />
          </FirebaseProtectedRoute>
        } />

        {/* Admin dashboard for monitoring all problems */}
        <Route path="/admin/all-problems" element={
          <FirebaseProtectedRoute>
            <AdminAllProblems />
          </FirebaseProtectedRoute>
        } />

        {/* Debug tool for inspecting Firebase sessions */}
        <Route path="/debug-session" element={
          <FirebaseProtectedRoute>
            <FirebaseSessionInspector />
          </FirebaseProtectedRoute>
        } />

        {/* Dev-only Hotspot Editor for Melody Mystery */}
        <Route path="/dev/hotspot-editor" element={
          <FirebaseProtectedRoute>
            <HotspotEditor />
          </FirebaseProtectedRoute>
        } />

        {/* Lesson Plan PDF Viewer */}
        <Route path="/lesson-plan/lesson1" element={<LessonPlanPDF />} />
        <Route path="/lesson-plan/lesson2" element={<LessonPlan2PDF />} />
        <Route path="/lesson-plan/lesson3" element={<LessonPlan3PDF />} />
        <Route path="/lesson-plan/lesson4" element={<LessonPlan4PDF />} />
        <Route path="/lesson-plan/lesson5" element={<LessonPlan5PDF />} />
        <Route path="/lesson-plan/listening-lab-lesson1" element={<LLLessonPlan1PDF />} />
        <Route path="/lesson-plan/listening-lab-lesson2" element={<LLLessonPlan2PDF />} />
        <Route path="/lesson-plan/listening-lab-lesson3" element={<LLLessonPlan3PDF />} />
        <Route path="/lesson-plan/listening-lab-lesson4" element={<LLLessonPlan4PDF />} />
        <Route path="/lesson-plan/listening-lab-lesson5" element={<LLLessonPlan5PDF />} />
        <Route path="/lesson-plan/music-journalist-lesson1" element={<MJLessonPlan1PDF />} />
        <Route path="/lesson-plan/music-journalist-lesson2" element={<MJLessonPlan2PDF />} />
        <Route path="/lesson-plan/music-journalist-lesson3" element={<MJLessonPlan3PDF />} />
        <Route path="/lesson-plan/music-journalist-lesson4" element={<MJLessonPlan4PDF />} />
        <Route path="/lesson-plan/music-journalist-lesson5" element={<MJLessonPlan5PDF />} />

        {/* Join Page - NO AUTHENTICATION REQUIRED */}
        <Route path="/join" element={<JoinWithCode />} />
        
        {/* ✅ ADDED: View saved listening map */}
        <Route path="/view/listening-map" element={<ListeningMapViewer />} />
        
        {/* Composition Viewer - View shared compositions */}
        <Route path="/view-composition/:shareCode" element={<CompositionViewer />} />

        {/* Public Student Portfolio - No auth required */}
        <Route path="/portfolio/:shareToken" element={<PublicPortfolio />} />

        {/* Session Start Page - Shows session code before starting lesson */}
        <Route path="/session-start" element={<SessionStartPage />} />
        
        {/* Presentation View Route - NO AUTHENTICATION REQUIRED */}
        <Route path="/presentation" element={<PresentationView />} />
        
        {/* ✅ ADDED: Demo Activity Route - Teacher preview of activities */}
        <Route path="/demo" element={<DemoActivity />} />
        
        {/* Allow access to lessons without authentication in classroom mode */}
        <Route path="/lessons/film-music-project/lesson1" element={<Lesson1 />} />
        <Route path="/lessons/film-music-project/lesson2" element={<Lesson2 />} />
        <Route path="/lessons/film-music-project/lesson3" element={<Lesson3 />} />
        <Route path="/lessons/film-music-project/lesson4" element={<Lesson4 />} />
        <Route path="/lessons/film-music-project/lesson5" element={<Lesson5 />} />
        <Route path="/lessons/film-music-1" element={<Lesson1 />} />
        <Route path="/lessons/film-music-2" element={<Lesson2 />} />

        {/* Film Music Unit Routes (NEW - Leitmotif-based curriculum) */}
        <Route path="/lessons/film-music/lesson1" element={<FMLesson1 />} />
        <Route path="/lessons/film-music/lesson2" element={<FMLesson2 />} />
        <Route path="/lessons/film-music/lesson3" element={<FMLesson3 />} />
        <Route path="/lessons/film-music/lesson4" element={<FMLesson4 />} />
        <Route path="/lessons/film-music/lesson5" element={<FMLesson5 />} />

        <Route path="/lessons/:lessonId" element={<SimpleLessonPlaceholder />} />

        {/* Music Classroom Resources - Unit selection page */}
        <Route path="/music-classroom-resources" element={<MusicClassroomResources />} />

        {/* Curriculum Guide - Standards and scope & sequence */}
        <Route path="/curriculum-guide" element={<CurriculumGuide />} />

        {/* The Loop Lab Hub */}
        <Route path="/music-loops-in-media" element={<MusicLoopsInMediaHub />} />

        {/* Listening Lab Hub (Unit 2) */}
        <Route path="/listening-lab" element={<ListeningLabHub />} />

        {/* Listening Lab Lessons (Unit 2) */}
        <Route path="/lessons/listening-lab/lesson1" element={<ListeningLabLesson1 />} />
        <Route path="/lessons/listening-lab/lesson2" element={<ListeningLabLesson2 />} />
        <Route path="/lessons/listening-lab/lesson3" element={<ListeningLabLesson3 />} />
        <Route path="/lessons/listening-lab/lesson4" element={<ListeningLabLesson4 />} />
        <Route path="/lessons/listening-lab/lesson5" element={<ListeningLabLesson5 />} />

        {/* Music Agent Hub & Lessons (Unit 3) */}
        <Route path="/music-agent-hub" element={<MusicJournalistHub />} />
        <Route path="/music-journalist" element={<MusicJournalistHub />} />
        <Route path="/music-journalist-hub" element={<MusicJournalistHub />} />
        <Route path="/lessons/music-journalist/lesson1" element={<MJLesson1 />} />
        <Route path="/lessons/music-journalist/lesson2" element={<MJLesson2 />} />
        <Route path="/lessons/music-journalist/lesson3" element={<MJLesson3 />} />
        <Route path="/lessons/music-journalist/lesson4" element={<MJLesson4 />} />
        <Route path="/lessons/music-journalist/lesson5" element={<MJLesson5 />} />

        {/* Film Music Hub - Coming Soon placeholder (early access) */}
        <Route path="/film-music-hub" element={
          <FirebaseProtectedRoute>
            <FilmMusicHub />
          </FirebaseProtectedRoute>
        } />

        {/* Allow access to projects without authentication in classroom mode */}
        <Route path="/projects/film-music-score" element={<VideoSelection showToast={showToast} isDemo={true} />} />
        <Route path="/projects/video-selection" element={<VideoSelection showToast={showToast} />} />
        <Route path="/projects/music-composer/:videoId" element={<MusicComposer showToast={showToast} />} />
        <Route path="/projects/:projectId" element={<FilmMusicScoreMain showToast={showToast} />} />

        {/* Student Account Routes (NEW) */}
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student/home" element={
          <StudentProtectedRoute>
            <StudentHome />
          </StudentProtectedRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>

      {/* Error logger - red button for students */}
      <ErrorLogger />
      </SessionProvider>
      </StudentAuthProvider>
    );
  }

  // COMMERCIAL SITE (musicmindacademy.com)
  return (
    <StudentAuthProvider>
    <SessionProvider>
      <ClassProvider>
      <Suspense fallback={<PageLoader />}>
      {toast && (
        <div 
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg ${
            toast.type === 'success' ? 'bg-green-500 text-white' :
            toast.type === 'error' ? 'bg-red-500 text-white' :
            'bg-blue-500 text-white'
          }`}
        >
          {typeof toast.message === 'string' ? toast.message : toast.message}
          <button 
            className="ml-2 font-bold"
            onClick={closeToast}
          >
            ×
          </button>
        </div>
      )}
      
      <Routes>
        {/* Public landing page at root */}
        <Route path="/" element={<LandingPage />} />

        {/* Legal/Privacy pages */}
        <Route path="/student-privacy" element={<StudentPrivacy />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/dpa" element={<DataPrivacyAgreement />} />
        <Route path="/security" element={<SecurityPractices />} />

        {/* Teacher login page for approved pilot teachers */}
        <Route path="/login" element={<TeacherLoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Student join page */}
        <Route path="/join" element={<JoinWithCode />} />

        {/* Admin dashboard */}
        <Route path="/admin/all-problems" element={
          <FirebaseProtectedRoute>
            <AdminAllProblems />
          </FirebaseProtectedRoute>
        } />

        {/* Debug tool for inspecting Firebase sessions */}
        <Route path="/debug-session" element={
          <FirebaseProtectedRoute>
            <FirebaseSessionInspector />
          </FirebaseProtectedRoute>
        } />

        {/* Dev-only Hotspot Editor for Melody Mystery */}
        <Route path="/dev/hotspot-editor" element={
          <FirebaseProtectedRoute>
            <HotspotEditor />
          </FirebaseProtectedRoute>
        } />

        {/* Lesson Plan PDF Viewer */}
        <Route path="/lesson-plan/lesson1" element={<LessonPlanPDF />} />
        <Route path="/lesson-plan/lesson2" element={<LessonPlan2PDF />} />
        <Route path="/lesson-plan/lesson3" element={<LessonPlan3PDF />} />
        <Route path="/lesson-plan/lesson4" element={<LessonPlan4PDF />} />
        <Route path="/lesson-plan/lesson5" element={<LessonPlan5PDF />} />
        <Route path="/lesson-plan/listening-lab-lesson1" element={<LLLessonPlan1PDF />} />
        <Route path="/lesson-plan/listening-lab-lesson2" element={<LLLessonPlan2PDF />} />
        <Route path="/lesson-plan/listening-lab-lesson3" element={<LLLessonPlan3PDF />} />
        <Route path="/lesson-plan/listening-lab-lesson4" element={<LLLessonPlan4PDF />} />
        <Route path="/lesson-plan/listening-lab-lesson5" element={<LLLessonPlan5PDF />} />
        <Route path="/lesson-plan/music-journalist-lesson1" element={<MJLessonPlan1PDF />} />
        <Route path="/lesson-plan/music-journalist-lesson2" element={<MJLessonPlan2PDF />} />
        <Route path="/lesson-plan/music-journalist-lesson3" element={<MJLessonPlan3PDF />} />
        <Route path="/lesson-plan/music-journalist-lesson4" element={<MJLessonPlan4PDF />} />
        <Route path="/lesson-plan/music-journalist-lesson5" element={<MJLessonPlan5PDF />} />

        {/* ✅ ADDED: View saved listening map */}
        <Route path="/view/listening-map" element={<ListeningMapViewer />} />

        {/* Composition Viewer */}
        <Route path="/view-composition/:shareCode" element={<CompositionViewer />} />

        {/* Public Student Portfolio - No auth required */}
        <Route path="/portfolio/:shareToken" element={<PublicPortfolio />} />

        {/* Session Start Page */}
        <Route path="/session-start" element={<SessionStartPage />} />
        
        {/* Presentation View Route */}
        <Route path="/presentation" element={<PresentationView />} />
        
        {/* ✅ ADDED: Demo Activity Route - Teacher preview of activities */}
        <Route path="/demo" element={<DemoActivity />} />

        {/* LESSON ROUTES - Open access for students joining via session codes */}
        <Route path="/lessons/film-music-project/lesson1" element={<Lesson1 />} />
        <Route path="/lessons/film-music-project/lesson2" element={<Lesson2 />} />
        <Route path="/lessons/film-music-project/lesson3" element={<Lesson3 />} />
        <Route path="/lessons/film-music-project/lesson4" element={<Lesson4 />} />
        <Route path="/lessons/film-music-project/lesson5" element={<Lesson5 />} />
        <Route path="/lessons/film-music-1" element={<Lesson1 />} />

        {/* Film Music Unit Routes (NEW - Leitmotif-based curriculum) */}
        <Route path="/lessons/film-music/lesson1" element={<FMLesson1 />} />
        <Route path="/lessons/film-music/lesson2" element={<FMLesson2 />} />
        <Route path="/lessons/film-music/lesson3" element={<FMLesson3 />} />
        <Route path="/lessons/film-music/lesson4" element={<FMLesson4 />} />
        <Route path="/lessons/film-music/lesson5" element={<FMLesson5 />} />

        <Route path="/lessons/:lessonId" element={<SimpleLessonPlaceholder />} />

        {/* PROTECTED ROUTES */}

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard showToast={showToast} />
          </ProtectedRoute>
        } />
        
        {/* ✅ UPDATED: Teacher now goes to MusicClassroomResources */}
        <Route path="/teacher" element={
          <ProtectedRoute requiredRole="teacher">
            <MusicClassroomResources />
          </ProtectedRoute>
        } />
        
        {/* The Loop Lab Hub - for teachers (legacy backend auth) */}
        <Route path="/music-loops-in-media" element={
          <ProtectedRoute requiredRole="teacher">
            <MusicLoopsInMediaHub />
          </ProtectedRoute>
        } />

        {/* Firebase-authenticated teacher dashboard */}
        <Route path="/teacher/dashboard" element={
          <FirebaseProtectedRoute>
            <FirebaseTeacherDashboard />
          </FirebaseProtectedRoute>
        } />

        {/* Class Detail Page (NEW) */}
        <Route path="/teacher/class/:classId" element={
          <FirebaseProtectedRoute>
            <ClassDetailPage />
          </FirebaseProtectedRoute>
        } />

        {/* Firebase-authenticated routes for pilot teachers */}
        <Route path="/music-classroom-resources" element={
          <FirebaseProtectedRoute>
            <MusicClassroomResources />
          </FirebaseProtectedRoute>
        } />
        <Route path="/curriculum-guide" element={
          <FirebaseProtectedRoute>
            <CurriculumGuide />
          </FirebaseProtectedRoute>
        } />
        <Route path="/music-loops-in-media-hub" element={
          <FirebaseProtectedRoute>
            <MusicLoopsInMediaHub />
          </FirebaseProtectedRoute>
        } />

        {/* Listening Lab Hub (Unit 2) */}
        <Route path="/listening-lab-hub" element={
          <FirebaseProtectedRoute>
            <ListeningLabHub />
          </FirebaseProtectedRoute>
        } />

        {/* Listening Lab Lessons (Unit 2) */}
        <Route path="/lessons/listening-lab/lesson1" element={<ListeningLabLesson1 />} />
        <Route path="/lessons/listening-lab/lesson2" element={<ListeningLabLesson2 />} />
        <Route path="/lessons/listening-lab/lesson3" element={<ListeningLabLesson3 />} />
        <Route path="/lessons/listening-lab/lesson4" element={<ListeningLabLesson4 />} />
        <Route path="/lessons/listening-lab/lesson5" element={<ListeningLabLesson5 />} />

        {/* Music Agent Hub & Lessons (Unit 3) */}
        <Route path="/music-agent-hub" element={<MusicJournalistHub />} />
        <Route path="/music-journalist" element={<MusicJournalistHub />} />
        <Route path="/music-journalist-hub" element={<MusicJournalistHub />} />
        <Route path="/lessons/music-journalist/lesson1" element={<MJLesson1 />} />
        <Route path="/lessons/music-journalist/lesson2" element={<MJLesson2 />} />
        <Route path="/lessons/music-journalist/lesson3" element={<MJLesson3 />} />
        <Route path="/lessons/music-journalist/lesson4" element={<MJLesson4 />} />
        <Route path="/lessons/music-journalist/lesson5" element={<MJLesson5 />} />

        {/* Film Music Hub - Coming Soon placeholder (early access) */}
        <Route path="/film-music-hub" element={
          <FirebaseProtectedRoute>
            <FilmMusicHub />
          </FirebaseProtectedRoute>
        } />

        {/* Admin dashboard with sidebar navigation */}
        <Route path="/admin" element={
          <FirebaseProtectedRoute>
            <AdminLayout />
          </FirebaseProtectedRoute>
        }>
          <Route index element={<AdminDashboardPage />} />
          <Route path="applications" element={<AdminApplicationsPage />} />
          <Route path="approved" element={<AdminApprovedEmailsPage />} />
          <Route path="registered" element={<AdminRegisteredUsersPage />} />
          <Route path="teachers" element={<AdminTeacherAnalyticsPage />} />
          <Route path="lessons" element={<AdminLessonAnalyticsPage />} />
          <Route path="sessions" element={<AdminSessionsPage />} />
          <Route path="surveys" element={<AdminSurveysPage />} />
          <Route path="emails" element={<AdminEmailsPage />} />
          <Route path="errors" element={<AdminErrorLogsPage />} />
        </Route>
        {/* Redirect old admin URL */}
        <Route path="/admin/pilot" element={<Navigate to="/admin" replace />} />

        {/* Pilot application page (public) */}
        <Route path="/apply" element={<PilotApplicationPage />} />

        {/* Standalone survey pages (teachers click email links) */}
        <Route path="/survey/mid-pilot" element={<MidPilotSurveyPage />} />
        <Route path="/survey/final" element={<FinalPilotSurveyPage />} />

        {/* Teacher Gradebook (NEW) */}
        <Route path="/teacher/gradebook/:classId" element={
          <FirebaseProtectedRoute>
            <TeacherGradebook />
          </FirebaseProtectedRoute>
        } />

        {/* Legacy teacher dashboard (backend auth) */}
        <Route path="/teacher/legacy-dashboard" element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherDashboard showToast={showToast} />
          </ProtectedRoute>
        } />
        {/* Legacy class management - commented out, using new ClassDetailPage instead */}
        <Route path="/teacher/edit-class/:classId" element={
          <ProtectedRoute requiredRole="teacher">
            <EditClassPage showToast={showToast} />
          </ProtectedRoute>
        } />
        <Route path="/teacher/student/:studentId" element={
          <ProtectedRoute requiredRole="teacher">
            <StudentProfilePage showToast={showToast} />
          </ProtectedRoute>
        } />
        <Route path="/teacher/projects/:projectId/submissions" element={
          <ProtectedRoute requiredRole="teacher">
            <AssignmentGradingPage showToast={showToast} />
          </ProtectedRoute>
        } />
        <Route path="/teacher/projects/:projectId/submission/:studentId" element={
          <ProtectedRoute requiredRole="teacher">
            <StudentSubmissionView showToast={showToast} />
          </ProtectedRoute>
        } />
        <Route path="/teacher/projects" element={
          <ProtectedRoute requiredRole="teacher">
            <CreateAssignmentPage 
              showToast={showToast} 
              onAssignmentCreated={handleAssignmentCreated}
            />
          </ProtectedRoute>
        } />
        <Route path="/teacher/projects/film-music-score-demo" element={
          <ProtectedRoute requiredRole="teacher">
            <VideoSelection showToast={showToast} isDemo={true} />
          </ProtectedRoute>
        } />
        <Route path="/teacher/projects/film-music-score-demo/:videoId" element={
          <ProtectedRoute requiredRole="teacher">
            <MusicComposer showToast={showToast} isDemo={true} />
          </ProtectedRoute>
        } />
        <Route path="/teacher/assignments/edit/:assignmentId" element={
          <ProtectedRoute requiredRole="teacher">
            <EditAssignmentPage showToast={showToast} />
          </ProtectedRoute>
        } />
        <Route path="/teacher/assignments/:assignmentId/submissions" element={
            <ProtectedRoute requiredRole="teacher">
                <TeacherSubmissionViewer showToast={showToast} />
            </ProtectedRoute>
        } />
        <Route path="/teacher/assignments/:assignmentId/submissions/:submissionId/playback" element={
          <ProtectedRoute requiredRole="teacher">
            <StudentSubmissionView showToast={showToast} />
          </ProtectedRoute>
        } />

        {/* Student Routes */}
        <Route path="/student" element={
          <ProtectedRoute requiredRole="student">
            <StudentDashboard showToast={showToast} />
          </ProtectedRoute>
        } />

        {/* STUDENT PRACTICE ROUTES */}
        <Route path="/student/practice/film-music-score" element={
          <ProtectedRoute requiredRole="student">
            <VideoSelection showToast={showToast} isPractice={true} />
          </ProtectedRoute>
        } />
        <Route path="/student/practice/film-music-score/music-composer/:videoId" element={
          <ProtectedRoute requiredRole="student">
            <MusicComposer showToast={showToast} isPractice={true} />
          </ProtectedRoute>
        } />

        {/* STUDENT ASSIGNMENT ROUTES */}
        <Route path="/student/assignment/:assignmentId/video-selection" element={
          <ProtectedRoute requiredRole="student">
            <VideoSelection showToast={showToast} />
          </ProtectedRoute>
        } />
        <Route path="/student/assignment/:assignmentId/music-composer/:videoId" element={
          <ProtectedRoute requiredRole="student">
            <MusicComposer showToast={showToast} />
          </ProtectedRoute>
        } />
        <Route path="/student/assignment/:assignmentId/film-music-score" element={
          <ProtectedRoute requiredRole="student">
            <FilmMusicScoreMain showToast={showToast} />
          </ProtectedRoute>
        } />

        {/* General Project Routes */}
        <Route path="/projects/film-music-score-main" element={
          <ProtectedRoute>
            <FilmMusicScoreMain showToast={showToast} />
          </ProtectedRoute>
        } />
        <Route path="/projects/video-selection" element={
          <ProtectedRoute>
            <VideoSelection showToast={showToast} />
          </ProtectedRoute>
        } />
        <Route path="/projects/music-composer/:videoId" element={
          <ProtectedRoute>
            <MusicComposer showToast={showToast} />
          </ProtectedRoute>
        } />

        {/* Student Account Routes (NEW) */}
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/student/home" element={
          <StudentProtectedRoute>
            <StudentHome />
          </StudentProtectedRoute>
        } />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </ClassProvider>

    {/* Error logger */}
    <ErrorLogger />
    </SessionProvider>
    </StudentAuthProvider>
  );
};

const App = () => {
  // Set page title based on site mode
  useEffect(() => {
    const siteMode = import.meta.env.VITE_SITE_MODE;
    document.title = siteMode === 'edu' ? 'Music Room Tools' : 'Music Mind Academy';
  }, []);

  // Chromebook detection - disable fancy cursors for stability
  useEffect(() => {
    const isChromeOS = /\bCrOS\b/.test(navigator.userAgent);
    if (isChromeOS) {
      document.body.classList.add('chromebook-mode');
      console.log('🖥️ Chromebook detected - cursor stabilization enabled');
    }
  }, []);

  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <FirebaseAuthProvider>
            <AppContent />
          </FirebaseAuthProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
};

export default App;// force rebuild 1776300304
