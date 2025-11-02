// FirebaseSessionInspector.jsx
// Standalone page to inspect what's actually in Firebase
// Access at: /debug-session?session=3289

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getDatabase, ref, onValue, get } from 'firebase/database';

const FirebaseSessionInspector = () => {
  const [searchParams] = useSearchParams();
  const sessionCode = searchParams.get('session');
  const [sessionData, setSessionData] = useState(null);
  const [allSessions, setAllSessions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveUpdates, setLiveUpdates] = useState([]);

  // Load specific session
  useEffect(() => {
    if (!sessionCode) return;

    const db = getDatabase();
    const sessionRef = ref(db, `sessions/${sessionCode}`);

    console.log('🔍 Loading session from Firebase:', sessionCode);

    const unsubscribe = onValue(sessionRef, (snapshot) => {
      const data = snapshot.val();
      console.log('📦 Session data:', data);
      setSessionData(data);
      setLoading(false);
      
      // Add to live updates
      setLiveUpdates(prev => [...prev, {
        time: new Date().toLocaleTimeString(),
        data: data
      }].slice(-10));
    }, (err) => {
      console.error('❌ Firebase error:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [sessionCode]);

  // Load all sessions
  useEffect(() => {
    const db = getDatabase();
    const sessionsRef = ref(db, 'sessions');

    get(sessionsRef).then((snapshot) => {
      const data = snapshot.val();
      console.log('📦 All sessions:', data);
      setAllSessions(data);
    }).catch((err) => {
      console.error('❌ Error loading all sessions:', err);
    });
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', fontFamily: 'monospace' }}>
        <h1>Loading Firebase session...</h1>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px',
      fontFamily: 'monospace',
      backgroundColor: '#1a202c',
      color: '#fff',
      minHeight: '100vh'
    }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px', borderBottom: '2px solid #3b82f6', paddingBottom: '10px' }}>
        🔥 Firebase Session Inspector
      </h1>

      {/* Session Code Input */}
      <div style={{ marginBottom: '30px', backgroundColor: '#374151', padding: '20px', borderRadius: '8px' }}>
        <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px' }}>
          Session Code:
        </label>
        <input
          type="text"
          value={sessionCode || ''}
          onChange={(e) => {
            const newCode = e.target.value;
            window.location.href = `/debug-session?session=${newCode}`;
          }}
          placeholder="Enter session code..."
          style={{
            padding: '10px',
            fontSize: '24px',
            fontFamily: 'monospace',
            width: '300px',
            backgroundColor: '#1f2937',
            color: '#fff',
            border: '2px solid #3b82f6',
            borderRadius: '4px'
          }}
        />
      </div>

      {error && (
        <div style={{ 
          backgroundColor: '#7f1d1d', 
          padding: '20px', 
          borderRadius: '8px',
          marginBottom: '20px',
          border: '2px solid #ef4444'
        }}>
          <h2>❌ Error</h2>
          <p>{error}</p>
        </div>
      )}

      {/* Specific Session Data */}
      {sessionCode && (
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{ fontSize: '24px', marginBottom: '15px', color: '#3b82f6' }}>
            Session: {sessionCode}
          </h2>
          
          {!sessionData ? (
            <div style={{ 
              backgroundColor: '#7f1d1d', 
              padding: '20px', 
              borderRadius: '8px',
              border: '2px solid #ef4444'
            }}>
              <h3>❌ Session NOT FOUND in Firebase</h3>
              <p>Path: <code>sessions/{sessionCode}</code></p>
              <p style={{ marginTop: '10px' }}>
                This session does not exist in the database. 
                Make sure the session was created properly.
              </p>
            </div>
          ) : (
            <div>
              {/* Status */}
              <div style={{ 
                backgroundColor: '#065f46', 
                padding: '15px', 
                borderRadius: '8px',
                marginBottom: '20px',
                border: '2px solid #10b981'
              }}>
                <h3 style={{ marginBottom: '10px' }}>✅ Session EXISTS in Firebase</h3>
                <div style={{ fontSize: '14px', opacity: 0.9 }}>
                  <div><strong>Current Stage:</strong> <span style={{
                    backgroundColor: sessionData.currentStage === 'locked' ? '#ef4444' : '#10b981',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    marginLeft: '5px'
                  }}>{sessionData.currentStage || 'UNDEFINED'}</span></div>
                  <div style={{ marginTop: '5px' }}>
                    <strong>Class ID:</strong> {sessionData.classId || 'MISSING'}
                  </div>
                  <div style={{ marginTop: '5px' }}>
                    <strong>Lesson ID:</strong> {sessionData.lessonId || 'MISSING'}
                  </div>
                </div>
              </div>

              {/* Full Data */}
              <div style={{ backgroundColor: '#374151', padding: '20px', borderRadius: '8px' }}>
                <h3 style={{ marginBottom: '10px' }}>📋 Full Session Data</h3>
                <pre style={{
                  backgroundColor: '#1f2937',
                  padding: '15px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  fontSize: '12px',
                  border: '1px solid #4b5563'
                }}>
                  {JSON.stringify(sessionData, null, 2)}
                </pre>
              </div>

              {/* Live Updates */}
              <div style={{ 
                backgroundColor: '#374151', 
                padding: '20px', 
                borderRadius: '8px',
                marginTop: '20px'
              }}>
                <h3 style={{ marginBottom: '10px' }}>📡 Live Updates (Last 10)</h3>
                {liveUpdates.map((update, i) => (
                  <div key={i} style={{ 
                    backgroundColor: '#1f2937',
                    padding: '10px',
                    borderRadius: '4px',
                    marginBottom: '10px',
                    fontSize: '11px',
                    border: '1px solid #4b5563'
                  }}>
                    <div style={{ color: '#10b981', marginBottom: '5px' }}>
                      [{update.time}]
                    </div>
                    <pre style={{ margin: 0 }}>
                      {JSON.stringify(update.data, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* All Sessions */}
      <div style={{ marginTop: '40px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '15px', color: '#3b82f6' }}>
          All Sessions in Database
        </h2>
        {!allSessions ? (
          <p style={{ opacity: 0.7 }}>No sessions found</p>
        ) : (
          <div style={{ backgroundColor: '#374151', padding: '20px', borderRadius: '8px' }}>
            <pre style={{
              backgroundColor: '#1f2937',
              padding: '15px',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px',
              border: '1px solid #4b5563'
            }}>
              {JSON.stringify(allSessions, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default FirebaseSessionInspector;