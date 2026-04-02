// File: /src/lessons/listening-lab/lesson2/LessonPlanPDF.jsx
// Printable lesson plan view for teachers - Woodwinds & Tempo

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
            🎵 Lesson 2: Woodwinds & Tempo
          </h1>
          <p className="text-lg text-gray-700 font-semibold">
            Feel the Speed of Music — Hungarian Dance No. 5 by Johannes Brahms
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
            Students explore the woodwind family and learn Italian tempo markings, then apply their knowledge by creating a Tempo Listening Map while listening to Brahms's Hungarian Dance No. 5.
          </p>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Students Will:</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Identify woodwind instruments by sight and sound</li>
            <li className="text-sm">Define and demonstrate understanding of tempo markings (Largo, Adagio, Andante, Allegro, Presto)</li>
            <li className="text-sm">Identify tempo changes (accelerando, ritardando) in music</li>
            <li className="text-sm">Create a tempo listening map while listening to Brahms's Hungarian Dance No. 5</li>
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
              <li className="text-sm"><strong>MU:Re7.2.5a</strong> - Demonstrate and explain how responses to music are informed by structure and context</li>
              <li className="text-sm"><strong>MU:Re8.1.5a</strong> - Demonstrate and explain how expressive qualities are used in interpretations</li>
              <li className="text-sm"><strong>MU:Pr6.1.5a</strong> - Perform music with expression and technical accuracy</li>
            </ul>
          </div>

          {/* Essential Questions */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Essential Questions:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">How does tempo (speed) change the character and energy of music?</li>
              <li className="text-sm">How do woodwind instruments contribute to the sound of an orchestra?</li>
              <li className="text-sm">Why do composers use Italian terms for tempo markings?</li>
            </ul>
          </div>

          {/* I Can Statement */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              I Can Statement:
            </h3>
            <p className="text-sm ml-6 italic">I can identify woodwind instruments and describe tempo using proper Italian terms.</p>
          </div>

          {/* Enduring Understandings */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Enduring Understandings:
            </h3>
            <p className="text-sm italic mb-2">Students will understand that...</p>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Tempo is a fundamental element that shapes the character and energy of music</li>
              <li className="text-sm">Musicians use standardized Italian terms to communicate tempo</li>
              <li className="text-sm">Composers change tempo within a piece to create contrast and expression</li>
              <li className="text-sm">Woodwind instruments produce sound through air vibration and come in different sizes and ranges</li>
            </ul>
          </div>

          {/* Students will know */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Students will know...
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">The four orchestral woodwinds: Flute, Oboe, Clarinet, Bassoon</li>
              <li className="text-sm">Five Italian tempo markings: Largo, Adagio, Andante, Allegro, Presto</li>
              <li className="text-sm">Two tempo changes: Accelerando (getting faster) and Ritardando (getting slower)</li>
              <li className="text-sm">How BPM (beats per minute) measures the speed of music</li>
            </ul>
          </div>

          {/* Students will be able to */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Students will be able to...
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Identify woodwind instruments by sight and sound</li>
              <li className="text-sm">Match tempo markings to their Italian terms and BPM ranges</li>
              <li className="text-sm">Recognize accelerando and ritardando in a piece of music</li>
              <li className="text-sm">Create a tempo listening map that tracks tempo changes through a piece</li>
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
              Students create a Tempo Listening Map for Hungarian Dance No. 5 by Brahms that demonstrates:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm"><strong>Tempo Identification:</strong> Places at least 8 tempo markings throughout the piece</li>
              <li className="text-sm"><strong>Vocabulary:</strong> Uses correct Italian tempo terms (Largo, Adagio, Andante, Allegro, Presto)</li>
              <li className="text-sm"><strong>Tempo Changes:</strong> Identifies moments of accelerando and ritardando</li>
            </ul>
          </div>

          {/* Other Evidence */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Other Evidence:
            </h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Tempo Detective game participation (formative - tempo identification)</li>
              <li className="text-sm">Class discussion responses (formative - woodwind knowledge)</li>
              <li className="text-sm">Share & Pair partner discussion (peer assessment)</li>
              <li className="text-sm">Class Reflection responses (self-assessment)</li>
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
              1. Introduction <span className="font-normal text-gray-600">— Meet the Woodwinds + Tempo (12 min)</span>
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
                  <td className="border p-2 font-medium">Woodwinds & Tempo</td>
                  <td className="border p-2">Show what we will learn today: woodwind instruments, tempo markings, and a listening map</td>
                </tr>
                <tr>
                  <td className="border p-2">2 min</td>
                  <td className="border p-2 font-medium">Meet the Woodwind Family</td>
                  <td className="border p-2">Discussion: "What woodwind instruments can you name? How do you think they make sound?"</td>
                </tr>
                <tr>
                  <td className="border p-2">2 min</td>
                  <td className="border p-2 font-medium">What is a Woodwind?</td>
                  <td className="border p-2">Define woodwinds: air vibrates inside a tube, some use reeds, covering holes changes pitch. Fun fact: flute is metal!</td>
                </tr>
                <tr>
                  <td className="border p-2">2 min</td>
                  <td className="border p-2 font-medium">Orchestral Woodwinds</td>
                  <td className="border p-2">Introduce Flute (highest, no reed), Oboe (double reed, nasal), Clarinet (single reed, warm), Bassoon (double reed, deep)</td>
                </tr>
                <tr>
                  <td className="border p-2">3 min</td>
                  <td className="border p-2 font-medium">See & Hear the Woodwinds</td>
                  <td className="border p-2">Interactive showcase: play audio clips of each instrument, students listen and compare</td>
                </tr>
                <tr>
                  <td className="border p-2">1 min</td>
                  <td className="border p-2 font-medium">What is Tempo?</td>
                  <td className="border p-2">Define tempo = speed of music, measured in BPM. Composers use Italian words.</td>
                </tr>
                <tr>
                  <td className="border p-2">2 min</td>
                  <td className="border p-2 font-medium">Tempo Markings</td>
                  <td className="border p-2">Teach five markings: Largo (very slow), Adagio (slow), Andante (walking), Allegro (fast), Presto (very fast)</td>
                </tr>
                <tr>
                  <td className="border p-2">1 min</td>
                  <td className="border p-2 font-medium">Accelerando & Ritardando</td>
                  <td className="border p-2">Teach gradual tempo changes: accelerando (getting faster) and ritardando (getting slower)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tempo Detective - Whole Class */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-purple-50 p-2 rounded">
              2. Tempo Detective — Whole Class <span className="font-normal text-gray-600">— Listen & Guess the Tempo (8 min)</span>
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
                  <td className="border p-2 font-medium">Tempo Detective Instructions</td>
                  <td className="border p-2">Explain the game: listen to clips and guess which tempo marking matches</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">7 min</td>
                  <td className="border p-2 font-medium">🎮 Tempo Detective</td>
                  <td className="border p-2">
                    <strong>CLASS GAME:</strong> Listen to clips, guess the tempo. Fastest correct answer gets the most points!<br/>
                    <em className="text-green-700">Each clip is only 8 seconds — listen carefully!</em>
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">1 min</td>
                  <td className="border p-2 font-medium">Tempo Detective Results</td>
                  <td className="border p-2">View class results and celebrate top scorers</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Tempo Listening Map */}
          <div className="mb-6 page-break-before">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-orange-50 p-2 rounded">
              3. Tempo Listening Map <span className="font-normal text-gray-600">— Hungarian Dance No. 5 (21 min)</span>
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
                  <td className="border p-2 font-medium">Listening Map Instructions</td>
                  <td className="border p-2">Explain: listen to the song, place tempo markings on the map. Aim for 8+ markings. Dynamics and instruments are bonus!</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">15 min</td>
                  <td className="border p-2 font-medium">🎮 Tempo Listening Map</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Create a Tempo Listening Map for Hungarian Dance No. 5<br/>
                    Requirements: Place 8+ tempo markings throughout the piece<br/>
                    <em className="text-green-700">Bonus: Circle moments where you hear the clarinet!</em>
                  </td>
                </tr>
                <tr>
                  <td className="border p-2">2 min</td>
                  <td className="border p-2 font-medium">Share & Pair</td>
                  <td className="border p-2">Students share listening maps with a partner. Discuss: What tempo changes did you notice? Where was the biggest change?</td>
                </tr>
                <tr>
                  <td className="border p-2">2 min</td>
                  <td className="border p-2 font-medium">Answer Key</td>
                  <td className="border p-2">Review the correct answers together as a class</td>
                </tr>
                <tr>
                  <td className="border p-2">3 min</td>
                  <td className="border p-2 font-medium">Class Reflection</td>
                  <td className="border p-2">Ask: "Name a tempo you learned today. What woodwind instrument did you notice or like the most?"</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bonus */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-amber-50 p-2 rounded">
              4. Bonus <span className="font-normal text-gray-600">— Extra Activities (12 min)</span>
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
                  <td className="border p-2 font-medium">Lesson Complete!</td>
                  <td className="border p-2">Celebrate what students learned. Introduce bonus activity if time allows.</td>
                </tr>
                <tr>
                  <td className="border p-2">1 min</td>
                  <td className="border p-2 font-medium">Tempo Detective Instructions</td>
                  <td className="border p-2">Explain small group rules: groups of 2-5, take turns being the picker, others guess the tempo</td>
                </tr>
                <tr className="bg-amber-50">
                  <td className="border p-2">10 min</td>
                  <td className="border p-2 font-medium">🎮 Tempo Detective Small Groups</td>
                  <td className="border p-2">
                    <strong>SMALL GROUPS:</strong> Take turns being the picker and guessing the tempo<br/>
                    <em className="text-amber-700">Everyone gets a turn to be the picker!</em>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* TEMPO MARKINGS REFERENCE */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-blue-800 mb-4 border-b-2 border-blue-300 pb-2">
            Tempo Markings Reference
          </h2>
          <div className="grid grid-cols-5 gap-2 text-sm">
            <div className="bg-blue-100 p-3 rounded text-center">
              <div className="font-bold text-blue-800">Largo</div>
              <div className="text-xs text-blue-700">Very slow (40-60 BPM)</div>
            </div>
            <div className="bg-blue-100 p-3 rounded text-center">
              <div className="font-bold text-blue-800">Adagio</div>
              <div className="text-xs text-blue-700">Slow, relaxed (66-76 BPM)</div>
            </div>
            <div className="bg-yellow-100 p-3 rounded text-center">
              <div className="font-bold text-yellow-800">Andante</div>
              <div className="text-xs text-yellow-700">Walking speed (76-108 BPM)</div>
            </div>
            <div className="bg-orange-100 p-3 rounded text-center">
              <div className="font-bold text-orange-800">Allegro</div>
              <div className="text-xs text-orange-700">Fast, lively (120-156 BPM)</div>
            </div>
            <div className="bg-red-100 p-3 rounded text-center">
              <div className="font-bold text-red-800">Presto</div>
              <div className="text-xs text-red-700">Very fast (168-200 BPM)</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm mt-3">
            <div className="bg-green-100 p-3 rounded text-center">
              <div className="font-bold text-green-800">Accelerando</div>
              <div className="text-xs text-green-700">Gradually getting faster</div>
            </div>
            <div className="bg-red-100 p-3 rounded text-center">
              <div className="font-bold text-red-800">Ritardando</div>
              <div className="text-xs text-red-700">Gradually getting slower</div>
            </div>
          </div>
        </section>

        {/* WOODWIND FAMILY REFERENCE */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-blue-800 mb-4 border-b-2 border-blue-300 pb-2">
            Woodwind Family Reference
          </h2>
          <div className="grid grid-cols-4 gap-2 text-sm">
            <div className="bg-blue-100 p-3 rounded text-center">
              <div className="font-bold text-blue-800">Flute</div>
              <div className="text-xs text-blue-700">Highest, no reed, bright and airy</div>
            </div>
            <div className="bg-purple-100 p-3 rounded text-center">
              <div className="font-bold text-purple-800">Oboe</div>
              <div className="text-xs text-purple-700">Double reed, nasal and piercing</div>
            </div>
            <div className="bg-green-100 p-3 rounded text-center">
              <div className="font-bold text-green-800">Clarinet</div>
              <div className="text-xs text-green-700">Single reed, warm and smooth</div>
            </div>
            <div className="bg-red-100 p-3 rounded text-center">
              <div className="font-bold text-red-800">Bassoon</div>
              <div className="text-xs text-red-700">Double reed, deep and rich</div>
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
            <li className="text-sm">Hungarian Dance No. 5 by Johannes Brahms (audio recording)</li>
            <li className="text-sm">Woodwind instrument audio samples (Flute, Oboe, Clarinet, Bassoon)</li>
            <li className="text-sm">Tempo Detective game clips at various tempos</li>
            <li className="text-sm">Session code for teacher-controlled lesson flow</li>
          </ul>
        </section>

        {/* Important Notes */}
        <section className="mb-8 bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
          <h2 className="text-xl font-bold text-blue-800 mb-3">
            📋 Important Notes for Teachers
          </h2>
          <ul className="list-disc ml-6 space-y-2">
            <li className="text-sm">This is Lesson 2 - students should already know strings and dynamics from Lesson 1</li>
            <li className="text-sm">The Tempo Listening Map auto-saves - no manual submission required</li>
            <li className="text-sm">Teacher advances stages when ready - don't wait for 100% completion</li>
            <li className="text-sm">Green rows (🎮) indicate student activity time - start the timer!</li>
            <li className="text-sm">Encourage students to use Italian terms (not just "fast" and "slow")</li>
            <li className="text-sm">The bonus Tempo Detective small group activity is great if you have extra time</li>
          </ul>
        </section>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-4 mt-8 text-center text-sm text-gray-500">
          <p>🎵 Woodwinds & Tempo - Lesson 2 of The Listening Lab</p>
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
