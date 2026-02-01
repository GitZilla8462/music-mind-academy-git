// /src/pages/DataPrivacyAgreement.jsx
// Data Privacy Agreement (DPA) Template Page
// Schools and districts can review this DPA and request a signed copy

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Mail, CheckCircle, FileText } from 'lucide-react';

const DataPrivacyAgreement = () => {
  const navigate = useNavigate();
  const [showContactForm, setShowContactForm] = useState(false);

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div style={{
      fontFamily: "'DM Sans', sans-serif",
      minHeight: '100vh',
      backgroundColor: '#fafafa'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');

        .dpa-content h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin-top: 2rem;
          margin-bottom: 0.75rem;
        }

        .dpa-content h3 {
          font-size: 1rem;
          font-weight: 600;
          color: #334155;
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }

        .dpa-content p {
          color: #475569;
          line-height: 1.7;
          margin-bottom: 0.75rem;
          font-size: 0.95rem;
        }

        .dpa-content ul, .dpa-content ol {
          color: #475569;
          line-height: 1.7;
          margin-bottom: 0.75rem;
          padding-left: 1.5rem;
          font-size: 0.95rem;
        }

        .dpa-content li {
          margin-bottom: 0.4rem;
        }

        .dpa-section {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1.5rem;
          margin: 1rem 0;
        }

        .dpa-header-box {
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          color: white;
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2rem;
        }

        .exhibit-table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
          font-size: 0.9rem;
        }

        .exhibit-table th {
          background: #f1f5f9;
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          border: 1px solid #e2e8f0;
        }

        .exhibit-table td {
          padding: 0.75rem;
          border: 1px solid #e2e8f0;
        }

        @media print {
          .no-print { display: none !important; }
          .dpa-header-box { background: #1e40af !important; -webkit-print-color-adjust: exact; }
        }
      `}</style>

      {/* Navigation */}
      <nav className="no-print" style={{
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
            <img
              src="/MusicMindAcademyLogo.png"
              alt="Music Mind Academy"
              style={{ height: '40px', width: 'auto' }}
            />
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#1e293b'
            }}>
              Music Mind Academy
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              onClick={() => window.print()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: 'white',
                color: '#334155',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <Download size={16} />
              Print/Save PDF
            </button>
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
        </div>
      </nav>

      {/* Main Content */}
      <main style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: '2rem 1.5rem 4rem'
      }}>
        <div className="dpa-content">
          {/* Header */}
          <div className="dpa-header-box">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <FileText size={32} />
              <h1 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '2rem',
                fontWeight: 700,
                margin: 0
              }}>
                Data Privacy Agreement
              </h1>
            </div>
            <p style={{ opacity: 0.9, margin: 0, fontSize: '1rem' }}>
              Standard Data Privacy Agreement for School Districts
            </p>
            <p style={{ opacity: 0.7, margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
              Compatible with SDPC National Data Privacy Agreement (NDPA) Framework
            </p>
          </div>

          {/* Request Box */}
          <div className="no-print" style={{
            background: '#eff6ff',
            border: '1px solid #93c5fd',
            borderRadius: '8px',
            padding: '1.25rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1e40af' }}>Request a Signed DPA</h3>
            <p style={{ margin: '0 0 1rem 0', color: '#1e40af', fontSize: '0.95rem' }}>
              To request a signed Data Privacy Agreement for your school or district, contact us with
              your district name, state, and any specific requirements.
            </p>
            <a
              href="mailto:rob@musicmindacademy.com?subject=DPA%20Request&body=District%20Name:%0AState:%0AContact%20Name:%0ASpecial%20Requirements:%0A"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#1e40af',
                color: 'white',
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '0.95rem'
              }}
            >
              <Mail size={18} />
              Request DPA: rob@musicmindacademy.com
            </a>
          </div>

          {/* Agreement Body */}
          <div className="dpa-section">
            <p style={{ textAlign: 'center', fontWeight: 600, marginBottom: '1.5rem' }}>
              DATA PRIVACY AGREEMENT<br />
              Between<br />
              <span style={{ color: '#2563eb' }}>______________________ School District</span> ("LEA")<br />
              and<br />
              <span style={{ color: '#2563eb' }}>Music Mind Academy</span> ("Provider")
            </p>

            <p>
              This Data Privacy Agreement ("DPA") is entered into on <span style={{ color: '#2563eb' }}>__________</span> by
              and between the Local Education Agency identified above ("LEA") and Music Mind Academy ("Provider")
              for the purpose of establishing privacy protections for student data in connection with the Provider's
              educational technology services.
            </p>
          </div>

          <h2>Article I: Purpose and Scope</h2>
          <p>
            The purpose of this DPA is to establish the responsibilities of the Provider with respect to Student Data
            (as defined below) in connection with the delivery of the Provider's educational services to the LEA.
          </p>
          <p>
            This DPA applies to all Student Data that the Provider may receive, create, or process in connection with
            the services provided to the LEA pursuant to this agreement.
          </p>

          <h2>Article II: Definitions</h2>
          <ul>
            <li><strong>"Student Data"</strong> means any data, whether gathered by the Provider or provided by the LEA,
            that is descriptive of the student including, but not limited to, information in the student's educational
            record or email, first and last name, birthdate, home or other physical address, telephone number,
            email address, or other information allowing physical or online contact, discipline records, test results,
            special education data, grades, evaluations, criminal records, medical records, health records, social
            security numbers, biometric information, disabilities, socioeconomic information, food purchases, political
            affiliations, religious information, text messages, documents, student identifiers, search activity, photos,
            voice recordings, geolocation information, and any other information that alone or in combination could
            identify a specific student.</li>
            <li><strong>"Educational Records"</strong> means those records that are directly related to a student and
            maintained by the LEA or a party acting on behalf of the LEA, as defined by FERPA (20 U.S.C. § 1232g).</li>
            <li><strong>"De-Identified Data"</strong> means data from which all personally identifiable information has been
            removed, and that has been processed in a manner such that it cannot reasonably be used to identify an
            individual student.</li>
            <li><strong>"Operator"</strong> means the Provider of an internet website, online service, online application, or
            mobile application with actual knowledge that the site, service, or application is used primarily for K-12
            school purposes.</li>
          </ul>

          <h2>Article III: Student Data To Be Provided</h2>
          <p>
            In order to provide the services described in the Service Agreement, the LEA will provide or allow
            the Provider to access the following Student Data:
          </p>

          <h3>Classroom Mode (Zero PII Option)</h3>
          <ul>
            <li>Student-selected musical pseudonym only (no real names)</li>
            <li>Session-based activity scores (temporary, not retained)</li>
          </ul>

          <h3>Student Accounts Mode</h3>
          <ul>
            <li>Student first and last name (from Google Sign-In or teacher entry)</li>
            <li>Student email address (if using Google Sign-In)</li>
            <li>Student musical compositions and written reflections</li>
            <li>Activity and game scores</li>
            <li>Session timestamps</li>
          </ul>

          <p>
            The Provider agrees not to collect, use, or process any Student Data beyond what is necessary to
            provide the educational services specified in the Service Agreement.
          </p>

          <h2>Article IV: Data Privacy and Security Obligations</h2>

          <h3>A. Privacy Compliance</h3>
          <p>The Provider agrees to comply with all applicable federal and state laws regarding student data privacy, including:</p>
          <ul>
            <li>Family Educational Rights and Privacy Act (FERPA), 20 U.S.C. § 1232g</li>
            <li>Children's Online Privacy Protection Act (COPPA), 15 U.S.C. §§ 6501-6506</li>
            <li>Protection of Pupil Rights Amendment (PPRA), 20 U.S.C. § 1232h</li>
            <li>New York Education Law § 2-d (if applicable)</li>
            <li>California Student Online Personal Information Protection Act (SOPIPA) (if applicable)</li>
            <li>Other applicable state student privacy laws</li>
          </ul>

          <h3>B. Data Use Restrictions</h3>
          <p>The Provider agrees that Student Data shall:</p>
          <ul>
            <li>Only be used for the educational purposes specified in the Service Agreement</li>
            <li>Never be sold, leased, or rented to any third party</li>
            <li>Never be used for targeted advertising to students or their parents</li>
            <li>Never be used to create a profile about a student for non-educational purposes</li>
            <li>Never be used for AI or machine learning training purposes</li>
          </ul>

          <h3>C. Security Safeguards</h3>
          <p>The Provider agrees to implement and maintain the following security measures:</p>
          <ul>
            <li>Encryption of Student Data in transit using TLS 1.3/HTTPS</li>
            <li>Encryption of Student Data at rest using AES-256 encryption</li>
            <li>Password/PIN hashing using bcrypt (OWASP recommended algorithm)</li>
            <li>Rate limiting to prevent brute force attacks (5 attempts per 15 minutes)</li>
            <li>Role-based access controls limiting data access to authorized personnel only</li>
            <li>Firebase Security Rules enforcing granular access permissions</li>
            <li>Regular security assessments and vulnerability testing</li>
            <li>Employee training on data privacy and security practices</li>
            <li>Incident response procedures for potential data breaches</li>
          </ul>

          <h3>D. Subprocessors</h3>
          <p>
            The Provider uses the following subprocessors in the delivery of services. The Provider ensures that
            all subprocessors maintain equivalent data protection obligations:
          </p>
          <table className="exhibit-table">
            <thead>
              <tr>
                <th>Subprocessor</th>
                <th>Purpose</th>
                <th>Data Location</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Firebase (Google Cloud)</td>
                <td>Authentication and database services</td>
                <td>United States</td>
              </tr>
              <tr>
                <td>MongoDB Atlas</td>
                <td>Database services</td>
                <td>United States</td>
              </tr>
              <tr>
                <td>Vercel</td>
                <td>Web hosting (static files only, no student data)</td>
                <td>United States</td>
              </tr>
              <tr>
                <td>Railway</td>
                <td>Backend API hosting</td>
                <td>United States</td>
              </tr>
            </tbody>
          </table>

          <h2>Article V: Data Breach Response</h2>
          <p>
            In the event of an unauthorized release, disclosure, or acquisition of Student Data, the Provider shall:
          </p>
          <ol>
            <li>Notify the LEA within <strong>seven (7) calendar days</strong> of discovery of the breach</li>
            <li>Provide a description of the nature and scope of the breach</li>
            <li>Identify the types of Student Data involved</li>
            <li>Describe the actions taken to mitigate the breach</li>
            <li>Describe the corrective actions to prevent future incidents</li>
            <li>Cooperate with the LEA's investigation and notification obligations</li>
          </ol>

          <h2>Article VI: Data Retention and Return/Destruction</h2>

          <h3>A. Data Retention</h3>
          <p>
            The Provider will retain Student Data only for as long as necessary to fulfill the educational purposes
            described in the Service Agreement, subject to the following:
          </p>
          <ul>
            <li><strong>Classroom Mode:</strong> Session data is temporary and not retained after the session ends</li>
            <li><strong>Student Accounts Mode:</strong> Data is retained during active enrollment and for 60 days
            following account termination</li>
          </ul>

          <h3>B. Return or Destruction</h3>
          <p>Upon written request from the LEA or upon termination of the Service Agreement:</p>
          <ul>
            <li>The Provider will return all Student Data to the LEA in a commonly used, machine-readable format within 30 days</li>
            <li>Following data return (or if return is not requested), the Provider will securely destroy all Student Data within 60 days</li>
            <li>The Provider will provide written certification of data destruction upon request</li>
          </ul>

          <h2>Article VII: Parental Rights</h2>
          <p>The Provider agrees to support the following parental rights:</p>
          <ul>
            <li>Parents may review the Student Data collected about their child</li>
            <li>Parents may request correction of inaccurate Student Data</li>
            <li>Parents may request deletion of their child's Student Data</li>
            <li>The Provider will respond to parental requests within 30 days</li>
          </ul>
          <p>
            The LEA acknowledges that it may consent to the collection of Student Data under COPPA on behalf of parents
            when the technology is used for educational purposes and not for any other commercial purpose.
          </p>

          <h2>Article VIII: Audits and Transparency</h2>
          <ul>
            <li>The Provider will make available to the LEA, upon request, documentation of its data privacy and
            security practices</li>
            <li>The Provider will cooperate with reasonable LEA audits of its compliance with this DPA</li>
            <li>The Provider maintains a public Student Data Privacy page at musicmindacademy.com/student-privacy</li>
          </ul>

          <h2>Article IX: Term and Termination</h2>
          <p>
            This DPA shall remain in effect for the duration of the Service Agreement between the parties. Either
            party may terminate this DPA upon written notice if the other party materially breaches this DPA and
            fails to cure such breach within 30 days of written notice.
          </p>
          <p>
            The provisions of this DPA relating to data security, data breach notification, data return/destruction,
            and confidentiality shall survive termination of this DPA.
          </p>

          <h2>Article X: General Provisions</h2>
          <ul>
            <li><strong>Amendments:</strong> This DPA may only be amended by written agreement signed by both parties</li>
            <li><strong>Governing Law:</strong> This DPA shall be governed by the laws of the state in which the LEA is located</li>
            <li><strong>Entire Agreement:</strong> This DPA, together with the Service Agreement and Privacy Policy,
            constitutes the entire agreement between the parties with respect to Student Data</li>
            <li><strong>Notices:</strong> All notices under this DPA shall be sent to the contact information provided below</li>
          </ul>

          {/* Signature Block */}
          <div className="dpa-section" style={{ marginTop: '2rem' }}>
            <h2 style={{ marginTop: 0 }}>Signatures</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '1.5rem' }}>
              <div>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>LOCAL EDUCATION AGENCY</p>
                <p style={{ borderBottom: '1px solid #333', padding: '0.5rem 0', marginBottom: '0.25rem' }}>
                  District Name: _________________________
                </p>
                <p style={{ borderBottom: '1px solid #333', padding: '0.5rem 0', marginBottom: '0.25rem' }}>
                  Authorized Representative: _____________
                </p>
                <p style={{ borderBottom: '1px solid #333', padding: '0.5rem 0', marginBottom: '0.25rem' }}>
                  Title: _______________________________
                </p>
                <p style={{ borderBottom: '1px solid #333', padding: '0.5rem 0', marginBottom: '0.25rem' }}>
                  Signature: ___________________________
                </p>
                <p style={{ borderBottom: '1px solid #333', padding: '0.5rem 0', marginBottom: '0.25rem' }}>
                  Date: _______________________________
                </p>
              </div>

              <div>
                <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>PROVIDER</p>
                <p style={{ padding: '0.5rem 0', marginBottom: '0.25rem' }}>
                  Company: Music Mind Academy
                </p>
                <p style={{ padding: '0.5rem 0', marginBottom: '0.25rem' }}>
                  Authorized Representative: Robert Taube
                </p>
                <p style={{ padding: '0.5rem 0', marginBottom: '0.25rem' }}>
                  Title: Founder
                </p>
                <p style={{ borderBottom: '1px solid #333', padding: '0.5rem 0', marginBottom: '0.25rem' }}>
                  Signature: ___________________________
                </p>
                <p style={{ borderBottom: '1px solid #333', padding: '0.5rem 0', marginBottom: '0.25rem' }}>
                  Date: _______________________________
                </p>
              </div>
            </div>
          </div>

          {/* Exhibit A */}
          <h2>Exhibit A: Data Elements Collected</h2>
          <table className="exhibit-table">
            <thead>
              <tr>
                <th>Data Element</th>
                <th>Classroom Mode</th>
                <th>Student Accounts Mode</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Student Real Name</td>
                <td style={{ color: '#16a34a' }}>Not Collected</td>
                <td>Collected (from Google or teacher)</td>
              </tr>
              <tr>
                <td>Student Email</td>
                <td style={{ color: '#16a34a' }}>Not Collected</td>
                <td>Collected if using Google Sign-In</td>
              </tr>
              <tr>
                <td>Musical Pseudonym</td>
                <td>Student-selected</td>
                <td>Optional</td>
              </tr>
              <tr>
                <td>Music Compositions</td>
                <td>Session only (temporary)</td>
                <td>Persistent storage</td>
              </tr>
              <tr>
                <td>Written Reflections</td>
                <td>Session only (temporary)</td>
                <td>Persistent storage</td>
              </tr>
              <tr>
                <td>Activity Scores</td>
                <td>Session only (temporary)</td>
                <td>Persistent storage</td>
              </tr>
              <tr>
                <td>Session Timestamps</td>
                <td>Not retained</td>
                <td>Collected</td>
              </tr>
            </tbody>
          </table>

          {/* Contact Info */}
          <h2>Contact Information</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="dpa-section">
              <h3 style={{ marginTop: 0 }}>Provider Contact</h3>
              <p style={{ marginBottom: '0.25rem' }}><strong>Music Mind Academy</strong></p>
              <p style={{ marginBottom: '0.25rem' }}>Attn: Robert Taube, Privacy Officer</p>
              <p style={{ marginBottom: '0.25rem' }}>Email: rob@musicmindacademy.com</p>
              <p style={{ marginBottom: 0 }}>Website: musicmindacademy.com</p>
            </div>
            <div className="dpa-section">
              <h3 style={{ marginTop: 0 }}>LEA Contact</h3>
              <p style={{ borderBottom: '1px solid #ccc', padding: '0.5rem 0' }}>District: _____________</p>
              <p style={{ borderBottom: '1px solid #ccc', padding: '0.5rem 0' }}>Contact Name: _________</p>
              <p style={{ borderBottom: '1px solid #ccc', padding: '0.5rem 0' }}>Email: _______________</p>
              <p style={{ borderBottom: '1px solid #ccc', padding: '0.5rem 0' }}>Phone: _______________</p>
            </div>
          </div>

          {/* Footer Links */}
          <div className="no-print" style={{
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
            <a href="/security" style={{ color: '#2563eb', textDecoration: 'none' }}>Security Practices</a>
            <a href="/" style={{ color: '#2563eb', textDecoration: 'none' }}>Home</a>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DataPrivacyAgreement;
