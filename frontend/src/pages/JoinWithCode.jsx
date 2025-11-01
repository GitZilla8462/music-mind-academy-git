import React, { useState } from 'react';
import { sessionExists } from '../firebase/config';

const JoinWithCode = () => {
  const [code, setCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const handleJoinSession = async () => {
    if (code.length !== 4) {
      setError('Please enter a 4-digit code');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      const exists = await sessionExists(code);
      
      if (!exists) {
        setError('Session not found. Check the code and try again.');
        setIsJoining(false);
        return;
      }

      // Redirect to lesson in student mode
      window.location.href = `/lessons/film-music-project/lesson1?session=${code}&role=student`;
    } catch (error) {
      console.error('Error joining session:', error);
      setError('Failed to join session. Please try again.');
      setIsJoining(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f4f8',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{ 
          fontSize: '56px', 
          fontWeight: 'bold', 
          color: '#1a202c',
          marginBottom: '16px',
          lineHeight: '1.2'
        }}>
          Join Music Class
        </h1>
        <p style={{ 
          fontSize: '20px', 
          color: '#718096',
          fontWeight: '400'
        }}>
          Enter the 4-digit code from your teacher's screen
        </p>
      </div>
      
      {/* Code Entry Card */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '48px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        width: '100%'
      }}>
        {/* Code Input */}
        <input
          type="text"
          placeholder="• • • •"
          value={code}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '').slice(0, 4);
            setCode(value);
            setError('');
          }}
          maxLength={4}
          autoFocus
          style={{
            width: '100%',
            padding: '24px',
            fontSize: '48px',
            fontWeight: '700',
            textAlign: 'center',
            letterSpacing: '16px',
            border: error ? '3px solid #e53e3e' : '3px solid #e2e8f0',
            borderRadius: '12px',
            marginBottom: '24px',
            outline: 'none',
            transition: 'border-color 0.2s',
            fontFamily: 'monospace'
          }}
          onFocus={(e) => {
            if (!error) e.target.style.borderColor = '#4299e1';
          }}
          onBlur={(e) => {
            if (!error) e.target.style.borderColor = '#e2e8f0';
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && code.length === 4) {
              handleJoinSession();
            }
          }}
        />
        
        {/* Join Button */}
        <button
          onClick={handleJoinSession}
          disabled={isJoining || code.length !== 4}
          style={{
            width: '100%',
            padding: '20px',
            fontSize: '20px',
            fontWeight: '700',
            backgroundColor: code.length === 4 && !isJoining ? '#48bb78' : '#e2e8f0',
            color: code.length === 4 && !isJoining ? 'white' : '#a0aec0',
            border: 'none',
            borderRadius: '12px',
            cursor: code.length === 4 && !isJoining ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            if (code.length === 4 && !isJoining) {
              e.target.style.backgroundColor = '#38a169';
              e.target.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (code.length === 4 && !isJoining) {
              e.target.style.backgroundColor = '#48bb78';
              e.target.style.transform = 'translateY(0)';
            }
          }}
        >
          {isJoining ? 'Joining...' : 'Join Class →'}
        </button>
        
        {/* Error Message */}
        {error && (
          <div style={{ 
            marginTop: '20px', 
            padding: '16px', 
            backgroundColor: '#fed7d7',
            borderRadius: '8px',
            color: '#c53030',
            fontSize: '15px',
            fontWeight: '500',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Helper Text */}
      <div style={{
        marginTop: '32px',
        textAlign: 'center',
        color: '#a0aec0',
        fontSize: '14px'
      }}>
        <p>Don't have a code? Ask your teacher to start a session.</p>
      </div>
    </div>
  );
};

export default JoinWithCode;