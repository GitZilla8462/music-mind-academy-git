// File: /src/lessons/film-music-project/lesson3/LessonPlan3PDF.jsx
// Printable lesson plan view for teachers - Epic Wildlife (Lesson 3)

import React from 'react';

const LessonPlan3PDF = () => {
  return (
    <div className="min-h-screen bg-white p-8 max-w-5xl mx-auto print:p-4">
      {/* Print Button - Hidden when printing */}
      <div className="mb-6 print:hidden flex gap-3">
        <button
          onClick={() => window.print()}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-colors"
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
        <div className="border-b-4 border-green-600 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-green-900 mb-2">
            🌍 Lesson 3: Epic Wildlife
          </h1>
          <p className="text-lg text-gray-700 font-semibold">
            Form & Structure — How do sections organize to tell a musical story?
          </p>
          <div className="flex gap-6 mt-3 text-sm">
            <div><strong>Grade Level:</strong> 6-8</div>
            <div><strong>Duration:</strong> 45 minutes</div>
          </div>
        </div>

        {/* LESSON OVERVIEW */}
        <section className="mb-8 bg-green-50 p-4 rounded-lg border border-green-200">
          <h2 className="text-xl font-bold text-green-800 mb-3">
            Lesson Overview
          </h2>
          <p className="text-sm mb-4">
            Students learn how film scores follow a story arc with distinct sections (Intro → A → A' → Outro). They create a listening map to Vivaldi's Spring, play a section-matching game, then compose an epic nature documentary soundtrack.
          </p>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Students Will:</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Create a listening map visualizing song form</li>
            <li className="text-sm">Identify sections in sectional loop form (Intro, A, A', Outro)</li>
            <li className="text-sm">Compose a complete film score with clear structure</li>
          </ul>
        </section>

        {/* STAGE 1: DESIRED RESULTS */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-green-800 mb-4 border-b-2 border-green-300 pb-2">
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
              <li className="text-sm">Sectional loop form (Intro → A → A' → Outro) creates variety within unity</li>
              <li className="text-sm">Visual listening maps help understand musical structure</li>
            </ul>
          </div>

          {/* Essential Questions */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Essential Questions:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">How do sections organize to tell a musical story?</li>
              <li className="text-sm">How does A' differ from A while staying connected?</li>
              <li className="text-sm">Why do film composers plan when instruments come in and out?</li>
            </ul>
          </div>

          {/* Students will know */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Students will know...
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">The sections of sectional loop form: Intro, A, A' (A prime), Outro</li>
              <li className="text-sm">How to create a listening map that visualizes song structure</li>
              <li className="text-sm">How the story arc of a film connects to musical structure</li>
              <li className="text-sm">How A' varies from A (different instrumentation, same foundation)</li>
            </ul>
          </div>

          {/* Students will be able to */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Students will be able to...
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Create a listening map while listening to Vivaldi's Spring</li>
              <li className="text-sm">Identify sections by ear in the Sectional Loop Builder game</li>
              <li className="text-sm">Compose a structured wildlife documentary score</li>
              <li className="text-sm">Explain their structural choices using musical vocabulary</li>
            </ul>
          </div>
        </section>

        {/* STAGE 2: ASSESSMENT EVIDENCE */}
        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-green-800 mb-4 border-b-2 border-green-300 pb-2">
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
              <li className="text-sm"><strong>Structure:</strong> Clear sections (Intro → A → A' → Outro)</li>
              <li className="text-sm"><strong>Variation:</strong> A' section differs from A while maintaining connection</li>
              <li className="text-sm"><strong>Story:</strong> Music supports the visual narrative arc</li>
            </ul>
          </div>

          {/* Other Evidence */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Other Evidence:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Listening Map activity (formative - understanding of visual form representation)</li>
              <li className="text-sm">Sectional Loop Builder game (formative - identifying sections by ear)</li>
              <li className="text-sm">Real-time progress tracking during composition</li>
              <li className="text-sm">"Two Stars and a Wish" reflection (self-assessment)</li>
            </ul>
          </div>
        </section>

        {/* STAGE 3: LEARNING PLAN */}
        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-green-800 mb-4 border-b-2 border-green-300 pb-2">
            STAGE 3: LEARNING PLAN (45 minutes)
          </h2>

          {/* Introduction */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-blue-50 p-2 rounded">
              1. Introduction <span className="font-normal text-gray-600">— Song Form Concept (5 min)</span>
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
                  <td className="border p-2 font-medium">Welcome</td>
                  <td className="border p-2">Introduce Epic Wildlife lesson. "Today we'll learn about song FORM."</td>
                </tr>
                <tr>
                  <td className="border p-2">3 min</td>
                  <td className="border p-2 font-medium">Form Concept</td>
                  <td className="border p-2">Explain sectional loop form: Intro → A → A' → Outro. "A' is like A, but with a twist!"</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Listening Map */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-yellow-50 p-2 rounded">
              2. Listening Map <span className="font-normal text-gray-600">— Vivaldi's Spring (14 min)</span>
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
                  <td className="border p-2 font-medium">Intro to Listening Maps</td>
                  <td className="border p-2">"A listening map is a visual guide that shows song form."</td>
                </tr>
                <tr>
                  <td className="border p-2">2 min</td>
                  <td className="border p-2 font-medium">▶️ Video</td>
                  <td className="border p-2">Play the Listening Map explanation video</td>
                </tr>
                <tr>
                  <td className="border p-2">1 min</td>
                  <td className="border p-2 font-medium">Introduce Music</td>
                  <td className="border p-2">"Spring by Vivaldi - listen for the violin imitating birds!"</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">8 min</td>
                  <td className="border p-2 font-medium">🎮 Listening Map Activity</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Draw shapes/colors while listening<br/>
                    Create 4 rows, unique style per section<br/>
                    <em className="text-green-700">Use stickers, shapes, and colors to visualize the music</em>
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">2 min</td>
                  <td className="border p-2 font-medium">Share & Pair</td>
                  <td className="border p-2">Partner activity: Share your listening map, discuss choices</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Sectional Loop Form */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-teal-50 p-2 rounded">
              3. Sectional Loop Form <span className="font-normal text-gray-600">— Teaching (5 min)</span>
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
                  <td className="border p-2">5 min</td>
                  <td className="border p-2 font-medium">Form Continued</td>
                  <td className="border p-2">
                    Explain Intro → A → A' → Outro in detail<br/>
                    <strong>Intro:</strong> Sets the scene (fewer layers)<br/>
                    <strong>A:</strong> Main theme with full instrumentation<br/>
                    <strong>A':</strong> Variation - same foundation, different details<br/>
                    <strong>Outro:</strong> Wraps up, often returns to simpler texture
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Sectional Loop Builder Game */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-purple-50 p-2 rounded">
              4. Sectional Loop Builder Game <span className="font-normal text-gray-600">— (7 min)</span>
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
                  <td className="border p-2 font-medium">Instructions</td>
                  <td className="border p-2">"Listen to each clip and identify which section is playing!"</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">5 min</td>
                  <td className="border p-2 font-medium">🎮 Sectional Loop Builder</td>
                  <td className="border p-2">
                    <strong>STUDENTS PLAY:</strong> Identify sections by ear<br/>
                    Leaderboard shows on projector<br/>
                    <em className="text-green-700">Points for correct answers + speed bonus</em>
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">1 min</td>
                  <td className="border p-2 font-medium">Results</td>
                  <td className="border p-2">Show winner celebration, review any tricky sections</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Composition */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-green-50 p-2 rounded">
              5. Composition <span className="font-normal text-gray-600">— Wildlife Documentary Score (12 min)</span>
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
                  <td className="border p-2 font-medium">Instructions</td>
                  <td className="border p-2">Show composition requirements. "Create a score with clear sections!"</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">10 min</td>
                  <td className="border p-2 font-medium">🎮 Wildlife Composition</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Create epic wildlife score<br/>
                    Choose video, then build Intro → A → A' → Outro<br/>
                    <em className="text-green-700">5+ loops required, focus on WHEN loops enter/exit</em>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Reflection */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-amber-50 p-2 rounded">
              6. Reflection <span className="font-normal text-gray-600">— Two Stars and a Wish (6 min)</span>
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
                  <td className="border p-2 font-medium">Instructions</td>
                  <td className="border p-2">Explain the Two Stars and a Wish prompts</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">5 min</td>
                  <td className="border p-2 font-medium">🎮 Two Stars and a Wish</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Reflect on structure choices<br/>
                    What section is strongest? What would you change?
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* KEY VOCABULARY */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-green-800 mb-4 border-b-2 border-green-300 pb-2">
            Key Vocabulary
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <ul className="space-y-2">
                <li><strong>Form:</strong> The structure or organization of a piece of music</li>
                <li><strong>Section:</strong> A distinct part of a musical composition</li>
                <li><strong>Intro:</strong> Opening section that sets the scene</li>
                <li><strong>A Section:</strong> Main theme with full instrumentation</li>
              </ul>
            </div>
            <div>
              <ul className="space-y-2">
                <li><strong>A' (A Prime):</strong> Variation of A - same foundation, different details</li>
                <li><strong>Outro:</strong> Closing section that provides resolution</li>
                <li><strong>Listening Map:</strong> Visual representation of musical form</li>
                <li><strong>Sectional Loop Form:</strong> Intro → A → A' → Outro structure</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Resources & Materials */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-green-800 mb-4 border-b-2 border-green-300 pb-2">
            Resources & Materials
          </h2>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Chromebooks/computers with internet access and headphones</li>
            <li className="text-sm">Vivaldi's Spring audio (for Listening Map activity)</li>
            <li className="text-sm">Epic wildlife footage (nature documentary clips)</li>
            <li className="text-sm">Loop library with mood categories</li>
            <li className="text-sm">Session code for teacher-controlled lesson flow</li>
          </ul>
        </section>

        {/* Important Notes */}
        <section className="mb-8 bg-green-50 p-4 rounded-lg border-2 border-green-300">
          <h2 className="text-xl font-bold text-green-800 mb-3">
            📋 Important Notes for Teachers
          </h2>
          <ul className="list-disc ml-6 space-y-2">
            <li className="text-sm">The Listening Map builds on the form concepts from the intro</li>
            <li className="text-sm">In Sectional Loop Builder, explain that A' has different layers than A</li>
            <li className="text-sm">Emphasize that Intro should have fewer layers - save the big sounds!</li>
            <li className="text-sm">Green rows (🎮) indicate student activity time - start the timer!</li>
            <li className="text-sm">All student work saves automatically and appears on the Join page</li>
          </ul>
        </section>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-4 mt-8 text-center text-sm text-gray-500">
          <p>🌍 Epic Wildlife - Lesson 3 of Music for Media Unit</p>
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

export default LessonPlan3PDF;
