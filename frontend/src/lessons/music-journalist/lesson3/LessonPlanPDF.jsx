// File: /src/lessons/music-journalist/lesson3/LessonPlanPDF.jsx
// Printable lesson plan view for teachers - Claim Your Artist

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
          <h1 className="text-3xl font-bold text-[#1a2744] mb-2">🎯 Lesson 3: Claim Your Artist</h1>
          <p className="text-lg text-gray-700 font-semibold">What makes an artist worth believing in?</p>
          <div className="flex gap-6 mt-3 text-sm">
            <div><strong>Grade Level:</strong> 6-8</div>
            <div><strong>Duration:</strong> ~42 minutes</div>
            <div><strong>Unit:</strong> Music Agent (Unit 3)</div>
          </div>
        </div>

        <section className="mb-8 bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h2 className="text-xl font-bold text-[#1a2744] mb-3">Lesson Overview</h2>
          <p className="text-sm mb-4">
            Students learn the 4-point checklist for evaluating artists (Unique Sound, Compelling Story, Signs of Growth, Gut Feeling), practice distinguishing fact from opinion, build a Scouting Report with evidence, share with a partner, and play Would You Sign Them?
          </p>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Students Will:</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Evaluate artists using the 4-point checklist</li>
            <li className="text-sm">Distinguish between strong evidence and weak evidence</li>
            <li className="text-sm">Classify statements as fact or opinion</li>
            <li className="text-sm">Build a structured Scouting Report with evidence</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-[#1a2744] mb-4 border-b-2 border-[#f0b429] pb-2">STAGE 1: DESIRED RESULTS</h2>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Standards:</h3>
            <ul className="list-none space-y-1 ml-0">
              <li className="text-sm"><strong>MU:Cn10.0.7</strong> — Personal interests influence musical selection</li>
              <li className="text-sm"><strong>CCSS.ELA-LITERACY.RI.7.1</strong> — Cite textual evidence</li>
              <li className="text-sm"><strong>CCSS.ELA-LITERACY.W.7.7</strong> — Short research using multiple sources</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Essential Question:</h3>
            <p className="text-sm ml-6 italic">What makes an artist worth believing in?</p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">I Can Statement:</h3>
            <p className="text-sm ml-6">I can evaluate an artist using evidence and build a case for why they should be signed.</p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Vocabulary:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>Evidence</strong> — Specific facts, quotes, or data that support your argument</div>
              <div><strong>Strong Evidence</strong> — Specific, measurable, verifiable (dates, numbers, sources)</div>
              <div><strong>Weak Evidence</strong> — Vague statements without details</div>
              <div><strong>Fact</strong> — Can be proven true or false with evidence</div>
              <div><strong>Opinion</strong> — Reflects personal view, belief, or judgment</div>
              <div><strong>4-Point Checklist</strong> — Unique Sound, Story, Growth, Gut Feeling</div>
            </div>
          </div>
        </section>

        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-[#1a2744] mb-4 border-b-2 border-[#f0b429] pb-2">STAGE 2: ASSESSMENT EVIDENCE</h2>
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Performance Task:</h3>
            <p className="text-sm mb-2">Students complete a 3-slide Scouting Report demonstrating:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm"><strong>Checklist Evaluation:</strong> Addresses all 4 points with specific evidence</li>
              <li className="text-sm"><strong>Fact vs Opinion:</strong> Distinguishes factual claims from personal opinions</li>
              <li className="text-sm"><strong>Evidence Quality:</strong> Uses strong, specific evidence rather than vague statements</li>
            </ul>
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Other Evidence:</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Fact or Opinion writing activity (formative)</li>
              <li className="text-sm">Share Out partner discussion (peer assessment)</li>
              <li className="text-sm">Would You Sign Them? game (formative — evidence matching)</li>
            </ul>
          </div>
        </section>

        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-[#1a2744] mb-4 border-b-2 border-[#f0b429] pb-2">STAGE 3: LEARNING PLAN (~42 minutes)</h2>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-blue-50 p-2 rounded">
              1. Introduction <span className="font-normal text-gray-600">— Hook + 4-Point Checklist (6 min)</span>
            </h3>
            <table className="w-full text-sm border-collapse">
              <thead><tr className="bg-gray-100"><th className="border p-2 text-left w-16">Time</th><th className="border p-2 text-left w-48">Activity</th><th className="border p-2 text-left">What to Say/Do</th></tr></thead>
              <tbody>
                <tr><td className="border p-2">1 min</td><td className="border p-2 font-medium">Hook</td><td className="border p-2">"Imagine scrolling through music and you hear something that STOPS you. That's the moment every talent agent lives for."</td></tr>
                <tr><td className="border p-2">1 min</td><td className="border p-2 font-medium">4 Points Overview</td><td className="border p-2">Introduce the 4-Point Checklist: Unique Sound, Compelling Story, Signs of Growth, Gut Feeling.</td></tr>
                <tr><td className="border p-2">1 min</td><td className="border p-2 font-medium">Unique Sound</td><td className="border p-2">Point 1: "Their music doesn't sound like anyone else. You could pick their song out of a playlist."</td></tr>
                <tr><td className="border p-2">1 min</td><td className="border p-2 font-medium">Compelling Story</td><td className="border p-2">Point 2: "There's a real reason they started making music — the story makes the music mean more."</td></tr>
                <tr><td className="border p-2">1 min</td><td className="border p-2 font-medium">Signs of Growth</td><td className="border p-2">Point 3: "Their streams, followers, or shows have increased. Other people are starting to notice."</td></tr>
                <tr><td className="border p-2">1 min</td><td className="border p-2 font-medium">Gut Feeling</td><td className="border p-2">Point 4: "You keep replaying their music. You'd be disappointed if someone else signed them first."</td></tr>
              </tbody>
            </table>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-purple-50 p-2 rounded">
              2. Fact or Opinion <span className="font-normal text-gray-600">— Writing Activity (5 min)</span>
            </h3>
            <table className="w-full text-sm border-collapse">
              <thead><tr className="bg-gray-100"><th className="border p-2 text-left w-16">Time</th><th className="border p-2 text-left w-48">Activity</th><th className="border p-2 text-left">What to Say/Do</th></tr></thead>
              <tbody>
                <tr className="bg-green-50"><td className="border p-2">5 min</td><td className="border p-2 font-medium">🎮 Fact or Opinion</td><td className="border p-2"><strong>STUDENTS WRITE:</strong> Write one fact and one opinion about your artist.<br/><em className="text-green-700">Agents need evidence, not just vibes — practice telling the difference.</em></td></tr>
              </tbody>
            </table>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-orange-50 p-2 rounded">
              3. Scouting Report <span className="font-normal text-gray-600">— Build Your Report (20 min)</span>
            </h3>
            <table className="w-full text-sm border-collapse">
              <thead><tr className="bg-gray-100"><th className="border p-2 text-left w-16">Time</th><th className="border p-2 text-left w-48">Activity</th><th className="border p-2 text-left">What to Say/Do</th></tr></thead>
              <tbody>
                <tr className="bg-green-50"><td className="border p-2">20 min</td><td className="border p-2 font-medium">🎮 Scouting Report</td><td className="border p-2"><strong>STUDENTS BUILD:</strong> Complete 3 slides for your assigned artist with real evidence.<br/><em className="text-green-700">Use the 4-point checklist as your guide. Include specific facts, not vague opinions.</em></td></tr>
              </tbody>
            </table>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-yellow-50 p-2 rounded">
              4. Share Out <span className="font-normal text-gray-600">— Partner Discussion (4 min)</span>
            </h3>
            <table className="w-full text-sm border-collapse">
              <thead><tr className="bg-gray-100"><th className="border p-2 text-left w-16">Time</th><th className="border p-2 text-left w-48">Activity</th><th className="border p-2 text-left">What to Say/Do</th></tr></thead>
              <tbody>
                <tr className="bg-green-50"><td className="border p-2">4 min</td><td className="border p-2 font-medium">🗣️ Share Out</td><td className="border p-2"><strong>PARTNER ACTIVITY:</strong> Which of the four points felt strongest for your artist? What was your best piece of strong evidence? Would you sign them?</td></tr>
              </tbody>
            </table>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-amber-50 p-2 rounded">
              5. Bonus <span className="font-normal text-gray-600">— Would You Sign Them? (7 min)</span>
            </h3>
            <table className="w-full text-sm border-collapse">
              <thead><tr className="bg-gray-100"><th className="border p-2 text-left w-16">Time</th><th className="border p-2 text-left w-48">Activity</th><th className="border p-2 text-left">What to Say/Do</th></tr></thead>
              <tbody>
                <tr className="bg-amber-50"><td className="border p-2">7 min</td><td className="border p-2 font-medium">🎮 Would You Sign Them?</td><td className="border p-2"><strong>CLASS GAME:</strong> Match evidence to the 4-point checklist!<br/><em className="text-amber-700">Great if you have extra time. Can also be used as a warm-up for Lesson 4.</em></td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-[#1a2744] mb-4 border-b-2 border-[#f0b429] pb-2">Resources & Materials</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Chromebooks/computers with internet access and headphones</li>
            <li className="text-sm">Session code for teacher-controlled lesson flow</li>
            <li className="text-sm">Artist profiles on the discovery platform</li>
          </ul>
        </section>

        <section className="mb-8 bg-amber-50 p-4 rounded-lg border-2 border-amber-300">
          <h2 className="text-xl font-bold text-[#1a2744] mb-3">📋 Important Notes for Teachers</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li className="text-sm">The 4-Point Checklist intro is teacher-led — step through each point at your pace</li>
            <li className="text-sm">Fact or Opinion is a writing activity, not a sorting game</li>
            <li className="text-sm">Scouting Report uses the assigned artist — students don't choose their own yet</li>
            <li className="text-sm">Would You Sign Them? is a bonus game — use it if time allows</li>
            <li className="text-sm">Work auto-saves — no manual submission required</li>
            <li className="text-sm">Green rows (🎮/🗣️) indicate student activity time — start the timer!</li>
          </ul>
        </section>

        <div className="border-t-2 border-gray-300 pt-4 mt-8 text-center text-sm text-gray-500">
          <p>🎯 Claim Your Artist — Lesson 3 of Music Agent (Unit 3)</p>
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
