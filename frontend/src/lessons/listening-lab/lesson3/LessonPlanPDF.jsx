// File: /src/lessons/listening-lab/lesson3/LessonPlanPDF.jsx
// Printable lesson plan view for teachers - Brass & Form

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
            🎺 Lesson 3: Brass & Form
          </h1>
          <p className="text-lg text-gray-700 font-semibold">
            Music Has a Blueprint — How do composers organize music into sections?
          </p>
          <div className="flex gap-6 mt-3 text-sm">
            <div><strong>Grade Level:</strong> 5-8</div>
            <div><strong>Duration:</strong> ~35 minutes</div>
            <div><strong>Unit:</strong> The Listening Lab</div>
          </div>
        </div>

        {/* LESSON OVERVIEW */}
        <section className="mb-8 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h2 className="text-xl font-bold text-blue-800 mb-3">
            Lesson Overview
          </h2>
          <p className="text-sm mb-2">
            <strong>Featured Piece:</strong> <em>In the Hall of the Mountain King</em> by Edvard Grieg (1875)
          </p>
          <p className="text-sm mb-4">
            Students meet the brass family, learn how composers organize music into sections using letter names (form), and begin building a Listening Journey game with dynamics stickers.
          </p>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Students Will:</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Identify brass instruments by sight and sound (trumpet, French horn, trombone, tuba)</li>
            <li className="text-sm">Understand musical form — how sections are labeled with letters (A, B)</li>
            <li className="text-sm">Identify ternary form (ABA) in Grieg's Mountain King</li>
            <li className="text-sm">Begin building a Listening Journey game with dynamics stickers</li>
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
              <li className="text-sm"><strong>MU:Re7.1.5a</strong> - Demonstrate and explain, citing evidence, how selected music connects to and is influenced by specific interests, experiences, purposes, or contexts</li>
              <li className="text-sm"><strong>MU:Cr2.1.5a</strong> - Demonstrate selected and developed musical ideas for compositions to express intent</li>
            </ul>
          </div>

          {/* Essential Questions */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Essential Questions:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">How do composers organize music into sections, and why does it matter?</li>
              <li className="text-sm">What makes a brass instrument a brass instrument?</li>
              <li className="text-sm">How can we use letter names to describe the structure of music?</li>
            </ul>
          </div>

          {/* I Can Statement */}
          <div className="mb-6 bg-blue-50 p-3 rounded-lg border border-blue-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              I Can Statement:
            </h3>
            <p className="text-sm font-medium italic">
              "I can identify brass instruments and label sections of music using letter names."
            </p>
          </div>

          {/* Enduring Understandings */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Enduring Understandings:
            </h3>
            <p className="text-sm italic mb-2">Students will understand that...</p>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Music is organized into sections — like chapters in a book</li>
              <li className="text-sm">Composers use form (structure) to create contrast and interest</li>
              <li className="text-sm">The brass family produces sound by buzzing lips into a cup mouthpiece</li>
              <li className="text-sm">Ternary form (ABA) creates a satisfying sense of return after contrast</li>
            </ul>
          </div>

          {/* Students will know */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Students will know...
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">The four orchestral brass instruments: trumpet, French horn, trombone, tuba</li>
              <li className="text-sm">How brass instruments produce sound (buzzing lips into a cup mouthpiece)</li>
              <li className="text-sm">Musical form uses letters to label sections (A, B, C...)</li>
              <li className="text-sm">Ternary form (ABA) = statement, contrast, return</li>
              <li className="text-sm">The three sections of Grieg's Mountain King and their characteristics</li>
            </ul>
          </div>

          {/* Students will be able to */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Students will be able to...
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Identify brass instruments by sight and sound</li>
              <li className="text-sm">Label sections of music using letter names (A, B)</li>
              <li className="text-sm">Recognize ternary form (ABA) in a piece of music</li>
              <li className="text-sm">Place dynamic markings on a Listening Journey to match what they hear</li>
              <li className="text-sm">Describe the musical characteristics of each section in Mountain King</li>
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
              Students complete two tasks that demonstrate understanding of form and dynamics:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm"><strong>Capstone Plan Worksheet:</strong> Students plan dynamics, tempo, and instruments for each section of their journey</li>
              <li className="text-sm"><strong>Listening Journey (Dynamics Focus):</strong> Students place dynamic stickers (pp, p, mf, f, ff) on each section to match what they hear in the music</li>
            </ul>
          </div>

          {/* Other Evidence */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Other Evidence:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Pair & Share feedback (peer assessment)</li>
              <li className="text-sm">Class discussion responses (formative - brass identification, form concepts)</li>
              <li className="text-sm">Four Corners game participation (bonus - review of Lessons 1-3)</li>
            </ul>
          </div>
        </section>

        {/* STAGE 3: LEARNING PLAN */}
        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-blue-800 mb-4 border-b-2 border-blue-300 pb-2">
            STAGE 3: LEARNING PLAN (~35 minutes)
          </h2>

          {/* 1. Brass Family */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-blue-50 p-2 rounded">
              1. Brass Family <span className="font-normal text-gray-600">— Meet the Brass (6 min)</span>
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
                  <td className="border p-2 font-medium">Brass & Form</td>
                  <td className="border p-2">Show students what we will learn today: brass instruments, musical form, and ternary form in Grieg's Mountain King.</td>
                </tr>
                <tr>
                  <td className="border p-2">1 min</td>
                  <td className="border p-2 font-medium">What is a Brass Instrument?</td>
                  <td className="border p-2">Define brass instruments: sound made by buzzing lips into a cup mouthpiece, metal tubing, valves or slide change pitch.</td>
                </tr>
                <tr>
                  <td className="border p-2">4 min</td>
                  <td className="border p-2 font-medium">See & Hear the Brass</td>
                  <td className="border p-2">Interactive showcase: Trumpet, French Horn, Trombone, Tuba. Play audio samples and share facts about each instrument.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2. What is Form? */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-blue-50 p-2 rounded">
              2. What is Form? <span className="font-normal text-gray-600">— Sections & Letters (14 min)</span>
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
                  <td className="border p-2 font-medium">What is Form?</td>
                  <td className="border p-2">Music is organized into sections like chapters. First sound = A, new sound = B, A comes back = still A.</td>
                </tr>
                <tr>
                  <td className="border p-2">2 min</td>
                  <td className="border p-2 font-medium">Meet Ternary Form</td>
                  <td className="border p-2">Ternary = ABA. Statement, contrast, return. Show Mountain King sections: A (Sneaky Start), B (Building Energy), A' (Explosive Return).</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">5 min</td>
                  <td className="border p-2 font-medium">🎮 Plan Your Journey</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Fill in Capstone Plan worksheet — dynamics, tempo, and instruments for each section.<br/>
                    <em className="text-green-700">Students plan what their Listening Journey will look and sound like.</em>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 3. Listening Journey */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-blue-50 p-2 rounded">
              3. Listening Journey <span className="font-normal text-gray-600">— Build Your Journey (15 min)</span>
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
                  <td className="border p-2 font-medium">Game Creator Intro</td>
                  <td className="border p-2">Introduce the Listening Journey Game Creator: create a visual world, place dynamic stickers, classmates play your game!</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">12 min</td>
                  <td className="border p-2 font-medium">🎮 Build Your Listening Journey</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Build their Listening Journey — focus on dynamics today.<br/>
                    Place dynamic markings (pp, p, mf, f, ff) on each section.<br/>
                    <em className="text-green-700">Bonus: Add tempo markings, instruments, and emojis too!</em>
                  </td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">7 min</td>
                  <td className="border p-2 font-medium">🎮 Pair and Share</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Pair up, play each other's games, and give feedback.<br/>
                    <em className="text-green-700">Students trade Chromebooks and play their partner's journey.</em>
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">1 min</td>
                  <td className="border p-2 font-medium">Lesson Complete!</td>
                  <td className="border p-2">Review what we learned: brass family, musical form, ternary (ABA), and dynamics in Mountain King.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bonus */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-amber-50 p-2 rounded">
              4. Bonus Activity <span className="font-normal text-gray-600">— Four Corners (12 min)</span>
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
                  <td className="border p-2 font-medium">Bonus Activity Intro</td>
                  <td className="border p-2">Introduce Four Corners as a bonus review activity if time allows.</td>
                </tr>
                <tr>
                  <td className="border p-2">1 min</td>
                  <td className="border p-2 font-medium">Four Corners Instructions</td>
                  <td className="border p-2">A question appears with 4 answers — each in a corner. Move to the corner you think is correct, or tap your answer on your Chromebook.</td>
                </tr>
                <tr className="bg-amber-50">
                  <td className="border p-2">10 min</td>
                  <td className="border p-2 font-medium">🎮 Unlock Four Corners</td>
                  <td className="border p-2">
                    <strong>CLASS GAME:</strong> Move to a corner to answer review questions!<br/>
                    <em className="text-amber-700">Review dynamics, tempo, woodwinds, and brass!</em>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FORM REFERENCE */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-blue-800 mb-4 border-b-2 border-blue-300 pb-2">
            Musical Form Reference
          </h2>
          <div className="grid grid-cols-3 gap-3 text-sm mb-6">
            <div className="bg-blue-100 p-3 rounded text-center">
              <div className="font-bold text-blue-800">Binary</div>
              <div className="text-lg font-mono font-bold text-blue-700">AB</div>
              <div className="text-xs text-blue-700">Two contrasting sections</div>
            </div>
            <div className="bg-purple-100 p-3 rounded text-center">
              <div className="font-bold text-purple-800">Ternary</div>
              <div className="text-lg font-mono font-bold text-purple-700">ABA</div>
              <div className="text-xs text-purple-700">Statement, contrast, return</div>
            </div>
            <div className="bg-amber-100 p-3 rounded text-center">
              <div className="font-bold text-amber-800">Rondo</div>
              <div className="text-lg font-mono font-bold text-amber-700">ABACADA</div>
              <div className="text-xs text-amber-700">A section keeps returning between new episodes</div>
            </div>
          </div>

          {/* Mountain King Sections */}
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Mountain King Sections (ABA'):
          </h3>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
              <div className="font-bold text-blue-800">A — Sneaky Start</div>
              <div className="text-xs text-blue-700 mt-1">Pizzicato strings, quiet (pp, andante)</div>
            </div>
            <div className="bg-red-50 p-3 rounded border-l-4 border-red-500">
              <div className="font-bold text-red-800">B — Building Energy</div>
              <div className="text-xs text-red-700 mt-1">Brass enters, louder (mf, moderato)</div>
            </div>
            <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-500">
              <div className="font-bold text-blue-800">A' — Explosive Return</div>
              <div className="text-xs text-blue-700 mt-1">Full orchestra (ff, presto)</div>
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
            <li className="text-sm">Audio: <em>In the Hall of the Mountain King</em> by Edvard Grieg (1875, public domain)</li>
            <li className="text-sm">Brass instrument audio samples (trumpet, French horn, trombone, tuba)</li>
            <li className="text-sm">Session code for teacher-controlled lesson flow</li>
            <li className="text-sm">Capstone Plan worksheet (built into the app)</li>
          </ul>
        </section>

        {/* Important Notes */}
        <section className="mb-8 bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
          <h2 className="text-xl font-bold text-blue-800 mb-3">
            Important Notes for Teachers
          </h2>
          <ul className="list-disc ml-6 space-y-2">
            <li className="text-sm">This is Lesson 3 — students should already know dynamics (Lesson 1) and tempo/woodwinds (Lesson 2)</li>
            <li className="text-sm">The Listening Journey focuses on dynamics stickers today — tempo and instruments come in later lessons</li>
            <li className="text-sm">Work auto-saves — no manual submission required</li>
            <li className="text-sm">Teacher advances stages when ready — don't wait for 100% completion</li>
            <li className="text-sm">Green rows indicate student activity time — start the timer!</li>
            <li className="text-sm">Pair and Share: students trade Chromebooks and play each other's journey games</li>
            <li className="text-sm">Four Corners is a bonus activity — only play if you have extra time</li>
          </ul>
        </section>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-4 mt-8 text-center text-sm text-gray-500">
          <p>Brass & Form - Lesson 3 of The Listening Lab</p>
          <p>Music Mind Academy</p>
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
