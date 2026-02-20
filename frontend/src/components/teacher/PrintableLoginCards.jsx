// Printable Login Cards Component
// src/components/teacher/PrintableLoginCards.jsx
// Generates professional cut-out login cards for students

import React from 'react';
import { createPortal } from 'react-dom';
import { Printer, X } from 'lucide-react';

const PrintableLoginCards = ({ roster, className, onClose }) => {
  const isEduSite = import.meta.env.VITE_SITE_MODE === 'edu';
  const handlePrint = () => {
    window.print();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-auto bg-gray-900/50 login-cards-print-container">
      {/* Floating controls — hidden when printing */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 print:hidden">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg"
        >
          <Printer size={18} />
          Print
        </button>
        <button
          onClick={onClose}
          className="p-2 bg-white text-gray-500 hover:text-gray-700 rounded-lg shadow-lg"
        >
          <X size={20} />
        </button>
      </div>

      {/* Styles */}
      <style>{`
        .login-card {
          border: 2px dashed #94a3b8;
          border-radius: 8px;
          padding: 10px 12px;
          background: white;
          break-inside: avoid;
        }

        .card-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          padding: 16px;
          max-width: 800px;
          margin: 0 auto;
        }

        @media print {
          @page {
            size: letter;
            margin: 0.3in 0.4in;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Hide the app */
          #root {
            display: none !important;
          }

          /* Cards container: static for pagination */
          .login-cards-print-container {
            position: static !important;
            overflow: visible !important;
            height: auto !important;
            background: white !important;
          }

          /* Force grid layout in print */
          .card-grid {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 10px !important;
            padding: 0 !important;
            max-width: none !important;
          }

          .login-card {
            break-inside: avoid !important;
          }
        }
      `}</style>

      {/* All cards in one continuous grid — browser handles pagination */}
      <div className="bg-white p-6 print:p-0">
        <div className="card-grid">
          {roster.map((student) => (
            <div key={student.seatNumber} className="login-card">
              {/* Header: logo + student name */}
              <div className="flex items-center gap-2 mb-1.5 pb-1.5 border-b border-gray-100">
                {!isEduSite && (
                  <img
                    src="/MusicMindAcademyLogo.png"
                    alt="Music Mind Academy"
                    style={{ height: '20px', width: 'auto' }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-gray-900 text-sm truncate">
                    {student.displayName || `Seat ${student.seatNumber}`}
                  </div>
                  <div className="text-[10px] text-gray-400">{className}</div>
                </div>
              </div>

              {/* Instructions */}
              <div className="text-[10px] text-gray-500 mb-1.5 leading-tight">
                <span className="font-semibold text-gray-600">1.</span> Go to <span className="font-medium text-gray-700">{isEduSite ? 'musicroomtools.org' : 'musicmindacademy.com'}</span>
                {' '}<span className="font-semibold text-gray-600">2.</span> Click <span className="font-medium text-gray-700">Join Class</span>
                {' '}<span className="font-semibold text-gray-600">3.</span> Enter your username & password
              </div>

              {/* Login Credentials */}
              <div className="bg-gray-50 rounded-md p-2">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-[9px] text-gray-500 uppercase tracking-wide">Username</div>
                    <div className="font-mono font-bold text-lg text-gray-900 tracking-wide">
                      {student.username || `seat${student.seatNumber}`}
                    </div>
                  </div>
                  <div className="border-l border-gray-200 pl-3">
                    <div className="text-[9px] text-gray-500 uppercase tracking-wide">Password</div>
                    <div className="font-mono font-bold text-base text-gray-900">
                      {student.pin}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>,
    document.body
  );
};

export default PrintableLoginCards;
