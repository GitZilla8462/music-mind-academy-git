// File: /src/lessons/film-music-project/lesson2/LessonPlan2PDF.jsx
// Printable lesson plan view for teachers - Sports Highlight Reel Music

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
            🏀 Sports Highlight Reel Music
          </h1>
          <p className="text-lg text-gray-700 font-semibold">
            MUSIC LESSON PLAN - Understanding by Design Template
          </p>
          <div className="flex gap-6 mt-3 text-sm">
            <div><strong>Grade Level:</strong> 5-8</div>
            <div><strong>Duration:</strong> 32 minutes</div>
          </div>
        </div>

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
              <li className="text-sm"><strong>MU:Cr3.1.5a</strong> - Evaluate, refine, and document revisions to personal music</li>
              <li className="text-sm"><strong>MU:Pr4.2.5a</strong> - Demonstrate understanding of the structure and elements of music</li>
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
              <li className="text-sm">Musicians create sports music by intentionally layering sounds to build energy and excitement</li>
              <li className="text-sm">Texture (the combination of layers) affects the intensity and mood of music</li>
              <li className="text-sm">Composers match musical energy to visual action in sports media</li>
              <li className="text-sm">Technology tools (like DAWs) enable musicians to experiment with layering and texture</li>
            </ul>
          </div>

          {/* Essential Questions */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Essential Questions:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">How does layering sounds create energy and excitement in sports music?</li>
              <li className="text-sm">What techniques do composers use to match music to athletic action?</li>
              <li className="text-sm">How does texture (thin vs. thick) affect the feeling of music?</li>
            </ul>
          </div>

          {/* Students will know */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Students will know...
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">What a Digital Audio Workstation (DAW) is and its basic functions</li>
              <li className="text-sm">Musical concepts: texture, layering, mood</li>
              <li className="text-sm">How layers create thickness and energy in music</li>
              <li className="text-sm">The role of music in enhancing sports highlights</li>
            </ul>
          </div>

          {/* Students will be able to */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Students will be able to...
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Navigate and use basic DAW controls</li>
              <li className="text-sm">Place and align music loops on a timeline</li>
              <li className="text-sm">Create 3+ layers by playing multiple loops simultaneously</li>
              <li className="text-sm">Select loops that match the mood/energy of sports action</li>
              <li className="text-sm">Evaluate and reflect on their creative decisions</li>
              <li className="text-sm">Articulate how layering creates texture using music vocabulary</li>
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
              Students compose an original sports highlight soundtrack for their chosen sport (basketball, skateboarding, or football) that demonstrates:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm"><strong>Variety:</strong> Uses 5+ different loops</li>
              <li className="text-sm"><strong>Layering:</strong> Creates 3+ layers (loops playing simultaneously)</li>
              <li className="text-sm"><strong>Energy:</strong> Music matches the high-energy feel of the sports action</li>
            </ul>
          </div>

          {/* Other Evidence */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Other Evidence:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">DAW Challenge completion (formative assessment - knowledge check)</li>
              <li className="text-sm">Real-time progress tracking during composition (formative - skill demonstration)</li>
              <li className="text-sm">"Two Stars and a Wish" reflection (self-assessment - metacognition)</li>
              <li className="text-sm">Teacher observation of student work process</li>
            </ul>
          </div>

          {/* Criteria for Success */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Criteria for Success:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Technical proficiency (meets 3 composition requirements)</li>
              <li className="text-sm">Creative expression (energy matches sports action)</li>
              <li className="text-sm">Musical coherence (loops in same mood category work well together)</li>
              <li className="text-sm">Thoughtful reflection (articulates creative decisions about texture and layering)</li>
            </ul>
          </div>
        </section>

        {/* STAGE 3: LEARNING PLAN */}
        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-orange-800 mb-4 border-b-2 border-orange-300 pb-2">
            STAGE 3: LEARNING PLAN
          </h2>

          {/* Introduction */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-blue-50 p-2 rounded">
              🎬 Introduction <span className="font-normal text-gray-600">— Slides → DAW Tutorial</span>
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
                  <td className="border p-2 font-medium">Sports Highlight Reel</td>
                  <td className="border p-2">Ask: "What sport do you like? What music or feeling goes with it?"</td>
                </tr>
                <tr>
                  <td className="border p-2">1 min</td>
                  <td className="border p-2 font-medium">Agenda</td>
                  <td className="border p-2">Review: "Today we'll: 1) Learn about DAW, 2) Create sports composition"</td>
                </tr>
                <tr>
                  <td className="border p-2">1 min</td>
                  <td className="border p-2 font-medium">Digital Audio Workstation</td>
                  <td className="border p-2">Explain: "A DAW is software for recording, editing, mixing, and producing audio"</td>
                </tr>
                <tr>
                  <td className="border p-2">1 min</td>
                  <td className="border p-2 font-medium">DAW Challenge Preview</td>
                  <td className="border p-2">Preview: "You'll click buttons and controls to learn the DAW"</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">6 min</td>
                  <td className="border p-2 font-medium">🎮 DAW Challenge</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Answer questions, click every button to learn DAW<br/>
                    <em className="text-green-700">Bonus: Explore & experiment with the DAW</em>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Activity 1 */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-red-50 p-2 rounded">
              🎵 Activity 1 <span className="font-normal text-gray-600">— Slides → Compose</span>
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
                  <td className="border p-2 font-medium">Composition Tutorial</td>
                  <td className="border p-2">Announce: "Next we'll watch a 2-min video on getting started"</td>
                </tr>
                <tr>
                  <td className="border p-2">3 min</td>
                  <td className="border p-2 font-medium">▶️ Play Video</td>
                  <td className="border p-2"><strong>PLAY VIDEO:</strong> Sports composition tutorial (students watch main screen)</td>
                </tr>
                <tr>
                  <td className="border p-2">1 min</td>
                  <td className="border p-2 font-medium">Composition Requirements</td>
                  <td className="border p-2">Review: "5+ loops, line up edges, same mood. Bonus: add sound effects"</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">10 min</td>
                  <td className="border p-2 font-medium">🎮 Composition</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Pick sport video, think about mood, compose music<br/>
                    <em className="text-green-700">Bonus: Add more layers and sound effects</em>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Activity 2 */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-yellow-50 p-2 rounded">
              ⭐ Activity 2 <span className="font-normal text-gray-600">— Reflect</span>
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
                  <td className="border p-2">5 min</td>
                  <td className="border p-2 font-medium">🎮 Two Stars and a Wish</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Name 2 things done well + 1 to improve, fill out form, share<br/>
                    <em className="text-green-700">Bonus: Layer Detective game with a partner (groups of 2-3)</em>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Conclusion */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-gray-100 p-2 rounded">
              💬 Conclusion <span className="font-normal text-gray-600">— Discuss</span>
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
                  <td className="border p-2">2 min</td>
                  <td className="border p-2 font-medium">Class Discussion</td>
                  <td className="border p-2">
                    Ask class:<br/>
                    • "What is a DAW?"<br/>
                    • "What sport did your partner choose and what mood?"<br/>
                    • "How many layers did you have playing at one time?"<br/>
                    • "Did anyone have more than 6?"
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Resources & Materials */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-orange-800 mb-4 border-b-2 border-orange-300 pb-2">
            Resources & Materials
          </h2>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Computers/Chromebooks with internet access and headphones</li>
            <li className="text-sm">Sports highlight videos (basketball, skateboarding, football)</li>
            <li className="text-sm">Loop library (high-energy, sports-appropriate loops)</li>
            <li className="text-sm">Sound effects library (optional bonus)</li>
            <li className="text-sm">Session code for teacher-controlled lesson flow</li>
            <li className="text-sm">Projector/whiteboard for presentation view</li>
          </ul>
        </section>

        {/* Differentiation */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-orange-800 mb-4 border-b-2 border-orange-300 pb-2">
            Differentiation
          </h2>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm"><strong>Advanced learners:</strong> Bonus activities (sound effects, Layer Detective game, 6+ layers)</li>
            <li className="text-sm"><strong>Struggling learners:</strong> Teacher support during DAW challenge, start with 3 loops instead of 5</li>
            <li className="text-sm"><strong>ELL students:</strong> Visual demonstrations, video instructions with captions, text read-aloud</li>
            <li className="text-sm"><strong>All students:</strong> Auto-save eliminates submission pressure, choice of 3 sport videos</li>
          </ul>
        </section>

        {/* Vocabulary */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-orange-800 mb-4 border-b-2 border-orange-300 pb-2">
            Key Vocabulary
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <ul className="list-disc ml-6 space-y-1">
                <li className="text-sm"><strong>DAW (Digital Audio Workstation):</strong> Software for creating music</li>
                <li className="text-sm"><strong>Loop:</strong> A repeating musical phrase</li>
                <li className="text-sm"><strong>Timeline:</strong> Where loops are placed horizontally</li>
              </ul>
            </div>
            <div>
              <ul className="list-disc ml-6 space-y-1">
                <li className="text-sm"><strong>Texture:</strong> How many layers of sound play together</li>
                <li className="text-sm"><strong>Layering:</strong> Adding loops on top of each other</li>
                <li className="text-sm"><strong>Mood:</strong> The feeling or emotion of music</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Important Notes */}
        <section className="mb-8 bg-orange-50 p-4 rounded-lg border-2 border-orange-300">
          <h2 className="text-xl font-bold text-orange-800 mb-3">
            📋 Important Notes for Teachers
          </h2>
          <ul className="list-disc ml-6 space-y-2">
            <li className="text-sm">Work auto-saves every 5 seconds - no manual submission required</li>
            <li className="text-sm">Teacher advances stages when ready - no need to wait for 100% completion</li>
            <li className="text-sm">Use arrow keys (← →) or click "Next" buttons to navigate slides</li>
            <li className="text-sm">Green rows (🎮) indicate student activity time - start the timer!</li>
            <li className="text-sm">Students choose their own sport video (basketball, skateboarding, or football)</li>
            <li className="text-sm">Loops should be in the same "mood" category to sound cohesive</li>
            <li className="text-sm">All student compositions saved to Firebase for teacher review</li>
          </ul>
        </section>
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