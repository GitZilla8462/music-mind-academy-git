// File: /src/lessons/film-music-project/lesson5/LessonPlan5PDF.jsx
// Printable lesson plan view for teachers - Game On! (Melody & Contour)

import React from 'react';

const LessonPlan5PDF = () => {
  return (
    <div className="min-h-screen bg-white p-8 max-w-5xl mx-auto print:p-4">
      {/* Print Button - Hidden when printing */}
      <div className="mb-6 print:hidden flex gap-3">
        <button
          onClick={() => window.print()}
          className="bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-colors"
        >
          Print Lesson Plan
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
        <div className="border-b-4 border-pink-600 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-pink-900 mb-2">
            Lesson 5: Game On!
          </h1>
          <p className="text-lg text-gray-700 font-semibold">
            Melody & Contour — How do melodic phrases create memorable themes?
          </p>
          <div className="flex gap-6 mt-3 text-sm">
            <div><strong>Grade Level:</strong> 5-8</div>
            <div><strong>Duration:</strong> 38 minutes</div>
          </div>
        </div>

        {/* LESSON OVERVIEW */}
        <section className="mb-8 bg-pink-50 p-4 rounded-lg border border-pink-200">
          <h2 className="text-xl font-bold text-pink-800 mb-3">
            Lesson Overview
          </h2>
          <p className="text-sm mb-4">
            Students discover how melody creates memorable themes by analyzing famous video game music, learning about contour patterns (ascending, descending, arch), and composing their own video game soundtrack with original melodies.
          </p>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Learning Objectives:</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Define melody as a sequence of pitches you can sing or hum</li>
            <li className="text-sm">Identify contour as the shape of a melody (ascending, descending, repeated)</li>
            <li className="text-sm">Distinguish between steps (smooth) and skips (jumpy) in melodic movement</li>
            <li className="text-sm">Create an original 8-beat melody using a pentatonic scale</li>
            <li className="text-sm">Describe how melody creates memorable themes in video game music</li>
          </ul>
        </section>

        {/* STAGE 1: DESIRED RESULTS */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-pink-800 mb-4 border-b-2 border-pink-300 pb-2">
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
              <li className="text-sm"><strong>MU:Re7.2.5a</strong> - Demonstrate and explain how responses to music are informed by the structure and use of the elements of music</li>
            </ul>
          </div>

          {/* Enduring Understandings */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Enduring Understandings:
            </h3>
            <p className="text-sm italic mb-2">Students will understand that...</p>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Melody is the part of music we remember and can sing back</li>
              <li className="text-sm">Melodic contour (the shape of a melody) affects how music feels</li>
              <li className="text-sm">Steps create smooth, connected melodies while skips create jumpy, energetic ones</li>
              <li className="text-sm">Video game composers use memorable melodies to create iconic themes</li>
            </ul>
          </div>

          {/* Essential Questions */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Essential Questions:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">How do melodic phrases create memorable themes?</li>
              <li className="text-sm">What makes a melody stick in your head?</li>
              <li className="text-sm">How does the shape (contour) of a melody affect how it sounds?</li>
            </ul>
          </div>

          {/* Key Vocabulary */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Key Vocabulary:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm"><strong>Melody:</strong> A sequence of pitches that you can sing or hum</li>
              <li className="text-sm"><strong>Contour:</strong> The shape of a melody — whether it goes up, down, or stays the same</li>
              <li className="text-sm"><strong>Ascending:</strong> A melody that moves upward in pitch</li>
              <li className="text-sm"><strong>Descending:</strong> A melody that moves downward in pitch</li>
              <li className="text-sm"><strong>Steps:</strong> Moving to the next closest note (smooth movement)</li>
              <li className="text-sm"><strong>Skips:</strong> Jumping over notes (jumpy movement)</li>
            </ul>
          </div>
        </section>

        {/* STAGE 2: ASSESSMENT EVIDENCE */}
        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-pink-800 mb-4 border-b-2 border-pink-300 pb-2">
            STAGE 2: ASSESSMENT EVIDENCE
          </h2>

          {/* Performance Task */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Performance Task:
            </h3>
            <p className="text-sm mb-2">
              Students compose an original video game soundtrack that demonstrates:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm"><strong>Original Melody:</strong> Creates an 8-beat melody using the pentatonic scale</li>
              <li className="text-sm"><strong>Contour Awareness:</strong> Melody uses intentional ascending, descending, or mixed contour</li>
              <li className="text-sm"><strong>Layering:</strong> Combines their melody with loops to create a full soundtrack</li>
            </ul>
          </div>

          {/* Other Evidence */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Other Evidence:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Melody Maker activity completion (formative)</li>
              <li className="text-sm">Melody Spotlight reflection (self-assessment)</li>
              <li className="text-sm">Hook discussion participation</li>
            </ul>
          </div>
        </section>

        {/* STAGE 3: LEARNING PLAN */}
        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-pink-800 mb-4 border-b-2 border-pink-300 pb-2">
            STAGE 3: LEARNING PLAN (38 minutes)
          </h2>

          {/* Section 1: Hook */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-blue-50 p-2 rounded">
              1. Hook <span className="font-normal text-gray-600">— Name That Game (6 min)</span>
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
                  <td className="border p-2 font-medium">Welcome & Agenda</td>
                  <td className="border p-2">"Today we're exploring how melody creates memorable video game themes!"</td>
                </tr>
                <tr>
                  <td className="border p-2">3 min</td>
                  <td className="border p-2 font-medium">Name That Game!</td>
                  <td className="border p-2">
                    <strong>PLAY CLIPS:</strong> Play iconic game theme melodies. Students try to guess the game.<br/>
                    Let students experience how powerful a memorable melody is.
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">2 min</td>
                  <td className="border p-2 font-medium">Discussion</td>
                  <td className="border p-2">Ask: "What made those melodies so memorable? Could you hum them back?"</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2: Learn & Create Melody */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-green-50 p-2 rounded">
              2. Learn & Create Melody <span className="font-normal text-gray-600">— Melody Basics + Activity (14 min)</span>
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
                  <td className="border p-2 font-medium">What is a Melody?</td>
                  <td className="border p-2">
                    Explain key terms:<br/>
                    • <strong>Melody:</strong> A sequence of pitches you can sing<br/>
                    • <strong>Contour:</strong> The shape — up, down, or same<br/>
                    • <strong>Steps:</strong> Smooth movement to next note<br/>
                    • <strong>Skips:</strong> Jumpy movement over notes
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">2 min</td>
                  <td className="border p-2 font-medium">Building a Melody Demo</td>
                  <td className="border p-2">
                    <strong>TEACHER DEMO:</strong> Use the melody builder to show contour patterns:<br/>
                    Pattern 1: Ascending (going up)<br/>
                    Pattern 2: Descending (going down)<br/>
                    Pattern 3: Repeated (staying the same)<br/>
                    Pattern 4: Mixed with steps (smooth)<br/>
                    Pattern 5: Mixed with skips (jumpy)
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">1 min</td>
                  <td className="border p-2 font-medium">Activity Instructions</td>
                  <td className="border p-2">Explain how to use the melody maker grid. "Create an 8-beat melody!"</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">8 min</td>
                  <td className="border p-2 font-medium">Build Your Melody</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Create a melody using the note grid.<br/>
                    • Place notes on the pentatonic scale<br/>
                    • Listen and adjust your contour<br/>
                    • Bonus: Make multiple melodies to choose from!
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Compose */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-orange-50 p-2 rounded">
              3. Compose <span className="font-normal text-gray-600">— Score the Game (13 min)</span>
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
                  <td className="border p-2 font-medium">Requirements</td>
                  <td className="border p-2">
                    Explain: "Use your melody + loops to score one of the game videos. Match the mood!"
                  </td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">12 min</td>
                  <td className="border p-2 font-medium">Score the Game</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Combine their melody with loops to score game footage.<br/>
                    • Pick a game video (Grow A Garden, Minecraft, Unpacking)<br/>
                    • Add their custom melody<br/>
                    • Layer in loops that match the game mood<br/>
                    • Make the melody match the action!
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 4: Reflect */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-teal-50 p-2 rounded">
              4. Reflect & Wrap Up <span className="font-normal text-gray-600">— Melody Spotlight (5 min)</span>
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
                  <td className="border p-2 font-medium">Reflection Intro</td>
                  <td className="border p-2">Introduce the reflection activity.</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">3 min</td>
                  <td className="border p-2 font-medium">Melody Spotlight</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Reflect on their melodic choices.<br/>
                    • What contour did you use?<br/>
                    • How does your melody fit the game?
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">1 min</td>
                  <td className="border p-2 font-medium">Key Insight</td>
                  <td className="border p-2">"Melody is the memorable part of music — it's what makes a theme stick in your head!"</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Bonus Activity */}
        <section className="mb-8 bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h2 className="text-xl font-bold text-purple-800 mb-3">
            Bonus Activity: Melody Mystery (10 min)
          </h2>
          <p className="text-sm mb-2">Solo or partner activity for early finishers:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm"><strong>Phase 1 - CREATE:</strong> Build a melody puzzle and get a mystery code</li>
            <li className="text-sm"><strong>Phase 2 - SOLVE:</strong> Trade codes with a partner, listen to their hidden melody, and try to recreate it</li>
          </ul>
        </section>

        {/* Important Notes */}
        <section className="mb-8 bg-pink-50 p-4 rounded-lg border-2 border-pink-300">
          <h2 className="text-xl font-bold text-pink-800 mb-3">
            Important Notes for Teachers
          </h2>
          <ul className="list-disc ml-6 space-y-2">
            <li className="text-sm">Students should have completed Lessons 1-4 first (mood, texture, form, rhythm)</li>
            <li className="text-sm">The "Name That Game" hook is engaging — let students shout out guesses!</li>
            <li className="text-sm">During the teacher demo, play each contour pattern and ask students to describe the shape</li>
            <li className="text-sm">Green rows indicate student activity time — start the timer!</li>
            <li className="text-sm">Encourage students to think about what contour fits their chosen game video</li>
          </ul>
        </section>

        {/* Resources & Materials */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-pink-800 mb-4 border-b-2 border-pink-300 pb-2">
            Resources & Materials
          </h2>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Chromebooks/computers with internet access and headphones</li>
            <li className="text-sm">Game footage videos (Grow A Garden, Minecraft, Unpacking)</li>
            <li className="text-sm">Melody Maker tool with pentatonic note grid</li>
            <li className="text-sm">Loop library with various instrument categories</li>
            <li className="text-sm">Session code for teacher-controlled lesson flow</li>
          </ul>
        </section>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-4 mt-8 text-center text-sm text-gray-500">
          <p>Game On! - Lesson 5 of The Loop Lab</p>
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

export default LessonPlan5PDF;
