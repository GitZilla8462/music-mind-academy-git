// /src/pages/TermsOfService.jsx
// Terms of Service for Music Mind Academy
// Last updated: January 2026

import React from 'react';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      minHeight: '100vh',
      backgroundColor: '#fafafa'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');

        .terms-content h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }

        .terms-content h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #334155;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }

        .terms-content p {
          color: #475569;
          line-height: 1.7;
          margin-bottom: 1rem;
        }

        .terms-content ul {
          color: #475569;
          line-height: 1.7;
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }

        .terms-content li {
          margin-bottom: 0.5rem;
        }

        .terms-content a {
          color: #2563eb;
        }
      `}</style>

      {/* Navigation */}
      <nav style={{
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div
            onClick={() => navigate('/')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}>
              <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#1e293b'
            }}>
              Music Mind Academy
            </span>
          </div>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              background: 'white',
              color: '#334155',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            ← Back to Home
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '2rem 1.5rem 4rem'
      }}>
        <div className="terms-content">
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#1e293b',
              marginBottom: '0.5rem'
            }}>
              Terms of Service
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>
              Last updated: January 2026
            </p>
          </div>

          <p>
            Welcome to Music Mind Academy. These Terms of Service ("Terms") govern your use of our
            website and services at musicmindacademy.com (the "Service"). By using our Service,
            you agree to these Terms.
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using Music Mind Academy, you agree to be bound by these Terms and our
            <a href="/privacy"> Privacy Policy</a>. If you do not agree to these Terms, please do not use our Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            Music Mind Academy is a web-based music education platform designed for middle school
            general music classes. The Service includes:
          </p>
          <ul>
            <li>Interactive music composition activities</li>
            <li>Digital Audio Workstation (DAW) tools</li>
            <li>Lesson content and teacher presentation materials</li>
            <li>Classroom session management tools</li>
            <li>Student progress tracking</li>
          </ul>

          <h2>3. User Accounts</h2>

          <h3>Teacher Accounts</h3>
          <p>
            Teachers may create accounts using Google or Microsoft sign-in. You are responsible for:
          </p>
          <ul>
            <li>Maintaining the security of your account</li>
            <li>All activities that occur under your account</li>
            <li>Ensuring your use complies with your school or district policies</li>
          </ul>

          <h3>Student Access</h3>
          <p>
            Students access the Service through session codes provided by their teacher. Students
            do not create accounts and are not required to provide any personal information beyond
            a self-chosen nickname.
          </p>

          <h2>4. Acceptable Use</h2>
          <p>You agree NOT to:</p>
          <ul>
            <li>Use the Service for any unlawful purpose</li>
            <li>Share content that is offensive, harmful, or inappropriate for educational settings</li>
            <li>Attempt to gain unauthorized access to any part of the Service</li>
            <li>Interfere with or disrupt the Service or servers</li>
            <li>Use the Service to collect information about other users without their consent</li>
            <li>Use automated means (bots, scrapers) to access the Service</li>
            <li>Reverse engineer or attempt to extract source code from the Service</li>
          </ul>

          <h2>5. Content and Intellectual Property</h2>

          <h3>Our Content</h3>
          <p>
            Music Mind Academy owns or licenses all content provided through the Service, including
            lessons, audio loops, images, and software. This content is protected by copyright and
            other intellectual property laws.
          </p>

          <h3>User Content</h3>
          <p>
            Teachers and students may create content using our tools (compositions, reflections, etc.).
            You retain ownership of content you create. By using the Service, you grant us a license
            to host and display your content as necessary to provide the Service.
          </p>

          <h3>Audio Loops License</h3>
          <p>
            Audio loops provided in Music Mind Academy are licensed for educational use within our
            platform. They may not be extracted, downloaded, or used outside of Music Mind Academy
            without separate licensing.
          </p>

          <h2>6. Educational Use</h2>
          <p>
            Music Mind Academy is designed for educational purposes in K-12 school settings. Teachers
            are responsible for ensuring their use complies with their school or district's policies
            regarding educational technology.
          </p>
          <p>
            If your district requires a Data Privacy Agreement (DPA), please contact us at
            <a href="mailto:rob@musicmindacademy.com"> rob@musicmindacademy.com</a>.
          </p>

          <h2>7. Subscription and Payment</h2>
          <p>
            Music Mind Academy may offer free and paid subscription tiers. For paid subscriptions:
          </p>
          <ul>
            <li>Payment is due at the start of the subscription period</li>
            <li>Subscriptions automatically renew unless canceled</li>
            <li>Refunds are handled on a case-by-case basis</li>
            <li>We reserve the right to change pricing with 30 days notice</li>
          </ul>

          <h2>8. Disclaimer of Warranties</h2>
          <p>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
            EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED,
            ERROR-FREE, OR SECURE.
          </p>

          <h2>9. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, MUSIC MIND ACADEMY SHALL NOT BE LIABLE FOR
            ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS
            OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY.
          </p>

          <h2>10. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Music Mind Academy and its owner from any
            claims, damages, or expenses arising from your use of the Service or violation of
            these Terms.
          </p>

          <h2>11. Termination</h2>
          <p>
            We may suspend or terminate your access to the Service at any time for violation of
            these Terms or for any other reason. You may terminate your account at any time by
            contacting us.
          </p>
          <p>
            Upon termination, your right to use the Service will cease immediately. Provisions
            of these Terms that by their nature should survive termination will survive.
          </p>

          <h2>12. Changes to Terms</h2>
          <p>
            We may modify these Terms at any time. We will notify users of significant changes
            by posting a notice on our website. Your continued use of the Service after changes
            are posted constitutes acceptance of the modified Terms.
          </p>

          <h2>13. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the State of New York, United States,
            without regard to conflict of law principles.
          </p>

          <h2>14. Contact Information</h2>
          <p>
            If you have questions about these Terms, please contact us:
          </p>
          <p>
            <strong>Robert Taube</strong><br />
            Founder, Music Mind Academy<br />
            Email: <a href="mailto:rob@musicmindacademy.com">rob@musicmindacademy.com</a>
          </p>

          {/* Footer Links */}
          <div style={{
            marginTop: '3rem',
            paddingTop: '2rem',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            gap: '2rem',
            flexWrap: 'wrap'
          }}>
            <a href="/privacy">Privacy Policy</a>
            <a href="/student-privacy">Student Data Privacy</a>
            <a href="/">Home</a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TermsOfService;
