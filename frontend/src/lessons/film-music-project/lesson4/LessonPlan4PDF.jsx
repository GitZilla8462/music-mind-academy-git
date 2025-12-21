// File: /src/lessons/film-music-project/lesson4/LessonPlan4PDF.jsx
// Printable lesson plan view for teachers - Epic Wildlife

import React from 'react';

const LessonPlan4PDF = () => {
  return (
    <div className="min-h-screen bg-white p-8 max-w-5xl mx-auto print:p-4">
      {/* Print Button - Hidden when printing */}
      <div className="mb-6 print:hidden flex gap-3">
        <button
          onClick={() => window.print()}
          className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-colors"
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
        <div className="border-b-4 border-amber-600 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-amber-900 mb-2">
            🦁 Lesson 4: Epic Wildlife
          </h1>
          <p className="text-lg text-gray-700 font-semibold">
            Form & Structure — When do sounds enter and exit?
          </p>
          <div className="flex gap-6 mt-3 text-sm">
            <div><strong>Grade Level:</strong> 6-8</div>
            <div><strong>Duration:</strong> 40 minutes</div>
          </div>
        </div>

        {/* LESSON OVERVIEW */}
        <section className="mb-8 bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h2 className="text-xl font-bold text-amber-800 mb-3">
            Lesson Overview
          </h2>
          <p className="text-sm mb-4">
            Students learn how film scores follow a story arc with distinct sections, then create an epic nature documentary soundtrack.
          </p>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Students Will:</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Understand sectional song form (Intro, Build, Climax, Outro)</li>
            <li className="text-sm">Place loops strategically to support story structure</li>
            <li className="text-sm">Compose a complete film score with intentional form</li>
          </ul>
        </section>

        {/* STAGE 1: DESIRED RESULTS */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-amber-800 mb-4 border-b-2 border-amber-300 pb-2">
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
              <li className="text-sm"><strong>MU:Cr3.1.5a</strong> - Evaluate, refine, and document revisions to personal music</li>
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
              <li className="text-sm">Music has structure and form that can be intentionally designed</li>
              <li className="text-sm">Film scores follow the story arc of the visual content</li>
              <li className="text-sm">Different sections (intro, build, climax, outro) serve different purposes</li>
              <li className="text-sm">When instruments enter and exit affects the emotional journey</li>
            </ul>
          </div>

          {/* Essential Questions */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Essential Questions:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">When do sounds enter and exit?</li>
              <li className="text-sm">How does the structure of music support a story?</li>
              <li className="text-sm">Why do film composers plan when instruments come in and out?</li>
            </ul>
          </div>

          {/* Students will know */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Students will know...
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">The four sections of typical film score form: Intro, Build, Climax, Outro</li>
              <li className="text-sm">How the story arc of a film connects to musical structure</li>
              <li className="text-sm">Strategic placement of instruments creates emotional impact</li>
              <li className="text-sm">The importance of "saving" sounds for key moments</li>
            </ul>
          </div>

          {/* Students will be able to */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Students will be able to...
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Identify the sections of a film score (intro, build, climax, outro)</li>
              <li className="text-sm">Plan when different loops will enter and exit</li>
              <li className="text-sm">Compose a structured wildlife documentary score</li>
              <li className="text-sm">Explain their structural choices using musical vocabulary</li>
            </ul>
          </div>
        </section>

        {/* STAGE 2: ASSESSMENT EVIDENCE */}
        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-amber-800 mb-4 border-b-2 border-amber-300 pb-2">
            STAGE 2: ASSESSMENT EVIDENCE
          </h2>

          {/* Performance Task */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Performance Task:
            </h3>
            <p className="text-sm mb-2">
              Students compose an original wildlife documentary score that demonstrates:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm"><strong>Structure:</strong> Clear sections (intro, build, climax, outro)</li>
              <li className="text-sm"><strong>Strategy:</strong> Loops enter and exit at intentional moments</li>
              <li className="text-sm"><strong>Story:</strong> Music supports the visual narrative arc</li>
            </ul>
          </div>

          {/* Other Evidence */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Other Evidence:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Sectional Loop Builder activity (formative - understanding of form)</li>
              <li className="text-sm">Real-time progress tracking during composition</li>
              <li className="text-sm">"Two Stars and a Wish" reflection (self-assessment)</li>
              <li className="text-sm">Class discussion about structural choices</li>
            </ul>
          </div>
        </section>

        {/* STAGE 3: LEARNING PLAN */}
        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-amber-800 mb-4 border-b-2 border-amber-300 pb-2">
            STAGE 3: LEARNING PLAN (40 minutes)
          </h2>

          {/* Introduction */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-blue-50 p-2 rounded">
              1. Introduction <span className="font-normal text-gray-600">— Form Concept (8 min)</span>
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
                  <td className="border p-2">Ask: "Have you noticed music gets louder/bigger at exciting movie moments?"</td>
                </tr>
                <tr>
                  <td className="border p-2">5 min</td>
                  <td className="border p-2 font-medium">Form Concept</td>
                  <td className="border p-2">Explain the 4 sections: Intro (sets scene), Build (tension rises), Climax (peak moment), Outro (resolution). Show story arc diagram.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Practice */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-purple-50 p-2 rounded">
              2. Practice <span className="font-normal text-gray-600">— Sectional Loop Builder (8 min)</span>
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
                  <td className="border p-2 font-medium">🎮 Sectional Loop Builder</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Match loops to sections<br/>
                    Decide which loops belong in Intro, Build, Climax, Outro<br/>
                    <em className="text-green-700">Practice strategic placement before composition</em>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Composition */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-amber-50 p-2 rounded">
              3. Create <span className="font-normal text-gray-600">— Wildlife Documentary Score (14 min)</span>
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
                  <td className="border p-2">14 min</td>
                  <td className="border p-2 font-medium">🎮 Composition</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Create epic wildlife score<br/>
                    Plan sections first, then build each one<br/>
                    <em className="text-green-700">Focus on WHEN loops enter and exit</em>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Reflection */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-yellow-50 p-2 rounded">
              4. Reflect <span className="font-normal text-gray-600">— Two Stars and a Wish + Discussion (10 min)</span>
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
                    <strong>STUDENTS WORK:</strong> Reflect on structure choices<br/>
                    What section is strongest? What would you change?
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">5 min</td>
                  <td className="border p-2 font-medium">Share & Discussion</td>
                  <td className="border p-2">Share 2-3 compositions. Ask: "Where was the climax? How could you tell?"</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bonus Activity */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-pink-50 p-2 rounded">
              ⭐ Bonus Activity <span className="font-normal text-gray-600">— Monster Melody Maker (8 min)</span>
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
                <tr className="bg-pink-50">
                  <td className="border p-2">8 min</td>
                  <td className="border p-2 font-medium">🎮 Monster Melody Maker</td>
                  <td className="border p-2">
                    <strong>BONUS:</strong> Creative melody game<br/>
                    <em className="text-pink-700">Use if time allows or for fast finishers</em>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* KEY VOCABULARY */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-amber-800 mb-4 border-b-2 border-amber-300 pb-2">
            Key Vocabulary
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <ul className="space-y-2">
                <li><strong>Form:</strong> The structure or organization of a piece of music</li>
                <li><strong>Section:</strong> A distinct part of a musical composition</li>
                <li><strong>Intro:</strong> Opening section that sets the scene</li>
                <li><strong>Build:</strong> Section where tension and intensity increase</li>
              </ul>
            </div>
            <div>
              <ul className="space-y-2">
                <li><strong>Climax:</strong> The peak moment of intensity in the music</li>
                <li><strong>Outro:</strong> Closing section that provides resolution</li>
                <li><strong>Story Arc:</strong> The narrative journey (beginning, middle, end)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Resources & Materials */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-amber-800 mb-4 border-b-2 border-amber-300 pb-2">
            Resources & Materials
          </h2>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Chromebooks/computers with internet access and headphones</li>
            <li className="text-sm">Epic wildlife footage (nature documentary clips)</li>
            <li className="text-sm">Story arc diagram visual</li>
            <li className="text-sm">Loop library organized by intensity/energy level</li>
            <li className="text-sm">Session code for teacher-controlled lesson flow</li>
          </ul>
        </section>

        {/* Important Notes */}
        <section className="mb-8 bg-amber-50 p-4 rounded-lg border-2 border-amber-300">
          <h2 className="text-xl font-bold text-amber-800 mb-3">
            📋 Important Notes for Teachers
          </h2>
          <ul className="list-disc ml-6 space-y-2">
            <li className="text-sm">Connect to movie examples students know (Marvel climaxes, Disney build-ups)</li>
            <li className="text-sm">Emphasize that less is more in the intro - save the big sounds!</li>
            <li className="text-sm">The Sectional Loop Builder helps students plan before composing</li>
            <li className="text-sm">Green rows (🎮) indicate student activity time - start the timer!</li>
            <li className="text-sm">During share time, point out the structural differences between compositions</li>
          </ul>
        </section>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-4 mt-8 text-center text-sm text-gray-500">
          <p>🦁 Epic Wildlife - Lesson 4 of Music for Media Unit</p>
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

export default LessonPlan4PDF;
