// File: /src/lessons/listening-lab/lesson4/LessonPlanPDF.jsx
// Printable lesson plan view for teachers - Percussion & Review

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
        <div className="border-b-4 border-blue-600 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            🥁 Lesson 4: Percussion & Review
          </h1>
          <p className="text-lg text-gray-700 font-semibold">
            Instrument Families & Review
          </p>
          <div className="flex gap-6 mt-3 text-sm">
            <div><strong>Grade Level:</strong> 6-8</div>
            <div><strong>Duration:</strong> ~35 minutes</div>
            <div><strong>Unit:</strong> The Listening Lab</div>
          </div>
        </div>

        {/* LESSON OVERVIEW */}
        <section className="mb-8 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h2 className="text-xl font-bold text-blue-800 mb-3">
            Lesson Overview
          </h2>
          <p className="text-sm mb-4">
            Students meet the percussion family, distinguish pitched from unpitched instruments, then continue building their Listening Journey with tempo, instruments, and form stickers. A bonus rapid-fire review game covers dynamics, tempo, and form from Lessons 1-3.
          </p>
          <p className="text-sm mb-4">
            <strong>Featured Piece:</strong> Student's chosen capstone piece (options: Mountain King, Danse Macabre, William Tell Storm, Beethoven 5th, Night on Bald Mountain)
          </p>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Students Will:</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Identify percussion instruments and distinguish pitched from unpitched</li>
            <li className="text-sm">Review dynamics, tempo, and form concepts from Lessons 1-3</li>
            <li className="text-sm">Continue building Listening Journey with tempo, instruments, and form stickers</li>
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
              <li className="text-sm"><strong>MU:Re8.1.5a</strong> - Demonstrate and explain how expressive qualities are used in interpretations</li>
              <li className="text-sm"><strong>MU:Re9.1.5a</strong> - Evaluate musical works and performances, applying established criteria</li>
            </ul>
          </div>

          {/* Essential Questions */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Essential Questions:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">How do all four instrument families and musical elements work together in orchestral music?</li>
            </ul>
          </div>

          {/* I Can Statement */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              I Can Statement:
            </h3>
            <p className="text-sm italic ml-6">
              I can identify percussion instruments and use dynamics, tempo, and form vocabulary to describe what I hear.
            </p>
          </div>

          {/* Enduring Understandings */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Enduring Understandings:
            </h3>
            <p className="text-sm italic mb-2">Students will understand that...</p>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Percussion instruments come in two categories: pitched (can play melodies) and unpitched (rhythm and color only)</li>
              <li className="text-sm">Dynamics, tempo, form, and instrumentation all work together to create the character of a piece</li>
              <li className="text-sm">Active listening requires identifying multiple musical elements simultaneously</li>
              <li className="text-sm">Peer feedback strengthens understanding and creative work</li>
            </ul>
          </div>

          {/* Students will know */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Students will know...
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">The difference between pitched and unpitched percussion instruments</li>
              <li className="text-sm">Key percussion instruments: timpani, snare drum, bass drum, cymbals</li>
              <li className="text-sm">Dynamics vocabulary: p, f, ff, pp, crescendo, decrescendo</li>
              <li className="text-sm">Tempo vocabulary: allegro, adagio, andante, presto, accelerando, ritardando</li>
              <li className="text-sm">Form vocabulary: A/B sections, rondo, binary, ternary</li>
            </ul>
          </div>

          {/* Students will be able to */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Students will be able to...
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Identify percussion instruments by sight and sound</li>
              <li className="text-sm">Classify percussion instruments as pitched or unpitched</li>
              <li className="text-sm">Add tempo, instrument, and form stickers to their Listening Journey</li>
              <li className="text-sm">Categorize musical terms as dynamics, tempo, or form</li>
              <li className="text-sm">Give and receive peer feedback on Listening Journeys</li>
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
              Students continue building their Listening Journey with dynamics, tempo, instruments, and form stickers that accurately reflect what they hear in their chosen capstone piece.
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm"><strong>Accuracy:</strong> Stickers match what is actually heard in the music</li>
              <li className="text-sm"><strong>Completeness:</strong> Includes tempo, instrument, and form stickers (added this lesson)</li>
              <li className="text-sm"><strong>Variety:</strong> Each section looks and feels different</li>
            </ul>
          </div>

          {/* Other Evidence */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Other Evidence:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Name That Element game responses (formative - review of L1-L3 concepts)</li>
              <li className="text-sm">Pair and Share feedback (peer assessment)</li>
            </ul>
          </div>
        </section>

        {/* STAGE 3: LEARNING PLAN */}
        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-blue-800 mb-4 border-b-2 border-blue-300 pb-2">
            STAGE 3: LEARNING PLAN (~35 minutes)
          </h2>

          {/* 1. Percussion */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-blue-50 p-2 rounded">
              1. Percussion <span className="font-normal text-gray-600">— Meet the Percussion (6 min)</span>
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
                  <td className="border p-2 font-medium">Percussion & Review</td>
                  <td className="border p-2">Welcome! Today: percussion family, review, and worktime.</td>
                </tr>
                <tr>
                  <td className="border p-2">2 min</td>
                  <td className="border p-2 font-medium">Pitched vs. Unpitched</td>
                  <td className="border p-2">Define percussion categories: pitched instruments can play specific notes (timpani, marimba); unpitched have no specific pitch (snare drum, bass drum, cymbals). All are played by striking, shaking, or scraping.</td>
                </tr>
                <tr>
                  <td className="border p-2">4 min</td>
                  <td className="border p-2 font-medium">See & Hear Percussion</td>
                  <td className="border p-2">Show and play each percussion instrument: Timpani (pitched), Snare Drum, Bass Drum, Cymbals (unpitched).</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2. Listening Journey Worktime */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-blue-50 p-2 rounded">
              2. Listening Journey Worktime <span className="font-normal text-gray-600">— Build Your Journey (19 min)</span>
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
                  <td className="border p-2 font-medium">Today's Focus</td>
                  <td className="border p-2">Explain what to add today: tempo markings, instrument stickers, and form/section labels. Accuracy matters — every sticker must match what you actually hear!</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">15 min</td>
                  <td className="border p-2 font-medium">🎮 Build Your Journey</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Continue building their Listening Journey — add tempo, instruments, and form stickers.<br/>
                    <em className="text-green-700">Make sure every sticker matches what you actually hear!</em>
                  </td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">7 min</td>
                  <td className="border p-2 font-medium">🎮 Pair and Share</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Pair up, play each other's games, and give feedback.<br/>
                    <em className="text-green-700">Play your partner's journey — does it match the music?</em>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. Bonus Game */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-amber-50 p-2 rounded">
              3. Bonus Game <span className="font-normal text-gray-600">— Name That Element (10 min)</span>
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
                  <td className="border p-2 font-medium">Name That Element Intro</td>
                  <td className="border p-2">Explain the rapid-fire review game: see a term or description, identify if it's dynamics, tempo, or form. 3 rounds, 12 questions.</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">8 min</td>
                  <td className="border p-2 font-medium">🎮 Name That Element</td>
                  <td className="border p-2">
                    <strong>CLASS GAME:</strong> Hear a clip, identify dynamics, tempo, or form. Fast + correct = more points!<br/>
                    <em className="text-green-700">Speed bonus for fast answers!</em>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* PERCUSSION REFERENCE */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-blue-800 mb-4 border-b-2 border-blue-300 pb-2">
            Percussion Reference
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Pitched Percussion</h3>
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <div className="font-bold text-blue-800 mb-1">Timpani</div>
                <div className="text-xs text-blue-700">Large pitched drums, pedal changes pitch, the "thunder" of the orchestra</div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Unpitched Percussion</h3>
              <div className="space-y-2">
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <div className="font-bold text-gray-800 mb-1">Snare Drum</div>
                  <div className="text-xs text-gray-700">Sharp, crisp sound with metal wires underneath</div>
                </div>
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <div className="font-bold text-gray-800 mb-1">Bass Drum</div>
                  <div className="text-xs text-gray-700">Deep, booming sound, the heartbeat of the orchestra</div>
                </div>
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <div className="font-bold text-gray-800 mb-1">Cymbals</div>
                  <div className="text-xs text-gray-700">Metallic crash, punctuates big moments</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Resources & Materials */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-blue-800 mb-4 border-b-2 border-blue-300 pb-2">
            Resources & Materials
          </h2>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Chromebooks/computers with internet access and headphones</li>
            <li className="text-sm">Student's chosen capstone piece (selected in previous lesson)</li>
            <li className="text-sm">Percussion instrument audio/video examples</li>
            <li className="text-sm">Session code for teacher-controlled lesson flow</li>
          </ul>
        </section>

        {/* Important Notes */}
        <section className="mb-8 bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
          <h2 className="text-xl font-bold text-blue-800 mb-3">
            📋 Important Notes for Teachers
          </h2>
          <ul className="list-disc ml-6 space-y-2">
            <li className="text-sm">Students should already have their capstone piece chosen from a previous lesson</li>
            <li className="text-sm">Listening Journeys auto-save — no manual submission required</li>
            <li className="text-sm">Teacher advances stages when ready — don't wait for 100% completion</li>
            <li className="text-sm">Green rows (🎮) indicate student activity time — start the timer!</li>
            <li className="text-sm">Pair and Share works best when partners have different capstone pieces</li>
            <li className="text-sm">Name That Element is a bonus — skip if short on time, or use as a warm-up next class</li>
          </ul>
        </section>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-4 mt-8 text-center text-sm text-gray-500">
          <p>🥁 Percussion & Review - Lesson 4 of The Listening Lab</p>
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
