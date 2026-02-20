// Printable Roster Sheet
// src/components/teacher/PrintableRosterSheet.jsx
// Single-page table with all student usernames and PINs

import React from 'react';
import { Printer, X } from 'lucide-react';

const PrintableRosterSheet = ({ roster, className, onClose }) => {
  const isEduSite = import.meta.env.VITE_SITE_MODE === 'edu';
  const siteName = isEduSite ? 'musicroomtools.org' : 'musicmindacademy.com';

  const handlePrint = () => {
    window.print();
  };

  const sorted = [...roster].sort((a, b) => a.seatNumber - b.seatNumber);

  return (
    <div className="print-roster-overlay fixed inset-0 z-50 overflow-auto bg-gray-900/50 print:bg-white print:static">
      {/* Controls - Hidden when printing */}
      <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Print Class Roster</h2>
          <p className="text-sm text-gray-500">{roster.length} students in {className}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Printer size={18} />
            Print Roster
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
          /* Hide everything on the page except this overlay */
          body > * {
            visibility: hidden !important;
          }
          /* But show the React root and walk down to this component */
          #root, #root > *, #root > * > * {
            visibility: hidden !important;
          }
          .print-roster-overlay {
            visibility: visible !important;
            position: absolute !important;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
          }
          .print-roster-overlay * {
            visibility: visible !important;
          }
          .roster-table th {
            background-color: #f3f4f6 !important;
          }
        }
      `}</style>

      {/* Roster Page */}
      <div className="bg-white min-h-screen p-8 print:p-0 print:min-h-0 max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-gray-900">{className}</h1>
          <p className="text-gray-500 text-sm">Student Login Roster · {siteName}</p>
        </div>

        {/* Table */}
        <table className="roster-table w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr>
              <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase w-12">#</th>
              <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
              <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase w-40">Username</th>
              <th className="border border-gray-300 bg-gray-100 px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase w-32">Password</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((student) => (
              <tr key={student.seatNumber}>
                <td className="border border-gray-300 px-3 py-1.5 text-gray-500">{student.seatNumber}</td>
                <td className="border border-gray-300 px-3 py-1.5 font-medium text-gray-900">
                  {student.displayName || student.name || `Seat ${student.seatNumber}`}
                </td>
                <td className="border border-gray-300 px-3 py-1.5 font-mono font-semibold text-gray-800">
                  {student.username || `seat${student.seatNumber}`}
                </td>
                <td className="border border-gray-300 px-3 py-1.5 font-mono font-bold text-gray-900">
                  {student.pin || '--'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="mt-4 text-xs text-gray-400 text-center">
          Keep this sheet private · Do not post or share with students
        </div>
      </div>
    </div>
  );
};

export default PrintableRosterSheet;
