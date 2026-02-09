// Visual Error Logger - Red button that appears when issues occur
// Works on both musicroomtools.org and musicmindacademy.com
// src/components/ErrorLogger.jsx

import React, { useState, useEffect } from 'react';

const ErrorLogger = () => {
  const [logs, setLogs] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Capture console.error
    const originalError = console.error;
    console.error = function(...args) {
      const message = args.map(arg => {
        if (typeof arg === 'object') {
          try { return JSON.stringify(arg); } catch { return '[Object]'; }
        }
        return String(arg);
      }).join(' ');
      
      // Only show critical errors with these keywords
      if (message.includes('🔴') || 
          message.includes('CRITICAL') || 
          message.includes('DANGER') ||
          message.includes('KICKED')) {
        
        const logEntry = {
          type: 'error',
          message: message.replace(/🔴|CRITICAL:|DANGER:/g, '').trim(),
          timestamp: new Date().toLocaleTimeString()
        };
        
        setLogs(prev => {
          // Prevent duplicates
          const isDuplicate = prev.some(log => 
            log.message === logEntry.message && 
            log.timestamp === logEntry.timestamp
          );
          if (isDuplicate) return prev;
          
          return [...prev, logEntry];
        });
        setIsVisible(true);
      }
      
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  // Auto-hide after 30 seconds of no new errors
  useEffect(() => {
    if (logs.length > 0) {
      const timer = setTimeout(() => {
        // Don't auto-hide, let user manually close
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [logs]);

  if (logs.length === 0) return null;

  // Get session code from URL if available
  const urlParams = new URLSearchParams(window.location.search);
  const sessionCode = urlParams.get('session') || 'Unknown';

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          fontSize: '32px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.5)',
          zIndex: 9999,
          animation: 'pulse 2s infinite',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold'
        }}
        title="Click to see connection issues"
      >
        !
        {logs.length > 1 && (
          <div style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            backgroundColor: '#dc2626',
            color: 'white',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: 'bold',
            border: '3px solid white'
          }}>
            {logs.length}
          </div>
        )}
      </button>

      {/* Error Panel */}
      {isVisible && (
        <div style={{
          position: 'fixed',
          bottom: '100px',
          right: '20px',
          width: '420px',
          maxHeight: '600px',
          backgroundColor: 'white',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          overflow: 'hidden',
          zIndex: 9998,
          border: '3px solid #ef4444',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
          {/* Header */}
          <div style={{
            padding: '20px',
            backgroundColor: '#ef4444',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '20px' }}>
                🚨 Connection Issue
              </div>
              <div style={{ fontSize: '14px', marginTop: '4px', opacity: 0.9 }}>
                Session: {sessionCode}
              </div>
            </div>
            <button
              onClick={() => setIsVisible(false)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>
          </div>

          {/* Simple Message for Teachers */}
          <div style={{
            padding: '24px',
            backgroundColor: '#fef2f2',
            borderBottom: '2px solid #fee2e2'
          }}>
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#991b1b',
              marginBottom: '12px'
            }}>
              What happened:
            </div>
            <div style={{
              fontSize: '16px',
              color: '#7f1d1d',
              lineHeight: '1.5'
            }}>
              {logs[0].message.includes('null') && 'Lost connection to the lesson'}
              {logs[0].message.includes('ended') && 'Session was ended'}
              {logs[0].message.includes('redirect') && 'Student was redirected'}
              {!logs[0].message.includes('null') && 
               !logs[0].message.includes('ended') && 
               !logs[0].message.includes('redirect') && 
               'Connection problem detected'}
            </div>
            <div style={{
              marginTop: '16px',
              padding: '12px',
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '2px solid #fecaca'
            }}>
              <div style={{ fontSize: '14px', color: '#991b1b', fontWeight: '600' }}>
                📋 Report to teacher:
              </div>
              <div style={{
                marginTop: '8px',
                fontSize: '15px',
                color: '#7f1d1d',
                fontFamily: 'monospace',
                padding: '8px',
                backgroundColor: '#fef2f2',
                borderRadius: '4px'
              }}>
                "Session {sessionCode} at {logs[0].timestamp}"
              </div>
            </div>
          </div>

          {/* Action Instructions */}
          <div style={{
            padding: '24px',
            backgroundColor: 'white'
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '12px'
            }}>
              What to do:
            </div>
            <ol style={{
              margin: 0,
              paddingLeft: '24px',
              color: '#4b5563',
              fontSize: '15px',
              lineHeight: '1.8'
            }}>
              <li>Tell your teacher about this message</li>
              <li>Go back to the join page</li>
              <li>Enter the session code again: <strong>{sessionCode}</strong></li>
              <li>Your work is auto-saved - you won't lose it!</li>
            </ol>
          </div>

          {/* All Errors (collapsed) */}
          {logs.length > 1 && (
            <details style={{
              padding: '16px',
              backgroundColor: '#f9fafb',
              borderTop: '1px solid #e5e7eb'
            }}>
              <summary style={{
                cursor: 'pointer',
                fontSize: '14px',
                color: '#6b7280',
                fontWeight: '600'
              }}>
                View all {logs.length} issues
              </summary>
              <div style={{
                marginTop: '12px',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {logs.map((log, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '8px',
                      marginBottom: '8px',
                      backgroundColor: 'white',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#6b7280',
                      border: '1px solid #e5e7eb'
                    }}
                  >
                    <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                      {log.timestamp}
                    </div>
                    <div style={{ fontSize: '11px' }}>
                      {log.message.substring(0, 100)}...
                    </div>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      <style>
        {`
          @keyframes pulse {
            0%, 100% { 
              transform: scale(1);
              box-shadow: 0 4px 12px rgba(239, 68, 68, 0.5);
            }
            50% { 
              transform: scale(1.05);
              box-shadow: 0 8px 24px rgba(239, 68, 68, 0.8);
            }
          }
        `}
      </style>
    </>
  );
};

export default ErrorLogger;