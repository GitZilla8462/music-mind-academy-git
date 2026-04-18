// File: /src/lessons/music-journalist/lesson4/LessonPlanPDF.jsx
// Printable lesson plan view for teachers - Build Your Story

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
          <h1 className="text-3xl font-bold text-[#1a2744] mb-2">🎨 Lesson 4: Build Your Story</h1>
          <p className="text-lg text-gray-700 font-semibold">How do you tell someone's story in a way that makes people care?</p>
          <div className="flex gap-6 mt-3 text-sm">
            <div><strong>Grade Level:</strong> 6-8</div>
            <div><strong>Duration:</strong> ~45 minutes</div>
            <div><strong>Unit:</strong> Music Agent (Unit 3)</div>
          </div>
        </div>

        <section className="mb-8 bg-amber-50 p-4 rounded-lg border border-amber-200">
          <h2 className="text-xl font-bold text-[#1a2744] mb-3">Lesson Overview</h2>
          <p className="text-sm mb-4">
            Students learn what a press kit is and why it matters, then build a 5-slide presentation for their artist using the Slide Builder. Partners swap and review each other's work, make final edits, and choose their presentation format for Launch Day.
          </p>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Students Will:</h3>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Structure a 5-slide press kit presentation using research and listening notes</li>
            <li className="text-sm">Write concise, persuasive slide content with evidence from multiple sources</li>
            <li className="text-sm">Give and receive constructive peer feedback</li>
            <li className="text-sm">Prepare for a 2-3 minute presentation</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-[#1a2744] mb-4 border-b-2 border-[#f0b429] pb-2">STAGE 1: DESIRED RESULTS</h2>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Standards:</h3>
            <ul className="list-none space-y-1 ml-0">
              <li className="text-sm"><strong>CCSS.ELA-LITERACY.SL.7.5</strong> — Include multimedia in presentations</li>
              <li className="text-sm"><strong>CCSS.ELA-LITERACY.W.7.7</strong> — Short research projects using several sources</li>
              <li className="text-sm"><strong>ISTE 6a</strong> — Choose platforms to create original works</li>
            </ul>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Essential Question:</h3>
            <p className="text-sm ml-6 italic">How do you tell someone's story in a way that makes people care?</p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">I Can Statement:</h3>
            <p className="text-sm ml-6">I can design a press kit that tells my artist's story using evidence and visuals.</p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Vocabulary:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><strong>Press Kit</strong> — Professional package to promote an artist</div>
              <div><strong>Call to Action</strong> — Telling your audience what to do next</div>
              <div><strong>Unique Selling Point</strong> — The one thing that makes your artist different</div>
              <div><strong>Peer Feedback</strong> — Constructive comments to improve work</div>
            </div>
          </div>
        </section>

        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-[#1a2744] mb-4 border-b-2 border-[#f0b429] pb-2">STAGE 2: ASSESSMENT EVIDENCE</h2>
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Performance Task:</h3>
            <p className="text-sm mb-2">Students build a 5-slide press kit presentation demonstrating:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm"><strong>Structure:</strong> 5 slides — Meet, Story, Sound, Why Sign, Listen</li>
              <li className="text-sm"><strong>Evidence:</strong> Content drawn from research and listening notes</li>
              <li className="text-sm"><strong>Design:</strong> Visual choices that support the artist's brand</li>
            </ul>
          </div>
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Other Evidence:</h3>
            <ul className="list-disc ml-6 space-y-1">
              <li className="text-sm">Peer Review feedback given and received (formative)</li>
              <li className="text-sm">Presentation format selection (self-assessment of strengths)</li>
            </ul>
          </div>
        </section>

        <section className="mb-8 page-break-before">
          <h2 className="text-2xl font-bold text-[#1a2744] mb-4 border-b-2 border-[#f0b429] pb-2">STAGE 3: LEARNING PLAN (~45 minutes)</h2>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-blue-50 p-2 rounded">
              1. Introduction <span className="font-normal text-gray-600">— What Is a Press Kit? (3 min)</span>
            </h3>
            <table className="w-full text-sm border-collapse">
              <thead><tr className="bg-gray-100"><th className="border p-2 text-left w-16">Time</th><th className="border p-2 text-left w-48">Activity</th><th className="border p-2 text-left">What to Say/Do</th></tr></thead>
              <tbody>
                <tr><td className="border p-2">3 min</td><td className="border p-2 font-medium">Hook</td><td className="border p-2">"A PRESS KIT is what gets sent to record labels, festival bookers, and playlist curators. It tells the artist's story in a way that makes people CARE. You already have everything you need — research, sound statement, evidence. Now turn it into 5 polished slides."</td></tr>
              </tbody>
            </table>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-purple-50 p-2 rounded">
              2. Build Time <span className="font-normal text-gray-600">— Create Your Presentation (25 min)</span>
            </h3>
            <table className="w-full text-sm border-collapse">
              <thead><tr className="bg-gray-100"><th className="border p-2 text-left w-16">Time</th><th className="border p-2 text-left w-48">Activity</th><th className="border p-2 text-left">What to Say/Do</th></tr></thead>
              <tbody>
                <tr className="bg-green-50"><td className="border p-2">25 min</td><td className="border p-2 font-medium">🎮 Build Your Story</td><td className="border p-2"><strong>STUDENTS BUILD:</strong> Build 5-slide presentation in the Slide Builder.<br/><em className="text-green-700">Slides: Meet the Artist, Their Story, Their Sound, Why Sign Them, Listen Now. Circulate and check that students are using evidence, not just opinions.</em></td></tr>
              </tbody>
            </table>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-orange-50 p-2 rounded">
              3. Peer Review + Revise <span className="font-normal text-gray-600">— Swap, Feedback, Final Edits (9 min)</span>
            </h3>
            <table className="w-full text-sm border-collapse">
              <thead><tr className="bg-gray-100"><th className="border p-2 text-left w-16">Time</th><th className="border p-2 text-left w-48">Activity</th><th className="border p-2 text-left">What to Say/Do</th></tr></thead>
              <tbody>
                <tr className="bg-green-50"><td className="border p-2">9 min</td><td className="border p-2 font-medium">🎮 Peer Review + Revise</td><td className="border p-2"><strong>PARTNER ACTIVITY:</strong> Swap with a partner. What's their strongest slide? What's missing? Then make final edits based on feedback.<br/><em className="text-green-700">Split: ~4 min reviewing partner's work, ~5 min revising your own.</em></td></tr>
              </tbody>
            </table>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 bg-yellow-50 p-2 rounded">
              4. Presentation Prep <span className="font-normal text-gray-600">— Tomorrow's Format (3 min)</span>
            </h3>
            <table className="w-full text-sm border-collapse">
              <thead><tr className="bg-gray-100"><th className="border p-2 text-left w-16">Time</th><th className="border p-2 text-left w-48">Activity</th><th className="border p-2 text-left">What to Say/Do</th></tr></thead>
              <tbody>
                <tr><td className="border p-2">3 min</td><td className="border p-2 font-medium">Presentation Prep</td><td className="border p-2">Explain tomorrow's options: Live Pitch, Voiceover, Partner Pitch, or Panel. 2-3 minutes per presentation. "TELL the story — don't just read your slides. You MUST play or reference a specific song."</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-[#1a2744] mb-4 border-b-2 border-[#f0b429] pb-2">Resources & Materials</h2>
          <ul className="list-disc ml-6 space-y-1">
            <li className="text-sm">Chromebooks/computers with internet access and headphones</li>
            <li className="text-sm">Session code for teacher-controlled lesson flow</li>
            <li className="text-sm">Students' completed Scouting Reports and Listening Guides from previous lessons</li>
          </ul>
        </section>

        <section className="mb-8 bg-amber-50 p-4 rounded-lg border-2 border-amber-300">
          <h2 className="text-xl font-bold text-[#1a2744] mb-3">📋 Important Notes for Teachers</h2>
          <ul className="list-disc ml-6 space-y-2">
            <li className="text-sm">Build time is the bulk of this lesson — circulate and check for evidence-based content</li>
            <li className="text-sm">Peer Review should include both feedback AND revision time</li>
            <li className="text-sm">Let students choose their presentation format — it increases buy-in for Launch Day</li>
            <li className="text-sm">Work auto-saves — no manual submission required</li>
            <li className="text-sm">Green rows (🎮) indicate student activity time — start the timer!</li>
          </ul>
        </section>

        <div className="border-t-2 border-gray-300 pt-4 mt-8 text-center text-sm text-gray-500">
          <p>🎨 Build Your Story — Lesson 4 of Music Agent (Unit 3)</p>
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
