import React, { useState, useCallback, useEffect, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ClassProvider } from './context/ClassContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SessionProvider } from './context/SessionContext';
import { FirebaseAuthProvider } from './context/FirebaseAuthContext';
import ErrorBoundary from './components/ErrorBoundary';

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
import ErrorLogger from './components/ErrorLogger';

// ===========================================
// LAZY IMPORTS - Load on demand (heavy components)
// ===========================================

// Landing pages (light, but lazy load for code splitting)
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const EduLandingPage = React.lazy(() => import('./pages/EduLandingPage'));
const TeacherLoginPage = React.lazy(() => import('./pages/TeacherLoginPage'));

// Legal/Privacy pages
const StudentPrivacy = React.lazy(() => import('./pages/StudentPrivacy'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = React.lazy(() => import('./pages/TermsOfService'));

// Dashboard pages
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const TeacherDashboard = React.lazy(() => import('./pages/TeacherDashboard'));
const StudentDashboard = React.lazy(() => import('./pages/StudentDashboard'));
const FirebaseTeacherDashboard = React.lazy(() => import('./pages/FirebaseTeacherDashboard'));
const PilotAdminPage = React.lazy(() => import('./pages/PilotAdminPage'));

// Classroom and hub pages
const MusicClassroomResources = React.lazy(() => import('./pages/MusicClassroomResources'));
const MusicLoopsInMediaHub = React.lazy(() => import('./pages/MusicLoopsInMediaHub'));
const FilmMusicHub = React.lazy(() => import('./pages/FilmMusicHub'));

// Assignment/class management pages
const CreateAssignmentPage = React.lazy(() => import('./pages/CreateAssignmentPage'));
const ClassManagementPage = React.lazy(() => import('./pages/ClassManagementPage'));
const EditClassPage = React.lazy(() => import('./pages/EditClassPage'));
const StudentProfilePage = React.lazy(() => import('./pages/StudentProfilePage'));
const AssignmentGradingPage = React.lazy(() => import('./components/dashboard/teacherdashboard/AssignmentGradingPage'));
const StudentSubmissionView = React.lazy(() => import('./components/dashboard/teacherdashboard/StudentSubmissionView'));
const EditAssignmentPage = React.lazy(() => import('./components/dashboard/teacherdashboard/EditAssignmentPage'));
const TeacherSubmissionViewer = React.lazy(() => import('./components/dashboard/teacherdashboard/TeacherSubmissionViewer'));

// Film music score project (HEAVY - uses Pixi.js, Tone.js)
const VideoSelection = React.lazy(() => import('./pages/projects/film-music-score/shared/VideoSelection'));
const MusicComposer = React.lazy(() => import('./pages/projects/film-music-score/composer/MusicComposer'));
const FilmMusicScoreMain = React.lazy(() => import('./pages/projects/film-music-score/FilmMusicScoreMain'));

// Lesson components (HEAVY - use Tone.js, etc.)
const SimpleLessonPlaceholder = React.lazy(() => import('./lessons/shared/components/LessonPlayer'));
const Lesson1 = React.lazy(() => import('./lessons/film-music-project/lesson1/Lesson1'));
const Lesson2 = React.lazy(() => import('./lessons/film-music-project/lesson2/Lesson2'));
const Lesson3 = React.lazy(() => import('./lessons/film-music-project/lesson3/Lesson3'));
const Lesson4 = React.lazy(() => import('./lessons/film-music-project/lesson4/Lesson4'));
const Lesson5 = React.lazy(() => import('./lessons/film-music-project/lesson5/Lesson5'));

// Film Music Unit Lessons (NEW - Leitmotif-based curriculum)
const FMLesson1 = React.lazy(() => import('./lessons/film-music/lesson1/Lesson1'));

// Lesson plan PDFs
const LessonPlanPDF = React.lazy(() => import('./lessons/film-music-project/lesson1/LessonPlanPDF'));
const LessonPlan2PDF = React.lazy(() => import('./lessons/film-music-project/lesson2/LessonPlan2PDF'));
const LessonPlan3PDF = React.lazy(() => import('./lessons/film-music-project/lesson3/LessonPlan3PDF'));
const LessonPlan4PDF = React.lazy(() => import('./lessons/film-music-project/lesson4/LessonPlan4PDF'));

// Presentation and session pages
const PresentationView = React.lazy(() => import('./components/PresentationView'));
const SessionStartPage = React.lazy(() => import('./pages/SessionStartPage'));
const JoinWithCode = React.lazy(() => import('./pages/JoinWithCode'));
const CompositionViewer = React.lazy(() => import('./pages/CompositionViewer'));

// Debug and admin tools
const FirebaseSessionInspector = React.lazy(() => import('./components/FirebaseSessionInspector'));
const AdminAllProblems = React.lazy(() => import('./pages/AdminAllProblems'));

// Activity pages
const DemoActivity = React.lazy(() => import('./pages/DemoActivity'));
const ListeningMapViewer = React.lazy(() => import('./pages/ListeningMapViewer'));

// Dev tools
const HotspotEditor = React.lazy(() => import('./pages/dev/HotspotEditor'));

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
      <SessionProvider>
        <Suspense fallback={<PageLoader />}>
        <Routes>
        {/* Landing page for edu site */}
        <Route path="/" element={<EduLandingPage />} />

        {/* Legal/Privacy pages */}
        <Route path="/student-privacy" element={<StudentPrivacy />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />

        {/* Teacher login page for approved pilot teachers */}
        <Route path="/login" element={<TeacherLoginPage />} />

        {/* Firebase-authenticated teacher dashboard */}
        <Route path="/teacher/dashboard" element={
          <FirebaseProtectedRoute>
            <FirebaseTeacherDashboard />
          </FirebaseProtectedRoute>
        } />

        {/* Pilot program admin page */}
        <Route path="/admin/pilot" element={
          <FirebaseProtectedRoute>
            <PilotAdminPage />
          </FirebaseProtectedRoute>
        } />

        {/* Admin dashboard for monitoring all problems */}
        <Route path="/admin/all-problems" element={<AdminAllProblems />} />

        {/* Debug tool for inspecting Firebase sessions */}
        <Route path="/debug-session" element={<FirebaseSessionInspector />} />

        {/* Dev-only Hotspot Editor for Melody Mystery */}
        <Route path="/dev/hotspot-editor" element={<HotspotEditor />} />

        {/* Lesson Plan PDF Viewer */}
        <Route path="/lesson-plan/lesson1" element={<LessonPlanPDF />} />
        <Route path="/lesson-plan/lesson2" element={<LessonPlan2PDF />} />
        <Route path="/lesson-plan/lesson3" element={<LessonPlan3PDF />} />
        <Route path="/lesson-plan/lesson4" element={<LessonPlan4PDF />} />

        {/* Join Page - NO AUTHENTICATION REQUIRED */}
        <Route path="/join" element={<JoinWithCode />} />
        
        {/* ✅ ADDED: View saved listening map */}
        <Route path="/view/listening-map" element={<ListeningMapViewer />} />
        
        {/* Composition Viewer - View shared compositions */}
        <Route path="/view-composition/:shareCode" element={<CompositionViewer />} />
        
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

        <Route path="/lessons/:lessonId" element={<SimpleLessonPlaceholder />} />
        
        {/* Music Classroom Resources - Unit selection page */}
        <Route path="/music-classroom-resources" element={<MusicClassroomResources />} />

        {/* Music Loops in Media Hub */}
        <Route path="/music-loops-in-media" element={<MusicLoopsInMediaHub />} />

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
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>

      {/* Error logger - red button for students */}
      <ErrorLogger />
      </SessionProvider>
    );
  }

  // COMMERCIAL SITE (musicmindacademy.com)
  return (
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

        {/* Teacher login page for approved pilot teachers */}
        <Route path="/login" element={<TeacherLoginPage />} />

        {/* Student join page */}
        <Route path="/join" element={<JoinWithCode />} />

        {/* Admin dashboard */}
        <Route path="/admin/all-problems" element={<AdminAllProblems />} />

        {/* Debug tool for inspecting Firebase sessions */}
        <Route path="/debug-session" element={<FirebaseSessionInspector />} />

        {/* Dev-only Hotspot Editor for Melody Mystery */}
        <Route path="/dev/hotspot-editor" element={<HotspotEditor />} />

        {/* Lesson Plan PDF Viewer */}
        <Route path="/lesson-plan/lesson1" element={<LessonPlanPDF />} />
        <Route path="/lesson-plan/lesson2" element={<LessonPlan2PDF />} />
        <Route path="/lesson-plan/lesson3" element={<LessonPlan3PDF />} />
        <Route path="/lesson-plan/lesson4" element={<LessonPlan4PDF />} />

        {/* ✅ ADDED: View saved listening map */}
        <Route path="/view/listening-map" element={<ListeningMapViewer />} />
        
        {/* Composition Viewer */}
        <Route path="/view-composition/:shareCode" element={<CompositionViewer />} />
        
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
        
        {/* Music Loops in Media Hub - for teachers (legacy backend auth) */}
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

        {/* Firebase-authenticated routes for pilot teachers */}
        <Route path="/music-classroom-resources" element={
          <FirebaseProtectedRoute>
            <MusicClassroomResources />
          </FirebaseProtectedRoute>
        } />
        <Route path="/music-loops-in-media-hub" element={
          <FirebaseProtectedRoute>
            <MusicLoopsInMediaHub />
          </FirebaseProtectedRoute>
        } />

        {/* Film Music Hub - Coming Soon placeholder (early access) */}
        <Route path="/film-music-hub" element={
          <FirebaseProtectedRoute>
            <FilmMusicHub />
          </FirebaseProtectedRoute>
        } />

        {/* Pilot program admin page */}
        <Route path="/admin/pilot" element={
          <FirebaseProtectedRoute>
            <PilotAdminPage />
          </FirebaseProtectedRoute>
        } />

        {/* Legacy teacher dashboard (backend auth) */}
        <Route path="/teacher/legacy-dashboard" element={
          <ProtectedRoute requiredRole="teacher">
            <TeacherDashboard showToast={showToast} />
          </ProtectedRoute>
        } />
        <Route path="/teacher/class/:classId" element={
          <ProtectedRoute requiredRole="teacher">
            <ClassManagementPage showToast={showToast} />
          </ProtectedRoute>
        } />
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

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </ClassProvider>

    {/* Error logger */}
    <ErrorLogger />
    </SessionProvider>
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

export default App;