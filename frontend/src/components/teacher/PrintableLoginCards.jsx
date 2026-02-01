// Printable Login Cards Component
// src/components/teacher/PrintableLoginCards.jsx
// Generates professional cut-out login cards for students

import React from 'react';
import { Printer, X } from 'lucide-react';

const PrintableLoginCards = ({ roster, className, classCode, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  // Generate 6 cards per page (2 columns x 3 rows)
  const cardsPerPage = 6;
  const pages = [];
  for (let i = 0; i < roster.length; i += cardsPerPage) {
    pages.push(roster.slice(i, i + cardsPerPage));
  }

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-gray-900/50 print:bg-white print:static">
      {/* Print Controls - Hidden when printing */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Print Login Cards</h2>
          <p className="text-sm text-gray-500">{roster.length} cards for {className}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Printer size={18} />
            Print Cards
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: letter;
            margin: 0.5in;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .print-page {
            page-break-after: always;
            page-break-inside: avoid;
          }

          .print-page:last-child {
            page-break-after: auto;
          }

          .no-print {
            display: none !important;
          }
        }

        .login-card {
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          padding: 20px;
          background: white;
          position: relative;
        }

        .login-card::before {
          content: '✂';
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          padding: 0 8px;
          color: #94a3b8;
          font-size: 14px;
        }

        .card-logo {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #0ea5e9, #0284c7);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .card-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          padding: 24px;
        }

        @media print {
          .card-grid {
            gap: 20px;
            padding: 0;
          }
        }
      `}</style>

      {/* Card Pages */}
      <div className="print:block">
        {pages.map((pageCards, pageIndex) => (
          <div key={pageIndex} className="print-page bg-white min-h-screen p-6 print:p-0 print:min-h-0">
            {/* Page Header - Only on first page for print */}
            {pageIndex === 0 && (
              <div className="text-center mb-6 print:mb-4">
                <h1 className="text-xl font-bold text-gray-900 print:text-lg">{className}</h1>
                <p className="text-gray-500 text-sm">Student Login Cards</p>
              </div>
            )}

            {/* Cards Grid */}
            <div className="card-grid">
              {pageCards.map((student) => (
                <div key={student.seatNumber} className="login-card">
                  {/* Card Header */}
                  <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                    <img
                      src="/MusicMindAcademyLogo.png"
                      alt="Music Mind Academy"
                      style={{ height: '32px', width: 'auto' }}
                    />
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">Music Mind Academy</div>
                      <div className="text-xs text-gray-500">{className}</div>
                    </div>
                  </div>

                  {/* Student Name */}
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Student</div>
                    <div className="font-semibold text-gray-900 text-lg">
                      {student.displayName || `Seat ${student.seatNumber}`}
                    </div>
                  </div>

                  {/* Login Info */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">Class Code</div>
                      <div className="font-mono font-bold text-xl text-blue-600 tracking-wider">
                        {classCode}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Username</div>
                      <div className="font-mono font-bold text-2xl text-gray-900 tracking-wide text-center py-1">
                        {student.username || `seat${student.seatNumber}`}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">PIN</div>
                      <div className="font-mono font-bold text-3xl text-gray-900 tracking-widest text-center py-1">
                        {student.pin}
                      </div>
                    </div>
                  </div>

                  {/* Instructions */}
                  <div className="mt-4 text-xs text-gray-500 text-center">
                    Go to <span className="font-medium text-gray-700">musicmindacademy.com</span> → Enter code → Enter username & PIN
                  </div>
                </div>
              ))}

              {/* Fill empty spots on last page */}
              {pageCards.length < cardsPerPage &&
                Array(cardsPerPage - pageCards.length).fill(null).map((_, i) => (
                  <div key={`empty-${i}`} className="login-card opacity-0 print:hidden" />
                ))
              }
            </div>

            {/* Page Footer */}
            <div className="mt-6 text-center text-xs text-gray-400 print:mt-4">
              Page {pageIndex + 1} of {pages.length} · Keep this card private
            </div>
          </div>
        ))}
      </div>

      {/* Preview Note */}
      <div className="p-4 bg-gray-100 text-center print:hidden">
        <p className="text-sm text-gray-600">
          Cards are designed to be cut along the dashed lines. Print on standard letter paper.
        </p>
      </div>
    </div>
  );
};

export default PrintableLoginCards;
