// /src/pages/EduLandingPage.jsx
// Landing page for musicroomtools.org - free educational site

import React from 'react';
import { useNavigate } from 'react-router-dom';

const EduLandingPage = () => {
  const navigate = useNavigate();

  const goToLogin = () => navigate('/login');

  return (
    <div className="min-h-screen bg-white text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
        
        .gradient-text {
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
          transition: all 0.3s ease;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 40px rgba(124, 58, 237, 0.3);
        }
        
        .card-shadow {
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
        }
      `}</style>

      {/* Simple Navigation */}
      <nav className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <span className="font-display text-xl font-bold text-slate-800">Music Room Tools</span>
          </div>
          
          <button 
            onClick={goToLogin}
            className="btn-primary px-5 py-2 rounded-full text-sm font-semibold text-white"
          >
            Enter
          </button>
        </div>
      </nav>

      {/* Hero - Personal Story */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-tight mb-6 text-slate-800">
            A Music Creation Tool
            <br />
            <span className="gradient-text">Built by a Teacher, for Teachers</span>
          </h1>
          
          <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto">
            I'm a middle school music teacher in New York. I built this because I wanted my students 
            to experience the joy of creating music—without needing expensive software or musical training. 
            Now I'm sharing it with you.
          </p>
          
          <button 
            onClick={goToLogin}
            className="btn-primary px-8 py-4 rounded-full font-semibold text-lg text-white"
          >
            Try It Free
          </button>
          
          <p className="text-slate-500 text-sm mt-4">
            No account required for students. Just share a class code.
          </p>
        </div>
      </section>

      {/* What It Is - Simple */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-12 text-slate-800">
            What Your Students Will Do
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 card-shadow text-center">
              <div className="text-4xl mb-4">🎬</div>
              <h3 className="font-semibold text-lg mb-2 text-slate-800">Score Films</h3>
              <p className="text-slate-600 text-sm">
                Add music to video clips—sports highlights, city scenes, wildlife documentaries.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 card-shadow text-center">
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="font-semibold text-lg mb-2 text-slate-800">Create with Loops</h3>
              <p className="text-slate-600 text-sm">
                Drag and drop loops to build songs. No instrument skills needed.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 card-shadow text-center">
              <div className="text-4xl mb-4">💻</div>
              <h3 className="font-semibold text-lg mb-2 text-slate-800">Works on Chromebooks</h3>
              <p className="text-slate-600 text-sm">
                Browser-based. No downloads, no installs, no headaches.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Lessons */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-4 text-slate-800">
            Ready-to-Use Lessons
          </h2>
          <p className="text-center text-slate-600 mb-10">
            Each lesson is about 35 minutes with video instruction and hands-on creation time.
          </p>
          
          <div className="space-y-4">
            {[
              { emoji: '🏀', title: 'Sports Highlight Reel', desc: 'Intro to the DAW', available: true },
              { emoji: '🏙️', title: 'City Soundscapes', desc: 'Texture & Layering', available: true },
              { emoji: '🌍', title: 'Epic Wildlife', desc: 'Sectional Form', available: true },
              { emoji: '🎮', title: 'Video Game Montage', desc: 'Coming Soon', available: false },
            ].map((lesson, i) => (
              <div 
                key={i} 
                className={`flex items-center gap-4 p-4 rounded-xl border ${
                  lesson.available 
                    ? 'bg-white border-slate-200' 
                    : 'bg-slate-50 border-slate-100 opacity-60'
                }`}
              >
                <span className="text-3xl">{lesson.emoji}</span>
                <div className="flex-1">
                  <div className="font-semibold text-slate-800">{lesson.title}</div>
                  <div className="text-sm text-slate-500">{lesson.desc}</div>
                </div>
                {lesson.available ? (
                  <span className="text-green-600 text-sm font-medium">✓ Available</span>
                ) : (
                  <span className="text-slate-400 text-sm">Coming Soon</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy - Important */}
      <section className="py-16 px-6 bg-violet-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-bold mb-4 text-slate-800">
              Student Privacy First
            </h2>
            <p className="text-slate-600">
              I built this with the same concerns I have for my own students.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 card-shadow">
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-slate-800">No student accounts</div>
                  <div className="text-sm text-slate-600">Students join with a class code and pick any nickname</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-slate-800">No emails collected</div>
                  <div className="text-sm text-slate-600">We never ask students for personal information</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Work saves locally</div>
                  <div className="text-sm text-slate-600">Student compositions stay on their device only</div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-slate-800">Zero PII</div>
                  <div className="text-sm text-slate-600">Nothing to report, nothing to breach</div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-4 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                FERPA
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                COPPA
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                NY Ed Law 2-D
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simple CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl font-bold mb-4 text-slate-800">
            Give It a Try
          </h2>
          <p className="text-slate-600 mb-8">
            It's free. If your students enjoy it, that's all the thanks I need.
          </p>
          <button 
            onClick={goToLogin}
            className="btn-primary px-8 py-4 rounded-full font-semibold text-lg text-white"
          >
            Enter Music Room Tools
          </button>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="border-t border-slate-200 py-8 px-6 bg-white">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <span className="font-display font-semibold text-slate-700">Music Room Tools</span>
          </div>
          
          <p className="text-slate-500 text-sm">
            Made with ❤️ by a fellow music teacher
          </p>
          
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Student Privacy First
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EduLandingPage;