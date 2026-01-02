// /src/pages/PrivacyPolicy.jsx
// General Privacy Policy for Music Mind Academy
// Last updated: January 2026

import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      minHeight: '100vh',
      backgroundColor: '#fafafa'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');

        .policy-content h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }

        .policy-content h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #334155;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }

        .policy-content p {
          color: #475569;
          line-height: 1.7;
          margin-bottom: 1rem;
        }

        .policy-content ul {
          color: #475569;
          line-height: 1.7;
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }

        .policy-content li {
          margin-bottom: 0.5rem;
        }

        .policy-content a {
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
        <div className="policy-content">
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#1e293b',
              marginBottom: '0.5rem'
            }}>
              Privacy Policy
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>
              Last updated: January 2026
            </p>
          </div>

          <p>
            Music Mind Academy ("we", "us", or "our") is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, and protect information when you use
            our website and services at musicmindacademy.com.
          </p>

          <p>
            <strong>For specific information about student data privacy, please see our
            <a href="/student-privacy"> Student Data Privacy</a> page.</strong>
          </p>

          <h2>1. Information We Collect</h2>

          <h3>Information from Teachers</h3>
          <p>When teachers create an account, we collect:</p>
          <ul>
            <li><strong>Email address:</strong> From Google or Microsoft sign-in</li>
            <li><strong>Display name:</strong> From your Google or Microsoft account</li>
            <li><strong>Profile photo:</strong> From your Google or Microsoft account (optional)</li>
            <li><strong>Usage data:</strong> Session history, lessons used, number of students joined</li>
          </ul>

          <h3>Information from Students</h3>
          <p>We collect minimal information from students:</p>
          <ul>
            <li><strong>Nickname:</strong> A name chosen by the student (e.g., "Wild Panda") - not linked to real identity</li>
            <li><strong>Activity data:</strong> Scores and progress during active sessions</li>
          </ul>
          <p>We do NOT collect student emails, real names, or any personally identifiable information.</p>

          <h3>Information Collected Automatically</h3>
          <p>We do NOT use cookies, Google Analytics, or third-party tracking services. We do not collect:</p>
          <ul>
            <li>IP addresses for tracking purposes</li>
            <li>Browser fingerprints</li>
            <li>Location data</li>
            <li>Device identifiers</li>
          </ul>

          <h2>2. How We Use Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide and maintain our educational services</li>
            <li>Allow teachers to manage classroom sessions</li>
            <li>Display student progress to teachers during sessions</li>
            <li>Improve our services and develop new features</li>
            <li>Communicate with teachers about their accounts</li>
          </ul>

          <h2>3. How We Share Information</h2>
          <p>We do NOT sell, rent, or share personal information with third parties for marketing purposes.</p>
          <p>We may share information only in the following circumstances:</p>
          <ul>
            <li><strong>Service providers:</strong> We use Firebase (Google Cloud) for database and authentication services</li>
            <li><strong>Legal requirements:</strong> If required by law or to protect our rights</li>
            <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
          </ul>

          <h2>4. Data Storage and Security</h2>
          <p>
            Teacher account data is stored in Firebase (Google Cloud Platform), which provides
            enterprise-grade security and is compliant with major security standards.
          </p>
          <p>
            Student work (compositions) is stored locally on the student's device using browser
            localStorage and is not transmitted to our servers unless explicitly shared.
          </p>
          <p>All data transmission uses HTTPS encryption.</p>

          <h2>5. Data Retention</h2>
          <ul>
            <li><strong>Teacher accounts:</strong> Retained until the teacher requests deletion</li>
            <li><strong>Session data:</strong> Retained for teacher review; may be deleted upon request</li>
            <li><strong>Student data:</strong> Session data is accessible during active sessions; compositions stored locally on student devices</li>
          </ul>

          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of the data we hold about you</li>
            <li><strong>Correction:</strong> Request correction of inaccurate data</li>
            <li><strong>Deletion:</strong> Request deletion of your data</li>
            <li><strong>Portability:</strong> Request your data in a portable format</li>
          </ul>
          <p>To exercise these rights, contact us at <a href="mailto:rob@musicmindacademy.com">rob@musicmindacademy.com</a>.</p>

          <h2>7. Children's Privacy</h2>
          <p>
            Music Mind Academy is designed for use in educational settings with students of all ages.
            We comply with the Children's Online Privacy Protection Act (COPPA) by:
          </p>
          <ul>
            <li>Not collecting personal information from students</li>
            <li>Not requiring student accounts or email addresses</li>
            <li>Allowing students to participate using only self-chosen nicknames</li>
            <li>Relying on teacher/school consent for classroom use</li>
          </ul>
          <p>
            For more details, see our <a href="/student-privacy">Student Data Privacy</a> page.
          </p>

          <h2>8. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li><strong>Firebase (Google Cloud):</strong> Database and authentication</li>
            <li><strong>Google OAuth:</strong> Teacher sign-in option</li>
            <li><strong>Microsoft OAuth:</strong> Teacher sign-in option</li>
          </ul>
          <p>We do NOT use Google Analytics, Facebook Pixel, or any advertising or tracking services.</p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify users of significant
            changes by posting a notice on our website. Your continued use of our services after
            changes are posted constitutes acceptance of the updated policy.
          </p>

          <h2>10. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us:</p>
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
            <a href="/student-privacy">Student Data Privacy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/">Home</a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
