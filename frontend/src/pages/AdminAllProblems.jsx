// Admin Dashboard - View all classroom issues across both sites
// Works on musicroomtools.org and musicmindacademy.com
// src/pages/AdminAllProblems.jsx

import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import database from '../firebase/config';

const AdminAllProblems = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'today', 'week'
  const [showResolved, setShowResolved] = useState(false);

  // Load all problems from Firebase
  useEffect(() => {
    const problemsRef = ref(database, 'all-problems');
    
    const unsubscribe = onValue(problemsRef, (snapshot) => {
      const data = snapshot.val();
      
      if (data) {
        // Convert to array and sort by timestamp (newest first)
        const problemsArray = Object.entries(data).map(([id, problem]) => ({
          id,
          ...problem
        }));
        
        problemsArray.sort((a, b) => b.timestamp - a.timestamp);
        setProblems(problemsArray);
      } else {
        setProblems([]);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter problems based on selected filter
  const getFilteredProblems = () => {
    let filtered = problems;

    // Filter by resolved status
    if (!showResolved) {
      filtered = filtered.filter(p => !p.resolved);
    }

    // Filter by time period
    const now = Date.now();
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);

    if (filter === 'today') {
      filtered = filtered.filter(p => p.timestamp > oneDayAgo);
    } else if (filter === 'week') {
      filtered = filtered.filter(p => p.timestamp > oneWeekAgo);
    }

    return filtered;
  };

  // Mark problem as resolved
  const markResolved = async (problemId) => {
    try {
      const problemRef = ref(database, `all-problems/${problemId}`);
      await update(problemRef, { resolved: true, resolvedAt: Date.now() });
      console.log('✅ Marked problem as resolved:', problemId);
    } catch (error) {
      console.error('Error marking resolved:', error);
    }
  };

  // Group problems by date
  const groupByDate = (problemsList) => {
    const groups = {};
    
    problemsList.forEach(problem => {
      const date = problem.date || new Date(problem.timestamp).toISOString().split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(problem);
    });

    return groups;
  };

  // Get human-readable date label
  const getDateLabel = (dateString) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (dateString === today) return 'Today';
    if (dateString === yesterday) return 'Yesterday';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  // Get problem icon
  const getProblemIcon = (type) => {
    if (type === 'kick') return '🚨';
    if (type === 'error') return '🔴';
    if (type === 'warning') return '⚠️';
    return 'ℹ️';
  };

  // Get problem color
  const getProblemColor = (type) => {
    if (type === 'kick') return '#dc2626';
    if (type === 'error') return '#ef4444';
    if (type === 'warning') return '#f59e0b';
    return '#3b82f6';
  };

  const filteredProblems = getFilteredProblems();
  const groupedProblems = groupByDate(filteredProblems);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
          <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading problems...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb',
      padding: '40px 20px'
    }}>
      {/* Header */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        marginBottom: '40px'
      }}>
        <h1 style={{ 
          fontSize: '36px', 
          fontWeight: 'bold', 
          color: '#111827',
          marginBottom: '8px'
        }}>
          🚨 All Classroom Issues
        </h1>
        <p style={{ 
          fontSize: '16px', 
          color: '#6b7280'
        }}>
          Monitor and resolve student connection issues across all sessions
        </p>
      </div>

      {/* Filters */}
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        marginBottom: '32px',
        display: 'flex',
        gap: '16px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        {/* Time Filter */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'today', 'week'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: filter === f ? '#3b82f6' : 'white',
                color: filter === f ? 'white' : '#6b7280',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                textTransform: 'capitalize'
              }}
            >
              {f === 'all' ? 'All Time' : f === 'today' ? 'Today' : 'This Week'}
            </button>
          ))}
        </div>

        {/* Show Resolved Toggle */}
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          Show resolved issues
        </label>

        {/* Summary Stats */}
        <div style={{ 
          marginLeft: 'auto',
          padding: '12px 20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          fontSize: '14px',
          color: '#6b7280',
          fontWeight: '600'
        }}>
          {filteredProblems.length} issue{filteredProblems.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Problems List */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {filteredProblems.length === 0 ? (
          <div style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '60px',
            textAlign: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>✨</div>
            <div style={{ fontSize: '24px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
              No issues found!
            </div>
            <div style={{ fontSize: '16px', color: '#6b7280' }}>
              {showResolved 
                ? 'All issues have been resolved.' 
                : 'Everything is running smoothly.'}
            </div>
          </div>
        ) : (
          Object.entries(groupedProblems).map(([date, dateProblems]) => (
            <div key={date} style={{ marginBottom: '32px' }}>
              {/* Date Header */}
              <div style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#111827',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span>📅 {getDateLabel(date)}</span>
                <span style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#6b7280',
                  backgroundColor: '#f3f4f6',
                  padding: '4px 12px',
                  borderRadius: '12px'
                }}>
                  {dateProblems.length} issue{dateProblems.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Problems for this date */}
              {dateProblems.map(problem => (
                <div
                  key={problem.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '24px',
                    marginBottom: '16px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    borderLeft: `4px solid ${getProblemColor(problem.type)}`,
                    opacity: problem.resolved ? 0.6 : 1
                  }}
                >
                  {/* Header Row */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '16px'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '8px'
                      }}>
                        <span style={{ fontSize: '24px' }}>
                          {getProblemIcon(problem.type)}
                        </span>
                        <span style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#111827'
                        }}>
                          {problem.type === 'kick' ? 'Student Kicked' : 
                           problem.type === 'error' ? 'Error' : 
                           problem.type === 'warning' ? 'Warning' : 'Info'}
                        </span>
                        {problem.resolved && (
                          <span style={{
                            padding: '4px 12px',
                            backgroundColor: '#d1fae5',
                            color: '#065f46',
                            fontSize: '12px',
                            fontWeight: '600',
                            borderRadius: '12px'
                          }}>
                            ✓ Resolved
                          </span>
                        )}
                      </div>
                      <div style={{
                        fontSize: '16px',
                        color: '#374151',
                        fontWeight: '500'
                      }}>
                        {problem.message}
                      </div>
                    </div>

                    {!problem.resolved && (
                      <button
                        onClick={() => markResolved(problem.id)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px',
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        Session Code
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827', fontFamily: 'monospace' }}>
                        {problem.sessionCode}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        Student
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                        {problem.studentName || problem.studentId}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        Time
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                        {problem.time || new Date(problem.timestamp).toLocaleTimeString()}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        Lesson
                      </div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                        {problem.lessonId}
                      </div>
                    </div>

                    {problem.siteMode && (
                      <div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                          Site
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                          {problem.siteMode === 'edu' ? 'Classroom' : 'Commercial'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Additional Data (if present) */}
                  {problem.data && Object.keys(problem.data).length > 0 && (
                    <details style={{ marginTop: '16px' }}>
                      <summary style={{
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: '#6b7280',
                        fontWeight: '600',
                        padding: '8px',
                        backgroundColor: '#f3f4f6',
                        borderRadius: '6px'
                      }}>
                        View technical details
                      </summary>
                      <pre style={{
                        marginTop: '12px',
                        padding: '16px',
                        backgroundColor: '#1f2937',
                        color: '#d1d5db',
                        borderRadius: '8px',
                        fontSize: '12px',
                        overflow: 'auto',
                        maxHeight: '300px'
                      }}>
                        {JSON.stringify(problem.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminAllProblems;