// File: /src/lessons/film-music-project/lesson1/LessonPlanPDF.jsx
// Printable lesson plan view for teachers - Score the Adventure

import React from 'react';

const LessonPlanPDF = () => {
  return (
    <div className="min-h-screen bg-white p-8 max-w-5xl mx-auto print:p-4">
      {/* Print Button - Hidden when printing */}
      <div className="mb-6 print:hidden flex gap-3">
        <button
          onClick={() => window.print()}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-colors"
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
        <div className="border-b-4 border-purple-600 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-purple-900 mb-2">
            🎬 Lesson 1: Score the Adventure
          </h1>
          <p className="text-lg text-gray-700 font-semibold">
            Mood & Expression — Why does music affect how we feel?
          </p>
          <div className="flex gap-6 mt-3 text-sm">
            <div><strong>Grade Level:</strong> 6-8</div>
            <div><strong>Duration:</strong> 40 minutes</div>
          </div>
        </div>

        {/* LESSON OVERVIEW */}
        <section className="mb-8 bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h2 className="text-xl font-bold text-purple-800 mb-3">
            Lesson Overview
          </h2>
          <p className="text-sm mb-4">
            Students discover how music creates emotion by watching the same video with different scores, then compose their own adventure soundtrack.
          </p>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Students Will:</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Identify how music creates different moods</li>
            <li className="text-sm">Match loops to mood categories</li>
            <li className="text-sm">Compose a soundtrack for drone footage</li>
          </ul>
        </section>

        {/* STAGE 1: DESIRED RESULTS */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-purple-800 mb-4 border-b-2 border-purple-300 pb-2">
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
              <li className="text-sm"><strong>MU:Re7.2.5a</strong> - Demonstrate and explain how responses to music are informed by structure and context</li>
            </ul>
          </div>

          {/* Enduring Understandings */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Enduring Understandings:
            </h3>
            <p className="text-sm italic mb-2">Students will understand that...</p>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Music has the power to create and influence emotions</li>
              <li className="text-sm">The same visual content can feel completely different with different music</li>
              <li className="text-sm">Film composers intentionally choose music to shape audience emotions</li>
              <li className="text-sm">Different musical elements (tempo, key, instrumentation) create different moods</li>
            </ul>
          </div>

          {/* Essential Questions */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Essential Questions:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Why does music affect how we feel?</li>
              <li className="text-sm">How do composers use music to create specific moods?</li>
              <li className="text-sm">What musical elements contribute to different emotional responses?</li>
            </ul>
          </div>

          {/* Students will know */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Students will know...
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">The five mood categories: Heroic, Hype, Mysterious, Scary, Upbeat</li>
              <li className="text-sm">How different loops create different emotional responses</li>
              <li className="text-sm">Basic DAW interface and controls</li>
              <li className="text-sm">The role of music in enhancing visual storytelling</li>
            </ul>
          </div>

          {/* Students will be able to */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Students will be able to...
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Identify and categorize loops by mood</li>
              <li className="text-sm">Navigate and use basic DAW controls</li>
              <li className="text-sm">Create a composition that matches a chosen mood</li>
              <li className="text-sm">Reflect on their creative decisions using music vocabulary</li>
            </ul>
          </div>
        </section>

        {/* STAGE 2: ASSESSMENT EVIDENCE */}
        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-purple-800 mb-4 border-b-2 border-purple-300 pb-2">
            STAGE 2: ASSESSMENT EVIDENCE
          </h2>

          {/* Performance Task */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Performance Task:
            </h3>
            <p className="text-sm mb-2">
              Students compose an original adventure soundtrack for drone nature footage that demonstrates:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm"><strong>Mood Focus:</strong> Chooses one mood category and stays consistent</li>
              <li className="text-sm"><strong>Variety:</strong> Uses 5+ different loops</li>
              <li className="text-sm"><strong>Layering:</strong> Creates 3+ layers playing together</li>
            </ul>
          </div>

          {/* Other Evidence */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Other Evidence:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Mood Match Game participation (formative - mood identification)</li>
              <li className="text-sm">Class discussion responses (formative - understanding)</li>
              <li className="text-sm">"Two Stars and a Wish" reflection (self-assessment)</li>
              <li className="text-sm">Peer sharing and feedback</li>
            </ul>
          </div>
        </section>

        {/* STAGE 3: LEARNING PLAN */}
        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-purple-800 mb-4 border-b-2 border-purple-300 pb-2">
            STAGE 3: LEARNING PLAN (40 minutes)
          </h2>

          {/* Introduction */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-blue-50 p-2 rounded">
              1. Introduction <span className="font-normal text-gray-600">— Hook & Mood Categories (9 min)</span>
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
                  <td className="border p-2 font-medium">Hook Video</td>
                  <td className="border p-2">Play the same drone footage with 5 different scores. Ask: "What changed?"</td>
                </tr>
                <tr>
                  <td className="border p-2">3 min</td>
                  <td className="border p-2 font-medium">Discussion</td>
                  <td className="border p-2">Ask: "How did the music change the feeling?" Discuss emotional responses.</td>
                </tr>
                <tr>
                  <td className="border p-2">3 min</td>
                  <td className="border p-2 font-medium">Mood Categories</td>
                  <td className="border p-2">Introduce the 5 mood types: Heroic, Hype, Mysterious, Scary, Upbeat</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mood Match Game */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-purple-50 p-2 rounded">
              2. Practice <span className="font-normal text-gray-600">— Mood Match Game (6 min)</span>
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
                  <td className="border p-2 font-medium">🎮 Mood Match Game</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Listen to loops, vote on which mood fits each one<br/>
                    <em className="text-green-700">Teacher plays loops, students vote on their devices</em>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* DAW Tutorial & Composition */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-orange-50 p-2 rounded">
              3. Create <span className="font-normal text-gray-600">— DAW Tutorial & Composition (18 min)</span>
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
                  <td className="border p-2 font-medium">▶️ DAW Tutorial Video</td>
                  <td className="border p-2"><strong>PLAY VIDEO:</strong> Learn the basics + Chromebook setup tips</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">14 min</td>
                  <td className="border p-2 font-medium">🎮 Composition</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Pick a mood, score the drone footage<br/>
                    Requirements: 5+ loops, 3+ layers, consistent mood<br/>
                    <em className="text-green-700">Bonus: Add sound effects!</em>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Reflection */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-yellow-50 p-2 rounded">
              4. Reflect <span className="font-normal text-gray-600">— Two Stars and a Wish + Share (7 min)</span>
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
                    <strong>STUDENTS WORK:</strong> Reflect on their composition<br/>
                    Star 1: What mood did you create and how?<br/>
                    Star 2: What worked well?<br/>
                    Wish: What would you try differently?
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">2 min</td>
                  <td className="border p-2 font-medium">Share</td>
                  <td className="border p-2">1-2 students share their work. Ask: "What mood? How did you achieve it?"</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bonus */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-amber-50 p-2 rounded">
              ⭐ Bonus Activity <span className="font-normal text-gray-600">— Name That Loop (5 min)</span>
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
                  <td className="border p-2">5 min</td>
                  <td className="border p-2 font-medium">🎮 Name That Loop</td>
                  <td className="border p-2">
                    <strong>PARTNER ACTIVITY:</strong> One student plays a loop, partner guesses the mood<br/>
                    <em className="text-amber-700">Great for early finishers!</em>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* MOOD CATEGORIES REFERENCE */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-purple-800 mb-4 border-b-2 border-purple-300 pb-2">
            Five Mood Categories Reference
          </h2>
          <div className="grid grid-cols-5 gap-2 text-sm">
            <div className="bg-red-100 p-3 rounded text-center">
              <div className="font-bold text-red-800">Heroic</div>
              <div className="text-xs text-red-700">Powerful, bold, triumphant</div>
            </div>
            <div className="bg-amber-100 p-3 rounded text-center">
              <div className="font-bold text-amber-800">Hype</div>
              <div className="text-xs text-amber-700">Exciting, energetic, pumped</div>
            </div>
            <div className="bg-blue-100 p-3 rounded text-center">
              <div className="font-bold text-blue-800">Mysterious</div>
              <div className="text-xs text-blue-700">Intriguing, unknown, curious</div>
            </div>
            <div className="bg-purple-100 p-3 rounded text-center">
              <div className="font-bold text-purple-800">Scary</div>
              <div className="text-xs text-purple-700">Frightening, tense, horror</div>
            </div>
            <div className="bg-green-100 p-3 rounded text-center">
              <div className="font-bold text-green-800">Upbeat</div>
              <div className="text-xs text-green-700">Happy, positive, cheerful</div>
            </div>
          </div>
        </section>

        {/* Resources & Materials */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-purple-800 mb-4 border-b-2 border-purple-300 pb-2">
            Resources & Materials
          </h2>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Chromebooks/computers with internet access and headphones</li>
            <li className="text-sm">Drone nature footage (mountains, ocean, forest, cave)</li>
            <li className="text-sm">Hook video showing same footage with 5 different scores</li>
            <li className="text-sm">Loop library organized by mood categories</li>
            <li className="text-sm">Session code for teacher-controlled lesson flow</li>
          </ul>
        </section>

        {/* Important Notes */}
        <section className="mb-8 bg-purple-50 p-4 rounded-lg border-2 border-purple-300">
          <h2 className="text-xl font-bold text-purple-800 mb-3">
            📋 Important Notes for Teachers
          </h2>
          <ul className="list-disc ml-6 space-y-2">
            <li className="text-sm">This is the first lesson - students learn the DAW here</li>
            <li className="text-sm">Work auto-saves every 5 seconds - no manual submission required</li>
            <li className="text-sm">Teacher advances stages when ready - don't wait for 100% completion</li>
            <li className="text-sm">Green rows (🎮) indicate student activity time - start the timer!</li>
            <li className="text-sm">Students should pick ONE mood and stay consistent throughout</li>
            <li className="text-sm">Encourage experimentation - there are no wrong answers in the Mood Match Game</li>
          </ul>
        </section>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-4 mt-8 text-center text-sm text-gray-500">
          <p>🎬 Score the Adventure - Lesson 1 of The Loop Lab</p>
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
