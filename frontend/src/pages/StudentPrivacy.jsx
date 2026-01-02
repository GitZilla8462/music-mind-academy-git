// /src/pages/StudentPrivacy.jsx
// Student Data Privacy page for IT departments and administrators
// Last updated: January 2026

import React from 'react';
import { useNavigate } from 'react-router-dom';

const StudentPrivacy = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      minHeight: '100vh',
      backgroundColor: '#fafafa'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');

        .privacy-content h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }

        .privacy-content h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #334155;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }

        .privacy-content p {
          color: #475569;
          line-height: 1.7;
          margin-bottom: 1rem;
        }

        .privacy-content ul, .privacy-content ol {
          color: #475569;
          line-height: 1.7;
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }

        .privacy-content li {
          margin-bottom: 0.5rem;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0 1.5rem 0;
        }

        .data-table th {
          background: #f1f5f9;
          padding: 0.75rem 1rem;
          text-align: left;
          font-weight: 600;
          color: #334155;
          border: 1px solid #e2e8f0;
        }

        .data-table td {
          padding: 0.75rem 1rem;
          border: 1px solid #e2e8f0;
          color: #475569;
        }

        .highlight-box {
          background: #ecfdf5;
          border: 1px solid #6ee7b7;
          border-radius: 8px;
          padding: 1.25rem;
          margin: 1.5rem 0;
        }

        .highlight-box.blue {
          background: #eff6ff;
          border-color: #93c5fd;
        }

        .compliance-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin: 1.5rem 0;
        }

        .compliance-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: white;
          border: 1px solid #e2e8f0;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          font-weight: 500;
          color: #334155;
        }

        @media (max-width: 640px) {
          .data-table {
            font-size: 0.875rem;
          }
          .data-table th, .data-table td {
            padding: 0.5rem;
          }
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
        <div className="privacy-content">
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '2.5rem',
              fontWeight: 700,
              color: '#1e293b',
              marginBottom: '0.5rem'
            }}>
              Student Data Privacy
            </h1>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>
              Last updated: January 2026 · For IT Administrators and School Districts
            </p>
          </div>

          {/* Quick Summary Box */}
          <div className="highlight-box">
            <h3 style={{ marginTop: 0, color: '#065f46' }}>Quick Summary</h3>
            <p style={{ marginBottom: 0 }}>
              Music Mind Academy is designed with student privacy as a core principle. We collect <strong>no student emails</strong>,
              require <strong>no student accounts</strong>, and students are identified only by <strong>nicknames they choose themselves</strong>.
              Student work saves locally on their own device. We do not sell data, show ads, or use third-party tracking.
            </p>
          </div>

          {/* Compliance Badges */}
          <div className="compliance-badges">
            <div className="compliance-badge">FERPA Compliant</div>
            <div className="compliance-badge">COPPA Compliant</div>
            <div className="compliance-badge">NY Ed Law 2-D Compliant</div>
            <div className="compliance-badge">No Ads</div>
            <div className="compliance-badge">No Data Selling</div>
          </div>

          {/* What We Collect */}
          <h2>What Student Data We Collect</h2>

          <table className="data-table">
            <thead>
              <tr>
                <th>Data Type</th>
                <th>Collected?</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Student Real Names</td>
                <td style={{ color: '#16a34a', fontWeight: 600 }}>No</td>
                <td>Never collected</td>
              </tr>
              <tr>
                <td>Student Email Addresses</td>
                <td style={{ color: '#16a34a', fontWeight: 600 }}>No</td>
                <td>Never collected</td>
              </tr>
              <tr>
                <td>Student Accounts/Logins</td>
                <td style={{ color: '#16a34a', fontWeight: 600 }}>No</td>
                <td>Not required - students join with class code only</td>
              </tr>
              <tr>
                <td>Student Nicknames</td>
                <td style={{ color: '#d97706', fontWeight: 600 }}>Yes</td>
                <td>Student-chosen nicknames (e.g., "Wild Panda") - not linked to real identity</td>
              </tr>
              <tr>
                <td>Activity Scores/Progress</td>
                <td style={{ color: '#d97706', fontWeight: 600 }}>Yes</td>
                <td>Associated with nickname only, visible to teacher during session</td>
              </tr>
              <tr>
                <td>Compositions/Work</td>
                <td style={{ color: '#16a34a', fontWeight: 600 }}>Local Only</td>
                <td>Saved to student's device (localStorage), not our servers</td>
              </tr>
            </tbody>
          </table>

          <h3>Why Nicknames Are Not PII</h3>
          <p>
            Students choose their own nicknames when joining a session (examples: "Wild Panda", "Music Star 123").
            These nicknames are:
          </p>
          <ul>
            <li>Not linked to any real identity information</li>
            <li>Not connected to email, school name, or any other identifier</li>
            <li>Chosen by the student themselves</li>
            <li>Unable to be traced back to an actual individual without external information we don't collect</li>
          </ul>

          {/* What We Don't Do */}
          <h2>What We Do NOT Do</h2>
          <ul>
            <li><strong>We do not sell student data</strong> - ever, to anyone</li>
            <li><strong>We do not show advertisements</strong> to students</li>
            <li><strong>We do not use third-party tracking</strong> (no Google Analytics, no Facebook Pixel)</li>
            <li><strong>We do not use cookies</strong> for tracking</li>
            <li><strong>We do not share data with third parties</strong> for marketing</li>
            <li><strong>We do not build student profiles</strong> for any purpose</li>
            <li><strong>We do not use student data for AI training</strong></li>
          </ul>

          {/* How It Works */}
          <h2>How Music Mind Academy Works</h2>

          <h3>For Students</h3>
          <ol>
            <li><strong>Teacher starts a session</strong> and gets a 6-character class code (e.g., "TIGER")</li>
            <li><strong>Students go to musicmindacademy.com</strong> and enter the class code</li>
            <li><strong>Students choose a nickname</strong> (e.g., "Piano Dreams") - no login required</li>
            <li><strong>Students complete activities</strong> - work saves to their own device</li>
            <li><strong>Session ends</strong> - student data is only accessible during active session</li>
          </ol>

          <h3>For Teachers</h3>
          <p>
            Teachers create accounts using Google or Microsoft sign-in. Teacher accounts store:
          </p>
          <ul>
            <li>Email address (from Google/Microsoft OAuth)</li>
            <li>Display name</li>
            <li>Session history and usage analytics</li>
          </ul>

          {/* Data Storage */}
          <h2>Data Storage and Security</h2>

          <table className="data-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Where Stored</th>
                <th>Who Can Access</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Student compositions (drafts)</td>
                <td>Student's device only (localStorage)</td>
                <td>Student only</td>
              </tr>
              <tr>
                <td>Student nicknames + scores</td>
                <td>Firebase (Google Cloud)</td>
                <td>Teacher during active session</td>
              </tr>
              <tr>
                <td>Teacher accounts</td>
                <td>Firebase (Google Cloud)</td>
                <td>Teacher only (own account)</td>
              </tr>
            </tbody>
          </table>

          <h3>Security Measures</h3>
          <ul>
            <li><strong>Encryption in transit:</strong> All data transmitted over HTTPS/TLS</li>
            <li><strong>Firebase Security Rules:</strong> Database access restricted by role</li>
            <li><strong>No persistent student identifiers:</strong> Students are not tracked across sessions</li>
            <li><strong>Minimal data collection:</strong> We only collect what's necessary for the service to function</li>
          </ul>

          {/* Legal Compliance */}
          <h2>Legal Compliance</h2>

          <h3>FERPA (Family Educational Rights and Privacy Act)</h3>
          <p>
            Because we do not collect student education records or personally identifiable information,
            FERPA's restrictions on disclosure do not apply in the traditional sense. However, we operate
            as a "school official" with a legitimate educational interest when teachers use our platform,
            and we limit data use to educational purposes only.
          </p>

          <h3>COPPA (Children's Online Privacy Protection Act)</h3>
          <p>
            COPPA requires parental consent before collecting personal information from children under 13.
            Music Mind Academy does not collect personal information from students:
          </p>
          <ul>
            <li>No email addresses collected from students</li>
            <li>No real names collected</li>
            <li>Nicknames are not considered PII under COPPA as they cannot identify a specific child</li>
            <li>Teacher consent (acting as agent of the school) covers classroom use</li>
          </ul>

          <h3>New York Education Law 2-D</h3>
          <p>
            NY Ed Law 2-D protects student data from unauthorized disclosure and commercial use.
            Music Mind Academy complies by:
          </p>
          <ul>
            <li>Not selling or using student data for commercial purposes</li>
            <li>Not sharing data with third parties for non-educational purposes</li>
            <li>Limiting data collection to what's necessary for the educational service</li>
            <li>Being willing to sign Data Privacy Agreements (DPAs) with districts that require them</li>
          </ul>

          {/* Data Privacy Agreements */}
          <div className="highlight-box blue">
            <h3 style={{ marginTop: 0, color: '#1e40af' }}>Data Privacy Agreements</h3>
            <p>
              If your district requires a signed Data Privacy Agreement (DPA), we are happy to work with you.
              We support the <strong>SDPC National Data Privacy Agreement (NDPA)</strong> format used by
              school districts across the country.
            </p>
            <p style={{ marginBottom: 0 }}>
              Contact us at <a href="mailto:rob@musicmindacademy.com" style={{ color: '#2563eb' }}>rob@musicmindacademy.com</a> to
              discuss DPA requirements.
            </p>
          </div>

          {/* Data Retention */}
          <h2>Data Retention</h2>
          <ul>
            <li><strong>Student session data:</strong> Retained only during active session; accessible to teacher for review</li>
            <li><strong>Student compositions (on device):</strong> Controlled by student; can be cleared by clearing browser data</li>
            <li><strong>Teacher accounts:</strong> Retained until teacher requests deletion</li>
          </ul>

          <h3>Data Deletion Requests</h3>
          <p>
            To request deletion of any data, contact us at <a href="mailto:rob@musicmindacademy.com" style={{ color: '#2563eb' }}>rob@musicmindacademy.com</a>.
            We will respond within 30 days.
          </p>

          {/* FAQ */}
          <h2>Frequently Asked Questions</h2>

          <h3>Can you identify individual students?</h3>
          <p>
            No. We only see student-chosen nicknames like "Wild Panda." Without additional information
            (which we don't collect), there is no way to connect a nickname to a real student.
          </p>

          <h3>Do students need to create accounts?</h3>
          <p>
            No. Students join sessions using only a class code and a nickname. No registration, no email, no password.
          </p>

          <h3>Is student work sent to your servers?</h3>
          <p>
            Student compositions save to their own device (browser localStorage). Work is only sent to our
            servers if a student explicitly chooses to share it, and even then it's associated only with their nickname.
          </p>

          <h3>Do you use AI or machine learning on student data?</h3>
          <p>
            No. We do not use student data for AI training, machine learning, or any automated decision-making.
          </p>

          <h3>What third-party services do you use?</h3>
          <p>
            We use Firebase (Google Cloud) for database and authentication. Teacher accounts authenticate
            via Google or Microsoft OAuth. We do not use analytics services, advertising networks, or
            any other third-party services that process student data.
          </p>

          {/* Contact */}
          <h2>Contact Us</h2>
          <p>
            For privacy questions, DPA requests, or data deletion requests:
          </p>
          <p>
            <strong>Robert Taube</strong><br />
            Founder, Music Mind Academy<br />
            Email: <a href="mailto:rob@musicmindacademy.com" style={{ color: '#2563eb' }}>rob@musicmindacademy.com</a>
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
            <a href="/privacy" style={{ color: '#2563eb', textDecoration: 'none' }}>Privacy Policy</a>
            <a href="/terms" style={{ color: '#2563eb', textDecoration: 'none' }}>Terms of Service</a>
            <a href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>Home</a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentPrivacy;
