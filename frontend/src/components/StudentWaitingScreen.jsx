// Student Waiting Screen
// src/components/StudentWaitingScreen.jsx

import React, { useEffect } from 'react';
import VirtualKeyboard from '../lessons/shared/activities/keyboard/VirtualKeyboard.jsx';

const StudentWaitingScreen = ({ 
  lessonTitle = "Film Music - Lesson 1",
  currentStage = 'locked'
}) => {
  
  // Redirect when session ends
  useEffect(() => {
    if (currentStage === 'ended') {
      // Check if we're in production or development
      const isProduction = window.location.hostname !== 'localhost';
      
      // Redirect to appropriate join page
      const redirectUrl = isProduction 
        ? 'https://musicroomtools.org/join'
        : 'http://localhost:5173/join';
      
      // Wait 2 seconds before redirecting so user can see the message
      const timer = setTimeout(() => {
        window.location.href = redirectUrl;
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [currentStage]);
  
  // Session ended - show message before redirect
  if (currentStage === 'ended') {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#1a202c',
        color: 'white',
        padding: '20px'
      }}>
        <div style={{
          fontSize: '80px',
          marginBottom: '30px'
        }}>
          ✓
        </div>

        <h1 style={{
          fontSize: '42px',
          fontWeight: 'bold',
          marginBottom: '16px',
          textAlign: 'center'
        }}>
          Session Ended
        </h1>

        <p style={{
          fontSize: '20px',
          color: '#a0aec0',
          textAlign: 'center',
          marginBottom: '40px',
          maxWidth: '600px'
        }}>
          Thank you for participating! Redirecting you back to the join page...
        </p>

        {/* Loading spinner */}
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #4a5568',
          borderTop: '4px solid #4299e1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Normal waiting screen - show keyboard with header
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1a202c',
      color: 'white',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header - Waiting message */}
      <div style={{
        padding: '20px',
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderBottom: '2px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          fontSize: '28px',
          fontWeight: 'bold',
          marginBottom: '8px',
          animation: 'pulse 2s ease-in-out infinite'
        }}>
          ♪ Waiting for your teacher...
        </div>
        <p style={{
          fontSize: '16px',
          color: '#a0aec0',
          margin: 0
        }}>
          {lessonTitle}
        </p>
      </div>

      {/* Virtual Keyboard - fills the rest of the screen */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <VirtualKeyboard onExit={null} />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentWaitingScreen;