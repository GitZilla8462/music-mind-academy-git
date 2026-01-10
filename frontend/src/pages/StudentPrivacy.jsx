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

        .highlight-box.amber {
          background: #fffbeb;
          border-color: #fcd34d;
        }

        .it-quick-ref {
          background: #1e293b;
          color: white;
          border-radius: 12px;
          padding: 1.5rem;
          margin: 1.5rem 0;
        }

        .it-quick-ref h3 {
          color: white;
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .it-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem 2rem;
        }

        .it-item {
          display: flex;
          justify-content: space-between;
          padding: 0.25rem 0;
          border-bottom: 1px solid #334155;
        }

        .it-item-label {
          color: #94a3b8;
        }

        .it-item-value {
          font-weight: 600;
        }

        .it-item-value.yes {
          color: #4ade80;
        }

        .it-item-value.no {
          color: #4ade80;
        }

        .it-domains {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #334155;
        }

        .it-domains-title {
          color: #94a3b8;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }

        .it-domain-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .it-domain {
          background: #334155;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.875rem;
        }

        .download-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          padding: 0.75rem 1.25rem;
          background: #3b82f6;
          color: white;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.875rem;
          transition: background 0.2s;
        }

        .download-btn:hover {
          background: #2563eb;
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
          .it-grid {
            grid-template-columns: 1fr;
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

          {/* IT Quick Reference Box */}
          <div className="it-quick-ref">
            <h3>⚡ Quick Reference for IT Administrators</h3>
            <div className="it-grid">
              <div className="it-item">
                <span className="it-item-label">Student PII Collected</span>
                <span className="it-item-value no">NONE</span>
              </div>
              <div className="it-item">
                <span className="it-item-label">Student Accounts Required</span>
                <span className="it-item-value no">NO</span>
              </div>
              <div className="it-item">
                <span className="it-item-label">Student Email Required</span>
                <span className="it-item-value no">NO</span>
              </div>
              <div className="it-item">
                <span className="it-item-label">Data Sold to Third Parties</span>
                <span className="it-item-value no">NO</span>
              </div>
              <div className="it-item">
                <span className="it-item-label">Advertising</span>
                <span className="it-item-value no">NONE</span>
              </div>
              <div className="it-item">
                <span className="it-item-label">AI Training on Student Data</span>
                <span className="it-item-value no">NO</span>
              </div>
              <div className="it-item">
                <span className="it-item-label">FERPA Compliant</span>
                <span className="it-item-value yes">YES</span>
              </div>
              <div className="it-item">
                <span className="it-item-label">COPPA Compliant</span>
                <span className="it-item-value yes">YES</span>
              </div>
              <div className="it-item">
                <span className="it-item-label">DPA Available</span>
                <span className="it-item-value yes">YES</span>
              </div>
              <div className="it-item">
                <span className="it-item-label">District SSO/Clever/ClassLink</span>
                <span className="it-item-value">NOT REQUIRED</span>
              </div>
            </div>
            <div className="it-domains">
              <div className="it-domains-title">Domains to Whitelist:</div>
              <div className="it-domain-list">
                <span className="it-domain">musicmindacademy.com</span>
                <span className="it-domain">*.firebaseapp.com</span>
                <span className="it-domain">*.firebaseio.com</span>
              </div>
            </div>
            <a href="/MusicMindAcademy_IT_Privacy_Summary.pdf" className="download-btn" download>
              📄 Download IT Summary (PDF)
            </a>
          </div>

          {/* Quick Summary Box */}
          <div className="highlight-box">
            <h3 style={{ marginTop: 0, color: '#065f46' }}>Summary</h3>
            <p style={{ marginBottom: 0 }}>
              Music Mind Academy is designed with student privacy as a core principle. We collect <strong>no student emails</strong>,
              require <strong>no student accounts</strong>, and students are identified only by <strong>randomly assigned nicknames</strong>.
              Students don't type any identifying information. Student work saves locally on their own device.
              We do not sell data, show ads, or use third-party tracking.
            </p>
          </div>

          {/* Compliance Badges */}
          <div className="compliance-badges">
            <div className="compliance-badge">✓ FERPA Compliant</div>
            <div className="compliance-badge">✓ COPPA Compliant</div>
            <div className="compliance-badge">✓ NY Ed Law 2-D Compliant</div>
            <div className="compliance-badge">✓ No Ads</div>
            <div className="compliance-badge">✓ No Data Selling</div>
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
                <td>Randomly assigned nicknames (e.g., "Wild Panda") - not linked to real identity</td>
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
            Students are randomly assigned nicknames when joining a session (examples: "Wild Panda", "Music Star 123").
            These nicknames are:
          </p>
          <ul>
            <li>Randomly generated by the system - students don't enter any information</li>
            <li>Not linked to any real identity information</li>
            <li>Not connected to email, school name, or any other identifier</li>
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
            <li><strong>Students are randomly assigned a nickname</strong> (e.g., "Piano Dreams") - no login required</li>
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

          {/* SSO and Rostering */}
          <h2>Single Sign-On & Rostering</h2>
          <p>
            <strong>Current status:</strong> Music Mind Academy does not currently integrate with Clever, ClassLink,
            or district SSO systems. Students join sessions via class codes without needing accounts or logins.
          </p>
          <p>
            <strong>Teacher authentication:</strong> Teachers sign in via Google or Microsoft OAuth.
            SAML/district SSO for teachers is not currently supported but may be added based on demand.
          </p>
          <p>
            <strong>Why no SSO is needed:</strong> Because students never create accounts and join only with
            class codes, there is no rostering or SSO requirement. This simplifies deployment and eliminates
            the need for student data synchronization.
          </p>

          {/* Data Subprocessors */}
          <h2>Data Subprocessors</h2>
          <p>Music Mind Academy uses the following third-party services:</p>

          <table className="data-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Purpose</th>
                <th>Data Processed</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Firebase (Google Cloud)</td>
                <td>Database & Authentication</td>
                <td>Teacher accounts, session data, student nicknames during active sessions</td>
                <td>United States</td>
              </tr>
              <tr>
                <td>Vercel</td>
                <td>Web hosting (frontend)</td>
                <td>Static files only - no student data</td>
                <td>United States</td>
              </tr>
              <tr>
                <td>Railway</td>
                <td>Backend hosting</td>
                <td>API requests - no persistent student data</td>
                <td>United States</td>
              </tr>
            </tbody>
          </table>

          <p><strong>We do NOT use:</strong> Google Analytics, Facebook Pixel, advertising networks,
          behavioral tracking, or any other third-party services that process student data.</p>

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
            <li><strong>No student data at rest:</strong> Student compositions save locally, not on our servers</li>
          </ul>

          {/* Breach Notification */}
          <h2>Data Breach Response</h2>
          <p>
            In the unlikely event of a data breach affecting student information, Music Mind Academy will:
          </p>
          <ul>
            <li>Notify affected schools/districts within <strong>72 hours</strong> of discovery</li>
            <li>Provide details of what data was affected</li>
            <li>Outline remediation steps taken</li>
            <li>Cooperate with any required state reporting obligations</li>
          </ul>
          <div className="highlight-box">
            <p style={{ marginBottom: 0 }}>
              <strong>Note:</strong> Because we collect no student PII (no names, emails, or identifying information),
              the risk of a meaningful student data breach is minimal. Even in a worst-case scenario,
              exposed data would only include randomly-assigned nicknames like "Wild Panda" that cannot
              be connected to real students.
            </p>
          </div>

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

          {/* State DPA Status */}
          <h2>Data Privacy Agreements by State</h2>
          <p>Music Mind Academy has signed or is ready to sign DPAs in the following states:</p>

          <table className="data-table">
            <thead>
              <tr>
                <th>State</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ohio</td>
                <td style={{ color: '#2563eb', fontWeight: 600 }}>Available</td>
                <td>Ready to sign Ohio NDPA on request.</td>
              </tr>
              <tr>
                <td>New York</td>
                <td style={{ color: '#2563eb', fontWeight: 600 }}>Available</td>
                <td>NY Ed Law 2-D compliant. DPA available on request.</td>
              </tr>
              <tr>
                <td>All Other States</td>
                <td style={{ color: '#2563eb', fontWeight: 600 }}>Available</td>
                <td>Contact us to discuss your state's DPA requirements.</td>
              </tr>
            </tbody>
          </table>

          <div className="highlight-box blue">
            <h3 style={{ marginTop: 0, color: '#1e40af' }}>Request a Data Privacy Agreement</h3>
            <p>
              If your district requires a signed Data Privacy Agreement (DPA), we are happy to work with you.
              We can review and sign agreements that outline our commitment to protecting student data and
              limiting its use to educational purposes only.
            </p>
            <p style={{ marginBottom: 0 }}>
              Contact us at <a href="mailto:rob@musicmindacademy.com" style={{ color: '#2563eb' }}>rob@musicmindacademy.com</a> to
              discuss DPA requirements.
            </p>
          </div>

          {/* IT Whitelist Box */}
          <div className="highlight-box blue" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginTop: 0, color: '#1e40af' }}>For IT Administrators: Domains to Whitelist</h3>
            <p>To allow Music Mind Academy on your school network, whitelist these domains:</p>
            <ul style={{ marginBottom: '0.5rem' }}>
              <li><code style={{ background: '#e0e7ff', padding: '2px 6px', borderRadius: '4px' }}>musicmindacademy.com</code></li>
              <li><code style={{ background: '#e0e7ff', padding: '2px 6px', borderRadius: '4px' }}>*.firebaseapp.com</code></li>
              <li><code style={{ background: '#e0e7ff', padding: '2px 6px', borderRadius: '4px' }}>*.firebaseio.com</code></li>
            </ul>
            <p style={{ marginBottom: 0, fontSize: '0.9rem', color: '#475569' }}>
              All traffic uses <strong>HTTPS (port 443)</strong>. No special ports or protocols required.
              If your school uses Google Workspace, Firebase domains may already be allowed.
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
            No. We only see randomly assigned nicknames like "Wild Panda." Without additional information
            (which we don't collect), there is no way to connect a nickname to a real student.
          </p>

          <h3>Do students need to create accounts?</h3>
          <p>
            No. Students join sessions using only a class code and are randomly assigned a nickname.
            No registration, no email, no password, and students don't type any identifying information.
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
            We use Firebase (Google Cloud) for database and authentication, Vercel for frontend hosting,
            and Railway for backend hosting. Teacher accounts authenticate via Google or Microsoft OAuth.
            We do not use analytics services, advertising networks, or any other third-party services
            that process student data.
          </p>

          <h3>Do you support Clever or ClassLink?</h3>
          <p>
            Not currently. Because students don't need accounts (they join with class codes only),
            SSO integration isn't necessary. Teachers sign in via Google or Microsoft OAuth.
          </p>

          <h3>What happens if there's a data breach?</h3>
          <p>
            We will notify affected districts within 72 hours with details of what occurred and remediation steps.
            However, because we don't collect student PII, the impact of any potential breach would be minimal —
            exposed data would only include randomly-assigned nicknames that cannot identify real students.
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
