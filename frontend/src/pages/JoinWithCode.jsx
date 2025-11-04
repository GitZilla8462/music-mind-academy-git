import React, { useState, useEffect } from 'react';
import { sessionExists } from '../firebase/config';

const JoinWithCode = () => {
  const [code, setCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  
  // Load saved work from localStorage (SAME AS MAIN PAGE)
  const [savedComposition, setSavedComposition] = useState(null);
  const [savedBonusComposition, setSavedBonusComposition] = useState(null);
  const [savedReflection, setSavedReflection] = useState(null);
  const [dawStats, setDawStats] = useState(null);

  // Load ALL saved data from localStorage
  useEffect(() => {
    // Load main composition
    const savedComp = localStorage.getItem('school-beneath-composition');
    if (savedComp) {
      try {
        setSavedComposition(JSON.parse(savedComp));
      } catch (error) {
        console.error('Error loading saved composition:', error);
      }
    }

    // Load bonus composition
    const savedBonus = localStorage.getItem('school-beneath-bonus');
    if (savedBonus) {
      try {
        setSavedBonusComposition(JSON.parse(savedBonus));
      } catch (error) {
        console.error('Error loading bonus composition:', error);
      }
    }

    // Load reflection
    const savedRefl = localStorage.getItem('school-beneath-reflection');
    if (savedRefl) {
      try {
        setSavedReflection(JSON.parse(savedRefl));
      } catch (error) {
        console.error('Error loading saved reflection:', error);
      }
    }

    // Load DAW stats
    const stats = localStorage.getItem('lesson1-daw-stats');
    if (stats) {
      try {
        setDawStats(JSON.parse(stats));
      } catch (error) {
        console.error('Error loading DAW stats:', error);
      }
    }
  }, []);

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
      justifyContent: 'flex-start',
      minHeight: '100vh',
      backgroundColor: '#f0f4f8',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px', marginTop: '40px' }}>
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
        fontSize: '14px',
        marginBottom: '48px'
      }}>
        <p>Don't have a code? Ask your teacher to start a session.</p>
      </div>

      {/* MY SAVED WORK SECTION - Same as main page! */}
      {(savedComposition || savedBonusComposition || savedReflection || dawStats) && (
        <div style={{ 
          maxWidth: '1400px', 
          width: '100%',
          marginTop: '20px'
        }}>
          <h2 style={{ 
            fontSize: '28px',
            fontWeight: '700',
            color: '#1a202c',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            My Saved Work
          </h2>
          
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div>
              {/* Title section */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '12px',
                marginBottom: '20px',
                paddingBottom: '16px',
                borderBottom: '2px solid #e2e8f0'
              }}>
                <div style={{
                  backgroundColor: '#4299e1',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '24px', color: 'white' }}>♪</span>
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#1a202c',
                    margin: 0
                  }}>
                    Lesson 1: School Beneath
                  </h3>
                  <p style={{ 
                    fontSize: '14px',
                    color: '#718096',
                    margin: '4px 0 0 0'
                  }}>
                    Film Music Composition
                  </p>
                </div>
              </div>

              {/* DAW Tutorial Stats */}
              {dawStats && (
                <div style={{ 
                  backgroundColor: '#f7fafc',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '600',
                    color: '#2d3748',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>DAW Tutorial Performance</span>
                  </div>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '12px'
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#718096' }}>Correct Answers</div>
                      <div style={{ 
                        fontSize: '24px', 
                        fontWeight: '700', 
                        color: '#48bb78'
                      }}>
                        {dawStats.correct}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#718096' }}>Incorrect Answers</div>
                      <div style={{ 
                        fontSize: '24px', 
                        fontWeight: '700', 
                        color: '#f56565'
                      }}>
                        {dawStats.incorrect}
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    marginTop: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '12px', color: '#718096' }}>Accuracy Rate</div>
                    <div style={{ 
                      fontSize: '20px', 
                      fontWeight: '700', 
                      color: '#4299e1'
                    }}>
                      {dawStats.correct + dawStats.incorrect > 0 
                        ? Math.round((dawStats.correct / (dawStats.correct + dawStats.incorrect)) * 100)
                        : 0}%
                    </div>
                  </div>
                </div>
              )}

              {/* Main Composition Info */}
              {savedComposition && (
                <>
                  <div style={{ 
                    backgroundColor: '#f0f9ff',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '12px',
                    border: '2px solid #4299e1'
                  }}>
                    <div style={{ 
                      fontSize: '13px', 
                      fontWeight: '600',
                      color: '#2b6cb0',
                      marginBottom: '8px'
                    }}>
                      Main Composition Saved
                    </div>
                    <div style={{ fontSize: '12px', color: '#2c5282' }}>
                      {savedComposition.loopCount} loops • Saved on {new Date(savedComposition.savedAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Requirements Status */}
                  <div style={{ 
                    backgroundColor: '#f7fafc',
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '16px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '12px', color: '#718096', marginBottom: '8px' }}>
                      Requirements Met:
                    </div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        borderRadius: '4px',
                        backgroundColor: savedComposition.requirements.minLoops ? '#c6f6d5' : '#fed7d7',
                        color: savedComposition.requirements.minLoops ? '#22543d' : '#742a2a'
                      }}>
                        {savedComposition.requirements.minLoops ? '✓' : '✗'} Minimum Loops
                      </span>
                      <span style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        borderRadius: '4px',
                        backgroundColor: savedComposition.requirements.layering ? '#c6f6d5' : '#fed7d7',
                        color: savedComposition.requirements.layering ? '#22543d' : '#742a2a'
                      }}>
                        {savedComposition.requirements.layering ? '✓' : '✗'} Layering
                      </span>
                      <span style={{
                        padding: '4px 8px',
                        fontSize: '12px',
                        borderRadius: '4px',
                        backgroundColor: savedComposition.requirements.structure ? '#c6f6d5' : '#fed7d7',
                        color: savedComposition.requirements.structure ? '#22543d' : '#742a2a'
                      }}>
                        {savedComposition.requirements.structure ? '✓' : '✗'} Structure
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Bonus Composition Info */}
              {savedBonusComposition && (
                <div style={{ 
                  backgroundColor: '#fef5e7',
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '16px',
                  border: '2px solid #f6ad55'
                }}>
                  <div style={{ 
                    fontSize: '13px', 
                    fontWeight: '600',
                    color: '#c05621',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span>🎉 Bonus Composition Created!</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#744210' }}>
                    {savedBonusComposition.loopCount} loops • Saved on {new Date(savedBonusComposition.savedAt).toLocaleDateString()}
                  </div>
                </div>
              )}

              {/* Reflection Info */}
              {savedReflection && (
                <div style={{ 
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '12px',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '12px', color: '#718096', marginBottom: '8px' }}>
                    Reflection Completed:
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      borderRadius: '4px',
                      backgroundColor: '#e9d5ff',
                      color: '#5b21b6',
                      fontWeight: '600'
                    }}>
                      ⭐ Two Stars and a Wish
                    </span>
                    <span style={{ fontSize: '12px', color: '#718096' }}>
                      ({savedReflection.reviewType === 'self' ? 'Self-Reflection' : `Partner: ${savedReflection.partnerName}`})
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ 
                borderTop: '1px solid #e2e8f0',
                paddingTop: '16px',
                display: 'flex',
                gap: '12px',
                flexWrap: 'wrap'
              }}>
                {savedComposition && (
                  <button
                    onClick={() => {
                      window.location.href = '/lessons/film-music-project/lesson1?view=saved';
                    }}
                    style={{
                      flex: '1 1 150px',
                      padding: '12px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      backgroundColor: '#4299e1',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#3182ce'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#4299e1'}
                  >
                    <span>🎵 View Main</span>
                  </button>
                )}

                {savedBonusComposition && (
                  <button
                    onClick={() => {
                      window.location.href = '/lessons/film-music-project/lesson1?view=bonus';
                    }}
                    style={{
                      flex: '1 1 150px',
                      padding: '12px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      backgroundColor: '#ed8936',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#dd6b20'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#ed8936'}
                  >
                    <span>🎉 View Bonus</span>
                  </button>
                )}

                {savedReflection && (
                  <button
                    onClick={() => {
                      window.location.href = '/lessons/film-music-project/lesson1?view=reflection';
                    }}
                    style={{
                      flex: '1 1 150px',
                      padding: '12px 20px',
                      fontSize: '14px',
                      fontWeight: '600',
                      backgroundColor: '#9f7aea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#805ad5'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#9f7aea'}
                  >
                    <span>⭐ Reflection</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete ALL your saved work (DAW stats, compositions, and reflection)? This cannot be undone.')) {
                      localStorage.removeItem('school-beneath-composition');
                      localStorage.removeItem('school-beneath-bonus');
                      localStorage.removeItem('school-beneath-reflection');
                      localStorage.removeItem('lesson1-daw-stats');
                      setSavedComposition(null);
                      setSavedBonusComposition(null);
                      setSavedReflection(null);
                      setDawStats(null);
                      alert('All saved work deleted successfully');
                    }
                  }}
                  style={{
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    backgroundColor: '#e53e3e',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#c53030'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#e53e3e'}
                >
                  🗑️ Delete All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JoinWithCode;