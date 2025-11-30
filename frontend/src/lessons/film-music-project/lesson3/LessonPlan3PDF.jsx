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
          className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-colors"
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
        <div className="border-b-4 border-teal-600 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-teal-900 mb-2">
            🏙️ City Soundscapes
          </h1>
          <p className="text-lg text-gray-700 font-semibold">
            MUSIC LESSON PLAN - Understanding by Design Template
          </p>
          <div className="flex gap-6 mt-3 text-sm">
            <div><strong>Grade Level:</strong> 5-8</div>
            <div><strong>Duration:</strong> 36 minutes</div>
            <div><strong>Concept:</strong> Texture & Layering</div>
          </div>
        </div>

        {/* STAGE 1: DESIRED RESULTS */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-teal-800 mb-4 border-b-2 border-teal-300 pb-2">
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
              <li className="text-sm">Texture in music refers to how thick or thin the sound is based on the number of layers</li>
              <li className="text-sm">Adding more instrumental layers creates a fuller, richer texture</li>
              <li className="text-sm">Composers use texture intentionally to create mood and atmosphere</li>
              <li className="text-sm">Visual listening maps can represent musical layers and texture</li>
            </ul>
          </div>

          {/* Essential Questions */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Essential Questions:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">What is texture in music and how do we describe it?</li>
              <li className="text-sm">How does the number of layers affect the feel and mood of music?</li>
              <li className="text-sm">How can we visually represent what we hear in music?</li>
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
              <li className="text-sm">The "sandwich" analogy: 1 ingredient = thin, many ingredients = full</li>
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
              <li className="text-sm">Compose a city soundscape with multiple layers to create full texture</li>
              <li className="text-sm">Describe texture using appropriate musical vocabulary</li>
              <li className="text-sm">Evaluate and reflect on their creative decisions</li>
            </ul>
          </div>
        </section>

        {/* STAGE 2: ASSESSMENT EVIDENCE */}
        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-teal-800 mb-4 border-b-2 border-teal-300 pb-2">
            STAGE 2: ASSESSMENT EVIDENCE
          </h2>

          {/* Performance Task */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Performance Task:
            </h3>
            <p className="text-sm mb-2">
              Students compose an original city soundscape for their chosen city (Paris, Tokyo, New York, etc.) that demonstrates:
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
              <li className="text-sm">Listening Map drawing (formative assessment - listening comprehension)</li>
              <li className="text-sm">Real-time progress tracking during composition (formative - skill demonstration)</li>
              <li className="text-sm">"Two Stars and a Wish" reflection (self-assessment - metacognition)</li>
              <li className="text-sm">Class discussion responses about texture</li>
            </ul>
          </div>

          {/* Criteria for Success */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Criteria for Success:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Listening Map shows at least 4 distinct rows with unique visual styles</li>
              <li className="text-sm">Composition meets technical requirements (5+ loops, aligned edges)</li>
              <li className="text-sm">Music creates appropriate mood/atmosphere for chosen city</li>
              <li className="text-sm">Student can articulate how texture affects the feel of their composition</li>
            </ul>
          </div>
        </section>

        {/* STAGE 3: LEARNING PLAN */}
        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-teal-800 mb-4 border-b-2 border-teal-300 pb-2">
            STAGE 3: LEARNING PLAN
          </h2>

          {/* Section 1: Introduction */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-blue-50 p-2 rounded">
              1. Introduction <span className="font-normal text-gray-600">— Slides → Texture Concept (8 min)</span>
            </h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left w-16">Time</th>
                  <th className="border p-2 text-left w-48">Stage</th>
                  <th className="border p-2 text-left">What to Say/Do</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">1 min</td>
                  <td className="border p-2 font-medium">City Soundscapes</td>
                  <td className="border p-2">Ask: "What city have you visited? How would it feel there?"</td>
                </tr>
                <tr>
                  <td className="border p-2">1 min</td>
                  <td className="border p-2 font-medium">Agenda</td>
                  <td className="border p-2">Review: "1) Learn texture & layering, 2) Create City Soundscape"</td>
                </tr>
                <tr>
                  <td className="border p-2">2 min</td>
                  <td className="border p-2 font-medium">Texture</td>
                  <td className="border p-2">Explain: "Texture = how thick or thin music sounds based on # of layers"</td>
                </tr>
                <tr>
                  <td className="border p-2">2 min</td>
                  <td className="border p-2 font-medium">Sandwich Analogy</td>
                  <td className="border p-2">Analogy: "1 ingredient = thin sandwich, many ingredients = full sandwich"</td>
                </tr>
                <tr>
                  <td className="border p-2">2 min</td>
                  <td className="border p-2 font-medium">Making Layers</td>
                  <td className="border p-2">Explain: "1 layer = thin, 2-3 layers = medium, 4+ layers = full texture"</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2: Listening Map */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-purple-50 p-2 rounded">
              2. Listening Map <span className="font-normal text-gray-600">— Video → Draw (11 min)</span>
            </h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left w-16">Time</th>
                  <th className="border p-2 text-left w-48">Stage</th>
                  <th className="border p-2 text-left">What to Say/Do</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">1 min</td>
                  <td className="border p-2 font-medium">Listening Map Intro</td>
                  <td className="border p-2">Announce: "We'll watch a 1-min video then draw while listening"</td>
                </tr>
                <tr>
                  <td className="border p-2">2 min</td>
                  <td className="border p-2 font-medium">▶️ Play Video</td>
                  <td className="border p-2"><strong>PLAY VIDEO:</strong> Listening Map explanation (students watch main screen)</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">8 min</td>
                  <td className="border p-2 font-medium">🎮 Listening Map</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Create 4 rows, unique style per row<br/>
                    <em className="text-green-700">Bonus: Add more colors, textures, and pictures</em>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Composition */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-green-50 p-2 rounded">
              3. City Soundscape Composition <span className="font-normal text-gray-600">— Slides → Compose (12 min)</span>
            </h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left w-16">Time</th>
                  <th className="border p-2 text-left w-48">Stage</th>
                  <th className="border p-2 text-left">What to Say/Do</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border p-2">1 min</td>
                  <td className="border p-2 font-medium">Composition Instructions</td>
                  <td className="border p-2">Instructions: "Select city, watch silent video, think about mood"</td>
                </tr>
                <tr>
                  <td className="border p-2">1 min</td>
                  <td className="border p-2 font-medium">Composition Requirements</td>
                  <td className="border p-2">Review: "5+ loops, line up edges, same mood. Bonus: sound effects"</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">10 min</td>
                  <td className="border p-2 font-medium">🎮 Composition</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Pick city video, compose soundscape music<br/>
                    <em className="text-green-700">Bonus: Add more layers and sound effects</em>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 4: Reflection */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-amber-50 p-2 rounded">
              4. Reflection and Discussion <span className="font-normal text-gray-600">— Reflect → Discuss (5 min)</span>
            </h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left w-16">Time</th>
                  <th className="border p-2 text-left w-48">Stage</th>
                  <th className="border p-2 text-left">What to Say/Do</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-green-50">
                  <td className="border p-2">3 min</td>
                  <td className="border p-2 font-medium">🎮 Reflection</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> 2 things well + 1 to improve, fill out form<br/>
                    <em className="text-green-700">Bonus: Layer Detective with a partner</em>
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">2 min</td>
                  <td className="border p-2 font-medium">Class Discussion</td>
                  <td className="border p-2">Ask: "What is texture? Partner's city? What did you like?"</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* DIFFERENTIATION */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-teal-800 mb-4 border-b-2 border-teal-300 pb-2">
            DIFFERENTIATION STRATEGIES
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <h3 className="font-semibold text-blue-800 mb-2">For Struggling Learners:</h3>
              <ul className="list-disc ml-4 text-sm space-y-1">
                <li>Reduce loop requirement to 3-4 loops</li>
                <li>Provide pre-selected "starter" loops</li>
                <li>Pair with a supportive peer</li>
                <li>Focus on 2 layers instead of 4+</li>
              </ul>
            </div>
            <div className="bg-green-50 p-4 rounded">
              <h3 className="font-semibold text-green-800 mb-2">For Advanced Learners:</h3>
              <ul className="list-disc ml-4 text-sm space-y-1">
                <li>Challenge to use 7+ loops with 5+ layers</li>
                <li>Add sound effects that match city atmosphere</li>
                <li>Create multiple sections with different textures</li>
                <li>Help peers with technical challenges</li>
              </ul>
            </div>
          </div>
        </section>

        {/* MATERIALS */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-teal-800 mb-4 border-b-2 border-teal-300 pb-2">
            MATERIALS & TECHNOLOGY
          </h2>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Teacher Materials:</h3>
              <ul className="list-disc ml-4 space-y-1">
                <li>Computer with projector/display</li>
                <li>Teacher Control Panel (session mode)</li>
                <li>Presentation slides (11 slides)</li>
                <li>ListeningMapExplanation.mp4 video</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Student Materials:</h3>
              <ul className="list-disc ml-4 space-y-1">
                <li>Chromebook or computer with internet</li>
                <li>Headphones (recommended)</li>
                <li>Access to Music Mind Academy platform</li>
                <li>Session join code</li>
              </ul>
            </div>
          </div>
        </section>

        {/* KEY VOCABULARY */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-teal-800 mb-4 border-b-2 border-teal-300 pb-2">
            KEY VOCABULARY
          </h2>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <ul className="space-y-2">
                <li><strong>Texture:</strong> How thick or thin music sounds based on layers</li>
                <li><strong>Layer:</strong> A single musical part or instrument track</li>
                <li><strong>Thin Texture:</strong> 1 layer playing alone (simple sound)</li>
                <li><strong>Medium Texture:</strong> 2-3 layers playing together</li>
              </ul>
            </div>
            <div>
              <ul className="space-y-2">
                <li><strong>Full Texture:</strong> 4+ layers playing together (rich sound)</li>
                <li><strong>Listening Map:</strong> Visual representation of what you hear</li>
                <li><strong>Soundscape:</strong> Musical representation of a place or environment</li>
                <li><strong>Mood:</strong> The feeling or atmosphere of the music</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-4 mt-8 text-center text-sm text-gray-500">
          <p>🏙️ City Soundscapes - Lesson 3 of Film Music Project Unit</p>
          <p>Music Mind Academy © 2024</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .page-break-before {
            page-break-before: always;
          }
          body {
            font-size: 11pt;
          }
          h1 {
            font-size: 18pt;
          }
          h2 {
            font-size: 14pt;
          }
          h3 {
            font-size: 12pt;
          }
        }
      `}</style>
    </div>
  );
};

export default LessonPlan3PDF;