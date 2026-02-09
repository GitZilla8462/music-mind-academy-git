// /src/pages/SecurityPractices.jsx
// Security Practices and Written Security Program Document
// Required for 2025 COPPA compliance

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Eye, Server, Users, AlertTriangle, CheckCircle, FileText } from 'lucide-react';

const SecurityPractices = () => {
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

        .security-content h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
        }

        .security-content h3 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #334155;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }

        .security-content p {
          color: #475569;
          line-height: 1.7;
          margin-bottom: 1rem;
        }

        .security-content ul {
          color: #475569;
          line-height: 1.7;
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }

        .security-content li {
          margin-bottom: 0.5rem;
        }

        .security-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1rem;
        }

        .security-card h3 {
          margin-top: 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .security-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
          margin: 1.5rem 0;
        }

        .check-list {
          list-style: none;
          padding: 0;
        }

        .check-list li {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 0.5rem 0;
        }

        .check-icon {
          color: #16a34a;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .highlight-box {
          background: #ecfdf5;
          border: 1px solid #6ee7b7;
          border-radius: 8px;
          padding: 1.25rem;
          margin: 1.5rem 0;
        }

        .alert-box {
          background: #fef3c7;
          border: 1px solid #fcd34d;
          border-radius: 8px;
          padding: 1.25rem;
          margin: 1.5rem 0;
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
        <div className="security-content">
          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
              <Shield size={32} style={{ color: '#16a34a' }} />
              <h1 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '2.5rem',
                fontWeight: 700,
                color: '#1e293b',
                margin: 0
              }}>
                Security Practices
              </h1>
            </div>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>
              Written Security Program · Last updated: February 2026
            </p>
          </div>

          {/* Summary Box */}
          <div className="highlight-box">
            <h3 style={{ marginTop: 0, color: '#065f46' }}>Overview</h3>
            <p style={{ marginBottom: 0 }}>
              Music Mind Academy maintains a comprehensive security program designed to protect student and teacher data.
              This document describes our security practices in accordance with FERPA, COPPA (2025 amendments), and
              NY Education Law § 2-d requirements for written security programs.
            </p>
          </div>

          {/* Quick Reference Cards */}
          <div className="security-grid">
            <div className="security-card" style={{ borderLeft: '4px solid #16a34a' }}>
              <h3><Lock size={20} style={{ color: '#16a34a' }} /> Encryption</h3>
              <ul className="check-list" style={{ marginBottom: 0 }}>
                <li><CheckCircle size={16} className="check-icon" /> TLS 1.3 in transit</li>
                <li><CheckCircle size={16} className="check-icon" /> AES-256 at rest</li>
                <li><CheckCircle size={16} className="check-icon" /> HTTPS required</li>
              </ul>
            </div>

            <div className="security-card" style={{ borderLeft: '4px solid #2563eb' }}>
              <h3><Users size={20} style={{ color: '#2563eb' }} /> Access Control</h3>
              <ul className="check-list" style={{ marginBottom: 0 }}>
                <li><CheckCircle size={16} className="check-icon" /> Role-based access</li>
                <li><CheckCircle size={16} className="check-icon" /> OAuth authentication</li>
                <li><CheckCircle size={16} className="check-icon" /> Session management</li>
              </ul>
            </div>

            <div className="security-card" style={{ borderLeft: '4px solid #7c3aed' }}>
              <h3><Server size={20} style={{ color: '#7c3aed' }} /> Infrastructure</h3>
              <ul className="check-list" style={{ marginBottom: 0 }}>
                <li><CheckCircle size={16} className="check-icon" /> Google Cloud (Firebase)</li>
                <li><CheckCircle size={16} className="check-icon" /> MongoDB Atlas</li>
                <li><CheckCircle size={16} className="check-icon" /> US data centers</li>
              </ul>
            </div>

            <div className="security-card" style={{ borderLeft: '4px solid #dc2626' }}>
              <h3><AlertTriangle size={20} style={{ color: '#dc2626' }} /> Incident Response</h3>
              <ul className="check-list" style={{ marginBottom: 0 }}>
                <li><CheckCircle size={16} className="check-icon" /> 7-day notification</li>
                <li><CheckCircle size={16} className="check-icon" /> Documented procedures</li>
                <li><CheckCircle size={16} className="check-icon" /> Remediation plans</li>
              </ul>
            </div>
          </div>

          <h2>1. Data Protection</h2>

          <h3>Encryption Standards</h3>
          <p>All student and teacher data is protected by encryption both in transit and at rest:</p>
          <ul>
            <li><strong>Data in Transit:</strong> All communications use TLS 1.3 encryption.
            HTTPS is enforced for all connections. HTTP Strict Transport Security (HSTS) headers are enabled.</li>
            <li><strong>Data at Rest:</strong> All stored data is encrypted using AES-256 encryption through our
            cloud providers (Firebase and MongoDB Atlas). Encryption keys are managed by the cloud providers
            with regular key rotation.</li>
            <li><strong>Database Security:</strong> Firebase Realtime Database and MongoDB Atlas both provide
            server-side encryption by default. Database access is restricted by authentication rules.</li>
          </ul>

          <h3>Data Minimization</h3>
          <p>We practice data minimization principles:</p>
          <ul>
            <li>Quick Join collects zero student personally identifiable information</li>
            <li>Classroom Mode collects only the minimum data necessary for the educational service</li>
            <li>We do not collect biometric data, precise location, or social media information</li>
            <li>Temporary session data is automatically deleted after sessions end</li>
          </ul>

          <h2>2. Access Controls</h2>

          <h3>Authentication</h3>
          <ul>
            <li><strong>Teacher Authentication:</strong> Teachers authenticate via Google OAuth or Microsoft OAuth,
            leveraging the security of these enterprise identity providers including their MFA requirements.</li>
            <li><strong>Student Authentication:</strong> Students authenticate via school Google accounts (OAuth)
            or PIN-based login (class code + seat number + 4-digit PIN). PIN sessions expire after 8 hours.</li>
            <li><strong>PIN Security:</strong> Student PINs are hashed using bcrypt (industry-standard password hashing)
            before storage. Plaintext PINs are never stored in publicly accessible locations.</li>
            <li><strong>Rate Limiting:</strong> PIN login attempts are rate-limited to prevent brute force attacks.
            After 5 failed attempts, the account is locked for 15 minutes. Teachers can reset PINs to unlock immediately.</li>
            <li><strong>Session Management:</strong> Sessions are securely managed with automatic expiration.
            Teacher sessions persist with secure tokens. Student PIN sessions are time-limited.</li>
          </ul>

          <h3>Role-Based Access Control (RBAC)</h3>
          <p>Access to data is restricted based on user roles:</p>
          <ul>
            <li><strong>Teachers</strong> can only access data for their own classes and students</li>
            <li><strong>Students</strong> can only access their own work and class materials</li>
            <li><strong>Administrators</strong> (platform operators) have access for support and maintenance only</li>
            <li>Firebase Security Rules enforce these access controls at the database level</li>
          </ul>

          <h3>PIN Hashing</h3>
          <p>
            Student PINs are protected using industry-standard cryptographic hashing:
          </p>
          <ul>
            <li><strong>Algorithm:</strong> bcrypt with cost factor 10 (OWASP recommended minimum)</li>
            <li><strong>Storage:</strong> Only hashed PINs are stored in publicly accessible paths; teachers access
            plaintext PINs through protected paths for printing login cards</li>
            <li><strong>Verification:</strong> PIN verification uses bcrypt.compare() - the plaintext PIN
            is never transmitted or stored during verification</li>
            <li><strong>Brute Force Protection:</strong> Rate limiting locks accounts after 5 failed attempts
            for 15 minutes, making brute force attacks impractical</li>
          </ul>

          <h3>Firebase Security Rules</h3>
          <p>
            Our Firebase Realtime Database is protected by security rules that enforce:
          </p>
          <ul>
            <li>Authentication required for all reads and writes (except anonymous class joining)</li>
            <li>Teachers can only read/write their own user data and classes they created</li>
            <li>Students can only read/write their own student data</li>
            <li>Class roster data (containing plaintext PINs) is only accessible by the class teacher</li>
            <li>PIN verification uses a separate path containing only hashed PINs</li>
            <li>Student work submissions are only accessible by the student who created them and their teacher</li>
            <li>Grades are writable only by teachers, readable by students (own grades only)</li>
          </ul>

          <h2>3. Infrastructure Security</h2>

          <h3>Cloud Providers</h3>
          <p>Music Mind Academy uses enterprise-grade cloud providers with strong security certifications:</p>

          <div className="security-card">
            <h3><Server size={20} /> Firebase (Google Cloud Platform)</h3>
            <p>Used for: Authentication, Realtime Database, Security Rules</p>
            <ul>
              <li>SOC 1, SOC 2, SOC 3 certified</li>
              <li>ISO 27001, ISO 27017, ISO 27018 certified</li>
              <li>FedRAMP authorized</li>
              <li>COPPA compliant</li>
              <li>Data stored in US data centers</li>
            </ul>
          </div>

          <div className="security-card">
            <h3><Server size={20} /> MongoDB Atlas</h3>
            <p>Used for: Application database, student work storage</p>
            <ul>
              <li>SOC 2 Type II certified</li>
              <li>ISO 27001 certified</li>
              <li>HIPAA capable</li>
              <li>Data stored in US data centers (AWS)</li>
            </ul>
          </div>

          <h3>Application Security</h3>
          <ul>
            <li><strong>Code Security:</strong> Dependencies are regularly updated to patch known vulnerabilities.
            We use automated dependency scanning.</li>
            <li><strong>Input Validation:</strong> All user inputs are validated and sanitized to prevent
            injection attacks (XSS, SQL injection, etc.)</li>
            <li><strong>Content Security Policy:</strong> CSP headers restrict script execution to prevent XSS attacks</li>
            <li><strong>No Third-Party Tracking:</strong> We do not use Google Analytics, advertising pixels,
            or any third-party tracking that could compromise student privacy</li>
          </ul>

          <h2>4. Incident Response Plan</h2>

          <h3>Detection and Assessment</h3>
          <p>Security incidents may be detected through:</p>
          <ul>
            <li>Monitoring and alerting from cloud providers (Firebase, MongoDB Atlas)</li>
            <li>User reports of suspicious activity</li>
            <li>Automated security scanning and vulnerability detection</li>
            <li>Log analysis and anomaly detection</li>
          </ul>

          <h3>Response Procedures</h3>
          <p>Upon detection of a security incident involving student data:</p>
          <ol>
            <li><strong>Containment (0-24 hours):</strong> Isolate affected systems, preserve evidence,
            assess scope of impact</li>
            <li><strong>Assessment (24-72 hours):</strong> Determine what data was affected, identify root cause,
            document findings</li>
            <li><strong>Notification (within 7 days):</strong> Notify affected schools/districts within 7 calendar
            days of discovery, as required by NY Education Law § 2-d</li>
            <li><strong>Remediation (ongoing):</strong> Fix the vulnerability, restore systems, implement
            additional controls as needed</li>
            <li><strong>Post-Incident Review:</strong> Document lessons learned, update security practices</li>
          </ol>

          <div className="alert-box">
            <h3 style={{ marginTop: 0, color: '#92400e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={20} /> Breach Notification
            </h3>
            <p style={{ marginBottom: 0 }}>
              In the event of a breach involving student personally identifiable information, we will notify
              affected schools and districts within <strong>7 calendar days</strong> of discovery. The notification
              will include: description of the incident, types of data involved, remediation steps taken, and
              contact information for questions.
            </p>
          </div>

          <h2>5. Employee Security</h2>

          <h3>Access Management</h3>
          <ul>
            <li>Administrative access to production systems is limited to essential personnel only</li>
            <li>Multi-factor authentication (MFA) is required for all administrative access</li>
            <li>Access is reviewed and revoked when no longer needed</li>
            <li>Principle of least privilege is applied to all access grants</li>
          </ul>

          <h3>Security Training</h3>
          <ul>
            <li>All personnel with access to student data receive training on FERPA, COPPA, and data privacy</li>
            <li>Security awareness training covers phishing, social engineering, and safe data handling</li>
            <li>Training is updated annually or when regulations change</li>
          </ul>

          <h2>6. Data Retention and Disposal</h2>

          <h3>Retention Periods</h3>
          <ul>
            <li><strong>Quick Join:</strong> Session data is temporary and deleted after the session ends</li>
            <li><strong>Classroom Mode:</strong> Data retained during active enrollment, deleted within
            60 days of account termination or upon request</li>
            <li><strong>Teacher Accounts:</strong> Data retained until the teacher requests deletion</li>
            <li><strong>Inactive Data:</strong> Data inactive for 2+ years is flagged for deletion with notice</li>
          </ul>

          <h3>Secure Disposal</h3>
          <ul>
            <li>Data deletion is performed using secure deletion methods provided by our cloud providers</li>
            <li>Deleted data is not recoverable after the deletion process completes</li>
            <li>Upon contract termination, we provide written certification of data destruction upon request</li>
          </ul>

          <h2>7. Compliance and Auditing</h2>

          <h3>Regulatory Compliance</h3>
          <p>Music Mind Academy maintains compliance with:</p>
          <ul>
            <li>Family Educational Rights and Privacy Act (FERPA)</li>
            <li>Children's Online Privacy Protection Act (COPPA), including 2025 amendments</li>
            <li>New York Education Law § 2-d</li>
            <li>California Student Online Personal Information Protection Act (SOPIPA)</li>
            <li>Other applicable state student privacy laws</li>
          </ul>

          <h3>Security Assessments</h3>
          <ul>
            <li>Regular security reviews of code and infrastructure</li>
            <li>Dependency vulnerability scanning</li>
            <li>Cloud provider security certifications and compliance reports available upon request</li>
            <li>Cooperation with school/district security assessments and audits</li>
          </ul>

          {!isEduSite && (
            <>
              <h2>8. Contact Information</h2>
              <p>
                For security questions, to report a security concern, or to request documentation of our
                security practices:
              </p>
              <div className="security-card">
                <p style={{ marginBottom: '0.5rem' }}><strong>Robert Taube</strong></p>
                <p style={{ marginBottom: '0.5rem' }}>Founder & Privacy Officer, Music Mind Academy</p>
                <p style={{ marginBottom: 0 }}>
                  Email: <a href="mailto:rob@musicmindacademy.com" style={{ color: '#2563eb' }}>rob@musicmindacademy.com</a>
                </p>
              </div>
            </>
          )}

          <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#64748b' }}>
            This security practices document is reviewed and updated at least annually, or when there are
            significant changes to our systems or applicable regulations. Schools and districts may request
            additional documentation of our security controls at any time.
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
            <a href="/student-privacy" style={{ color: '#2563eb', textDecoration: 'none' }}>Student Data Privacy</a>
            <a href="/terms" style={{ color: '#2563eb', textDecoration: 'none' }}>Terms of Service</a>
            <a href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>Home</a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SecurityPractices;
