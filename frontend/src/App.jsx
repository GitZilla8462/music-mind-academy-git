import React, { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ClassProvider } from './context/ClassContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SessionProvider } from './context/SessionContext';

// Import styles - including snap guide styles
import './App.css';

// Import authentication-related components
import AuthPage from './pages/AuthPage';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

// Import classroom component
import MusicClassroomResources from './pages/MusicClassroomResources';

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
import Lesson3 from './lessons/film-music-project/lesson3/Lesson3'; // ✅ ADDED
import Lesson4 from './lessons/film-music-project/lesson4/Lesson4';
import LessonPlanPDF from './lessons/film-music-project/lesson1/LessonPlanPDF';
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

// ✅ NEW: Import error logger and admin dashboard
import ErrorLogger from './components/ErrorLogger';
import AdminAllProblems from './pages/AdminAllProblems';

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

  // IF CLASSROOM MODE, SHOW ONLY CLASSROOM ROUTES
  if (isClassroomMode) {
    return (
      <SessionProvider>
        <Routes>
        <Route path="/" element={<MusicClassroomResources />} />
        
        {/* ✅ NEW: Admin dashboard for monitoring all problems */}
        <Route path="/admin/all-problems" element={<AdminAllProblems />} />
        
        {/* Debug tool for inspecting Firebase sessions */}
        <Route path="/debug-session" element={<FirebaseSessionInspector />} />
        
        {/* Lesson Plan PDF Viewer */}
        <Route path="/lesson-plan/lesson1" element={<LessonPlanPDF />} />
        
        {/* Join Page - NO AUTHENTICATION REQUIRED */}
        <Route path="/join" element={<JoinWithCode />} />
        
        {/* Composition Viewer - View shared compositions */}
        <Route path="/view-composition/:shareCode" element={<CompositionViewer />} />
        
        {/* Session Start Page - Shows session code before starting lesson */}
        <Route path="/session-start" element={<SessionStartPage />} />
        
        {/* Presentation View Route - NO AUTHENTICATION REQUIRED */}
        <Route path="/presentation" element={<PresentationView />} />
        
        {/* Allow access to lessons without authentication in classroom mode */}
        <Route path="/lessons/film-music-project/lesson1" element={<Lesson1 />} />
        <Route path="/lessons/film-music-project/lesson2" element={<Lesson2 />} />
        <Route path="/lessons/film-music-project/lesson3" element={<Lesson3 />} /> {/* ✅ ADDED */}
        <Route path="/lessons/film-music-project/lesson4" element={<Lesson4 />} />
        <Route path="/lessons/film-music-1" element={<Lesson1 />} />
        <Route path="/lessons/film-music-2" element={<Lesson2 />} />
        <Route path="/lessons/:lessonId" element={<SimpleLessonPlaceholder />} />
        
        {/* Music Loops in Media Hub */}
        <Route path="/music-loops-in-media" element={<MusicLoopsInMediaHub />} />
        
        {/* Allow access to projects without authentication in classroom mode */}
        <Route path="/projects/film-music-score" element={<VideoSelection showToast={showToast} isDemo={true} />} />
        <Route path="/projects/video-selection" element={<VideoSelection showToast={showToast} />} />
        <Route path="/projects/music-composer/:videoId" element={<MusicComposer showToast={showToast} />} />
        <Route path="/projects/:projectId" element={<FilmMusicScoreMain showToast={showToast} />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {/* ✅ NEW: Error logger - red button for students */}
      <ErrorLogger />
      </SessionProvider>
    );
  }

  // OTHERWISE, SHOW COMMERCIAL SITE (all your existing routes)
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
        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<AuthPage />} />
        
        {/* ✅ NEW: Admin dashboard - Also available in commercial mode */}
        <Route path="/admin/all-problems" element={<AdminAllProblems />} />
        
        {/* Debug tool for inspecting Firebase sessions */}
        <Route path="/debug-session" element={<FirebaseSessionInspector />} />
        
        {/* Lesson Plan PDF Viewer - Also available in commercial mode */}
        <Route path="/lesson-plan/lesson1" element={<LessonPlanPDF />} />
        
        {/* Composition Viewer - Also available in commercial mode */}
        <Route path="/view-composition/:shareCode" element={<CompositionViewer />} />
        
        {/* Session Start Page - Available in commercial mode */}
        <Route path="/session-start" element={<SessionStartPage />} />
        
        {/* Presentation View Route - Available in commercial mode too */}
        <Route path="/presentation" element={<PresentationView />} />
        
        {/* DYNAMIC ROOT ROUTE */}
        <Route path="/" element={
          loading ? (
            <div className="flex justify-center items-center h-screen"><div className="text-lg">Loading...</div></div>
          ) : isAuthenticated ? (
            user.role === 'teacher' ? <Navigate to="/teacher" replace /> :
            user.role === 'admin' ? <Navigate to="/admin" replace /> :
            user.role === 'student' ? <Navigate to="/student" replace /> :
            <Navigate to="/login" replace />
          ) : (
            <AuthPage />
          )
        } />

        {/* LESSON ROUTES - Available to all authenticated users */}
        <Route path="/lessons/film-music-project/lesson1" element={
          <ProtectedRoute>
            <Lesson1 />
          </ProtectedRoute>
        } />
        
        <Route path="/lessons/film-music-project/lesson2" element={
          <ProtectedRoute>
            <Lesson2 />
          </ProtectedRoute>
        } />
        
        <Route path="/lessons/film-music-project/lesson3" element={
          <ProtectedRoute>
            <Lesson3 />
          </ProtectedRoute>
        } /> {/* ✅ ADDED */}
        
        <Route path="/lessons/film-music-project/lesson4" element={
          <ProtectedRoute>
            <Lesson4 />
          </ProtectedRoute>
        } />
        
        <Route path="/lessons/film-music-1" element={
          <ProtectedRoute>
            <Lesson1 />
          </ProtectedRoute>
        } />
        
        <Route path="/lessons/:lessonId" element={
          <ProtectedRoute>
            <SimpleLessonPlaceholder />
          </ProtectedRoute>
        } />

        {/* PROTECTED ROUTES */}

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard showToast={showToast} />
          </ProtectedRoute>
        } />
        
        {/* Teacher Routes */}
        <Route path="/teacher" element={
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
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </ClassProvider>
    
    {/* ✅ NEW: Error logger - Also in commercial mode */}
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

  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;