// File: /src/lessons/music-journalist/lesson2/LessonPlanPDF.jsx
// Printable lesson plan view for teachers - Listen Like an Agent

import React from 'react';

const LessonPlanPDF = () => {
  return (
    <div className="min-h-screen bg-white p-8 max-w-5xl mx-auto print:p-4">
      {/* Print Button - Hidden when printing */}
      <div className="mb-6 print:hidden flex gap-3">
        <button
          onClick={() => window.print()}
          className="bg-[#1a2744] hover:bg-[#1a2744]/90 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-colors"
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

      <div className="prose prose-sm max-w-none">
        {/* Header */}
        <div className="border-b-4 border-[#1a2744] pb-4 mb-6">
          <h1 className="text-3xl font-bold text-[#1a2744] mb-2">
            🎧 Lesson 2: Listen Like an Agent
          </h1>
          <p className="text-lg text-gray-700 font-semibold">
            How do you describe music so other people can hear it through your words?
          </p>
          <div className="flex gap-6 mt-3 text-sm">
            <div><strong>Grade Level:</strong> 6-8</div>
            <div><strong>Duration:</strong> ~50 minutes</div>
            <div><strong>Unit:</strong> Music Agent (Unit 3)</div>
          </div>
        </div>

        {/* LESSON OVERVIEW */}
        <section className="mb-8 bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h2 className="text-xl font-bold text-[#1a2744] mb-3">Lesson Overview</h2>
          <p className="text-sm mb-4">
            Students learn to listen critically by analyzing 3 guided tracks as a class (Ketsa, Jason Shaw, Soft and Furious), then pick their own track for independent listening. They share observations with a partner and play Sign or Pass — ranking 3 mystery artists.
          </p>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Students Will:</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Listen critically and identify musical elements (tempo, mood, instrumentation)</li>
            <li className="text-sm">Analyze music independently using the Description Toolkit</li>
            <li className="text-sm">Share and defend observations with evidence from the music</li>
          </ul>
        </section>

        {/* STAGE 1: DESIRED RESULTS */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-[#1a2744] mb-4 border-b-2 border-[#f0b429] pb-2">
            STAGE 1: DESIRED RESULTS
          </h2>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Standards:</h3>
            <ul className="list-none space-y-1 ml-0">
              <li className="text-sm"><strong>MU:Re7.1.7</strong> — Select and describe musical elements</li>
              <li className="text-sm"><strong>MU:Re8.1.7</strong> — Interpret expressive intent, citing evidence from the music</li>
              <li className="text-sm"><strong>MU:Cn11.0.7</strong> — Relationships between music, history, and culture</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Essential Question:</h3>
            <p className="text-sm ml-6 italic">How do you describe music so other people can hear it through your words?</p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">I Can Statement:</h3>
            <p className="text-sm ml-6">I can analyze music using specific vocabulary and defend my observations with evidence.</p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Vocabulary:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>Tempo</strong> — Speed of the music (slow, moderate, fast)</div>
              <div><strong>Mood</strong> — Emotional feeling the music creates</div>
              <div><strong>Instrumentation</strong> — Specific instruments and sounds used</div>
              <div><strong>Hook</strong> — Catchy part that grabs your attention</div>
              <div><strong>Production</strong> — How a song is recorded, mixed, arranged</div>
              <div><strong>Influence</strong> — Other artists/genres that shaped the sound</div>
            </div>
          </div>
        </section>

        {/* STAGE 2: ASSESSMENT EVIDENCE */}
        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-[#1a2744] mb-4 border-b-2 border-[#f0b429] pb-2">
            STAGE 2: ASSESSMENT EVIDENCE
          </h2>
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Performance Task:</h3>
            <p className="text-sm mb-2">Students complete Listening Guides for guided and independent tracks demonstrating:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm"><strong>Element Identification:</strong> Accurately identifies tempo, mood, instrumentation</li>
              <li className="text-sm"><strong>Evidence-Based Description:</strong> Uses specific musical vocabulary to support observations</li>
              <li className="text-sm"><strong>Independent Analysis:</strong> Self-selects and analyzes a track without teacher guidance</li>
            </ul>
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Other Evidence:</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Guided Listening class discussion (formative)</li>
              <li className="text-sm">Share Out partner sharing (peer assessment)</li>
              <li className="text-sm">Sign or Pass ranking and justification (formative)</li>
            </ul>
          </div>
        </section>

        {/* STAGE 3: LEARNING PLAN */}
        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-[#1a2744] mb-4 border-b-2 border-[#f0b429] pb-2">
            STAGE 3: LEARNING PLAN (~50 minutes)
          </h2>

          {/* Section 1 */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-blue-50 p-2 rounded">
              1. Introduction <span className="font-normal text-gray-600">— Why Listen Like an Agent? (3 min)</span>
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
                  <td className="border p-2 font-medium">Hook</td>
                  <td className="border p-2">"Last class you explored genres — but liking a song isn't enough. To pitch an artist, you need to DESCRIBE their sound so precisely that someone who's never heard them can imagine it."</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 2 */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-purple-50 p-2 rounded">
              2. Critical Listening <span className="font-normal text-gray-600">— Guided + Independent (30 min)</span>
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
                  <td className="border p-2 font-medium">Guided Listening Intro</td>
                  <td className="border p-2">Explain: "We'll listen to 3 clips. After each, fill out a Listening Guide as a class." Introduce what to listen for: tempo, dynamics, mood, instrumentation.</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">5 min</td>
                  <td className="border p-2 font-medium">🎮 Guided Listening 1</td>
                  <td className="border p-2"><strong>CLASS ACTIVITY:</strong> Ketsa — "Trench Work" (Jazz / Soul / Trip-Hop). Play clip, fill out Listening Guide together, discuss.</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">5 min</td>
                  <td className="border p-2 font-medium">🎮 Guided Listening 2</td>
                  <td className="border p-2"><strong>CLASS ACTIVITY:</strong> Jason Shaw — "Acoustic Blues" (Country / Acoustic). Play clip, fill out Listening Guide together, discuss.</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">5 min</td>
                  <td className="border p-2 font-medium">🎮 Guided Listening 3</td>
                  <td className="border p-2"><strong>CLASS ACTIVITY:</strong> Soft and Furious — "Horizon Ending" (Synth Pop / Electronic). Play clip, fill out Listening Guide together, discuss.</td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">10 min</td>
                  <td className="border p-2 font-medium">🎮 Independent Listening</td>
                  <td className="border p-2">
                    <strong>STUDENTS WORK:</strong> Pick 1 of 5 tracks and analyze on your own.<br/>
                    <em className="text-green-700">Tracks: Kellee Maize, HoliznaCC0, Fog Lake, David Mumford, Pamela Yuen</em>
                  </td>
                </tr>
                <tr className="bg-green-50">
                  <td className="border p-2">5 min</td>
                  <td className="border p-2 font-medium">🗣️ Share Out</td>
                  <td className="border p-2"><strong>PARTNER ACTIVITY:</strong> Share which track you picked and why. Read your Listening Guide answers. Did your partner hear something you missed?</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3 */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-orange-50 p-2 rounded">
              3. Sign or Pass <span className="font-normal text-gray-600">— Rank + Debate (7 min)</span>
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
                  <td className="border p-2">7 min</td>
                  <td className="border p-2 font-medium">🎮 Sign or Pass</td>
                  <td className="border p-2">
                    <strong>CLASS GAME:</strong> Listen to 3 mystery artists. Rank 1–3. Match your group to score!<br/>
                    <em className="text-green-700">Students debate who they'd sign and why — using vocabulary from today.</em>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Resources & Materials */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-[#1a2744] mb-4 border-b-2 border-[#f0b429] pb-2">
            Resources & Materials
          </h2>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Chromebooks/computers with internet access and headphones</li>
            <li className="text-sm">Session code for teacher-controlled lesson flow</li>
            <li className="text-sm">Classroom speakers for guided listening (play audio for the whole class)</li>
          </ul>
        </section>

        {/* Important Notes */}
        <section className="mb-8 bg-amber-50 p-4 rounded-lg border-2 border-amber-300">
          <h2 className="text-xl font-bold text-[#1a2744] mb-3">📋 Important Notes for Teachers</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li className="text-sm">Guided Listening is teacher-led — play each clip from the projector so all students hear the same audio</li>
            <li className="text-sm">After each guided clip, give students time to fill out their Listening Guide before discussing</li>
            <li className="text-sm">Independent Listening requires headphones — students choose their own track</li>
            <li className="text-sm">Sign or Pass works best when students justify their rankings with vocabulary from today</li>
            <li className="text-sm">Work auto-saves — no manual submission required</li>
            <li className="text-sm">Green rows (🎮/🗣️) indicate student activity time — start the timer!</li>
          </ul>
        </section>

        {/* Footer */}
        <div className="border-t-2 border-gray-300 pt-4 mt-8 text-center text-sm text-gray-500">
          <p>🎧 Listen Like an Agent — Lesson 2 of Music Agent (Unit 3)</p>
          <p>Music Mind Academy © 2026</p>
        </div>
      </div>

      <style>{`
        @media print {
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .page-break-before { page-break-before: always; }
          @page { margin: 0.5in; }
        }
      `}</style>
    </div>
  );
};

export default LessonPlanPDF;
