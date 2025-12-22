// File: /src/lessons/film-music-project/lesson2/LessonPlan2PDF.jsx
// Printable lesson plan view for teachers - Sports Highlight Reel

import React from 'react';

const LessonPlan2PDF = () => {
  return (
    <div className="min-h-screen bg-white p-8 max-w-5xl mx-auto print:p-4">
      {/* Print Button - Hidden when printing */}
      <div className="mb-6 print:hidden flex gap-3">
        <button
          onClick={() => window.print()}
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-colors"
        >
          🖨️ Print Lesson Plan
        </button>
        <button
          onClick={() => window.close()}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-colors"
        >
          Close Window
        </button>
      </div>

      {/* Lesson Plan Content */}
      <div className="prose prose-sm max-w-none">
        {/* Header */}
        <div className="border-b-4 border-orange-600 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-orange-900 mb-2">
            🏀 Lesson 2: Sports Highlight Reel
          </h1>
          <p className="text-lg text-gray-700 font-semibold">
            Instrumentation & Timbre — What sounds create the feeling?
          </p>
          <div className="flex gap-6 mt-3 text-sm">
            <div><strong>Grade Level:</strong> 6-8</div>
            <div><strong>Duration:</strong> 40 minutes</div>
          </div>
        </div>

        {/* LESSON OVERVIEW */}
        <section className="mb-8 bg-orange-50 p-4 rounded-lg border border-orange-200">
          <h2 className="text-xl font-bold text-orange-800 mb-3">
            Lesson Overview
          </h2>
          <p className="text-sm mb-4">
            Students master the DAW through a guided challenge, then create high-energy music for sports highlights by choosing instruments intentionally.
          </p>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Students Will:</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Navigate the DAW interface confidently</li>
            <li className="text-sm">Choose instruments that match the energy</li>
            <li className="text-sm">Create layered compositions for sports video</li>
          </ul>
        </section>

        {/* STAGE 1: DESIRED RESULTS */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-orange-800 mb-4 border-b-2 border-orange-300 pb-2">
            STAGE 1: DESIRED RESULTS
          </h2>

          {/* Standards */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Standards (National Core Arts Standards - Music):
            </h3>
            <ul className="list-none space-y-1 ml-0">
              <li className="text-sm"><strong>MU:Cr1.1.5a</strong> - Improvise rhythmic, melodic, and harmonic ideas, and explain connection to specific purpose and context</li>
              <li className="text-sm"><strong>MU:Cr2.1.5a</strong> - Demonstrate selected and developed musical ideas for compositions to express intent</li>
              <li className="text-sm"><strong>MU:Pr4.2.5a</strong> - Demonstrate understanding of the structure and elements of music</li>
            </ul>
          </div>

          {/* Enduring Understandings */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Enduring Understandings:
            </h3>
            <p className="text-sm italic mb-2">Students will understand that...</p>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Different instruments create different timbres (tone colors)</li>
              <li className="text-sm">Instrumentation choices affect the energy and mood of music</li>
              <li className="text-sm">Sports music uses specific instruments to create excitement and hype</li>
              <li className="text-sm">DAW proficiency enables creative expression</li>
            </ul>
          </div>

          {/* Essential Questions */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Essential Questions:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">What sounds create the feeling?</li>
              <li className="text-sm">How do instrument choices affect the energy of music?</li>
              <li className="text-sm">What makes sports music sound exciting?</li>
            </ul>
          </div>

          {/* Students will know */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Students will know...
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">All DAW controls and their functions</li>
              <li className="text-sm">How different instruments create different timbres</li>
              <li className="text-sm">Which instrument families work well for high-energy music</li>
              <li className="text-sm">How to layer instruments effectively</li>
            </ul>
          </div>

          {/* Students will be able to */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Students will be able to...
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Navigate all DAW controls confidently</li>
              <li className="text-sm">Select instruments intentionally to match energy</li>
              <li className="text-sm">Create layered compositions with multiple instrument types</li>
              <li className="text-sm">Reflect on their instrumentation choices</li>
            </ul>
          </div>
        </section>

        {/* STAGE 2: ASSESSMENT EVIDENCE */}
        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-orange-800 mb-4 border-b-2 border-orange-300 pb-2">
            STAGE 2: ASSESSMENT EVIDENCE
          </h2>

          {/* Performance Task */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Performance Task:
            </h3>
            <p className="text-sm mb-2">
              Students compose an original sports highlight soundtrack that demonstrates:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm"><strong>DAW Mastery:</strong> Completes DAW Challenge successfully</li>
              <li className="text-sm"><strong>Variety:</strong> Uses 5+ different loops with intentional instrument choices</li>
              <li className="text-sm"><strong>Energy:</strong> Music matches the high-energy feel of sports</li>
            </ul>
          </div>

          {/* Other Evidence */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Other Evidence:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">DAW Challenge completion (formative - DAW proficiency)</li>
              <li className="text-sm">Real-time progress tracking during composition</li>
              <li className="text-sm">"Two Stars and a Wish" reflection (self-assessment)</li>
              <li className="text-sm">Peer sharing and discussion</li>
            </ul>
          </div>
        </section>

        {/* STAGE 3: LEARNING PLAN */}
        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-orange-800 mb-4 border-b-2 border-orange-300 pb-2">
            STAGE 3: LEARNING PLAN (40 minutes)
          </h2>

          {/* Introduction */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-blue-50 p-2 rounded">
              1. Introduction <span className="font-normal text-gray-600">— Discussion & DAW Review (6 min)</span>
            </h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left w-16">Time</th>
                  <th className="border p-2 text-left w-48">Activity</th>
                  <th className="border p-2 text-left">What to Say/Do</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">3 min</td>
                  <td className="border p-2 font-medium">Introduction</td>
                  <td className="border p-2">Ask: "What sport do you like? What music or feeling goes with it?"</td>
                </tr>
                <tr>
                  <td className="border p-2">3 min</td>
                  <td className="border p-2 font-medium">DAW Review</td>
                  <td className="border p-2">Quick refresher on DAW controls from Lesson 1</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* DAW Challenge */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-purple-50 p-2 rounded">
              2. Practice <span className="font-normal text-gray-600">— DAW Challenge (7 min)</span>
            </h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left w-16">Time</th>
                  <th className="border p-2 text-left w-48">Activity</th>
                  <th className="border p-2 text-left">What to Say/Do</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-green-50">
                  <td className="border p-2">7 min</td>
                  <td className="border p-2 font-medium">🎮 DAW Challenge</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Click every button to master the DAW<br/>
                    Complete all challenges to unlock composition mode<br/>
                    <em className="text-green-700">Bonus: Explore and experiment freely</em>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Composition */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-orange-50 p-2 rounded">
              3. Create <span className="font-normal text-gray-600">— Tutorial & Composition (19 min)</span>
            </h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left w-16">Time</th>
                  <th className="border p-2 text-left w-48">Activity</th>
                  <th className="border p-2 text-left">What to Say/Do</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">4 min</td>
                  <td className="border p-2 font-medium">▶️ Tutorial Video</td>
                  <td className="border p-2"><strong>PLAY VIDEO:</strong> How to compose for sports highlights</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">15 min</td>
                  <td className="border p-2 font-medium">🎮 Composition</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Pick a sport, create hype music<br/>
                    Focus on instrument choices that match energy<br/>
                    <em className="text-green-700">Bonus: Add sound effects and more layers!</em>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Reflection */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-yellow-50 p-2 rounded">
              4. Reflect <span className="font-normal text-gray-600">— Two Stars and a Wish + Share (8 min)</span>
            </h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left w-16">Time</th>
                  <th className="border p-2 text-left w-48">Activity</th>
                  <th className="border p-2 text-left">What to Say/Do</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-green-50">
                  <td className="border p-2">5 min</td>
                  <td className="border p-2 font-medium">🎮 Two Stars and a Wish</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Reflect on their work<br/>
                    Focus on instrument choices and energy level
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">3 min</td>
                  <td className="border p-2 font-medium">Share</td>
                  <td className="border p-2">1-2 students share their work. Ask: "What instruments? What energy?"</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bonus */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-amber-50 p-2 rounded">
              ⭐ Bonus Activity <span className="font-normal text-gray-600">— Melody Escape Room (7 min)</span>
            </h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left w-16">Time</th>
                  <th className="border p-2 text-left w-48">Activity</th>
                  <th className="border p-2 text-left">What to Say/Do</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-amber-50">
                  <td className="border p-2">7 min</td>
                  <td className="border p-2 font-medium">🎮 Melody Escape Room</td>
                  <td className="border p-2">
                    <strong>PARTNER ACTIVITY:</strong> Solve melody puzzles together<br/>
                    <em className="text-amber-700">Great for early finishers!</em>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* KEY VOCABULARY */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-orange-800 mb-4 border-b-2 border-orange-300 pb-2">
            Key Vocabulary
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Timbre:</strong> The unique tone color of an instrument</li>
                <li><strong>Instrumentation:</strong> Choice of instruments in a composition</li>
                <li><strong>DAW:</strong> Digital Audio Workstation</li>
              </ul>
            </div>
            <div>
              <ul className="list-disc ml-6 space-y-1">
                <li><strong>Loop:</strong> A repeating musical phrase</li>
                <li><strong>Layer:</strong> Multiple sounds playing together</li>
                <li><strong>Energy:</strong> The intensity and excitement level of music</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Resources & Materials */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-orange-800 mb-4 border-b-2 border-orange-300 pb-2">
            Resources & Materials
          </h2>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Chromebooks/computers with internet access and headphones</li>
            <li className="text-sm">Sports highlight videos (basketball, football, skateboarding, etc.)</li>
            <li className="text-sm">Loop library with various instrument categories</li>
            <li className="text-sm">Session code for teacher-controlled lesson flow</li>
          </ul>
        </section>

        {/* Important Notes */}
        <section className="mb-8 bg-orange-50 p-4 rounded-lg border-2 border-orange-300">
          <h2 className="text-xl font-bold text-orange-800 mb-3">
            📋 Important Notes for Teachers
          </h2>
          <ul className="list-disc ml-6 space-y-2">
            <li className="text-sm">Students should have completed Lesson 1 first (basic DAW skills)</li>
            <li className="text-sm">DAW Challenge reinforces and tests skills from Lesson 1</li>
            <li className="text-sm">Focus discussion on WHY certain instruments create energy</li>
            <li className="text-sm">Green rows (🎮) indicate student activity time - start the timer!</li>
            <li className="text-sm">Encourage students to think about instrument choices, not just random selection</li>
          </ul>
        </section>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-4 mt-8 text-center text-sm text-gray-500">
          <p>🏀 Sports Highlight Reel - Lesson 2 of Music for Media Unit</p>
          <p>Music Mind Academy © 2024</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .page-break-before {
            page-break-before: always;
          }
          @page {
            margin: 0.5in;
          }
        }
      `}</style>
    </div>
  );
};

export default LessonPlan2PDF;
