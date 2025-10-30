// Student Waiting Screen
// src/components/StudentWaitingScreen.jsx

import React from 'react';

const StudentWaitingScreen = ({ lessonTitle = "Film Music - Lesson 1" }) => {
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
      {/* Animated Music Note */}
      <div style={{
        fontSize: '80px',
        marginBottom: '30px',
        animation: 'pulse 2s ease-in-out infinite'
      }}>
        ♪
      </div>

      <h1 style={{
        fontSize: '32px',
        fontWeight: 'bold',
        marginBottom: '16px',
        textAlign: 'center'
      }}>
        Waiting for your teacher...
      </h1>

      <p style={{
        fontSize: '18px',
        color: '#a0aec0',
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        {lessonTitle}
      </p>

      {/* Loading dots */}
      <div style={{
        display: 'flex',
        gap: '12px'
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          backgroundColor: '#4299e1',
          borderRadius: '50%',
          animation: 'bounce 1.4s ease-in-out infinite'
        }} />
        <div style={{
          width: '12px',
          height: '12px',
          backgroundColor: '#4299e1',
          borderRadius: '50%',
          animation: 'bounce 1.4s ease-in-out 0.2s infinite'
        }} />
        <div style={{
          width: '12px',
          height: '12px',
          backgroundColor: '#4299e1',
          borderRadius: '50%',
          animation: 'bounce 1.4s ease-in-out 0.4s infinite'
        }} />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }

        @keyframes bounce {
          0%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
};

export default StudentWaitingScreen;