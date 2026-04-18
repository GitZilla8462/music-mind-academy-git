// File: /src/lessons/music-journalist/lesson5/LessonPlanPDF.jsx
// Printable lesson plan view for teachers - Launch Day

import React from 'react';

const LessonPlanPDF = () => {
  return (
    <div className="min-h-screen bg-white p-8 max-w-5xl mx-auto print:p-4">
      <div className="mb-6 print:hidden flex gap-3">
        <button onClick={() => window.print()} className="bg-[#1a2744] hover:bg-[#1a2744]/90 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-colors">
          🖨️ Print Lesson Plan
        </button>
        <button onClick={() => window.close()} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-colors">
          Close Window
        </button>
      </div>

      <div className="prose prose-sm max-w-none">
        <div className="border-b-4 border-[#1a2744] pb-4 mb-6">
          <h1 className="text-3xl font-bold text-[#1a2744] mb-2">🚀 Lesson 5: Launch Day</h1>
          <p className="text-lg text-gray-700 font-semibold">Can you convince someone to care about something you believe in?</p>
          <div className="flex gap-6 mt-3 text-sm">
            <div><strong>Grade Level:</strong> 6-8</div>
            <div><strong>Duration:</strong> ~45 minutes</div>
            <div><strong>Unit:</strong> Music Agent (Unit 3)</div>
          </div>
        </div>

        <section className="mb-8 bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h2 className="text-xl font-bold text-[#1a2744] mb-3">Lesson Overview</h2>
          <p className="text-sm mb-4">
            Launch Day! Students present their 2-3 minute pitches with press kits on screen and music playing. After all pitches, the class reflects on what they discovered about music throughout the unit and celebrates their work as music agents.
          </p>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Students Will:</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Deliver a persuasive 2-3 minute presentation with evidence</li>
            <li className="text-sm">Listen critically to peers and provide constructive feedback</li>
            <li className="text-sm">Reflect on music discovery, research, and communication skills</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-[#1a2744] mb-4 border-b-2 border-[#f0b429] pb-2">STAGE 1: DESIRED RESULTS</h2>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Standards:</h3>
            <ul className="list-none space-y-1 ml-0">
              <li className="text-sm"><strong>MU:Re9.1.7</strong> — Apply criteria to evaluate music, give constructive feedback</li>
              <li className="text-sm"><strong>CCSS.ELA-LITERACY.SL.7.4</strong> — Present claims and findings with relevant evidence</li>
              <li className="text-sm"><strong>ISTE 6d</strong> — Publish or present for intended audiences</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Essential Question:</h3>
            <p className="text-sm ml-6 italic">Can you convince someone to care about something you believe in?</p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">I Can Statement:</h3>
            <p className="text-sm ml-6">I can deliver a persuasive pitch that makes my audience care about my artist.</p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Vocabulary:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>Pitch</strong> — Short, persuasive presentation to convince someone</div>
              <div><strong>Call to Action</strong> — Final statement telling audience what to do</div>
              <div><strong>Peer Feedback</strong> — One strength and one suggestion from classmates</div>
              <div><strong>Go Viral</strong> — When content spreads rapidly to many people</div>
            </div>
          </div>
        </section>

        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-[#1a2744] mb-4 border-b-2 border-[#f0b429] pb-2">STAGE 2: ASSESSMENT EVIDENCE</h2>
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Performance Task:</h3>
            <p className="text-sm mb-2">Students deliver a 2-3 minute pitch demonstrating:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm"><strong>Storytelling:</strong> Tells the artist's story, doesn't just read slides</li>
              <li className="text-sm"><strong>Evidence:</strong> References specific facts and musical elements</li>
              <li className="text-sm"><strong>Music Integration:</strong> Plays or references a specific song</li>
              <li className="text-sm"><strong>Call to Action:</strong> Ends with a clear ask</li>
            </ul>
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Other Evidence:</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Peer feedback during pitches (formative)</li>
              <li className="text-sm">Reflection discussion responses (self-assessment)</li>
            </ul>
          </div>
        </section>

        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-[#1a2744] mb-4 border-b-2 border-[#f0b429] pb-2">STAGE 3: LEARNING PLAN (~45 minutes)</h2>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-blue-50 p-2 rounded">
              1. Welcome <span className="font-normal text-gray-600">— Set the Stage (5 min)</span>
            </h3>
            <table className="w-full text-sm border-collapse">
              <thead><tr className="bg-gray-100"><th className="border p-2 text-left w-16">Time</th><th className="border p-2 text-left w-48">Activity</th><th className="border p-2 text-left">What to Say/Do</th></tr></thead>
              <tbody>
                <tr><td className="border p-2">3 min</td><td className="border p-2 font-medium">Welcome</td><td className="border p-2">"Today you're not students — you're agents. Each of you has ONE artist you believe in. You have 2-3 minutes to convince the room. At the end, the class votes — whose artist goes VIRAL?"</td></tr>
                <tr><td className="border p-2">2 min</td><td className="border p-2 font-medium">Expectations</td><td className="border p-2"><strong>For Presenters:</strong> 2-3 min, tell the story, make eye contact, play a song, end with a call to action.<br/><strong>For Audience:</strong> Chromebooks CLOSED during pitches, snap/clap after each, OPEN briefly for feedback.</td></tr>
              </tbody>
            </table>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-purple-50 p-2 rounded">
              2. Agent Pitches <span className="font-normal text-gray-600">— Presentations (25 min)</span>
            </h3>
            <table className="w-full text-sm border-collapse">
              <thead><tr className="bg-gray-100"><th className="border p-2 text-left w-16">Time</th><th className="border p-2 text-left w-48">Activity</th><th className="border p-2 text-left">What to Say/Do</th></tr></thead>
              <tbody>
                <tr className="bg-green-50"><td className="border p-2">25 min</td><td className="border p-2 font-medium">🎤 Agent Pitches</td><td className="border p-2"><strong>PRESENTATIONS:</strong> Teacher displays each student's press kit on the projector. Students present 2-3 minutes each.<br/><em className="text-green-700">Manage time — call "30 seconds" and "time" as needed. Keep energy up between presenters.</em></td></tr>
              </tbody>
            </table>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-orange-50 p-2 rounded">
              3. Celebration <span className="font-normal text-gray-600">— Reflect + Celebrate (7 min)</span>
            </h3>
            <table className="w-full text-sm border-collapse">
              <thead><tr className="bg-gray-100"><th className="border p-2 text-left w-16">Time</th><th className="border p-2 text-left w-48">Activity</th><th className="border p-2 text-left">What to Say/Do</th></tr></thead>
              <tbody>
                <tr><td className="border p-2">4 min</td><td className="border p-2 font-medium">Reflection</td><td className="border p-2"><strong>DISCUSSION:</strong> "What did you learn about MUSIC you didn't know before? Did anyone discover a genre they didn't expect to like? What was hardest: research, writing, or presenting?"</td></tr>
                <tr><td className="border p-2">3 min</td><td className="border p-2 font-medium">Celebration</td><td className="border p-2">"You just did what REAL music agents do every day. You found talent, built the case, designed the campaign, and pitched it. These skills go way beyond music class."</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-[#1a2744] mb-4 border-b-2 border-[#f0b429] pb-2">Resources & Materials</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Projector for displaying student press kits</li>
            <li className="text-sm">Classroom speakers for playing artist music during pitches</li>
            <li className="text-sm">Session code for teacher-controlled lesson flow</li>
            <li className="text-sm">Chromebooks for peer feedback (closed during pitches, open briefly after each)</li>
          </ul>
        </section>

        <section className="mb-8 bg-amber-50 p-4 rounded-lg border-2 border-amber-300">
          <h2 className="text-xl font-bold text-[#1a2744] mb-3">📋 Important Notes for Teachers</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li className="text-sm">This is the capstone lesson — celebrate student work!</li>
            <li className="text-sm">Manage presentation time carefully — 2-3 min each, call "30 seconds" as a warning</li>
            <li className="text-sm">Chromebooks should be CLOSED during pitches to maintain audience engagement</li>
            <li className="text-sm">Teacher controls which student's presentation is displayed via the lesson interface</li>
            <li className="text-sm">If you have a large class, consider spreading pitches over two days</li>
            <li className="text-sm">The reflection discussion is important — give students time to process what they learned</li>
          </ul>
        </section>

        <div className="border-t-2 border-gray-300 pt-4 mt-8 text-center text-sm text-gray-500">
          <p>🚀 Launch Day — Lesson 5 of Music Agent (Unit 3)</p>
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
