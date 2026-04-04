// File: /src/lessons/listening-lab/lesson5/LessonPlanPDF.jsx
// Printable lesson plan view for teachers - Finish & Play

import React from 'react';

const LessonPlanPDF = () => {
  return (
    <div className="min-h-screen bg-white p-8 max-w-5xl mx-auto print:p-4">
      {/* Print Button - Hidden when printing */}
      <div className="mb-6 print:hidden flex gap-3">
        <button
          onClick={() => window.print()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-colors"
        >
          Print Lesson Plan
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
        <div className="border-b-4 border-blue-500 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            Lesson 5: Finish & Play
          </h1>
          <p className="text-lg text-gray-700 font-semibold">
            Decoys, Peer Play & Exit Ticket
          </p>
          <div className="flex gap-6 mt-3 text-sm">
            <div><strong>Grade Level:</strong> 5-8</div>
            <div><strong>Duration:</strong> ~30 minutes</div>
            <div><strong>Unit:</strong> The Listening Lab</div>
          </div>
          <div className="mt-2 text-sm">
            <strong>Featured Piece:</strong> Student's chosen capstone piece (same as Lesson 4)
          </div>
        </div>

        {/* LESSON OVERVIEW */}
        <section className="mb-8 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h2 className="text-xl font-bold text-blue-800 mb-3">
            Lesson Overview
          </h2>
          <p className="text-sm mb-4">
            Students add decoys to their Listening Journey games to create a challenge, then play each other's games and complete an exit ticket covering all five lessons.
          </p>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Students Will:</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Add decoys to create a challenging game for classmates</li>
            <li className="text-sm">Play each other's Listening Journey games</li>
            <li className="text-sm">Reflect on what you learned about dynamics, tempo, form, and instruments</li>
          </ul>
        </section>

        {/* STAGE 1: DESIRED RESULTS */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-blue-800 mb-4 border-b-2 border-blue-300 pb-2">
            STAGE 1: DESIRED RESULTS
          </h2>

          {/* Standards */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Standards (National Core Arts Standards - Music):
            </h3>
            <ul className="list-none space-y-1 ml-0">
              <li className="text-sm"><strong>MU:Re7.2.5a</strong> - Demonstrate and explain how responses to music are informed by structure and context</li>
              <li className="text-sm"><strong>MU:Re9.1.5a</strong> - Evaluate musical works and performances, applying established criteria</li>
              <li className="text-sm"><strong>MU:Cr3.1.5a</strong> - Evaluate, refine, and document revisions to personal music</li>
            </ul>
          </div>

          {/* Essential Questions */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Essential Questions:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">How can I use what I've learned about music elements to create and evaluate a listening experience?</li>
            </ul>
          </div>

          {/* I Can Statement */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              I Can Statement:
            </h3>
            <p className="text-sm ml-6">I can create a challenging Listening Journey game and identify musical elements in my classmates' games.</p>
          </div>

          {/* Students will know */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Students will know...
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">How decoys create challenge and require deeper musical understanding to distinguish</li>
              <li className="text-sm">How to evaluate a peer's Listening Journey for musical accuracy</li>
              <li className="text-sm">Key concepts from all five lessons: dynamics, tempo, form, and instruments</li>
            </ul>
          </div>

          {/* Students will be able to */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Students will be able to...
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Strategically place decoy stickers to challenge players</li>
              <li className="text-sm">Play and evaluate a classmate's Listening Journey game</li>
              <li className="text-sm">Demonstrate understanding of dynamics, tempo, form, and instruments through an exit ticket</li>
            </ul>
          </div>
        </section>

        {/* STAGE 2: ASSESSMENT EVIDENCE */}
        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-blue-800 mb-4 border-b-2 border-blue-300 pb-2">
            STAGE 2: ASSESSMENT EVIDENCE
          </h2>

          {/* Performance Task */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Performance Task:
            </h3>
            <p className="text-sm mb-2">
              Completed Listening Journey game with decoys that demonstrates:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm"><strong>Accuracy:</strong> Real stickers correctly placed at musical moments</li>
              <li className="text-sm"><strong>Challenge:</strong> Decoys placed strategically near real stickers</li>
              <li className="text-sm"><strong>Completeness:</strong> Journey covers dynamics, tempo, and form</li>
            </ul>
          </div>

          {/* Summative Assessment */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Summative Assessment:
            </h3>
            <p className="text-sm">
              Exit Ticket — 2 multiple-choice questions + 2 reflections covering content from all 5 lessons
            </p>
          </div>

          {/* Other Evidence */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Other Evidence:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Peer Play participation and engagement</li>
              <li className="text-sm">Peer feedback during gameplay</li>
              <li className="text-sm">Decoy placement strategy (formative)</li>
            </ul>
          </div>
        </section>

        {/* STAGE 3: LEARNING PLAN */}
        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-blue-800 mb-4 border-b-2 border-blue-300 pb-2">
            STAGE 3: LEARNING PLAN (~30 minutes)
          </h2>

          {/* Add Decoys */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-red-50 p-2 rounded">
              1. Add Decoys <span className="font-normal text-gray-600">— Set Your Traps (9 min)</span>
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
                  <td className="border p-2">2 min</td>
                  <td className="border p-2 font-medium">Welcome Back</td>
                  <td className="border p-2">Quick check-in — where did you leave off? What do you need to finish?</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">7 min</td>
                  <td className="border p-2 font-medium">Add Decoys</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Finish journey AND add decoy stickers. Decoys are fake stickers that trick the player — place them near real stickers to make the game harder!<br/>
                    <em className="text-green-700">Place decoys near real stickers to make your game harder!</em>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Peer Play */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-green-50 p-2 rounded">
              2. Peer Play <span className="font-normal text-gray-600">— Play Each Other's Journeys (10 min)</span>
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
                  <td className="border p-2">15 min</td>
                  <td className="border p-2 font-medium">Peer Play</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Students share codes and play each other's Listening Journey games on their devices<br/>
                    <em className="text-green-700">Try to get 5 people to play YOUR game! Check your Scores button to see who played.</em>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Exit Ticket */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-purple-50 p-2 rounded">
              3. Exit Ticket <span className="font-normal text-gray-600">— What Did You Learn? (7 min)</span>
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
                  <td className="border p-2">1 min</td>
                  <td className="border p-2 font-medium">Exit Ticket Intro</td>
                  <td className="border p-2">Explain the exit ticket — students will answer on their Chromebooks.</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">5 min</td>
                  <td className="border p-2 font-medium">Exit Ticket</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Students answer 2 multiple-choice questions and 2 reflections on their Chromebooks<br/>
                    <em className="text-green-700">Covers content from ALL 5 lessons (dynamics, tempo, form, instruments)</em>
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">2 min</td>
                  <td className="border p-2 font-medium">Answer Key</td>
                  <td className="border p-2">Review the correct answers with the class.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Resources & Materials */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-blue-800 mb-4 border-b-2 border-blue-300 pb-2">
            Resources & Materials
          </h2>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Chromebooks/computers with internet access and headphones</li>
            <li className="text-sm">Completed Listening Journey from Lessons 3-4</li>
            <li className="text-sm">Session code for teacher-controlled lesson flow</li>
            <li className="text-sm">Student game codes for Peer Play sharing</li>
          </ul>
        </section>

        {/* Important Notes */}
        <section className="mb-8 bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
          <h2 className="text-xl font-bold text-blue-800 mb-3">
            Important Notes for Teachers
          </h2>
          <ul className="list-disc ml-6 space-y-2">
            <li className="text-sm">Students should have their Listening Journey mostly complete from Lessons 3-4</li>
            <li className="text-sm">Decoys should be placed strategically near real stickers</li>
            <li className="text-sm">Peer Play: students share their game code, classmates play and try to find the real stickers</li>
            <li className="text-sm">Exit Ticket covers content from ALL 5 lessons (dynamics, tempo, form, instruments)</li>
            <li className="text-sm">Green rows indicate student activity time — start the timer!</li>
            <li className="text-sm">Teacher advances stages when ready — don't wait for 100% completion</li>
          </ul>
        </section>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-4 mt-8 text-center text-sm text-gray-500">
          <p>Finish & Play - Lesson 5 of The Listening Lab</p>
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

export default LessonPlanPDF;
