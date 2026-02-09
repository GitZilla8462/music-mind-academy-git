// /src/pages/TermsOfService.jsx
// Terms of Service for Music Mind Academy
// Last updated: January 2026

import React from 'react';
import { useNavigate } from 'react-router-dom';

const TermsOfService = () => {
  const navigate = useNavigate();
  const isEduSite = import.meta.env.VITE_SITE_MODE === 'edu';
  const siteName = isEduSite ? 'Music Room Tools' : 'Music Mind Academy';

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
              Last updated: February 2026
            </p>
          </div>

          <p>
            These Terms of Service ("Terms") govern your use of {siteName} ("the Platform,"
            "we," "us," or "our"), a web-based music education platform at {isEduSite ? 'musicroomtools.org' : 'musicmindacademy.com'}.
            By creating an account or using the Platform, you agree to these Terms.
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using {siteName}, you agree to be bound by these Terms and our{' '}
            <a href="/privacy">Privacy Policy</a>. If you do not agree to these Terms, please do not
            use our Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            {siteName} is a web-based music education platform. Students log in to create
            music compositions, complete activities, and save their work. Teachers manage lessons,
            track progress, and enter grades. Teachers can also run Quick Join sessions where
            students participate with just a class code — no accounts needed.
          </p>

          <h2>3. User Accounts</h2>

          <h3>Teacher Accounts</h3>
          <p>
            Teachers create accounts using Google sign-in. By creating a teacher account, you represent
            that you are an educator or authorized school employee and that you are at least 18 years of age.
            You are responsible for:
          </p>
          <ul>
            <li>Maintaining the security of your account credentials</li>
            <li>All activities that occur under your account</li>
            <li>Ensuring your use complies with your school or district policies</li>
          </ul>

          <h3>Student Access</h3>
          <p>
            Students access the platform by signing in with a system-generated username and PIN.
            Their work is saved persistently and visible to the teacher through a built-in gradebook.
            Teachers can also run Quick Join sessions where students join with just a class code — no
            account is created and no personal information is collected.
          </p>
          <p>
            By creating student accounts, the teacher represents and warrants that:
          </p>
          <ul>
            <li>They have reviewed the {siteName} <a href="/privacy">Privacy Policy</a></li>
            <li>Their school or district has authorized the use of the Platform for student data collection{!isEduSite && ', including any required Data Privacy Agreement'}</li>
            <li>They are authorized to consent on behalf of parents under COPPA for the educational
            use of the Platform</li>
            <li>They will not enter unnecessary personal information about students beyond what is
            required for the educational service</li>
          </ul>

          <h2>4. Teacher Responsibilities</h2>
          <p>As a teacher using the Platform, you agree to:</p>
          <ul>
            <li>Use the Platform solely for educational purposes</li>
            <li>Ensure that student use of the Platform is supervised or directed as part of classroom instruction</li>
            <li>Manage your class roster and remove students who are no longer in your class</li>
            <li>Not share class codes publicly or with unauthorized individuals</li>
            <li>Notify us promptly if you become aware of any unauthorized access to student data</li>
            <li>Comply with your school or district's acceptable use policies and data privacy requirements</li>
          </ul>

          <h2>5. Student Data Privacy</h2>
          <p>
            We take student privacy seriously. Our complete data privacy practices are described
            in our <a href="/privacy">Privacy Policy</a> and <a href="/student-privacy">Student Data
            Privacy</a> page. Key commitments include:
          </p>
          <ul>
            <li>We never sell student data</li>
            <li>We never use student data for advertising or marketing</li>
            <li>We collect only the minimum data necessary to provide the educational service</li>
            <li>Student data is encrypted in transit (TLS 1.2+) and at rest (AES-256)</li>
            <li>We comply with FERPA, COPPA, and New York Education Law § 2-d</li>
            <li>We operate as a "school official" under FERPA with a legitimate educational interest</li>
            <li>We do not redisclose education records except to our subprocessors or as authorized by FERPA</li>
            <li>Teachers can delete student data at any time</li>
            <li>Parents can request review or deletion of their child's data</li>
          </ul>

          <h3>Data Breach Notification</h3>
          <p>
            In the event of a breach or unauthorized release of student personally identifiable information,
            we will notify affected schools and districts within <strong>7 calendar days</strong> of discovery,
            in accordance with NY Education Law § 2-d. For complete incident response details, see
            our <a href="/student-privacy">Student Data Privacy</a> page.
          </p>

          {!isEduSite && (
            <>
              <h2>6. Data Privacy Agreements</h2>
              <p>
                Schools and districts may request a Data Privacy Agreement (DPA) before authorizing
                teacher use of the Platform. We are prepared to execute Data Privacy Agreements including
                agreements compatible with the Student Data Privacy Consortium (SDPC) National Data
                Privacy Agreement (NDPA) framework or your district's standard DPA template.
              </p>
              <p>
                To request a Data Privacy Agreement, contact:{' '}
                <a href="mailto:rob@musicmindacademy.com">rob@musicmindacademy.com</a>
              </p>
            </>
          )}

          <h2>7. Acceptable Use</h2>
          <p>You agree NOT to:</p>
          <ul>
            <li>Use the Service for any purpose other than music education</li>
            <li>Share content that is offensive, harmful, or inappropriate for educational settings</li>
            <li>Attempt to gain unauthorized access to any part of the Service or other users' data</li>
            <li>Interfere with or disrupt the Service or servers</li>
            <li>Use automated means (bots, scrapers) to access the Service</li>
            <li>Reverse engineer, decompile, or attempt to extract source code from the Service</li>
            <li>Share your account credentials with others</li>
            <li>Circumvent any access controls or security measures</li>
          </ul>

          <h2>8. Content and Intellectual Property</h2>

          <h3>Platform Content</h3>
          <p>
            The Platform, including its design, software, audio loops, lesson content, and educational
            materials, is owned by {siteName} and protected by copyright and other intellectual
            property laws. Your subscription grants you a limited, non-exclusive, non-transferable
            license to use the Platform for classroom instruction during your active subscription period.
          </p>

          <h3>Student-Created Content</h3>
          <p>
            Music compositions, written reflections, and other content created by students using the
            Platform belong to the student and their school. We claim no ownership of student-created
            content. Upon request, we will provide exports of student-created content to the teacher or school.
          </p>

          <h3>Teacher-Created Content</h3>
          <p>
            Lesson plans, class configurations, and other content created by teachers using the
            Platform belong to the teacher. We claim no ownership of teacher-created content.
          </p>

          <h3>Audio Loops License</h3>
          <p>
            Audio loops provided in {siteName} are licensed for educational use within our
            platform. They may not be extracted, downloaded, or used outside of {siteName}
            without separate licensing.
          </p>

          <h2>9. Subscription and Payment</h2>
          <p>
            Access to {siteName} requires a paid subscription. Subscription details, pricing,
            and payment terms are presented at the time of purchase.
          </p>
          <ul>
            <li>Subscriptions are billed annually unless otherwise specified</li>
            <li>Payment is due at the start of the subscription period</li>
            <li>You may cancel your subscription at any time</li>
            <li>Upon cancellation, you will retain access through the end of your current billing period</li>
            <li>Refund requests within 30 days of purchase will be honored</li>
            <li>We reserve the right to change pricing with 30 days notice</li>
          </ul>
          <p>
            After your subscription expires, student data will be handled
            in accordance with our Privacy Policy — securely deleted within 60 days unless you
            request an export.
          </p>

          <h2>10. Service Availability</h2>
          <p>
            We strive to keep the Platform available and reliable, but we do not guarantee
            uninterrupted access. We may temporarily suspend the service for maintenance, updates,
            or security reasons. We will make reasonable efforts to provide advance notice of
            planned maintenance.
          </p>

          <h2>11. Disclaimer of Warranties</h2>
          <p>
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
            EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT
            WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
          </p>

          <h2>12. Limitation of Liability</h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, MUSIC MIND ACADEMY SHALL NOT BE LIABLE FOR
            ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS
            OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY. OUR TOTAL LIABILITY
            FOR ANY CLAIMS ARISING UNDER THESE TERMS SHALL NOT EXCEED THE AMOUNT YOU PAID FOR
            YOUR SUBSCRIPTION IN THE 12 MONTHS PRECEDING THE CLAIM.
          </p>

          <h2>13. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless {siteName} and its owner from any
            claims, damages, or expenses arising from your use of the Service or violation of
            these Terms.
          </p>

          <h2>14. Termination</h2>
          <p>
            Either party may terminate these Terms at any time. You may terminate by canceling
            your subscription and deleting your account. We may suspend or terminate your access
            if you violate these Terms.
          </p>
          <p>Upon termination:</p>
          <ul>
            <li>Your right to use the Platform ceases (or at the end of your billing period if you cancel)</li>
            <li>Student data will be handled in accordance with our Privacy Policy</li>
            {!isEduSite && (
              <li>We will comply with any applicable Data Privacy Agreement regarding data return or destruction</li>
            )}
            <li>Provisions of these Terms that by their nature should survive termination will survive</li>
          </ul>

          <h2>15. Changes to Terms</h2>
          <p>
            We may modify these Terms at any time. If we make material changes, we will notify
            active users by email at least 30 days before the changes take effect. Continued use
            of the Service after changes take effect constitutes acceptance of the modified Terms.
          </p>

          <h2>16. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the State of New York, United States,
            without regard to conflict of law principles. Any disputes arising under these
            Terms shall be resolved in the courts of the State of New York.
          </p>

          {!isEduSite && (
            <>
              <h2>17. Contact Information</h2>
              <p>
                If you have questions about these Terms, please contact us:
              </p>
              <p>
                <strong>Robert Taube</strong><br />
                Founder, Music Mind Academy<br />
                Email: <a href="mailto:rob@musicmindacademy.com">rob@musicmindacademy.com</a>
              </p>
            </>
          )}
          <p>
            For data privacy questions specifically, see our{' '}
            <a href="/student-privacy">Student Data Privacy</a> page.
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
