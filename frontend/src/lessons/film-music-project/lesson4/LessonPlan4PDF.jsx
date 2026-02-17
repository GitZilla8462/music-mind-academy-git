// File: /src/lessons/film-music-project/lesson4/LessonPlan4PDF.jsx
// Printable lesson plan view for teachers - Sports Highlight Reel
// Updated to match actual lesson structure

import React from 'react';

const LessonPlan4PDF = () => {
  return (
    <div className="min-h-screen bg-white p-8 max-w-5xl mx-auto print:p-4">
      {/* Print Button - Hidden when printing */}
      <div className="mb-6 print:hidden flex gap-3">
        <button
          onClick={() => window.print()}
          className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-colors"
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
        <div className="border-b-4 border-orange-600 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-orange-900 mb-2">
            Lesson 4: Sports Highlight Reel
          </h1>
          <p className="text-lg text-gray-700 font-semibold">
            Rhythm & Beat — How do rhythmic phrases convey energy?
          </p>
          <div className="flex gap-6 mt-3 text-sm">
            <div><strong>Grade Level:</strong> 6-8</div>
            <div><strong>Duration:</strong> 38 minutes</div>
          </div>
        </div>

        {/* LESSON OVERVIEW */}
        <section className="mb-8 bg-orange-50 p-4 rounded-lg border border-orange-200">
          <h2 className="text-xl font-bold text-orange-800 mb-3">
            Lesson Overview
          </h2>
          <p className="text-sm mb-4">
            Students discover how rhythm creates energy by comparing video with and without music, learn the core drum sounds (kick, snare, hi-hat), create their own beat, then combine it with loops to score a sports highlight video.
          </p>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Learning Objectives:</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Explain the role of kick, snare, and hi-hat in creating a beat</li>
            <li className="text-sm">Create an original 4-bar rhythmic pattern using a drum grid</li>
            <li className="text-sm">Combine original beats with loops to score a sports video</li>
            <li className="text-sm">Describe how rhythm creates energy and matches visual action</li>
          </ul>
        </section>

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
              <li className="text-sm"><strong>MU:Pr4.2.5a</strong> - Demonstrate understanding of the structure and elements of music</li>
            </ul>
          </div>

          {/* Enduring Understandings */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Enduring Understandings:
            </h3>
            <p className="text-sm italic mb-2">Students will understand that...</p>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Rhythm is the foundation that drives energy in music</li>
              <li className="text-sm">Different drum sounds (kick, snare, hi-hat) serve specific roles in a beat</li>
              <li className="text-sm">Music transforms how we experience visual media</li>
              <li className="text-sm">Layering rhythmic elements creates more complex and engaging beats</li>
            </ul>
          </div>

          {/* Essential Questions */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Essential Questions:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">How does rhythm create energy in music?</li>
              <li className="text-sm">What role does each drum sound play in a beat?</li>
              <li className="text-sm">How can we match musical energy to visual action?</li>
            </ul>
          </div>

          {/* Key Vocabulary */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Key Vocabulary:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm"><strong>Beat:</strong> The steady pulse that drives the music forward</li>
              <li className="text-sm"><strong>Measure:</strong> A group of beats (typically 4 beats = 1 measure)</li>
              <li className="text-sm"><strong>Kick Drum:</strong> Low, deep foundation sound (beats 1 and 3)</li>
              <li className="text-sm"><strong>Snare Drum:</strong> Sharp, cracking sound that creates the backbeat (beats 2 and 4)</li>
              <li className="text-sm"><strong>Hi-Hat:</strong> Metallic, ticking sound that creates momentum</li>
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
              Students compose an original sports highlight soundtrack that demonstrates:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm"><strong>Original Beat:</strong> Creates a 4-bar beat using kick, snare, and hi-hat</li>
              <li className="text-sm"><strong>Layering:</strong> Combines their beat with 3+ loops</li>
              <li className="text-sm"><strong>Energy Match:</strong> Music matches the energy of the sports video</li>
            </ul>
          </div>

          {/* Other Evidence */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Other Evidence:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Beat Maker activity completion (formative)</li>
              <li className="text-sm">Beat Spotlight reflection (self-assessment)</li>
              <li className="text-sm">Quick Share discussion participation</li>
            </ul>
          </div>
        </section>

        {/* STAGE 3: LEARNING PLAN */}
        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-orange-800 mb-4 border-b-2 border-orange-300 pb-2">
            STAGE 3: LEARNING PLAN (38 minutes)
          </h2>

          {/* Section 1: Hook */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-blue-50 p-2 rounded">
              1. Hook <span className="font-normal text-gray-600">— Video Comparison (6 min)</span>
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
                  <td className="border p-2">"Today we're creating music for a sports highlight reel!"</td>
                </tr>
                <tr>
                  <td className="border p-2">3 min</td>
                  <td className="border p-2 font-medium">No Music vs With Music</td>
                  <td className="border p-2">
                    <strong>PLAY VIDEOS:</strong> Show the same sports clip without music, then with music.<br/>
                    Let students experience the dramatic difference.
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">2 min</td>
                  <td className="border p-2 font-medium">Discussion</td>
                  <td className="border p-2">Ask: "What did you notice? How did the music change how you felt?"</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2: Learn */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-green-50 p-2 rounded">
              2. Learn <span className="font-normal text-gray-600">— Beat Basics (5 min)</span>
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
                  <td className="border p-2 font-medium">What is a Beat?</td>
                  <td className="border p-2">
                    Explain: Beat, measure, and the three core drum sounds:<br/>
                    • <strong>Kick:</strong> Low foundation (beats 1 & 3)<br/>
                    • <strong>Snare:</strong> Sharp backbeat (beats 2 & 4)<br/>
                    • <strong>Hi-Hat:</strong> Momentum keeper
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">2 min</td>
                  <td className="border p-2 font-medium">Building a Beat Demo</td>
                  <td className="border p-2">
                    <strong>TEACHER DEMO:</strong> Use the beat builder to show layering:<br/>
                    Step 1: Add kick on beats 1 & 3<br/>
                    Step 2: Add snare on beats 2 & 4<br/>
                    Step 3: Add hi-hat pattern<br/>
                    Step 4: Listen to the complete beat
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Create Beat */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-purple-50 p-2 rounded">
              3. Create Beat <span className="font-normal text-gray-600">— Beat Maker Activity (8 min)</span>
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
                  <td className="border p-2 font-medium">Build Your Beat</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Create a beat using the drum grid.<br/>
                    • Start with kick and snare<br/>
                    • Add hi-hat pattern<br/>
                    • Try different patterns and kits!<br/>
                    • Save your beat when ready
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 4: Compose */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-orange-50 p-2 rounded">
              4. Compose <span className="font-normal text-gray-600">— Score the Video (13 min)</span>
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
                    Explain: "Use your beat + at least 3 loops. Match the energy of the video!"
                  </td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">12 min</td>
                  <td className="border p-2 font-medium">Score the Sports Highlight</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Combine their beat with loops to score the video.<br/>
                    • Pick a sport video (basketball, soccer, skateboarding)<br/>
                    • Add their custom beat<br/>
                    • Layer in loops that match the energy<br/>
                    • Build intensity as the action builds!
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 5: Reflect */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-teal-50 p-2 rounded">
              5. Reflect <span className="font-normal text-gray-600">— Beat Spotlight (3 min)</span>
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
                  <td className="border p-2">3 min</td>
                  <td className="border p-2 font-medium">Beat Spotlight</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Reflect on their rhythmic choices.<br/>
                    • What beat pattern did you create?<br/>
                    • How does your music match the energy?
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 6: Wrap Up */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-blue-50 p-2 rounded">
              6. Wrap Up <span className="font-normal text-gray-600">— Share & Conclude (3 min)</span>
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
                  <td className="border p-2 font-medium">Quick Share</td>
                  <td className="border p-2">2-3 students play 15 seconds of their composition for the class.</td>
                </tr>
                <tr>
                  <td className="border p-2">1 min</td>
                  <td className="border p-2 font-medium">Key Insight</td>
                  <td className="border p-2">"Rhythm is the heartbeat of your music. It's what makes people feel the energy!"</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Important Notes */}
        <section className="mb-8 bg-orange-50 p-4 rounded-lg border-2 border-orange-300">
          <h2 className="text-xl font-bold text-orange-800 mb-3">
            Important Notes for Teachers
          </h2>
          <ul className="list-disc ml-6 space-y-2">
            <li className="text-sm">Students should have completed Lessons 1-3 first (mood, texture, form)</li>
            <li className="text-sm">The video comparison hook is powerful - let students feel the difference!</li>
            <li className="text-sm">During the teacher demo, build the beat step by step so students can follow</li>
            <li className="text-sm">Green rows indicate student activity time - start the timer!</li>
            <li className="text-sm">Encourage students to match the energy of their chosen sport</li>
          </ul>
        </section>

        {/* Resources & Materials */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-orange-800 mb-4 border-b-2 border-orange-300 pb-2">
            Resources & Materials
          </h2>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Chromebooks/computers with internet access and headphones</li>
            <li className="text-sm">Sports highlight videos (basketball, soccer, skateboarding)</li>
            <li className="text-sm">Beat Maker tool with drum grid</li>
            <li className="text-sm">Loop library with various instrument categories</li>
            <li className="text-sm">Session code for teacher-controlled lesson flow</li>
          </ul>
        </section>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-4 mt-8 text-center text-sm text-gray-500">
          <p>Sports Highlight Reel - Lesson 4 of The Loop Lab</p>
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

export default LessonPlan4PDF;
