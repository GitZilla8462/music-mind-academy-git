// File: /src/lessons/film-music-project/lesson1/LessonPlanPDF.jsx
// Printable lesson plan view for teachers

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
            Lesson 1: Introduction to the Digital Audio Workstation
          </h1>
          <p className="text-lg text-gray-700 font-semibold">
            MUSIC LESSON PLAN - Understanding by Design Template
          </p>
          <div className="flex gap-6 mt-3 text-sm">
            <div><strong>Grade Level:</strong> 5-8</div>
            <div><strong>Duration:</strong> 34 minutes</div>
          </div>
        </div>

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
              <li className="text-sm">Musicians create film scores by intentionally selecting and layering sounds to enhance storytelling</li>
              <li className="text-sm">Musical elements (instrumentation, layering, structure) work together to create mood and emotion</li>
              <li className="text-sm">Composers use the creative process to develop and refine their work</li>
              <li className="text-sm">Technology tools (like DAWs) expand creative possibilities for musicians</li>
            </ul>
          </div>

          {/* Essential Questions */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Essential Questions:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">How does music enhance storytelling in films?</li>
              <li className="text-sm">What techniques do composers use to create mystery and suspense?</li>
              <li className="text-sm">How do musicians make intentional choices about instrumentation, layering, and structure?</li>
            </ul>
          </div>

          {/* Students will know */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Students will know...
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">DAW interface components (timeline, loop library, playback controls, mixer)</li>
              <li className="text-sm">Musical concepts: instrumentation, layering, structure</li>
              <li className="text-sm">Film music terminology</li>
              <li className="text-sm">The role of music in storytelling</li>
            </ul>
          </div>

          {/* Students will be able to */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Students will be able to...
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Navigate and use basic DAW controls</li>
              <li className="text-sm">Place and manipulate music loops on a timeline</li>
              <li className="text-sm">Create layers by playing multiple loops simultaneously</li>
              <li className="text-sm">Make intentional choices about instrumentation to create mood</li>
              <li className="text-sm">Evaluate and refine their own musical work</li>
              <li className="text-sm">Articulate creative decisions using music vocabulary</li>
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
              Students compose an original film score for "The School Beneath" underwater mystery trailer that demonstrates:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm"><strong>Instrumentation:</strong> Uses 5+ different loops</li>
              <li className="text-sm"><strong>Layering:</strong> Creates 3+ layers (loops playing together)</li>
              <li className="text-sm"><strong>Mood:</strong> Creates mysterious atmosphere appropriate for the scenario</li>
            </ul>
          </div>

          {/* Other Evidence */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Other Evidence:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">DAW Tutorial completion (formative assessment - knowledge check)</li>
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
              <li className="text-sm">Creative expression (mood matches intent)</li>
              <li className="text-sm">Musical coherence (loops work well together)</li>
              <li className="text-sm">Thoughtful reflection (articulates creative decisions with specific examples)</li>
            </ul>
          </div>
        </section>

        {/* STAGE 3: LEARNING PLAN */}
        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-blue-800 mb-4 border-b-2 border-blue-300 pb-2">
            STAGE 3: LEARNING PLAN
          </h2>

          {/* Introduction */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-blue-50 p-2 rounded">
              Introduction (10 minutes)
            </h3>
            <ol className="list-decimal ml-6 space-y-2">
              <li className="text-sm">
                <strong>Welcome & Agenda (1 min)</strong> - Orient students to lesson structure
              </li>
              <li className="text-sm">
                <strong>Introduction Video (3 min)</strong> - Film composers and DAW overview
              </li>
              <li className="text-sm">
                <strong>DAW Tutorial Instructions (1 min)</strong> - Preview interactive challenge
              </li>
              <li className="text-sm">
                <strong>DAW Basics Interactive Tutorial (4 min)</strong> - Hands-on exploration of DAW interface
                <ul className="list-disc ml-6 mt-1 space-y-1">
                  <li className="text-sm">Students answer questions, click all controls, explore workspace</li>
                  <li className="text-sm">Bonus: Early finishers explore freely</li>
                </ul>
              </li>
            </ol>
          </div>

          {/* Activity 1 */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-purple-50 p-2 rounded">
              Activity 1: Composition (12 minutes)
            </h3>
            <ol className="list-decimal ml-6 space-y-2" start="5">
              <li className="text-sm">
                <strong>Activity Instructions (1 min)</strong> - Transition to creative application
              </li>
              <li className="text-sm">
                <strong>Activity Intro Video (2 min)</strong> - "The School Beneath" scenario introduction
              </li>
              <li className="text-sm">
                <strong>Composition Instructions (1 min)</strong> - Display requirements clearly
              </li>
              <li className="text-sm">
                <strong>"School Beneath" Composition Activity (8 min)</strong> - Students create film score
                <ul className="list-disc ml-6 mt-1 space-y-1">
                  <li className="text-sm">Select loops from library</li>
                  <li className="text-sm">Place on timeline and create layers</li>
                  <li className="text-sm">Auto-save every 5 seconds (no manual submission needed)</li>
                  <li className="text-sm">Bonus: Add sound effects (shocks, risers, wooshes)</li>
                </ul>
              </li>
            </ol>
          </div>

          {/* Activity 2 */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-yellow-50 p-2 rounded">
              Activity 2: Reflection (10 minutes)
            </h3>
            <ol className="list-decimal ml-6 space-y-2" start="9">
              <li className="text-sm">
                <strong>Reflection Instructions (1 min)</strong> - Introduce "Two Stars and a Wish" format
              </li>
              <li className="text-sm">
                <strong>"Two Stars and a Wish" Reflection (10 min)</strong> - Structured self-assessment
                <ul className="list-disc ml-6 mt-1 space-y-1">
                  <li className="text-sm">Star 1: One thing done well</li>
                  <li className="text-sm">Star 2: Another strength</li>
                  <li className="text-sm">Wish: One area for improvement</li>
                  <li className="text-sm">Students listen to composition while reflecting</li>
                  <li className="text-sm">Bonus: "Guess the Loop" partner game</li>
                </ul>
              </li>
            </ol>
          </div>

          {/* Conclusion */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-gray-50 p-2 rounded">
              Conclusion (2 minutes)
            </h3>
            <ol className="list-decimal ml-6 space-y-2" start="11">
              <li className="text-sm">
                <strong>Class Discussion</strong> - Wrap-up, review key concepts, celebrate work
              </li>
            </ol>
          </div>
        </section>

        {/* Resources & Materials */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-blue-800 mb-4 border-b-2 border-blue-300 pb-2">
            Resources & Materials
          </h2>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Computers/tablets with internet access and headphones</li>
            <li className="text-sm">"School Beneath" video trailer</li>
            <li className="text-sm">Loop library (mysterious, suspenseful loops)</li>
            <li className="text-sm">Sound effects library</li>
            <li className="text-sm">Session code for teacher-controlled lesson flow</li>
          </ul>
        </section>

        {/* Differentiation */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-blue-800 mb-4 border-b-2 border-blue-300 pb-2">
            Differentiation
          </h2>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm"><strong>Advanced learners:</strong> Bonus activities (sound effects, partner games)</li>
            <li className="text-sm"><strong>Struggling learners:</strong> Teacher support during tutorial, extended time options</li>
            <li className="text-sm"><strong>ELL students:</strong> Visual demonstrations, video instructions, text read-aloud on directions</li>
            <li className="text-sm"><strong>All students:</strong> Auto-save eliminates submission pressure, self-paced exploration time</li>
          </ul>
        </section>

        {/* Important Notes */}
        <section className="mb-8 bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
          <h2 className="text-xl font-bold text-blue-800 mb-3">
            📋 Important Notes
          </h2>
          <ul className="list-disc ml-6 space-y-2">
            <li className="text-sm">Work auto-saves every 5 seconds - no manual submission required</li>
            <li className="text-sm">Teacher advances stages when ready - no need to wait for 100% completion</li>
            <li className="text-sm">Progress tracking shows real-time completion rates</li>
            <li className="text-sm">Presentation view available for classroom projection</li>
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

export default LessonPlanPDF;