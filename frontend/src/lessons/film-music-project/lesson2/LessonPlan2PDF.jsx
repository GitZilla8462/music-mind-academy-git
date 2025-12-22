// File: /src/lessons/film-music-project/lesson3/LessonPlan3PDF.jsx
// Printable lesson plan view for teachers - City Soundscapes

import React from 'react';

const LessonPlan3PDF = () => {
  return (
    <div className="min-h-screen bg-white p-8 max-w-5xl mx-auto print:p-4">
      {/* Print Button - Hidden when printing */}
      <div className="mb-6 print:hidden flex gap-3">
        <button
          onClick={() => window.print()}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-colors"
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
        <div className="border-b-4 border-cyan-600 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-cyan-900 mb-2">
            🏙️ Lesson 3: City Soundscapes
          </h1>
          <p className="text-lg text-gray-700 font-semibold">
            Texture & Layering — How many sounds play together?
          </p>
          <div className="flex gap-6 mt-3 text-sm">
            <div><strong>Grade Level:</strong> 6-8</div>
            <div><strong>Duration:</strong> 40 minutes</div>
          </div>
        </div>

        {/* LESSON OVERVIEW */}
        <section className="mb-8 bg-cyan-50 p-4 rounded-lg border border-cyan-200">
          <h2 className="text-xl font-bold text-cyan-800 mb-3">
            Lesson Overview
          </h2>
          <p className="text-sm mb-4">
            Students visualize how layers create texture using a listening map, then build their own rich city soundscape.
          </p>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Students Will:</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Understand thin vs. thick musical texture</li>
            <li className="text-sm">Create a visual listening map</li>
            <li className="text-sm">Build layered compositions for city footage</li>
          </ul>
        </section>

        {/* STAGE 1: DESIRED RESULTS */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-cyan-800 mb-4 border-b-2 border-cyan-300 pb-2">
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
              <li className="text-sm"><strong>MU:Re8.1.5a</strong> - Demonstrate and explain how the expressive qualities are used in performers' interpretations</li>
            </ul>
          </div>

          {/* Enduring Understandings */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Enduring Understandings:
            </h3>
            <p className="text-sm italic mb-2">Students will understand that...</p>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Texture refers to how thick or thin music sounds based on the number of layers</li>
              <li className="text-sm">Adding more layers creates a fuller, richer texture</li>
              <li className="text-sm">Composers use texture intentionally to create mood and atmosphere</li>
              <li className="text-sm">Visual listening maps can represent musical layers</li>
            </ul>
          </div>

          {/* Essential Questions */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Essential Questions:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">How many sounds play together?</li>
              <li className="text-sm">What is texture in music and how do we describe it?</li>
              <li className="text-sm">How does the number of layers affect the mood of music?</li>
            </ul>
          </div>

          {/* Students will know */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Students will know...
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">The definition of texture: how thick or thin music sounds</li>
              <li className="text-sm">Vocabulary: thin texture (1 layer), medium texture (2-3 layers), full texture (4+ layers)</li>
              <li className="text-sm">How layers combine to create different textures</li>
              <li className="text-sm">The "sandwich" analogy for understanding texture</li>
            </ul>
          </div>

          {/* Students will be able to */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Students will be able to...
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Identify and count the number of layers in a musical piece</li>
              <li className="text-sm">Create a visual listening map representing different musical layers</li>
              <li className="text-sm">Compose a city soundscape with multiple layers</li>
              <li className="text-sm">Describe texture using appropriate musical vocabulary</li>
            </ul>
          </div>
        </section>

        {/* STAGE 2: ASSESSMENT EVIDENCE */}
        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-cyan-800 mb-4 border-b-2 border-cyan-300 pb-2">
            STAGE 2: ASSESSMENT EVIDENCE
          </h2>

          {/* Performance Task */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Performance Task:
            </h3>
            <p className="text-sm mb-2">
              Students compose an original city soundscape that demonstrates:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm"><strong>Variety:</strong> Uses 5+ different loops</li>
              <li className="text-sm"><strong>Layering:</strong> Creates multiple layers for full texture</li>
              <li className="text-sm"><strong>Mood:</strong> Music matches the atmosphere of the city</li>
            </ul>
          </div>

          {/* Other Evidence */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Other Evidence:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Listening Map drawing (formative - listening comprehension)</li>
              <li className="text-sm">Real-time progress tracking during composition</li>
              <li className="text-sm">"Two Stars and a Wish" reflection (self-assessment)</li>
              <li className="text-sm">Class discussion responses about texture</li>
            </ul>
          </div>
        </section>

        {/* STAGE 3: LEARNING PLAN */}
        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-cyan-800 mb-4 border-b-2 border-cyan-300 pb-2">
            STAGE 3: LEARNING PLAN (40 minutes)
          </h2>

          {/* Introduction */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-blue-50 p-2 rounded">
              1. Introduction <span className="font-normal text-gray-600">— Texture Concept (7 min)</span>
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
                  <td className="border p-2 font-medium">Introduction</td>
                  <td className="border p-2">Ask: "What city have you visited? How would music for that city sound?"</td>
                </tr>
                <tr>
                  <td className="border p-2">5 min</td>
                  <td className="border p-2 font-medium">Texture Concept</td>
                  <td className="border p-2">Explain how layers create thick or thin sound. Use sandwich analogy.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Listening Map */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-purple-50 p-2 rounded">
              2. Practice <span className="font-normal text-gray-600">— Listening Map (11 min)</span>
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
                  <td className="border p-2 font-medium">▶️ Listening Map Video</td>
                  <td className="border p-2"><strong>PLAY VIDEO:</strong> How to visualize texture</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">8 min</td>
                  <td className="border p-2 font-medium">🎮 Listening Map Activity</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Draw while listening to music<br/>
                    Create 4 rows, unique style per row<br/>
                    <em className="text-green-700">Bonus: Add colors, textures, pictures</em>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Composition */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-cyan-50 p-2 rounded">
              3. Create <span className="font-normal text-gray-600">— City Soundscape Composition (14 min)</span>
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
                    <strong>STUDENTS WORK:</strong> Create a city soundscape with layers<br/>
                    Focus on building texture through layering<br/>
                    <em className="text-green-700">Bonus: Add sound effects!</em>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Reflection */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-yellow-50 p-2 rounded">
              4. Reflect <span className="font-normal text-gray-600">— Two Stars and a Wish + Discussion (8 min)</span>
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
                    <strong>STUDENTS WORK:</strong> Reflect on their layers<br/>
                    How many layers did you use? What texture did you create?
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">3 min</td>
                  <td className="border p-2 font-medium">Share & Discussion</td>
                  <td className="border p-2">Compare textures across compositions. Ask: "Who had the thickest texture?"</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* KEY VOCABULARY */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-cyan-800 mb-4 border-b-2 border-cyan-300 pb-2">
            Key Vocabulary
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <ul className="space-y-2">
                <li><strong>Texture:</strong> How thick or thin music sounds based on layers</li>
                <li><strong>Layer:</strong> A single musical part or instrument track</li>
                <li><strong>Thin Texture:</strong> 1 layer playing alone</li>
                <li><strong>Medium Texture:</strong> 2-3 layers playing together</li>
              </ul>
            </div>
            <div>
              <ul className="space-y-2">
                <li><strong>Full Texture:</strong> 4+ layers playing together (rich sound)</li>
                <li><strong>Listening Map:</strong> Visual representation of what you hear</li>
                <li><strong>Soundscape:</strong> Musical representation of a place</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Resources & Materials */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-cyan-800 mb-4 border-b-2 border-cyan-300 pb-2">
            Resources & Materials
          </h2>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Chromebooks/computers with internet access and headphones</li>
            <li className="text-sm">City footage videos (Paris, Tokyo, New York, etc.)</li>
            <li className="text-sm">Listening Map video explanation</li>
            <li className="text-sm">Loop library organized by mood/atmosphere</li>
            <li className="text-sm">Session code for teacher-controlled lesson flow</li>
          </ul>
        </section>

        {/* Important Notes */}
        <section className="mb-8 bg-cyan-50 p-4 rounded-lg border-2 border-cyan-300">
          <h2 className="text-xl font-bold text-cyan-800 mb-3">
            📋 Important Notes for Teachers
          </h2>
          <ul className="list-disc ml-6 space-y-2">
            <li className="text-sm">The sandwich analogy works well: 1 ingredient = thin, many = full</li>
            <li className="text-sm">Listening Map helps students visualize what they hear</li>
            <li className="text-sm">Encourage students to count their layers during composition</li>
            <li className="text-sm">Green rows (🎮) indicate student activity time - start the timer!</li>
            <li className="text-sm">Discussion should focus on texture vocabulary</li>
          </ul>
        </section>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-4 mt-8 text-center text-sm text-gray-500">
          <p>🏙️ City Soundscapes - Lesson 3 of Music for Media Unit</p>
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
