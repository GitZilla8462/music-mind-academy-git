// File: /src/lessons/music-journalist/lesson1/LessonPlanPDF.jsx
// Printable lesson plan view for teachers - Welcome to the Agency

import React from 'react';

const LessonPlanPDF = () => {
  return (
    <div className="min-h-screen bg-white p-8 max-w-5xl mx-auto print:p-4">
      {/* Print Button - Hidden when printing */}
      <div className="mb-6 print:hidden flex gap-3">
        <button
          onClick={() => window.print()}
          className="bg-[#1a2744] hover:bg-[#1a2744]/90 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-colors"
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
        <div className="border-b-4 border-[#1a2744] pb-4 mb-6">
          <h1 className="text-3xl font-bold text-[#1a2744] mb-2">
            🔍 Lesson 1: Welcome to the Agency
          </h1>
          <p className="text-lg text-gray-700 font-semibold">
            What does it take to discover the next big artist?
          </p>
          <div className="flex gap-6 mt-3 text-sm">
            <div><strong>Grade Level:</strong> 6-8</div>
            <div><strong>Duration:</strong> ~45 minutes</div>
            <div><strong>Unit:</strong> Music Agent (Unit 3)</div>
          </div>
        </div>

        {/* LESSON OVERVIEW */}
        <section className="mb-8 bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h2 className="text-xl font-bold text-[#1a2744] mb-3">
            Lesson Overview
          </h2>
          <p className="text-sm mb-4">
            Students are hired as music agents at a record label. They learn what agents and A&R reps do, explore emerging artists across genres through the Genre Showcase, play the Genre Match Game, complete a Genre Scouts report, and share discoveries with a partner.
          </p>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Students Will:</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Understand what music agents and A&R reps do in the music industry</li>
            <li className="text-sm">Explore and identify characteristics of different musical genres</li>
            <li className="text-sm">Navigate the Artist Discovery platform and preview emerging artists</li>
            <li className="text-sm">Find one artist that represents each genre and describe what you hear</li>
          </ul>
        </section>

        {/* STAGE 1: DESIRED RESULTS */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-[#1a2744] mb-4 border-b-2 border-[#f0b429] pb-2">
            STAGE 1: DESIRED RESULTS
          </h2>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Standards:</h3>
            <ul className="list-none space-y-1 ml-0">
              <li className="text-sm"><strong>MU:Re7.2.7</strong> — Classify and compare music using musical vocabulary</li>
              <li className="text-sm"><strong>MU:Cn10.0.7</strong> — Personal interests influence musical selection</li>
              <li className="text-sm"><strong>CCSS.ELA-LITERACY.SL.7.4</strong> — Present claims with relevant evidence</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Essential Question:</h3>
            <p className="text-sm ml-6 italic">What does it take to discover the next big artist?</p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">I Can Statement:</h3>
            <p className="text-sm ml-6">I can explore different genres and identify what makes each one unique.</p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Vocabulary:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>A&R</strong> — Artists & Repertoire; discovers and develops new talent</div>
              <div><strong>Music Agent</strong> — Represents and promotes an artist's career</div>
              <div><strong>Emerging Artist</strong> — Gaining fans but not yet mainstream</div>
              <div><strong>Genre</strong> — Category of music (hip-hop, jazz, rock, etc.)</div>
              <div><strong>Press Kit</strong> — Materials used to promote an artist</div>
              <div><strong>Pitch</strong> — Short, persuasive presentation</div>
            </div>
          </div>
        </section>

        {/* STAGE 2: ASSESSMENT EVIDENCE */}
        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-[#1a2744] mb-4 border-b-2 border-[#f0b429] pb-2">
            STAGE 2: ASSESSMENT EVIDENCE
          </h2>
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Performance Task:</h3>
            <p className="text-sm mb-2">
              Students complete a 3-slide Genre Scouts report demonstrating:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm"><strong>Genre Lineup:</strong> One artist per genre explored</li>
              <li className="text-sm"><strong>Surprise Discovery:</strong> A genre that surprised them and why</li>
              <li className="text-sm"><strong>Sound Snapshot:</strong> One artist described in detail</li>
            </ul>
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Other Evidence:</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Genre Match Game participation (formative — genre identification)</li>
              <li className="text-sm">Share Out partner discussion (peer assessment)</li>
            </ul>
          </div>
        </section>

        {/* STAGE 3: LEARNING PLAN */}
        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-[#1a2744] mb-4 border-b-2 border-[#f0b429] pb-2">
            STAGE 3: LEARNING PLAN (~45 minutes)
          </h2>

          {/* Section 1 */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-blue-50 p-2 rounded">
              1. Welcome to the Agency <span className="font-normal text-gray-600">— Hook + What Does an Agent Do? (5 min)</span>
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
                  <td className="border p-2 font-medium">Welcome Hook</td>
                  <td className="border p-2">"You've been hired at a music agency. Your job: find the next big artist." Share how Billie Eilish, Chance the Rapper, and BTS were discovered.</td>
                </tr>
                <tr>
                  <td className="border p-2">2 min</td>
                  <td className="border p-2 font-medium">What Does an Agent Do?</td>
                  <td className="border p-2">Teach A&R, music agent, press kit, pitch. Introduce the 5-lesson mission: EXPLORE → LISTEN → CLAIM → BUILD → PITCH.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2 */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-purple-50 p-2 rounded">
              2. Genre Showcase <span className="font-normal text-gray-600">— Teacher-Led (10 min)</span>
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
                  <td className="border p-2">10 min</td>
                  <td className="border p-2 font-medium">🎵 Genre Showcase</td>
                  <td className="border p-2">
                    <strong>TEACHER-LED:</strong> Step through genres with real artists and audio previews.<br/>
                    <em className="text-green-700">Play a clip from each genre. Discuss: what makes this genre different?</em>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3 */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-orange-50 p-2 rounded">
              3. Genre Match Game <span className="font-normal text-gray-600">— Class Game (8 min)</span>
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
                  <td className="border p-2">8 min</td>
                  <td className="border p-2 font-medium">🎮 Genre Match Game</td>
                  <td className="border p-2">
                    <strong>STUDENTS PLAY:</strong> Hear a clip, identify the genre.<br/>
                    <em className="text-green-700">Students listen to audio clips and match them to the correct genre.</em>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 4 */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-emerald-50 p-2 rounded">
              4. Genre Scouts <span className="font-normal text-gray-600">— Explore + Report (22 min)</span>
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
                  <td className="border p-2 font-medium">Genre Scouts Instructions</td>
                  <td className="border p-2">Explain: Browse artists and complete 3 slides — Genre Lineup, Surprise Discovery, Sound Snapshot. Start by clicking "My Report."</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">20 min</td>
                  <td className="border p-2 font-medium">🎮 Genre Scouts</td>
                  <td className="border p-2">
                    <strong>STUDENTS BUILD:</strong> Explore artists and complete 3 slides.<br/>
                    <em className="text-green-700">Slide 1: Genre Lineup — one artist per genre. Slide 2: Surprise Discovery — which genre surprised you? Slide 3: Sound Snapshot — describe one artist in detail.</em>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 5 */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-yellow-50 p-2 rounded">
              5. Share + Preview <span className="font-normal text-gray-600">— Discussion + What's Next (8 min)</span>
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
                  <td className="border p-2">6 min</td>
                  <td className="border p-2 font-medium">🗣️ Share Out</td>
                  <td className="border p-2">
                    <strong>PARTNER ACTIVITY:</strong> Share your Genre Lineup and Surprise Discovery with a partner.<br/>
                    <em className="text-green-700">Did anyone pick the same artists?</em>
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">2 min</td>
                  <td className="border p-2 font-medium">Next Time</td>
                  <td className="border p-2">Preview Lesson 2: "You'll learn to listen and describe music like a real agent."</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Resources & Materials */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-[#1a2744] mb-4 border-b-2 border-[#f0b429] pb-2">
            Resources & Materials
          </h2>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Chromebooks/computers with internet access and headphones</li>
            <li className="text-sm">Session code for teacher-controlled lesson flow</li>
            <li className="text-sm">Artist Discovery platform (built into the lesson)</li>
          </ul>
        </section>

        {/* Important Notes */}
        <section className="mb-8 bg-amber-50 p-4 rounded-lg border-2 border-amber-300">
          <h2 className="text-xl font-bold text-[#1a2744] mb-3">
            📋 Important Notes for Teachers
          </h2>
          <ul className="list-disc ml-6 space-y-2">
            <li className="text-sm">This is the first lesson in the Music Agent unit — students are introduced to the 5-lesson arc</li>
            <li className="text-sm">Work auto-saves — no manual submission required</li>
            <li className="text-sm">Teacher advances stages when ready — don't wait for 100% completion</li>
            <li className="text-sm">Green rows (🎮/🗣️) indicate student activity time — start the timer!</li>
            <li className="text-sm">Genre Showcase is teacher-led — advance through genres at your pace</li>
            <li className="text-sm">Genre Scouts: encourage students to click "My Report" first, then explore artists</li>
          </ul>
        </section>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-4 mt-8 text-center text-sm text-gray-500">
          <p>🔍 Welcome to the Agency — Lesson 1 of Music Agent (Unit 3)</p>
          <p>Music Mind Academy © 2026</p>
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
