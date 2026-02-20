// Printable Login Cards Component
// src/components/teacher/PrintableLoginCards.jsx
// Generates login cards that mirror the actual student login page

import React from 'react';
import { createPortal } from 'react-dom';
import { Printer, X } from 'lucide-react';

const PrintableLoginCards = ({ roster, className, onClose }) => {
  const isEduSite = import.meta.env.VITE_SITE_MODE === 'edu';
  const siteUrl = isEduSite ? 'musicroomtools.org' : 'musicmindacademy.com';

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
          border-radius: 10px;
          padding: 14px 16px;
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
              {/* Student name + class */}
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-gray-900 text-sm truncate">
                  {student.displayName || `Seat ${student.seatNumber}`}
                </div>
                <div className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{className}</div>
              </div>

              {/* Step 1: Big URL */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-center mb-2">
                <div className="text-[10px] text-blue-500 font-semibold mb-0.5">1. Go to</div>
                <div className="text-lg font-bold text-blue-700 tracking-tight">{siteUrl}</div>
              </div>

              {/* Step 2: Click Join Class */}
              <div className="text-sm text-gray-700 mb-2">
                <span className="font-semibold text-gray-500">2.</span> Click <span className="font-semibold">Join Class</span>
              </div>

              {/* Step 3: Enter credentials */}
              <div className="text-sm text-gray-700 mb-1.5">
                <span className="font-semibold text-gray-500">3.</span> Enter your username & password
              </div>
              <div className="space-y-1.5">
                <div className="border border-gray-300 rounded-md px-3 py-1.5 bg-gray-50">
                  <div className="text-[9px] text-gray-400 mb-0.5">Username</div>
                  <div className="font-mono font-bold text-base text-gray-900">
                    {student.username || `seat${student.seatNumber}`}
                  </div>
                </div>
                <div className="border border-gray-300 rounded-md px-3 py-1.5 bg-gray-50">
                  <div className="text-[9px] text-gray-400 mb-0.5">Password</div>
                  <div className="font-mono font-bold text-base text-gray-900">
                    {student.pin}
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
