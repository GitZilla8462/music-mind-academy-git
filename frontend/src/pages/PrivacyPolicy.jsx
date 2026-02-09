// /src/pages/PrivacyPolicy.jsx
// General Privacy Policy for Music Mind Academy
// Last updated: January 2026

import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
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
              Last updated: February 2026
            </p>
          </div>

          <p>
            Music Mind Academy ("we", "us", or "our") is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, and protect information when you use
            our website and services at {isEduSite ? 'musicroomtools.org' : 'musicmindacademy.com'}.
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
          <p>When students use Music Mind Academy through their teacher's class, we collect:</p>
          <ul>
            <li><strong>Student name:</strong> From Google account or entered by teacher</li>
            <li><strong>Student email:</strong> Only if using Google Sign-In</li>
            <li><strong>Compositions, reflections, and scores:</strong> Saved to the student's account</li>
          </ul>
          <p>
            Teachers can also run Quick Join sessions where students participate with just a class code
            and musical name — no personal information collected.
          </p>
          <p>
            For complete details on student data collection, see our{' '}
            <a href="/student-privacy">Student Data Privacy</a> page.
          </p>

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
          <p>
            <strong>FERPA Designation:</strong> Music Mind Academy
            functions as a "school official" with a legitimate educational interest under FERPA (20 U.S.C. § 1232g).
            We use student education records solely for the educational purposes authorized by the school,
            and we do not redisclose education records to any third party except as authorized by FERPA or
            with written parental consent.
          </p>

          <h2>3. How We Share Information</h2>
          <p>We do NOT sell, rent, or share personal information with third parties for marketing purposes.</p>
          <p>We may share information only in the following circumstances:</p>
          <ul>
            <li><strong>Service providers:</strong> We use Firebase (Google Cloud) and MongoDB Atlas for database and
            authentication services. These subprocessors are contractually bound to protect data and are listed on
            our <a href="/student-privacy">Student Data Privacy</a> page.</li>
            <li><strong>Legal requirements:</strong> If required by law, subpoena, or court order, or to protect
            the safety of students, teachers, or the public</li>
            <li><strong>Business transfers:</strong> In the event of a merger, acquisition, or sale of assets,
            student data protections will remain in effect. We will notify affected schools and districts at least
            30 days before any transfer of student data to a successor entity. The successor must agree to honor
            the terms of existing Data Privacy Agreements and this Privacy Policy, or student data will be securely
            deleted before transfer.</li>
          </ul>
          <p>
            <strong>No Redisclosure:</strong> We do not redisclose student education records or personally identifiable
            information from education records to any third party, except to our subprocessors as described above
            or as otherwise authorized by FERPA.
          </p>

          <h2>4. Data Storage and Security</h2>
          <p>
            Teacher and student data is stored in Firebase (Google Cloud Platform) and MongoDB Atlas,
            which provide enterprise-grade security and are compliant with major security standards.
            All student work is encrypted at rest (AES-256) with role-based access controls.
          </p>
          <p>
            Quick Join session data is stored locally on the student's device and is not transmitted
            to our servers.
          </p>
          <p><strong>Security measures include:</strong></p>
          <ul>
            <li>All data transmission uses HTTPS/TLS 1.3 encryption</li>
            <li>Student PINs are hashed using bcrypt before storage</li>
            <li>Rate limiting prevents brute force attacks on PIN login (5 attempts per 15 minutes)</li>
            <li>Firebase Security Rules enforce role-based access control</li>
            <li>Teachers can only access data for their own classes</li>
            <li>Students can only access their own work</li>
          </ul>
          <p>For complete security details, see our <a href="/student-privacy">Student Data Privacy</a> page.</p>

          <h2>5. Data Retention</h2>
          <ul>
            <li><strong>Teacher accounts:</strong> Retained until the teacher requests deletion</li>
            <li><strong>Student data:</strong> Retained while the student is enrolled; securely deleted within 60 days of account termination or upon request</li>
            <li><strong>Session data:</strong> Temporary — exists only during active sessions</li>
          </ul>

          <h2>6. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of the data we hold about you</li>
            <li><strong>Correction:</strong> Request correction of inaccurate data</li>
            <li><strong>Deletion:</strong> Request deletion of your data</li>
            <li><strong>Portability:</strong> Request your data in a portable format</li>
          </ul>
          {!isEduSite && (
            <p>To exercise these rights, contact us at <a href="mailto:rob@musicmindacademy.com">rob@musicmindacademy.com</a>.</p>
          )}

          <h2>7. Children's Privacy & COPPA Compliance</h2>
          <p>
            Music Mind Academy is designed for use in educational settings with students of all ages,
            including children under 13. We comply with the Children's Online Privacy Protection Act (COPPA) by:
          </p>
          <ul>
            <li>Schools may consent on behalf of parents when the technology is used solely for an educational purpose and for no other commercial purpose (per FTC guidance on school consent under COPPA)</li>
            <li>Quick Join sessions collect no personal information — students participate using only self-chosen musical names</li>
            <li>Allowing parents to review and request deletion of their child's data at any time</li>
            <li><strong>No direct child sign-up:</strong> Students cannot create accounts independently. A teacher
            must create the class and add students. Students access the platform only through
            teacher-created class codes or teacher-provisioned accounts.</li>
          </ul>
          <p>
            <strong>Parental Consent Revocation:</strong> Parents may revoke consent for the collection of their
            child's data at any time by contacting their child's teacher{!isEduSite && (
              <> or emailing us
            at <a href="mailto:rob@musicmindacademy.com">rob@musicmindacademy.com</a></>
            )}. Upon revocation, we will
            delete the child's data within 30 days. The student may still participate without an account, which
            collects no personal information.
          </p>
          <p>
            <strong>OAuth Permissions:</strong> When students sign in via Google, we request only basic profile
            information (name and email address). We do not request access to Google Drive, Gmail, Calendar, or
            any other Google services.
          </p>
          <p>
            For complete details, see our <a href="/student-privacy">Student Data Privacy</a> page.
          </p>

          <h2>8. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li><strong>Firebase (Google Cloud):</strong> Database and authentication — SOC 2, ISO 27001, FedRAMP authorized, COPPA compliant</li>
            <li><strong>MongoDB Atlas:</strong> Database — SOC 2 Type II, ISO 27001 certified</li>
            <li><strong>Google OAuth:</strong> Teacher and student sign-in — requests only basic profile (name, email)</li>
            <li><strong>Microsoft OAuth:</strong> Teacher sign-in — requests only basic profile (name, email)</li>
            <li><strong>Google Fonts:</strong> Web fonts loaded from fonts.googleapis.com (no user data is sent to Google through this service)</li>
            <li><strong>Vercel:</strong> Frontend web hosting — serves static files only, no student data processed</li>
            <li><strong>Railway:</strong> Backend API hosting — processes API requests</li>
          </ul>
          <p>We do NOT use Google Analytics, Facebook Pixel, or any advertising or tracking services.</p>
          <p>
            All subprocessors store data in United States data centers. For complete subprocessor details,
            see our <a href="/student-privacy">Student Data Privacy</a> page.
          </p>

          <h2>9. Data Breach Notification</h2>
          <p>
            In the event of a breach or unauthorized release of personally identifiable information,
            we will notify affected schools and districts within <strong>7 calendar days</strong> of
            discovery, in accordance with NY Education Law § 2-d. The notification will include a
            description of the incident, the types of data affected, and the remediation steps taken.
            For complete details, see our <a href="/student-privacy">Student Data Privacy</a> page.
          </p>

          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify users of material
            changes by email and by posting a notice on our website at least 30 days before the changes
            take effect. Your continued use of our services after changes are posted constitutes
            acceptance of the updated policy.
          </p>

          {!isEduSite && (
            <>
              <h2>11. Contact Us</h2>
              <p>If you have questions about this Privacy Policy, please contact us:</p>
              <p>
                <strong>Robert Taube</strong><br />
                Founder, Music Mind Academy<br />
                Email: <a href="mailto:rob@musicmindacademy.com">rob@musicmindacademy.com</a>
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
