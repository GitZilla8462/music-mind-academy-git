// /src/pages/StudentPrivacy.jsx
// Student Data Privacy page for IT departments and administrators
// Last updated: January 2026

import React from 'react';
import { useNavigate } from 'react-router-dom';

const StudentPrivacy = () => {
  const navigate = useNavigate();
  const isEduSite = import.meta.env.VITE_SITE_MODE === 'edu';

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

        .highlight-box.purple {
          background: #faf5ff;
          border-color: #c4b5fd;
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

        .mode-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          border: 2px solid #e2e8f0;
        }

        .mode-card.classroom {
          border-color: #6ee7b7;
        }

        .mode-card.accounts {
          border-color: #93c5fd;
        }

        .mode-card h3 {
          margin-top: 0;
        }

        .mode-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
          margin: 1.5rem 0;
        }

        .pbor-right {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1.25rem;
          margin-bottom: 1rem;
        }

        .pbor-right h4 {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.5rem;
          margin-top: 0;
        }

        .pbor-right p {
          margin-bottom: 0;
          font-size: 0.95rem;
        }

        @media (max-width: 768px) {
          .mode-grid {
            grid-template-columns: 1fr;
          }
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
            {!isEduSite && (
              <img
                src="/MusicMindAcademyLogo.png"
                alt="Music Mind Academy"
                style={{ height: '40px', width: 'auto' }}
              />
            )}
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#1e293b'
            }}>
              {isEduSite ? 'Music Room Tools' : 'Music Mind Academy'}
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
              Last updated: February 2026 · For IT Administrators, School Districts, and Parents
            </p>
          </div>

          {/* IT Quick Reference Box */}
          <div className="it-quick-ref">
            <h3>⚡ Quick Reference for IT Administrators</h3>
            <div className="it-grid">
              <div className="it-item">
                <span className="it-item-label">Two Session Modes</span>
                <span className="it-item-value yes">YES</span>
              </div>
              <div className="it-item">
                <span className="it-item-label">Quick Join Mode Available</span>
                <span className="it-item-value yes">YES</span>
              </div>
              <div className="it-item">
                <span className="it-item-label">Data Sold to Third Parties</span>
                <span className="it-item-value no">NEVER</span>
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
                <span className="it-item-label">Third-Party Tracking</span>
                <span className="it-item-value no">NONE</span>
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
                <span className="it-item-label">NY Ed Law 2-d Compliant</span>
                <span className="it-item-value yes">YES</span>
              </div>
              <div className="it-item">
                <span className="it-item-label">DPA Available</span>
                <span className="it-item-value yes">YES</span>
              </div>
              <div className="it-item">
                <span className="it-item-label">Encryption (Transit + Rest)</span>
                <span className="it-item-value yes">YES</span>
              </div>
              <div className="it-item">
                <span className="it-item-label">PIN Hashing (bcrypt)</span>
                <span className="it-item-value yes">YES</span>
              </div>
              <div className="it-item">
                <span className="it-item-label">Rate Limiting</span>
                <span className="it-item-value yes">YES</span>
              </div>
              <div className="it-item">
                <span className="it-item-label">Breach Notification</span>
                <span className="it-item-value" style={{ color: '#93c5fd' }}>7 DAYS</span>
              </div>
            </div>
            <div className="it-domains">
              <div className="it-domains-title">Domains to Whitelist:</div>
              <div className="it-domain-list">
                <span className="it-domain">musicmindacademy.com</span>
                <span className="it-domain">musicroomtools.org</span>
                <span className="it-domain">*.firebaseapp.com</span>
                <span className="it-domain">*.firebaseio.com</span>
                <span className="it-domain">accounts.google.com</span>
                <span className="it-domain">login.microsoftonline.com</span>
                <span className="it-domain">fonts.googleapis.com</span>
                <span className="it-domain">fonts.gstatic.com</span>
              </div>
            </div>
          </div>

          {/* Summary Box */}
          <div className="highlight-box">
            <h3 style={{ marginTop: 0, color: '#065f46' }}>Summary</h3>
            <p style={{ marginBottom: 0 }}>
              Music Mind Academy offers <strong>two session modes</strong> so teachers can choose the right level
              of data collection for their classroom. <strong>Quick Join</strong> collects zero student
              personally identifiable information — students join with a class code and pick a musical name.
              <strong> Classroom Mode</strong> saves student work persistently and collects limited PII
              (name, email, compositions). Both modes are fully compliant with FERPA, COPPA, and NY Ed Law 2-d.
              We never sell data, show ads, or use third-party tracking.
            </p>
          </div>

          {/* Compliance Badges */}
          <div className="compliance-badges">
            <div className="compliance-badge">✓ FERPA Compliant</div>
            <div className="compliance-badge">✓ COPPA Compliant</div>
            <div className="compliance-badge">✓ NY Ed Law 2-d Compliant</div>
            <div className="compliance-badge">✓ No Ads</div>
            <div className="compliance-badge">✓ No Data Selling</div>
            <div className="compliance-badge">✓ Encrypted at Rest + Transit</div>
          </div>

          {/* Two Modes */}
          <h2>Two Session Modes</h2>
          <p>
            Teachers choose a privacy mode when creating each class. This gives teachers and districts
            control over what student data is collected.
          </p>

          <div className="mode-grid">
            <div className="mode-card classroom">
              <h3 style={{ color: '#065f46' }}>🟢 Quick Join</h3>
              <p style={{ fontWeight: 600, color: '#065f46', marginBottom: '0.75rem' }}>
                Zero student PII collected
              </p>
              <ul style={{ fontSize: '0.95rem', paddingLeft: '1.25rem' }}>
                <li>Students join with a class code</li>
                <li>Students pick a musical name (e.g., "Forte")</li>
                <li>No real names, no emails, no accounts</li>
                <li>Work is session-based and temporary</li>
                <li>No DPA required</li>
              </ul>
            </div>

            <div className="mode-card accounts">
              <h3 style={{ color: '#1e40af' }}>🔵 Classroom Mode</h3>
              <p style={{ fontWeight: 600, color: '#1e40af', marginBottom: '0.75rem' }}>
                Student PII collected for persistent progress
              </p>
              <ul style={{ fontSize: '0.95rem', paddingLeft: '1.25rem' }}>
                <li>Students have persistent accounts</li>
                <li>Compositions, reflections, and scores saved</li>
                <li>Collects name and email (if Google Sign-In)</li>
                <li>Teachers can add/edit student names for grading</li>
                <li>Creates education records under FERPA</li>
                <li>DPA available upon request</li>
              </ul>
            </div>
          </div>

          {/* Data Collection - Quick Join */}
          <h2>Data Collected: Quick Join</h2>
          <p>
            In Quick Join, we collect <strong>no student personally identifiable information</strong>.
          </p>

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
                <td>Never collected in this mode</td>
              </tr>
              <tr>
                <td>Student Email Addresses</td>
                <td style={{ color: '#16a34a', fontWeight: 600 }}>No</td>
                <td>Never collected in this mode</td>
              </tr>
              <tr>
                <td>Student Accounts/Logins</td>
                <td style={{ color: '#16a34a', fontWeight: 600 }}>No</td>
                <td>Students join with class code only</td>
              </tr>
              <tr>
                <td>Musical Name</td>
                <td style={{ color: '#d97706', fontWeight: 600 }}>Yes</td>
                <td>Student-chosen musical name (e.g., "Forte") — not linked to real identity</td>
              </tr>
              <tr>
                <td>Activity Scores/Progress</td>
                <td style={{ color: '#d97706', fontWeight: 600 }}>Session Only</td>
                <td>Associated with musical name only, visible to teacher during session</td>
              </tr>
              <tr>
                <td>Compositions/Work</td>
                <td style={{ color: '#d97706', fontWeight: 600 }}>Session Only</td>
                <td>Temporary — not persisted after session ends</td>
              </tr>
            </tbody>
          </table>

          {/* Data Collection - Classroom Mode */}
          <h2>Data Collected: Classroom Mode</h2>
          <p>
            In Classroom Mode, we collect limited student PII necessary to provide persistent
            educational accounts. This mode creates education records as defined by FERPA.
          </p>

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
                <td>Student Name</td>
                <td style={{ color: '#2563eb', fontWeight: 600 }}>Yes</td>
                <td>From Google account or entered/imported by teacher to associate with grades and assignments</td>
              </tr>
              <tr>
                <td>Student Email</td>
                <td style={{ color: '#2563eb', fontWeight: 600 }}>If Google Sign-In</td>
                <td>Only if student uses school Google Sign-In; not collected for class code login</td>
              </tr>
              <tr>
                <td>Music Compositions</td>
                <td style={{ color: '#2563eb', fontWeight: 600 }}>Yes</td>
                <td>Saved persistently to student's account</td>
              </tr>
              <tr>
                <td>Written Reflections</td>
                <td style={{ color: '#2563eb', fontWeight: 600 }}>Yes</td>
                <td>Star/star/wish format reflections on student work</td>
              </tr>
              <tr>
                <td>Activity/Game Scores</td>
                <td style={{ color: '#2563eb', fontWeight: 600 }}>Yes</td>
                <td>Saved to student's account for teacher review</td>
              </tr>
              <tr>
                <td>Session Timestamps</td>
                <td style={{ color: '#2563eb', fontWeight: 600 }}>Yes</td>
                <td>When the student accessed the platform</td>
              </tr>
            </tbody>
          </table>

          {/* What We Do NOT Do */}
          <h2>What We Do NOT Do — In Either Mode</h2>
          <ul>
            <li><strong>We do not sell student data</strong> — ever, to anyone, for any reason</li>
            <li><strong>We do not show advertisements</strong> to students or teachers</li>
            <li><strong>We do not use third-party tracking</strong> (no Google Analytics, no Facebook Pixel)</li>
            <li><strong>We do not use cookies</strong> for tracking or marketing</li>
            <li><strong>We do not share data with third parties</strong> for marketing or commercial purposes</li>
            <li><strong>We do not build student profiles</strong> for non-educational purposes</li>
            <li><strong>We do not use student data for AI training</strong> or machine learning</li>
            <li><strong>We do not collect biometric data</strong>, location data, or social media information</li>
          </ul>

          {/* How It Works */}
          <h2>How Music Mind Academy Works</h2>

          <h3>Quick Join — For Students</h3>
          <ol>
            <li><strong>Teacher creates a class</strong> in Quick Join and gets a class code</li>
            <li><strong>Students go to musicmindacademy.com</strong> and enter the class code</li>
            <li><strong>Students pick a musical name</strong> (e.g., "Forte", "Treble Clef") — no login required</li>
            <li><strong>Students complete activities</strong> — work exists for the session only</li>
            <li><strong>Session ends</strong> — no persistent student data remains</li>
          </ol>

          <h3>Classroom Mode — For Students</h3>
          <ol>
            <li><strong>Teacher creates a class</strong> in Classroom Mode (requires school/district authorization)</li>
            <li><strong>Teacher adds student names</strong> to seats (individually or bulk import from roster list)</li>
            <li><strong>Students sign in</strong> via school Google account or class code + seat number + PIN</li>
            <li><strong>Students complete activities</strong> — compositions, reflections, and scores are saved</li>
            <li><strong>Students return anytime</strong> — work persists across sessions</li>
            <li><strong>Teacher reviews work</strong> — can view student names with assignments and grades</li>
          </ol>

          <h3>For Teachers</h3>
          <p>
            Teachers create accounts using Google sign-in. Teacher accounts store:
          </p>
          <ul>
            <li>Email address (from Google OAuth)</li>
            <li>Display name</li>
            <li>School name</li>
            <li>Classes created and session history</li>
          </ul>

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
                <td>Authentication & Realtime Database</td>
                <td>Teacher accounts, student accounts (when applicable), session data</td>
                <td>United States</td>
              </tr>
              <tr>
                <td>MongoDB Atlas</td>
                <td>Database</td>
                <td>Application data, student work (Classroom Mode)</td>
                <td>United States</td>
              </tr>
              <tr>
                <td>Vercel</td>
                <td>Web hosting (frontend)</td>
                <td>Static files only — no student data</td>
                <td>United States</td>
              </tr>
              <tr>
                <td>Railway</td>
                <td>Backend hosting</td>
                <td>API requests</td>
                <td>United States</td>
              </tr>
            </tbody>
          </table>

          <p><strong>We do NOT use:</strong> Google Analytics, Facebook Pixel, advertising networks,
          behavioral tracking, or any other third-party services that process student data.</p>

          {/* Data Storage and Security */}
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
                <td>Quick Join — session data</td>
                <td>Firebase (Google Cloud)</td>
                <td>Teacher during active session</td>
              </tr>
              <tr>
                <td>Classroom Mode — compositions, reflections, scores</td>
                <td>Firebase / MongoDB Atlas</td>
                <td>Student (own work) and teacher (own students)</td>
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
            <li><strong>Encryption in transit:</strong> All data transmitted over HTTPS/TLS 1.3</li>
            <li><strong>Encryption at rest:</strong> All stored data encrypted using AES-256 (Firebase and MongoDB Atlas default encryption)</li>
            <li><strong>PIN hashing:</strong> Student PINs are hashed using bcrypt (industry-standard password hashing algorithm) before storage</li>
            <li><strong>Rate limiting:</strong> PIN login attempts are limited to 5 per 15 minutes to prevent brute force attacks</li>
            <li><strong>Access controls:</strong> Teachers can only access their own students' data; students can only access their own work</li>
            <li><strong>Authentication required:</strong> All access to student records requires authentication</li>
            <li><strong>Firebase Security Rules:</strong> Database access restricted by role with granular permissions</li>
            <li><strong>Minimal data collection:</strong> We only collect what is necessary for the educational service</li>
            <li><strong>No anonymous access:</strong> No unauthenticated access to student records in Classroom Mode</li>
          </ul>

          {/* Breach Notification */}
          <h2>Data Breach Response</h2>
          <p>
            In the event of a breach or unauthorized release of student personally identifiable information,
            Music Mind Academy will:
          </p>
          <ul>
            <li>Notify affected schools and districts within <strong>7 calendar days</strong> of discovery (per NY Education Law § 2-d)</li>
            <li>Provide details of what data was affected</li>
            <li>Outline remediation steps taken</li>
            <li>Cooperate with schools, law enforcement, and any required state reporting obligations</li>
            <li>Notify parents through the affected school in accordance with applicable law</li>
          </ul>
          <div className="highlight-box">
            <p style={{ marginBottom: 0 }}>
              <strong>Note:</strong> In Quick Join, no student personally identifiable information is collected or stored,
              so the risk of a meaningful student data breach is minimal. Classroom Mode data is encrypted
              at rest and in transit with role-based access controls.
            </p>
          </div>

          {/* Legal Compliance */}
          <h2>Legal Compliance</h2>

          <h3>FERPA (Family Educational Rights and Privacy Act)</h3>
          <p>
            <strong>Quick Join:</strong> Because no student education records or personally identifiable
            information are collected, FERPA's restrictions on disclosure do not apply in the traditional sense.
          </p>
          <p>
            <strong>Classroom Mode:</strong> Student compositions, reflections, and scores constitute
            education records under FERPA. Music Mind Academy operates as a "school official" with a legitimate
            educational interest under 34 CFR § 99.31(a)(1). We use student data only for the educational purposes
            specified in our agreements and do not redisclose education records to any third party except to our
            subprocessors as necessary to provide the service, or as otherwise authorized by FERPA.
          </p>
          <p>
            <strong>Parental Rights Under FERPA:</strong> Parents have the right to inspect and review their
            child's education records. To request access, contact your child's teacher{!isEduSite && (<> or email us
            at <a href="mailto:rob@musicmindacademy.com" style={{ color: '#2563eb' }}>rob@musicmindacademy.com</a></>)}.
            We will provide access within <strong>45 days</strong> of receiving the request. Records can be
            provided as a digital export (JSON or PDF format). Parents may also request correction of inaccurate
            records or deletion of their child's data.
          </p>

          <h3>COPPA (Children's Online Privacy Protection Act)</h3>
          <p>
            COPPA requires verifiable parental consent before collecting personal information from children under 13.
          </p>
          <p>
            <strong>Quick Join:</strong> No student personal information is collected, so COPPA consent is not required.
          </p>
          <p>
            <strong>Classroom Mode:</strong> Schools may consent on behalf of parents when
            the technology is used solely for an educational purpose and for no other commercial purpose (per FTC guidance).
            By enabling Classroom Mode, the teacher — acting as an authorized representative of their school —
            provides consent on behalf of parents for the limited educational use described in this policy.
            Parents retain the right to review and request deletion of their child's data at any time.
          </p>
          <p>
            <strong>No Direct Child Sign-Up:</strong> Students cannot create accounts independently.
            Student accounts are created only through teacher-provisioned classes. Students access the
            platform either through a teacher-provided class code or through a teacher-provisioned seat
            with a PIN. This ensures that school consent is always obtained before any student data is collected.
          </p>
          <p>
            <strong>Parental Consent Revocation:</strong> Parents may revoke consent for the collection of
            their child's data at any time by:
          </p>
          <ol>
            <li>Contacting their child's teacher to request removal from Classroom Mode</li>
            {!isEduSite && (
              <li>Or emailing <a href="mailto:rob@musicmindacademy.com" style={{ color: '#2563eb' }}>rob@musicmindacademy.com</a> directly</li>
            )}
          </ol>
          <p>
            Upon revocation, we will delete the child's data within <strong>30 days</strong> and provide written
            confirmation. The student may continue participating in Quick Join, which collects no personal information.
          </p>
          <p>
            <strong>OAuth Permissions:</strong> When students sign in via Google, we request only basic profile
            information (name and email address). We do not request access to Google Drive, Gmail, Google Calendar,
            or any other Google services.
          </p>

          <h3>New York Education Law § 2-d</h3>
          <p>
            NY Education Law § 2-d is one of the strictest student privacy laws in the country.
            Music Mind Academy complies by:
          </p>
          <ul>
            <li>Never selling or releasing student PII for any commercial or marketing purpose</li>
            <li>Encrypting PII in transit (HTTPS/TLS) and at rest (AES-256)</li>
            <li>Notifying affected schools within 7 calendar days of discovering a breach</li>
            <li>Providing a Parents' Bill of Rights for Data Privacy and Security (see below)</li>
            <li>Limiting access to PII to those who need it to provide the educational service</li>
            <li>Being prepared to sign Data Privacy Agreements with NY districts</li>
            <li>Supporting data return or secure destruction at end of contract</li>
          </ul>

          {/* DPA Status */}
          <h2>Data Privacy Agreements by State</h2>
          <p>Music Mind Academy has signed or is ready to sign Data Privacy Agreements:</p>

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
                <td>Wyoming</td>
                <td style={{ color: '#16a34a', fontWeight: 600 }}>✓ Signed</td>
                <td>DPA executed and active.</td>
              </tr>
              <tr>
                <td>New York</td>
                <td style={{ color: '#2563eb', fontWeight: 600 }}>Available</td>
                <td>NY Ed Law 2-d compliant. DPA available on request.</td>
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
            <p style={{ marginBottom: 0 }}>
              If your district requires a signed Data Privacy Agreement (DPA), we are happy to work with you.
              We can sign agreements compatible with the SDPC National Data Privacy Agreement (NDPA) framework
              or your district's standard DPA template.
            </p>
            {!isEduSite && (
              <p style={{ marginBottom: 0 }}>
                Contact us at <a href="mailto:rob@musicmindacademy.com" style={{ color: '#2563eb' }}>rob@musicmindacademy.com</a> to
                discuss DPA requirements.
              </p>
            )}
          </div>

          {/* IT Whitelist Box */}
          <div className="highlight-box blue" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginTop: 0, color: '#1e40af' }}>For IT Administrators: Domains to Whitelist</h3>
            <p>To allow Music Mind Academy on your school network, whitelist these domains:</p>
            <ul style={{ marginBottom: '0.5rem' }}>
              <li><code style={{ background: '#e0e7ff', padding: '2px 6px', borderRadius: '4px' }}>musicmindacademy.com</code> — main platform</li>
              <li><code style={{ background: '#e0e7ff', padding: '2px 6px', borderRadius: '4px' }}>musicroomtools.org</code> — free educational site</li>
              <li><code style={{ background: '#e0e7ff', padding: '2px 6px', borderRadius: '4px' }}>*.firebaseapp.com</code> — database and authentication</li>
              <li><code style={{ background: '#e0e7ff', padding: '2px 6px', borderRadius: '4px' }}>*.firebaseio.com</code> — realtime database</li>
              <li><code style={{ background: '#e0e7ff', padding: '2px 6px', borderRadius: '4px' }}>accounts.google.com</code> — Google Sign-In (teacher and student login)</li>
              <li><code style={{ background: '#e0e7ff', padding: '2px 6px', borderRadius: '4px' }}>login.microsoftonline.com</code> — Microsoft Sign-In (teacher login)</li>
              <li><code style={{ background: '#e0e7ff', padding: '2px 6px', borderRadius: '4px' }}>fonts.googleapis.com</code> / <code style={{ background: '#e0e7ff', padding: '2px 6px', borderRadius: '4px' }}>fonts.gstatic.com</code> — Google Fonts</li>
            </ul>
            <p style={{ marginBottom: 0, fontSize: '0.9rem', color: '#475569' }}>
              All traffic uses <strong>HTTPS (port 443)</strong>. No special ports or protocols required.
              If your school uses Google Workspace, Firebase and Google domains may already be allowed.
            </p>
          </div>

          {/* Data Retention */}
          <h2>Data Retention</h2>

          <h3>Quick Join</h3>
          <ul>
            <li>Session data is temporary and exists only during the active session</li>
            <li>No persistent student data is stored after a session ends</li>
          </ul>

          <h3>Classroom Mode</h3>
          <ul>
            <li><strong>During active use:</strong> Student data is retained and accessible to the teacher and student</li>
            <li><strong>Teacher-initiated deletion:</strong> Teachers can delete individual students or entire classes and all associated data at any time</li>
            <li><strong>Subscription cancellation:</strong> Student data is securely deleted within 60 days of account termination unless the teacher requests an export</li>
            <li><strong>School/district request:</strong> Upon written request, we will return or securely destroy all student data within 30 days</li>
            <li><strong>Inactive data:</strong> Data inactive for more than 2 years will be flagged for deletion with notice to the teacher</li>
          </ul>

          <h3>Data Deletion Requests</h3>
          <p>
            Teachers, parents, and districts may request deletion of student data at any time:
          </p>
          <ol>
            <li><strong>Teachers:</strong> Delete students or entire classes directly from the platform dashboard, or email us</li>
            <li><strong>Parents:</strong> Contact your child's teacher{!isEduSite && (<>, or email us at{' '}
            <a href="mailto:rob@musicmindacademy.com" style={{ color: '#2563eb' }}>rob@musicmindacademy.com</a></>)}</li>
            <li><strong>Districts:</strong> Send a written request{!isEduSite && (<> to <a href="mailto:rob@musicmindacademy.com" style={{ color: '#2563eb' }}>rob@musicmindacademy.com</a></>)} to request deletion</li>
          </ol>
          <p>
            We will acknowledge deletion requests within <strong>5 business days</strong> and complete deletion within{' '}
            <strong>30 days</strong>. Written confirmation of deletion is available upon request.
          </p>

          {/* Company Acquisition */}
          <h2>Business Transfers</h2>
          <p>
            In the event of a merger, acquisition, or sale of Music Mind Academy's assets, all student data
            protections described in this policy and in any active Data Privacy Agreements will remain in
            effect. We will notify affected schools and districts at least <strong>30 days</strong> before
            any transfer of student data to a successor entity. The successor must agree to honor existing
            privacy commitments, or student data will be securely deleted before transfer.
          </p>

          {/* Parents' Bill of Rights */}
          <div id="parents-bill-of-rights" style={{ marginTop: '3rem' }}>
            <h2 style={{ fontSize: '1.75rem' }}>Parents' Bill of Rights for Data Privacy and Security</h2>
            <p style={{ fontStyle: 'italic', color: '#64748b' }}>
              In accordance with New York Education Law § 2-d
            </p>
            <p>
              Music Mind Academy is committed to protecting the privacy and security of student data.
              The following rights are guaranteed to all parents and guardians:
            </p>

            <div className="pbor-right">
              <h4>1. No Sale or Commercial Use of Student Data</h4>
              <p>
                Your child's personally identifiable information cannot be sold or released for any
                commercial or marketing purpose. Music Mind Academy will never sell student data,
                use it for advertising, or share it with third parties for commercial purposes.
              </p>
            </div>

            <div className="pbor-right">
              <h4>2. Right to Inspect and Review</h4>
              <p>
                You have the right to inspect and review the complete contents of your child's education
                record as stored on the Music Mind Academy platform. To request a review, contact your
                child's teacher{!isEduSite && (<> or email us at{' '}
                <a href="mailto:rob@musicmindacademy.com" style={{ color: '#2563eb' }}>rob@musicmindacademy.com</a></>)}.
                We will respond within 30 days.
              </p>
            </div>

            <div className="pbor-right">
              <h4>3. Data Is Protected by Law and Secured with Safeguards</h4>
              <p>
                State and federal laws — including FERPA, COPPA, and New York Education Law § 2-d — protect
                the confidentiality of your child's personally identifiable information. Safeguards including
                encryption in transit (HTTPS/TLS), encryption at rest (AES-256), role-based access controls,
                and authentication are in place whenever data is stored or transferred.
              </p>
            </div>

            <div className="pbor-right">
              <h4>4. Right to Review Data Elements Collected</h4>
              <p>
                A complete list of all student data elements collected by Music Mind Academy is available
                in the data collection tables above and in our{' '}
                <a href="/privacy" style={{ color: '#2563eb' }}>Privacy Policy</a>.
                A detailed list is also available for review upon request.
              </p>
            </div>

            <div className="pbor-right">
              <h4>5. Right to Have Complaints Addressed</h4>
              <p>
                You have the right to have complaints about possible breaches or unauthorized releases of
                student data addressed. Complaints may be directed to:
              </p>
              <ul style={{ marginTop: '0.5rem', marginBottom: 0, fontSize: '0.95rem' }}>
                {!isEduSite && (
                  <li>Music Mind Academy: <a href="mailto:rob@musicmindacademy.com" style={{ color: '#2563eb' }}>rob@musicmindacademy.com</a></li>
                )}
                <li>Your school district's Data Privacy Officer</li>
                <li>New York State Education Department Chief Privacy Officer, 89 Washington Avenue, Albany, NY 12234 — <a href="mailto:privacy@nysed.gov" style={{ color: '#2563eb' }}>privacy@nysed.gov</a></li>
              </ul>
            </div>

            <div className="pbor-right">
              <h4>6. Breach Notification</h4>
              <p>
                You will be notified in accordance with applicable laws and regulations if a breach or
                unauthorized release of your child's personally identifiable information occurs. Music Mind
                Academy will notify affected schools within 7 calendar days of discovery, and the school
                will notify parents in accordance with their notification procedures and applicable law.
              </p>
            </div>

            <div className="highlight-box purple">
              <h3 style={{ marginTop: 0, color: '#6d28d9' }}>Your Right to Opt Out</h3>
              <p>
                If you do not wish your child's personally identifiable information to be collected,
                contact your child's teacher to request removal from Classroom Mode. Your child
                may still be able to participate in Quick Join, which collects no student personal information.
              </p>
              {!isEduSite && (
                <p style={{ marginBottom: 0 }}>
                  You may also contact us directly at{' '}
                  <a href="mailto:rob@musicmindacademy.com" style={{ color: '#6d28d9' }}>rob@musicmindacademy.com</a>{' '}
                  to request deletion of your child's data.
                </p>
              )}
            </div>
          </div>

          {/* FAQ */}
          <h2>Frequently Asked Questions</h2>

          <h3>What is the difference between Quick Join and Classroom Mode?</h3>
          <p>
            In Quick Join, students join with a class code and pick a musical name — no real names,
            no emails, no accounts. Work is session-based. In Classroom Mode, students have
            persistent accounts where their compositions, reflections, and scores are saved across sessions.
            Teachers choose the mode when creating each class.
          </p>

          <h3>Does my district need a DPA for Quick Join?</h3>
          <p>
            Because Quick Join collects no student personally identifiable information, a DPA is
            typically not required. However, some districts may still want one as a matter of policy.
            We are happy to sign a DPA for either mode.
          </p>

          <h3>Can a teacher use Quick Join for some classes and Classroom Mode for others?</h3>
          <p>
            Yes. The mode is set per class. A teacher could use Quick Join for one period and
            Classroom Mode for another.
          </p>

          <h3>How do teachers add student names?</h3>
          <p>
            In Classroom Mode, teachers can add student names individually (click on a seat to edit)
            or use the "Import Names" feature to paste a list of student names from their roster. This associates
            student names with their seat numbers, allowing teachers to see "Johnny Smith - Assignment" instead
            of just "Seat 1 - Assignment" when reviewing grades and student work.
          </p>

          <h3>Do you use AI or machine learning on student data?</h3>
          <p>
            No. We do not use student data for AI training, machine learning, or any automated decision-making.
          </p>

          <h3>What third-party services do you use?</h3>
          <p>
            We use Firebase (Google Cloud) for authentication and database, MongoDB Atlas for database,
            Vercel for frontend hosting, and Railway for backend hosting. Teacher accounts authenticate
            via Google OAuth. We do not use analytics services, advertising networks, or any other
            third-party services that process student data for non-educational purposes.
          </p>

          <h3>Do you support Clever or ClassLink?</h3>
          <p>
            Not currently. In Quick Join, students join with class codes only — no SSO needed. In
            Classroom Mode, students can sign in via school Google accounts or class code + seat number.
            SAML/district SSO may be added based on demand.
          </p>

          <h3>What happens to student data when a teacher cancels?</h3>
          <p>
            In Quick Join, there is no persistent student data to worry about. In Classroom Mode,
            student data is securely deleted within 60 days of account termination. Teachers may request
            a data export before cancellation. Schools and districts may request return or destruction of
            data at any time.
          </p>

          <h3>What happens if there's a data breach?</h3>
          <p>
            We will notify affected schools within 7 calendar days of discovery, as required by NY Education
            Law § 2-d. In Quick Join, the risk of a meaningful student data breach is minimal because
            no PII is collected. In Classroom Mode, all data is encrypted at rest and in transit
            with role-based access controls.
          </p>

          {/* Contact */}
          <h2>Contact Us</h2>
          <p>
            For privacy questions, DPA requests, parental data review or deletion requests:
          </p>
          {!isEduSite && (
            <p>
              <strong>Robert Taube</strong><br />
              Founder, Music Mind Academy<br />
              Email: <a href="mailto:rob@musicmindacademy.com" style={{ color: '#2563eb' }}>rob@musicmindacademy.com</a>
            </p>
          )}

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
            <a href="/dpa" style={{ color: '#2563eb', textDecoration: 'none' }}>Data Privacy Agreement</a>
            <a href="/security" style={{ color: '#2563eb', textDecoration: 'none' }}>Security Practices</a>
            <a href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>Home</a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentPrivacy;
