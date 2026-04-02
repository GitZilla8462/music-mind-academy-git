// File: /src/lessons/listening-lab/lesson1/LessonPlanPDF.jsx
// Printable lesson plan view for teachers - Strings & Dynamics

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
            🎻 Lesson 1: Strings & Dynamics
          </h1>
          <p className="text-lg text-gray-700 font-semibold">
            Feel the Power of Soft and Loud
          </p>
          <p className="text-md text-gray-600">
            Featured Piece: <em>Spring</em> by Antonio Vivaldi (The Four Seasons)
          </p>
          <div className="flex gap-6 mt-3 text-sm">
            <div><strong>Grade Level:</strong> 6-8</div>
            <div><strong>Duration:</strong> ~40 minutes</div>
            <div><strong>Unit:</strong> The Listening Lab</div>
          </div>
        </div>

        {/* LESSON OVERVIEW */}
        <section className="mb-8 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h2 className="text-xl font-bold text-blue-800 mb-3">
            Lesson Overview
          </h2>
          <p className="text-sm mb-4">
            Students meet the string family, learn dynamic markings from pianissimo to fortissimo, and track dynamic changes in Vivaldi's Spring through an interactive listening map.
          </p>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Students Will:</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Identify instruments of the string family by sight and sound</li>
            <li className="text-sm">Define and demonstrate understanding of dynamic markings (pp, p, mp, mf, f, ff)</li>
            <li className="text-sm">Track dynamic changes on a listening map while listening to Vivaldi's Spring</li>
            <li className="text-sm">Describe how dynamics affect the mood and energy of music</li>
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
              <li className="text-sm"><strong>MU:Re7.2.5a</strong> - Demonstrate and explain how responses to music are informed by the structure, the use of the elements of music, and context</li>
              <li className="text-sm"><strong>MU:Re8.1.5a</strong> - Demonstrate and explain how the expressive qualities are used in performers' and personal interpretations</li>
              <li className="text-sm"><strong>MU:Cr2.1.5a</strong> - Demonstrate selected and developed musical ideas for compositions to express intent</li>
            </ul>
          </div>

          {/* Essential Questions */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Essential Questions:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">How do dynamics (soft and loud) change the way music makes us feel?</li>
            </ul>
          </div>

          {/* I Can Statement */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              I Can Statement:
            </h3>
            <p className="text-sm ml-6">I can identify string instruments and describe dynamics using proper musical terms.</p>
          </div>

          {/* Enduring Understandings */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Enduring Understandings:
            </h3>
            <p className="text-sm italic mb-2">Students will understand that...</p>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Dynamics are a fundamental element of musical expression</li>
              <li className="text-sm">Composers use dynamic contrast to create mood, tension, and energy</li>
              <li className="text-sm">The string family is the foundation of the orchestra</li>
              <li className="text-sm">Active listening reveals layers of detail in music</li>
            </ul>
          </div>

          {/* Students will know */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Students will know...
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">The six dynamic markings: pp, p, mp, mf, f, ff</li>
              <li className="text-sm">The meaning of crescendo and decrescendo</li>
              <li className="text-sm">The four orchestral string instruments: violin, viola, cello, double bass</li>
              <li className="text-sm">How dynamics affect the mood and energy of music</li>
            </ul>
          </div>

          {/* Students will be able to */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Students will be able to...
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Identify instruments of the string family by sight and sound</li>
              <li className="text-sm">Define and demonstrate understanding of dynamic markings</li>
              <li className="text-sm">Track dynamic changes on a listening map while listening to Vivaldi's Spring</li>
              <li className="text-sm">Describe how dynamics affect the mood and energy of music</li>
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
              Students create a Dynamics Listening Map showing dynamic changes in Vivaldi's Spring that demonstrates:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm"><strong>Dynamic Identification:</strong> Accurately marks dynamic levels throughout the piece</li>
              <li className="text-sm"><strong>Gradual Changes:</strong> Identifies crescendos and decrescendos</li>
              <li className="text-sm"><strong>Mood Connection:</strong> Connects dynamic changes to mood and energy</li>
            </ul>
          </div>

          {/* Other Evidence */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Other Evidence:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Dynamics Dash participation (formative - dynamic identification)</li>
              <li className="text-sm">Class discussion responses (formative - understanding)</li>
              <li className="text-sm">Share & Pair partner sharing (peer assessment)</li>
              <li className="text-sm">Class reflection responses (self-assessment)</li>
            </ul>
          </div>
        </section>

        {/* STAGE 3: LEARNING PLAN */}
        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-blue-800 mb-4 border-b-2 border-blue-300 pb-2">
            STAGE 3: LEARNING PLAN (~40 minutes)
          </h2>

          {/* Introduction */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-blue-50 p-2 rounded">
              1. Introduction <span className="font-normal text-gray-600">— Hook + Meet the Strings (12 min)</span>
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
                  <td className="border p-2 font-medium">Agenda</td>
                  <td className="border p-2">Show students what we will learn today.</td>
                </tr>
                <tr>
                  <td className="border p-2">1 min</td>
                  <td className="border p-2 font-medium">Essential Question</td>
                  <td className="border p-2">Introduce essential question and I Can statement.</td>
                </tr>
                <tr>
                  <td className="border p-2">2 min</td>
                  <td className="border p-2 font-medium">Meet the String Family</td>
                  <td className="border p-2">Discussion: What do students already know about string instruments?</td>
                </tr>
                <tr>
                  <td className="border p-2">2 min</td>
                  <td className="border p-2 font-medium">What is a String Instrument?</td>
                  <td className="border p-2">Define what makes an instrument a string instrument: vibrating strings, bowing or plucking, body amplifies sound.</td>
                </tr>
                <tr>
                  <td className="border p-2">2 min</td>
                  <td className="border p-2 font-medium">Orchestral String Family</td>
                  <td className="border p-2">Introduce violin, viola, cello, and double bass.</td>
                </tr>
                <tr>
                  <td className="border p-2">5 min</td>
                  <td className="border p-2 font-medium">See & Hear the Strings</td>
                  <td className="border p-2">Interactive showcase: watch and hear each instrument (Violin, Viola, Cello, Bass).</td>
                </tr>
                <tr>
                  <td className="border p-2">3 min</td>
                  <td className="border p-2 font-medium">Dynamic Markings</td>
                  <td className="border p-2">Teach the six dynamic markings: pp (pianissimo), p (piano), mp (mezzo piano), mf (mezzo forte), f (forte), ff (fortissimo).</td>
                </tr>
                <tr>
                  <td className="border p-2">2 min</td>
                  <td className="border p-2 font-medium">Gradual Changes</td>
                  <td className="border p-2">Teach crescendo (gradually getting louder) and decrescendo (gradually getting softer).</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Dynamics Dash */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-purple-50 p-2 rounded">
              2. Dynamics Dash <span className="font-normal text-gray-600">— Vivaldi's Spring (12 min)</span>
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
                  <td className="border p-2 font-medium">Dynamics Dash Instructions</td>
                  <td className="border p-2">Explain the game: listen to clips from Spring, identify the dynamic level.</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">8 min</td>
                  <td className="border p-2 font-medium">🎮 Dynamics Dash</td>
                  <td className="border p-2">
                    <strong>CLASS GAME:</strong> Identify dynamics in Vivaldi's Spring!<br/>
                    <em className="text-green-700">Listen to 6-second clips, choose the correct dynamic level. Answer quickly for bonus points!</em>
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">2 min</td>
                  <td className="border p-2 font-medium">🏆 Dynamics Dash Results</td>
                  <td className="border p-2">View class leaderboard and celebrate top scorers.</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Create - Listening Map */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-orange-50 p-2 rounded">
              3. Create <span className="font-normal text-gray-600">— Dynamics Listening Map (15 min)</span>
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
                  <td className="border p-2 font-medium">Listening Map Intro</td>
                  <td className="border p-2">Introduce the listening map activity.</td>
                </tr>
                <tr>
                  <td className="border p-2">2 min</td>
                  <td className="border p-2 font-medium">▶️ Listening Map Video</td>
                  <td className="border p-2"><strong>PLAY VIDEO:</strong> Watch the introduction video for the listening map activity.</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">12 min</td>
                  <td className="border p-2 font-medium">🎮 Dynamics Listening Map</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Create a Dynamics Listening Map for Spring.<br/>
                    <em className="text-green-700">Early finishers add instruments, tempo, melody direction.</em>
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">2 min</td>
                  <td className="border p-2 font-medium">Share & Pair</td>
                  <td className="border p-2">Students share their listening maps with a partner. Discuss: What mood did the dynamics create? Where was the biggest dynamic change?</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Reflection */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-yellow-50 p-2 rounded">
              4. Reflect <span className="font-normal text-gray-600">— Exit Ticket (5 min)</span>
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
                  <td className="border p-2 font-medium">Class Reflection</td>
                  <td className="border p-2">
                    Wrap up with three reflection questions:<br/>
                    1. What is one dynamic marking you learned today?<br/>
                    2. How did the dynamics in Spring make you feel?<br/>
                    3. What was your favorite part of creating the listening map?
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bonus */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-amber-50 p-2 rounded">
              5. Bonus <span className="font-normal text-gray-600">— Extra Activities</span>
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
                  <td className="border p-2">12 min</td>
                  <td className="border p-2 font-medium">🎮 Strings & Dynamics Lab</td>
                  <td className="border p-2">
                    <strong>PARTNER ACTIVITY:</strong> Pick an instrument and dynamic, partner guesses!<br/>
                    <em className="text-amber-700">Can you identify the instrument AND the dynamic level?</em>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* DYNAMIC MARKINGS REFERENCE */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-blue-800 mb-4 border-b-2 border-blue-300 pb-2">
            Dynamic Markings Reference
          </h2>
          <div className="grid grid-cols-6 gap-2 text-sm">
            <div className="bg-blue-100 p-3 rounded text-center">
              <div className="font-bold text-blue-800 text-lg">pp</div>
              <div className="text-xs text-blue-700">pianissimo</div>
              <div className="text-xs text-blue-600">Very soft</div>
            </div>
            <div className="bg-blue-100 p-3 rounded text-center">
              <div className="font-bold text-blue-800 text-lg">p</div>
              <div className="text-xs text-blue-700">piano</div>
              <div className="text-xs text-blue-600">Soft</div>
            </div>
            <div className="bg-yellow-100 p-3 rounded text-center">
              <div className="font-bold text-yellow-800 text-lg">mp</div>
              <div className="text-xs text-yellow-700">mezzo piano</div>
              <div className="text-xs text-yellow-600">Medium soft</div>
            </div>
            <div className="bg-yellow-100 p-3 rounded text-center">
              <div className="font-bold text-yellow-800 text-lg">mf</div>
              <div className="text-xs text-yellow-700">mezzo forte</div>
              <div className="text-xs text-yellow-600">Medium loud</div>
            </div>
            <div className="bg-red-100 p-3 rounded text-center">
              <div className="font-bold text-red-800 text-lg">f</div>
              <div className="text-xs text-red-700">forte</div>
              <div className="text-xs text-red-600">Loud</div>
            </div>
            <div className="bg-red-100 p-3 rounded text-center">
              <div className="font-bold text-red-800 text-lg">ff</div>
              <div className="text-xs text-red-700">fortissimo</div>
              <div className="text-xs text-red-600">Very loud</div>
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
            <li className="text-sm">Vivaldi's Spring recording (first movement)</li>
            <li className="text-sm">Session code for teacher-controlled lesson flow</li>
          </ul>
        </section>

        {/* Important Notes */}
        <section className="mb-8 bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
          <h2 className="text-xl font-bold text-blue-800 mb-3">
            📋 Important Notes for Teachers
          </h2>
          <ul className="list-disc ml-6 space-y-2">
            <li className="text-sm">This is the first lesson in The Listening Lab unit</li>
            <li className="text-sm">Work auto-saves - no manual submission required</li>
            <li className="text-sm">Teacher advances stages when ready - don't wait for 100% completion</li>
            <li className="text-sm">Green rows (🎮) indicate student activity time - start the timer!</li>
            <li className="text-sm">The String Family Showcase is teacher-led - advance through instruments at your pace</li>
            <li className="text-sm">Dynamics Dash is a class game - play audio from the projector so all students hear the same clips</li>
          </ul>
        </section>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-4 mt-8 text-center text-sm text-gray-500">
          <p>🎻 Strings & Dynamics - Lesson 1 of The Listening Lab</p>
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
