import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ClassProvider } from './context/ClassContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SessionProvider } from './context/SessionContext';
import { FirebaseAuthProvider } from './context/FirebaseAuthContext';

// Import styles - including snap guide styles
import './App.css';

// Import authentication-related components
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';
import EduLandingPage from './pages/EduLandingPage';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

// Import classroom component
import MusicClassroomResources from './pages/MusicClassroomResources';

// Import Firebase auth components
import FirebaseProtectedRoute from './components/FirebaseProtectedRoute';
import FirebaseTeacherDashboard from './pages/FirebaseTeacherDashboard';
import PilotAdminPage from './pages/PilotAdminPage';
import TeacherLoginPage from './pages/TeacherLoginPage';

// Import all necessary pages and components
import CreateAssignmentPage from './pages/CreateAssignmentPage';
import ClassManagementPage from './pages/ClassManagementPage';
import EditClassPage from './pages/EditClassPage';
import StudentProfilePage from './pages/StudentProfilePage';
import AssignmentGradingPage from './components/dashboard/teacherdashboard/AssignmentGradingPage';
import StudentSubmissionView from './components/dashboard/teacherdashboard/StudentSubmissionView';
import VideoSelection from './pages/projects/film-music-score/shared/VideoSelection.jsx';
import MusicComposer from './pages/projects/film-music-score/composer/MusicComposer';
import FilmMusicScoreMain from './pages/projects/film-music-score/FilmMusicScoreMain.jsx';
import EditAssignmentPage from './components/dashboard/teacherdashboard/EditAssignmentPage';
import TeacherSubmissionViewer from './components/dashboard/teacherdashboard/TeacherSubmissionViewer.jsx';

// Import lesson components
import SimpleLessonPlaceholder from "./lessons/shared/components/LessonPlayer";
import Lesson1 from './lessons/film-music-project/lesson1/Lesson1';
import Lesson2 from './lessons/film-music-project/lesson2/Lesson2';
import Lesson3 from './lessons/film-music-project/lesson3/Lesson3';
import Lesson4 from './lessons/film-music-project/lesson4/Lesson4';
import Lesson5 from './lessons/film-music-project/lesson5/Lesson5';
import LessonPlanPDF from './lessons/film-music-project/lesson1/LessonPlanPDF';
import LessonPlan2PDF from './lessons/film-music-project/lesson2/LessonPlan2PDF';
import LessonPlan3PDF from './lessons/film-music-project/lesson3/LessonPlan3PDF';
import LessonPlan4PDF from './lessons/film-music-project/lesson4/LessonPlan4PDF';
import MusicLoopsInMediaHub from './pages/MusicLoopsInMediaHub';

// Import presentation view
import PresentationView from './components/PresentationView';

// Import session start page
import SessionStartPage from './pages/SessionStartPage';

// Import join with code page
import JoinWithCode from './pages/JoinWithCode';

// Import composition viewer
import CompositionViewer from './pages/CompositionViewer';

// Import debug tool
import FirebaseSessionInspector from './components/FirebaseSessionInspector';

// Import error logger and admin dashboard
import ErrorLogger from './components/ErrorLogger';
import AdminAllProblems from './pages/AdminAllProblems';

// ✅ ADDED: Import DemoActivity for teacher activity previews
import DemoActivity from './pages/DemoActivity';

// ✅ ADDED: Import ListeningMapViewer for viewing saved listening maps
import ListeningMapViewer from './pages/ListeningMapViewer';

// Dev-only Hotspot Editor for Melody Mystery
import HotspotEditor from './pages/dev/HotspotEditor';

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
        <Routes>
        {/* Landing page for edu site */}
        <Route path="/" element={<EduLandingPage />} />
        
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
        <Route path="/lessons/:lessonId" element={<SimpleLessonPlaceholder />} />
        
        {/* Music Classroom Resources - Unit selection page */}
        <Route path="/music-classroom-resources" element={<MusicClassroomResources />} />

        {/* Music Loops in Media Hub */}
        <Route path="/music-loops-in-media" element={<MusicLoopsInMediaHub />} />
        
        {/* Allow access to projects without authentication in classroom mode */}
        <Route path="/projects/film-music-score" element={<VideoSelection showToast={showToast} isDemo={true} />} />
        <Route path="/projects/video-selection" element={<VideoSelection showToast={showToast} />} />
        <Route path="/projects/music-composer/:videoId" element={<MusicComposer showToast={showToast} />} />
        <Route path="/projects/:projectId" element={<FilmMusicScoreMain showToast={showToast} />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* Error logger - red button for students */}
      <ErrorLogger />
      </SessionProvider>
    );
  }

  // COMMERCIAL SITE (musicmindacademy.com)
  return (
    <SessionProvider>
      <ClassProvider>
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
        
        {/* Teacher login page for approved pilot teachers */}
        <Route path="/login" element={<TeacherLoginPage />} />
        
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

        {/* LESSON ROUTES - Available to Firebase authenticated users */}
        <Route path="/lessons/film-music-project/lesson1" element={
          <FirebaseProtectedRoute>
            <Lesson1 />
          </FirebaseProtectedRoute>
        } />

        <Route path="/lessons/film-music-project/lesson2" element={
          <FirebaseProtectedRoute>
            <Lesson2 />
          </FirebaseProtectedRoute>
        } />

        <Route path="/lessons/film-music-project/lesson3" element={
          <FirebaseProtectedRoute>
            <Lesson3 />
          </FirebaseProtectedRoute>
        } />

        <Route path="/lessons/film-music-project/lesson4" element={
          <FirebaseProtectedRoute>
            <Lesson4 />
          </FirebaseProtectedRoute>
        } />

        <Route path="/lessons/film-music-project/lesson5" element={
          <FirebaseProtectedRoute>
            <Lesson5 />
          </FirebaseProtectedRoute>
        } />

        <Route path="/lessons/film-music-1" element={
          <FirebaseProtectedRoute>
            <Lesson1 />
          </FirebaseProtectedRoute>
        } />

        <Route path="/lessons/:lessonId" element={
          <FirebaseProtectedRoute>
            <SimpleLessonPlaceholder />
          </FirebaseProtectedRoute>
        } />

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
    <Router>
      <AuthProvider>
        <FirebaseAuthProvider>
          <AppContent />
        </FirebaseAuthProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;