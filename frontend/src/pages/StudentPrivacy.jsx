// /src/pages/StudentPrivacy.jsx
// Student Data Privacy page for IT departments and administrators
// Last updated: February 2026

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
                {!isEduSite && <span className="it-domain">musicmindacademy.com</span>}
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
              Music Mind Academy is a web-based music education platform for middle school classrooms.
              Students log in with a school Google account or a class code + PIN to save their compositions,
              reflections, and scores. We collect only what's needed for the educational service. We never
              sell data, show ads, or use third-party tracking. Teachers can also run quick sessions where
              students join with just a code and musical name — no accounts, no data collected.
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

          {/* What We Collect */}
          <h2>What We Collect</h2>
          <p>
            We collect only what is necessary for the educational service. The following data is
            collected when students use the platform with an account:
          </p>

          <table className="data-table">
            <thead>
              <tr>
                <th>Data Type</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Student Name</td>
                <td>From Google account or entered by teacher</td>
              </tr>
              <tr>
                <td>Student Email</td>
                <td>Only if using Google Sign-In</td>
              </tr>
              <tr>
                <td>Music Compositions</td>
                <td>Saved to student's account</td>
              </tr>
              <tr>
                <td>Written Reflections</td>
                <td>Star/star/wish format</td>
              </tr>
              <tr>
                <td>Activity/Game Scores</td>
                <td>Saved for teacher review</td>
              </tr>
              <tr>
                <td>Session Timestamps</td>
                <td>When student accessed platform</td>
              </tr>
            </tbody>
          </table>

          {/* Quick Join */}
          <div className="highlight-box blue">
            <h3 style={{ marginTop: 0, color: '#1e40af' }}>Quick Join Sessions</h3>
            <p style={{ marginBottom: 0 }}>
              Teachers can also run sessions using Quick Join, where students join with a class code
              and choose a musical name (e.g., "Forte"). In Quick Join, no student personally identifiable
              information is collected — no real names, no emails, no accounts. Work exists only for
              the duration of the session.
            </p>
          </div>

          {/* What We Do NOT Do */}
          <h2>What We Do NOT Do</h2>
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
          <h2>How It Works for Students</h2>
          <ol>
            <li><strong>Sign in</strong> via school Google account or class code + seat number + PIN</li>
            <li><strong>Complete activities</strong> — compositions, reflections, and games</li>
            <li><strong>Work is saved</strong> to the student's account automatically</li>
            <li><strong>Teacher reviews</strong> student work, grades assignments, and provides feedback</li>
          </ol>

          {/* Data Storage and Security */}
          <h2>Data Storage and Security</h2>
          <p>
            All student data is stored in the United States and encrypted both in transit and at rest.
          </p>

          <h3>Security Measures</h3>
          <ul>
            <li><strong>Encryption in transit:</strong> All data transmitted over HTTPS/TLS 1.3</li>
            <li><strong>Encryption at rest:</strong> AES-256 encryption (Firebase and MongoDB Atlas)</li>
            <li><strong>PIN hashing:</strong> Student PINs hashed using bcrypt before storage</li>
            <li><strong>Rate limiting:</strong> PIN login attempts limited to 5 per 15 minutes</li>
            <li><strong>Access controls:</strong> Role-based access — teachers see only their own students; students see only their own work</li>
            <li><strong>Firebase Security Rules:</strong> Database access restricted by role with granular permissions</li>
          </ul>

          <h3>Subprocessors</h3>
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
                <td>Teacher accounts, student accounts, session data</td>
                <td>United States</td>
              </tr>
              <tr>
                <td>MongoDB Atlas</td>
                <td>Database</td>
                <td>Application data, student work</td>
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

          {/* Data Breach Response */}
          <h2>Data Breach Response</h2>
          <p>
            In the event of a breach or unauthorized release of student personally identifiable information,
            Music Mind Academy will:
          </p>
          <ul>
            <li>Notify affected schools and districts within <strong>7 calendar days</strong> of discovery</li>
            <li>Provide details of what data was affected</li>
            <li>Outline remediation steps taken</li>
            <li>Cooperate with schools, law enforcement, and any required state reporting obligations</li>
          </ul>

          {/* Legal Compliance */}
          <h2>Legal Compliance</h2>

          <h3>FERPA (Family Educational Rights and Privacy Act)</h3>
          <p>
            Student compositions, reflections, and scores constitute education records under FERPA.
            Music Mind Academy operates as a "school official" with a legitimate educational interest
            under 34 CFR § 99.31(a)(1). We use student data only for the educational purposes specified
            in our agreements and do not redisclose education records to any third party except to our
            subprocessors as necessary to provide the service.
          </p>

          <h3>COPPA (Children's Online Privacy Protection Act)</h3>
          <p>
            Schools may consent on behalf of parents when the technology is used solely for an educational
            purpose and for no other commercial purpose (per FTC guidance). Students cannot create accounts
            independently — student accounts are created only through teacher-provisioned classes.
          </p>

          <h3>New York Education Law § 2-d</h3>
          <p>
            Music Mind Academy complies with NY Ed Law 2-d by never selling or releasing student PII
            for commercial purposes, encrypting all PII in transit and at rest, notifying affected schools
            within 7 days of a breach, providing a Parents' Bill of Rights, and being prepared to sign
            Data Privacy Agreements with NY districts.
          </p>

          {/* Data Retention */}
          <h2>Data Retention</h2>
          <ul>
            <li><strong>During active use:</strong> Student data is retained and accessible to the teacher and student</li>
            <li><strong>Account termination:</strong> Student data is securely deleted within <strong>60 days</strong> unless the teacher requests an export</li>
            <li><strong>Deletion requests:</strong> Teachers, parents, and districts may request deletion of student data at any time</li>
            <li><strong>DPA available:</strong> We are happy to sign a Data Privacy Agreement with your district upon request</li>
          </ul>

          {/* Parents' Bill of Rights */}
          <div id="parents-bill-of-rights" style={{ marginTop: '3rem' }}>
            <h2 style={{ fontSize: '1.75rem' }}>Parents' Bill of Rights for Data Privacy and Security</h2>
            <p style={{ fontStyle: 'italic', color: '#64748b' }}>
              In accordance with New York Education Law § 2-d
            </p>

            <div className="pbor-right">
              <h4>1. No Sale or Commercial Use of Student Data</h4>
              <p>
                Your child's personally identifiable information cannot be sold or released for any
                commercial or marketing purpose.
              </p>
            </div>

            <div className="pbor-right">
              <h4>2. Right to Inspect and Review</h4>
              <p>
                You have the right to inspect and review the complete contents of your child's education
                record. To request a review, contact your child's teacher{!isEduSite && (<> or email us at{' '}
                <a href="mailto:rob@musicmindacademy.com" style={{ color: '#2563eb' }}>rob@musicmindacademy.com</a></>)}.
                We will respond within 30 days.
              </p>
            </div>

            <div className="pbor-right">
              <h4>3. Data Is Protected by Law and Secured with Safeguards</h4>
              <p>
                State and federal laws — including FERPA, COPPA, and New York Education Law § 2-d — protect
                the confidentiality of your child's personally identifiable information. Safeguards including
                encryption, role-based access controls, and authentication are in place.
              </p>
            </div>

            <div className="pbor-right">
              <h4>4. Right to Review Data Elements Collected</h4>
              <p>
                A complete list of all student data elements collected is available in the data collection
                table above and in our <a href="/privacy" style={{ color: '#2563eb' }}>Privacy Policy</a>.
              </p>
            </div>

            <div className="pbor-right">
              <h4>5. Right to Have Complaints Addressed</h4>
              <p>
                Complaints about possible breaches or unauthorized releases of student data may be directed to:
              </p>
              <ul style={{ marginTop: '0.5rem', marginBottom: 0, fontSize: '0.95rem' }}>
                {!isEduSite && (
                  <li>Music Mind Academy: <a href="mailto:rob@musicmindacademy.com" style={{ color: '#2563eb' }}>rob@musicmindacademy.com</a></li>
                )}
                <li>Your school district's Data Privacy Officer</li>
                <li>New York State Education Department Chief Privacy Officer — <a href="mailto:privacy@nysed.gov" style={{ color: '#2563eb' }}>privacy@nysed.gov</a></li>
              </ul>
            </div>

            <div className="pbor-right">
              <h4>6. Breach Notification</h4>
              <p>
                You will be notified in accordance with applicable laws if a breach or unauthorized release
                of your child's personally identifiable information occurs. Music Mind Academy will notify
                affected schools within 7 calendar days of discovery.
              </p>
            </div>

            <div className="highlight-box purple">
              <h3 style={{ marginTop: 0, color: '#6d28d9' }}>Your Right to Opt Out</h3>
              <p style={{ marginBottom: 0 }}>
                If you do not wish your child's personally identifiable information to be collected,
                contact your child's teacher to discuss options.
              </p>
            </div>
          </div>

          {/* FAQ */}
          <h2>Frequently Asked Questions</h2>

          <h3>Does my district need a DPA?</h3>
          <p>
            We are happy to sign a Data Privacy Agreement with your district. We can sign agreements
            compatible with the SDPC National Data Privacy Agreement (NDPA) framework or your district's
            standard DPA template.{!isEduSite && (<> Contact us at{' '}
            <a href="mailto:rob@musicmindacademy.com" style={{ color: '#2563eb' }}>rob@musicmindacademy.com</a> to
            discuss DPA requirements.</>)}
          </p>

          <h3>Do you use AI on student data?</h3>
          <p>
            No. We do not use student data for AI training, machine learning, or any automated decision-making.
          </p>

          <h3>What third-party services do you use?</h3>
          <p>
            We use Firebase (Google Cloud) for authentication and database, MongoDB Atlas for database,
            Vercel for frontend hosting, and Railway for backend hosting. We do not use analytics services,
            advertising networks, or any other third-party services that process student data.
          </p>

          <h3>What happens if there's a data breach?</h3>
          <p>
            We will notify affected schools within 7 calendar days of discovery, as required by
            NY Education Law § 2-d. All data is encrypted at rest and in transit with role-based
            access controls.
          </p>

          <h3>What happens when a teacher leaves?</h3>
          <p>
            Student data is securely deleted within 60 days of account termination. Teachers may
            request a data export before cancellation. Schools and districts may request return or
            destruction of data at any time.
          </p>

          {/* Contact Us */}
          {!isEduSite && (
            <>
              <h2>Contact Us</h2>
              <p>
                For privacy questions, DPA requests, or data deletion requests:
              </p>
              <p>
                <strong>Robert Taube</strong><br />
                Founder, Music Mind Academy<br />
                Email: <a href="mailto:rob@musicmindacademy.com" style={{ color: '#2563eb' }}>rob@musicmindacademy.com</a>
              </p>
            </>
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
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentPrivacy;
