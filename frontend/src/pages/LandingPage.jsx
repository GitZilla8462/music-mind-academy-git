// /src/pages/LandingPage.jsx
// Marketing landing page for Music Mind Academy (musicmindacademy.com)
// Teachers apply via Google Form, then sign in at /login after approval

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Google Form URL for pilot program applications
const PILOT_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfgcfEfVoPGYCRmpgyNO0FNPnR9Jc3O-BOhpMTodQhKAHSaSQ/viewform?usp=header';

// Activity data
const activities = [
  {
    title: 'Beat Escape Room',
    description: 'Build beats to unlock puzzles',
    image: '/landingpage/BeatEscapeRoom.png',
    concept: 'Rhythm & Pattern',
    color: '#8b5cf6'
  },
  {
    title: 'Loop Builder',
    description: 'Layer tracks to create music',
    image: '/landingpage/BuildYourBeat.png',
    concept: 'Texture & Layering',
    color: '#06b6d4'
  },
  {
    title: 'Film Scoring DAW',
    description: 'Add music to video clips',
    image: '/landingpage/DigitalAudioWorkstation.png',
    concept: 'Mood & Expression',
    color: '#f59e0b'
  },
  {
    title: 'Listening Map',
    description: 'Draw while listening to music',
    image: '/landingpage/InteractiveListeningMap.png',
    concept: 'Active Listening',
    color: '#10b981'
  },
  {
    title: 'Sports Montage',
    description: 'Score highlight reels with loops',
    image: '/landingpage/SportsMontageComposition.png',
    concept: 'Song Form',
    color: '#ef4444'
  }
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [showPilotModal, setShowPilotModal] = useState(false);

  const handleJoinPilot = () => {
    setShowPilotModal(true);
  };

  const handleContinueToForm = () => {
    window.open(PILOT_FORM_URL, '_blank');
    setShowPilotModal(false);
  };

  const handleTeacherLogin = () => {
    navigate('/login');
  };

  const handleJoinClass = () => {
    navigate('/join');
  };

  return (
    <div className="landing-page" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .landing-page {
          min-height: 100vh;
          background: #fafafa;
          color: #1e293b;
        }

        .font-display {
          font-family: 'Space Grotesk', sans-serif;
        }

        /* Navigation */
        .nav {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .nav-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1rem 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .nav-logo {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #0ea5e9, #0284c7);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
        }

        .nav-brand-text {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .btn {
          padding: 0.625rem 1.25rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .btn-primary {
          background: #0ea5e9;
          color: white;
        }

        .btn-primary:hover {
          background: #0284c7;
          transform: translateY(-1px);
        }

        .btn-login {
          background: #1e293b;
          color: white;
          border: none;
        }

        .btn-login:hover {
          background: #0f172a;
          transform: translateY(-1px);
        }

        .btn-join {
          background: #334155;
          color: white;
          padding: 0.625rem 1.25rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          border: none;
          transition: all 0.2s ease;
        }

        .btn-join:hover {
          background: #1e293b;
          transform: translateY(-1px);
        }

        /* Hero */
        .hero {
          background: linear-gradient(135deg, #0c4a6e 0%, #1e3a5f 100%);
          padding: 3rem 1.5rem 4rem;
          color: white;
        }

        .hero-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: center;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.15);
          padding: 0.5rem 1rem;
          border-radius: 100px;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }

        .hero-badge-dot {
          width: 8px;
          height: 8px;
          background: #4ade80;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .hero h1 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 2.75rem;
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 1rem;
        }

        .hero-highlight {
          color: #f59e0b;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          opacity: 0.9;
          margin-bottom: 0.5rem;
        }

        .hero-bullets {
          list-style: none;
          margin: 1.5rem 0;
        }

        .hero-bullets li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          font-size: 1rem;
          opacity: 0.95;
        }

        .hero-bullets .check {
          color: #4ade80;
          font-weight: bold;
        }

        .hero-cta {
          display: flex;
          gap: 1rem;
          align-items: center;
          margin-top: 2rem;
        }

        .btn-hero {
          background: #f59e0b;
          color: #1e293b;
          padding: 1rem 2rem;
          font-size: 1rem;
          font-weight: 700;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-hero:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(245, 158, 11, 0.4);
        }

        .hero-note {
          font-size: 0.875rem;
          opacity: 0.7;
        }

        .hero-image {
          background: #1e293b;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        .hero-image img {
          width: 100%;
          display: block;
        }

        /* Stats */
        .stats {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          padding: 1.5rem;
        }

        .stats-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: center;
          gap: 4rem;
        }

        .stat {
          text-align: center;
        }

        .stat-number {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 2rem;
          font-weight: 700;
          color: #0ea5e9;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #64748b;
        }

        /* Activities */
        .activities {
          padding: 4rem 1.5rem;
          background: #f8fafc;
        }

        .activities-inner {
          max-width: 1200px;
          margin: 0 auto;
        }

        .section-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .section-header h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .section-header p {
          color: #64748b;
          font-size: 1.125rem;
        }

        .activities-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 1.25rem;
        }

        .activity-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
          transition: all 0.2s ease;
        }

        .activity-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0,0,0,0.1);
        }

        .activity-image {
          width: 100%;
          height: 120px;
          object-fit: cover;
        }

        .activity-content {
          padding: 1rem;
        }

        .activity-concept {
          font-size: 0.7rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }

        .activity-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.95rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .activity-desc {
          font-size: 0.75rem;
          color: #64748b;
          line-height: 1.4;
        }

        /* What Each Lesson Includes */
        .includes {
          padding: 3rem 1.5rem;
          background: white;
        }

        .includes-inner {
          max-width: 900px;
          margin: 0 auto;
        }

        .includes-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }

        .include-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 12px;
        }

        .include-icon {
          font-size: 1.5rem;
        }

        .include-item strong {
          display: block;
          font-size: 0.95rem;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }

        .include-item p {
          font-size: 0.85rem;
          color: #64748b;
          margin: 0;
        }

        /* How It Works */
        .how-it-works {
          padding: 4rem 1.5rem;
          background: white;
        }

        .how-inner {
          max-width: 1000px;
          margin: 0 auto;
        }

        .how-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          align-items: center;
          margin-top: 2rem;
        }

        .how-image {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        }

        .how-image img {
          width: 100%;
          display: block;
        }

        .how-steps {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .how-step {
          display: flex;
          gap: 1rem;
        }

        .step-number {
          width: 36px;
          height: 36px;
          background: #0ea5e9;
          color: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Space Grotesk', sans-serif;
          font-weight: 700;
          flex-shrink: 0;
        }

        .step-content h3 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .step-content p {
          color: #64748b;
          font-size: 0.875rem;
        }

        /* Privacy */
        .privacy {
          padding: 4rem 1.5rem;
          background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
        }

        .privacy-inner {
          max-width: 800px;
          margin: 0 auto;
        }

        .privacy-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
        }

        .privacy-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .privacy-header .shield {
          color: #10b981;
          font-size: 1.5rem;
        }

        .privacy-header h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .privacy-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .privacy-item {
          display: flex;
          gap: 0.75rem;
        }

        .privacy-check {
          width: 24px;
          height: 24px;
          background: #d1fae5;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #10b981;
          flex-shrink: 0;
          font-size: 0.875rem;
        }

        .privacy-item-text h4 {
          font-weight: 600;
          font-size: 0.9375rem;
          margin-bottom: 0.125rem;
        }

        .privacy-item-text p {
          color: #64748b;
          font-size: 0.8125rem;
        }

        .privacy-badges {
          display: flex;
          justify-content: center;
          gap: 2rem;
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e2e8f0;
        }

        .privacy-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8125rem;
          color: #64748b;
        }

        .privacy-badge .shield {
          color: #10b981;
        }

        /* Final CTA */
        .final-cta {
          padding: 5rem 1.5rem;
          background: linear-gradient(135deg, #0c4a6e 0%, #1e3a5f 100%);
          color: white;
          text-align: center;
        }

        .final-cta h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .final-cta p {
          font-size: 1.125rem;
          opacity: 0.9;
          margin-bottom: 2rem;
        }

        /* Footer */
        .footer {
          background: #1e293b;
          color: white;
          padding: 2rem 1.5rem;
        }

        .footer-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .footer-text {
          color: #94a3b8;
          font-size: 0.875rem;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .hero-inner {
            grid-template-columns: 1fr;
          }
          .hero-image {
            display: none;
          }
          .activities-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 768px) {
          .hero h1 {
            font-size: 2rem;
          }
          .hero {
            padding: 2rem 1.25rem 3rem;
          }
          .activities-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .includes-grid {
            grid-template-columns: 1fr;
          }
          .how-grid {
            grid-template-columns: 1fr;
          }
          .privacy-grid {
            grid-template-columns: 1fr;
          }
          .stats-inner {
            gap: 2rem;
            flex-wrap: wrap;
          }
          .footer-inner {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
          .nav-buttons {
            gap: 0.5rem;
          }
          .nav-brand-text {
            font-size: 1.25rem;
          }
          .section-header h2 {
            font-size: 1.5rem;
          }
        }

        @media (max-width: 540px) {
          .hero h1 {
            font-size: 1.625rem;
          }
          .hero-subtitle {
            font-size: 1rem;
          }
          .hero-bullets li {
            font-size: 0.9rem;
          }
          .btn-hero {
            padding: 0.875rem 1.5rem;
            font-size: 0.9rem;
            width: 100%;
            text-align: center;
          }
          .nav-inner {
            padding: 0.75rem 1rem;
            flex-wrap: wrap;
            gap: 0.75rem;
          }
          .nav-brand-text {
            font-size: 1.1rem;
          }
          .nav-buttons {
            width: 100%;
            justify-content: stretch;
          }
          .nav-buttons .btn {
            flex: 1;
            text-align: center;
            padding: 0.625rem 0.5rem;
            font-size: 0.8rem;
            min-height: 44px;
          }
          .activities-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
          .activity-content {
            padding: 0.75rem;
          }
          .activity-image {
            height: 90px;
          }
          .stats-inner {
            gap: 1.25rem;
            justify-content: space-around;
          }
          .stat-number {
            font-size: 1.5rem;
          }
          .stat-label {
            font-size: 0.75rem;
          }
          .section-header h2 {
            font-size: 1.375rem;
          }
          .section-header p {
            font-size: 1rem;
          }
          .activities {
            padding: 2.5rem 1rem;
          }
          .includes {
            padding: 2.5rem 1rem;
          }
        }

        @media (max-width: 380px) {
          .hero h1 {
            font-size: 1.5rem;
          }
          .nav-brand-text {
            display: none;
          }
          .activities-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Navigation */}
      <nav className="nav">
        <div className="nav-inner">
          <div className="nav-brand">
            <img
              src="/MusicMindAcademyLogo.png"
              alt="Music Mind Academy"
              style={{ height: '56px', width: 'auto' }}
            />
            <span className="nav-brand-text">Music Mind Academy</span>
          </div>
          <div className="nav-buttons" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <button onClick={handleJoinClass} className="btn btn-join">
              Join Class
            </button>
            <button onClick={handleTeacherLogin} className="btn btn-login">
              Teacher Login
            </button>
            <button onClick={handleJoinPilot} className="btn btn-primary">
              Join the Pilot
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="hero-badge-dot"></span>
              March–June pilot — Spots available
            </div>
            <h1>
              No-Prep Music Lessons That <span className="hero-highlight">Actually Engage</span> Middle Schoolers
            </h1>
            <p className="hero-subtitle">
              Interactive composition projects. Click through slides. Students create music.
            </p>

            <ul className="hero-bullets">
              <li><span className="check">✓</span> Works on Chromebooks - no downloads</li>
              <li><span className="check">✓</span> Two modes - Quick Join or Classroom Mode</li>
              <li><span className="check">✓</span> Ready to teach tomorrow - no planning</li>
            </ul>

            <div className="hero-cta">
              <button onClick={handleJoinPilot} className="btn-hero">
                Join the Pilot
              </button>
              <span className="hero-note">Free pilot: March – June 2026</span>
            </div>
          </div>

          <div className="hero-image">
            <img src="/landingpage/LandingPageTopPicture.png" alt="Music Mind Academy platform" />
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="stats">
        <div className="stats-inner">
          <div className="stat">
            <div className="stat-number">5</div>
            <div className="stat-label">Complete Lessons</div>
          </div>
          <div className="stat">
            <div className="stat-number">150+</div>
            <div className="stat-label">Audio Loops</div>
          </div>
          <div className="stat">
            <div className="stat-number">35</div>
            <div className="stat-label">Minutes Each</div>
          </div>
          <div className="stat">
            <div className="stat-number">0</div>
            <div className="stat-label">Prep Required</div>
          </div>
        </div>
      </section>

      {/* Activities Section */}
      <section className="activities">
        <div className="activities-inner">
          <div className="section-header">
            <h2>What Students Will Create</h2>
            <p>Each lesson teaches a music concept through hands-on composition</p>
          </div>

          <div className="activities-grid">
            {activities.map((activity, index) => (
              <div key={index} className="activity-card">
                <img
                  src={activity.image}
                  alt={activity.title}
                  className="activity-image"
                />
                <div className="activity-content">
                  <div className="activity-concept" style={{ color: activity.color }}>
                    {activity.concept}
                  </div>
                  <div className="activity-title">{activity.title}</div>
                  <div className="activity-desc">{activity.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What Each Lesson Includes */}
      <section className="includes">
        <div className="includes-inner">
          <div className="section-header">
            <h2>What Each Lesson Includes</h2>
          </div>

          <div className="includes-grid">
            <div className="include-item">
              <span className="include-icon">📋</span>
              <div>
                <strong>Standards-Aligned Curriculum</strong>
                <p>Mapped to National Core Arts Standards</p>
              </div>
            </div>

            <div className="include-item">
              <span className="include-icon">🖥️</span>
              <div>
                <strong>Interactive Teacher Slides</strong>
                <p>Click-through presentation with built-in videos</p>
              </div>
            </div>

            <div className="include-item">
              <span className="include-icon">🎵</span>
              <div>
                <strong>DAW Composition Project</strong>
                <p>150+ loops and 15+ unique videos to score</p>
              </div>
            </div>

            <div className="include-item">
              <span className="include-icon">🎮</span>
              <div>
                <strong>Bonus Activities & Games</strong>
                <p>Escape rooms, mysteries, and listening maps</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="how-inner">
          <div className="section-header">
            <h2>Built for Busy Teachers</h2>
            <p>Interactive slides, timers, and class management built in</p>
          </div>

          <div className="how-grid">
            <div className="how-image">
              <img src="/landingpage/TeacherSlides.png" alt="Teacher control panel" />
            </div>

            <div className="how-steps">
              <div className="how-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>Start a Session</h3>
                  <p>One click generates a class code. Share it and students join.</p>
                </div>
              </div>
              <div className="how-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>Click Through Slides</h3>
                  <p>Interactive presentation with videos and demos built in.</p>
                </div>
              </div>
              <div className="how-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>Students Create</h3>
                  <p>Unlock activities and see student progress in real-time.</p>
                </div>
              </div>
              <div className="how-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <h3>Built-in Reflection</h3>
                  <p>Each lesson ends with guided reflection and self-assessment.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="privacy">
        <div className="privacy-inner">
          <div className="privacy-card">
            <div className="privacy-header">
              <span className="shield">🛡️</span>
              <h2>Student Privacy First</h2>
            </div>

            <div className="privacy-grid">
              <div className="privacy-item">
                <div className="privacy-check">✓</div>
                <div className="privacy-item-text">
                  <h4>Two Session Modes</h4>
                  <p>Teachers choose Quick Join or Classroom Mode per class</p>
                </div>
              </div>
              <div className="privacy-item">
                <div className="privacy-check">✓</div>
                <div className="privacy-item-text">
                  <h4>Quick Join</h4>
                  <p>Students join by class code, no accounts or real names needed</p>
                </div>
              </div>
              <div className="privacy-item">
                <div className="privacy-check">✓</div>
                <div className="privacy-item-text">
                  <h4>Classroom Mode</h4>
                  <p>Students log in to save work, get grades, and track progress</p>
                </div>
              </div>
              <div className="privacy-item">
                <div className="privacy-check">✓</div>
                <div className="privacy-item-text">
                  <h4>No Data Selling or Ads</h4>
                  <p>No tracking, no third parties, DPA available</p>
                </div>
              </div>
            </div>

            <div className="privacy-badges">
              <div className="privacy-badge"><span className="shield">🛡️</span> FERPA</div>
              <div className="privacy-badge"><span className="shield">🛡️</span> COPPA</div>
              <div className="privacy-badge"><span className="shield">🛡️</span> NY Ed Law 2-D</div>
              <div className="privacy-badge"><span className="shield">🛡️</span> PIPEDA (Canada)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="final-cta">
        <h2>Join the March–June Pilot</h2>
        <p>
          Try Music Mind Academy free with your classes this spring.
          <br />
          Spots are limited — apply now to get started.
        </p>
        <button onClick={handleJoinPilot} className="btn-hero">
          Apply Now
        </button>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <img
              src="/MusicMindAcademyLogo.png"
              alt="Music Mind Academy"
              style={{ height: '32px', width: 'auto' }}
            />
            <span>Music Mind Academy</span>
          </div>
          <div className="footer-text">Made by a fellow music teacher in Central New York</div>
          <div className="footer-text">Questions? Email <a href="mailto:rob@musicmindacademy.com" style={{ color: '#60a5fa', textDecoration: 'none' }}>rob@musicmindacademy.com</a></div>
          <div className="footer-text" style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="/privacy" style={{ color: '#60a5fa', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="/student-privacy" style={{ color: '#60a5fa', textDecoration: 'none' }}>Student Data Privacy</a>
            <a href="/terms" style={{ color: '#60a5fa', textDecoration: 'none' }}>Terms of Service</a>
          </div>
        </div>
      </footer>

      {/* Pilot Application Modal */}
      {showPilotModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={() => setShowPilotModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🎵</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
                Join the Pilot
              </h2>
              <p style={{ color: '#64748b', fontSize: '1rem' }}>
                Try Music Mind Academy free with your classes this spring.
              </p>
            </div>

            <div style={{
              backgroundColor: '#f8fafc',
              borderRadius: '0.75rem',
              padding: '1.25rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>📅</span>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>Pilot window</div>
                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>March – June 2026</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>🆓</span>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>100% free</div>
                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>No cost during the pilot program</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.25rem' }}>📧</span>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>What happens next</div>
                    <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Fill out the form and I'll get you set up</div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={handleContinueToForm}
                style={{
                  width: '100%',
                  padding: '0.875rem 1.5rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#2563eb'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#3b82f6'}
              >
                Continue to Application →
              </button>
              <button
                onClick={() => setShowPilotModal(false)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: 'transparent',
                  color: '#64748b',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
