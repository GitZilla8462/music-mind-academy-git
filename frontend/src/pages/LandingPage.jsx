// /src/pages/LandingPage.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'teacher') navigate('/teacher');
      else if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'student') navigate('/student');
    }
  }, [isAuthenticated, user, navigate]);

  const goToLogin = () => navigate('/login');
  const goToSignup = () => navigate('/login?signup=true');

  return (
    <div className="min-h-screen bg-white text-slate-800" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        .font-display { font-family: 'Plus Jakarta Sans', sans-serif; }
        
        .gradient-text {
          background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .btn-primary {
          background: linear-gradient(135deg, #2563eb 0%, #0ea5e9 100%);
          transition: all 0.3s ease;
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 40px rgba(37, 99, 235, 0.3);
        }
        
        .card-shadow {
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
        }
        
        .card-hover:hover {
          box-shadow: 0 8px 32px rgba(37, 99, 235, 0.12);
          transform: translateY(-2px);
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        
        .animate-float { animation: float 5s ease-in-out infinite; }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <span className="font-display text-xl font-bold text-slate-800">Music Mind Academy</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
            <a href="#privacy" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a>
          </div>
          
          <button 
            onClick={goToLogin}
            className="btn-primary px-6 py-2.5 rounded-full text-sm font-semibold text-white"
          >
            Teacher Login
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-b from-blue-50/50 to-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="font-display text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-slate-800">
                Music Creation
                <br />
                <span className="gradient-text">Made Simple</span>
                <br />
                for Every Student
              </h1>
              
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                A browser-based music studio designed for middle school classrooms. 
                Film scoring, loop-based composition, and interactive lessons—students 
                start creating in seconds.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={goToSignup}
                  className="btn-primary px-8 py-4 rounded-full font-semibold text-lg text-white"
                >
                  Get Started Free
                </button>
                <button className="px-8 py-4 rounded-full font-semibold text-lg border-2 border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-slate-700">
                  Watch Demo
                </button>
              </div>
              
              <div className="flex items-center gap-8 mt-10 pt-8 border-t border-slate-200">
                <div>
                  <div className="text-2xl font-bold text-blue-600">30 sec</div>
                  <div className="text-sm text-slate-500">Students start creating</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">Zero</div>
                  <div className="text-sm text-slate-500">Student data collected</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">100%</div>
                  <div className="text-sm text-slate-500">Browser-based</div>
                </div>
              </div>
            </div>
            
            {/* Hero Visual - DAW Preview */}
            <div className="relative animate-float">
              <div className="bg-white rounded-2xl card-shadow p-4 border border-slate-200">
                {/* Mock DAW Interface */}
                <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                  {/* DAW Header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                      <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">🎬 Film Score Project</span>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Tracks */}
                  <div className="p-4 space-y-2">
                    {[
                      { name: 'Drums', color: 'bg-blue-500', width: '75%' },
                      { name: 'Bass', color: 'bg-sky-500', width: '60%' },
                      { name: 'Synth', color: 'bg-indigo-500', width: '85%' },
                      { name: 'Strings', color: 'bg-violet-500', width: '50%' }
                    ].map((track, i) => (
                      <div key={track.name} className="flex items-center gap-3">
                        <div className="w-16 text-xs text-slate-500 font-medium truncate">{track.name}</div>
                        <div className="flex-1 h-10 bg-white rounded-lg overflow-hidden relative border border-slate-200">
                          <div 
                            className={`absolute inset-y-0 left-0 ${track.color} rounded-lg opacity-80`}
                            style={{ width: track.width }}
                          >
                            <div className="h-full flex items-center gap-0.5 px-2">
                              {[...Array(20)].map((_, j) => (
                                <div 
                                  key={j} 
                                  className="w-1 bg-white/40 rounded-full"
                                  style={{ height: `${20 + Math.random() * 60}%` }}
                                ></div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Loop Library Preview */}
                  <div className="px-4 pb-4">
                    <div className="text-xs text-slate-500 mb-2 font-medium">Loop Library</div>
                    <div className="grid grid-cols-4 gap-2">
                      {['🥁', '🎸', '🎹', '🎻'].map((emoji, i) => (
                        <div key={i} className="aspect-square bg-white rounded-lg flex items-center justify-center text-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all">
                          {emoji}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4 text-slate-800">How It Works</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Get your classroom creating music in minutes—no downloads, no student accounts
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Teacher Flow */}
            <div className="bg-blue-50 rounded-2xl p-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600 text-white text-sm font-medium mb-6">
                👨‍🏫 Teacher Setup
              </div>
              <div className="space-y-6">
                {[
                  { step: '1', text: 'Create your free teacher account' },
                  { step: '2', text: 'Choose a lesson to assign' },
                  { step: '3', text: 'Share the class code with students' }
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <p className="text-slate-700 pt-1">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Student Flow */}
            <div className="bg-green-50 rounded-2xl p-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-600 text-white text-sm font-medium mb-6">
                🎓 Student Experience
              </div>
              <div className="space-y-6">
                {[
                  { step: '1', text: 'Go to the class link' },
                  { step: '2', text: 'Enter class code & pick a nickname' },
                  { step: '3', text: 'Start creating music immediately' }
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {item.step}
                    </div>
                    <p className="text-slate-700 pt-1">{item.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-green-200">
                <p className="text-sm text-green-700 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  No student accounts. No sign-ups. No data collected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4 text-slate-800">Built for the Music Classroom</h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Everything you need to teach music creation—without the tech headaches
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🎬',
                title: 'Film Scoring Studio',
                description: 'Students compose soundtracks to video clips. Drag loops to the timeline and watch music sync to visuals.'
              },
              {
                icon: '🎛️',
                title: 'Loop-Based DAW',
                description: 'Professional-quality loops across genres. No music theory required—just drag, drop, and create.'
              },
              {
                icon: '📚',
                title: 'Ready-Made Lessons',
                description: 'Curriculum-aligned activities with videos, instructions, and hands-on projects. Just assign and go.'
              },
              {
                icon: '🎮',
                title: 'Interactive Activities',
                description: 'Engaging games and exercises that teach rhythm, melody, and composition concepts through play.'
              },
              {
                icon: '💻',
                title: 'Chromebook Ready',
                description: 'Runs entirely in the browser. No downloads, installations, or IT approvals needed.'
              },
              {
                icon: '🔒',
                title: 'Privacy First',
                description: 'No student accounts or data collected. Fully compliant with FERPA, COPPA, and state privacy laws.'
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 card-shadow border border-slate-100 card-hover transition-all">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-semibold text-lg mb-2 text-slate-800">{feature.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Privacy & Compliance */}
      <section id="privacy" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 md:p-12 border border-green-100">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              
              <div className="flex-1">
                <h2 className="font-display text-3xl font-bold mb-4 text-slate-800">Student Privacy is Non-Negotiable</h2>
                <p className="text-slate-600 text-lg mb-6">
                  Music Mind Academy collects zero student data. Not anonymized data. Not metadata. 
                  <strong className="text-slate-800"> Nothing.</strong>
                </p>
                
                {/* Compliance Badges */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {['FERPA', 'COPPA', 'NY Ed Law 2-D'].map((badge) => (
                    <div key={badge} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {badge} Compliant
                    </div>
                  ))}
                </div>
                
                <div className="bg-white rounded-xl p-6 border border-green-200">
                  <h3 className="font-semibold mb-3 text-slate-800">How students access lessons:</h3>
                  <ol className="space-y-2 text-slate-600 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-green-600">1.</span>
                      Teacher shares class code (like "MUSIC-7B")
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-green-600">2.</span>
                      Student enters code and picks any nickname they want
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-semibold text-green-600">3.</span>
                      Work saves to their device only—nothing goes to our servers
                    </li>
                  </ol>
                  <p className="mt-4 text-sm text-green-700 font-medium">
                    No emails. No accounts. No Google sign-in. No data to protect because there's no data to collect.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4 text-slate-800">Simple Pricing</h2>
            <p className="text-slate-600 text-lg">
              Try Lesson 1 free. Pay only when you're ready for more.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Free Tier */}
            <div className="bg-white rounded-2xl p-8 card-shadow border border-slate-200">
              <div className="text-sm text-slate-500 font-semibold mb-2">Free</div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-5xl font-bold text-slate-800">$0</span>
              </div>
              <p className="text-slate-500 mb-6">Try it with your class</p>
              <ul className="space-y-3 mb-8">
                {[
                  '1 demo lesson',
                  'Full DAW experience',
                  'Unlimited students',
                  'No credit card required'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <button 
                onClick={goToSignup}
                className="w-full py-3 rounded-full border-2 border-slate-200 font-semibold hover:border-blue-300 hover:bg-blue-50 transition-colors text-slate-700"
              >
                Get Started Free
              </button>
            </div>
            
            {/* Pro Tier */}
            <div className="relative bg-white rounded-2xl p-8 card-shadow border-2 border-blue-500">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 text-white text-xs font-semibold">
                Best Value
              </div>
              <div className="text-sm text-blue-600 font-semibold mb-2">Pro</div>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-5xl font-bold text-slate-800">$49</span>
                <span className="text-slate-500">/year</span>
              </div>
              <p className="text-slate-500 mb-6">Full curriculum access</p>
              <ul className="space-y-3 mb-8">
                {[
                  '5 complete lessons',
                  'All activities & games',
                  'Full DAW & loop library',
                  'Film scoring studio',
                  'Unlimited classes',
                  'Priority support'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-600">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <button 
                onClick={goToSignup}
                className="w-full py-3 rounded-full btn-primary font-semibold text-white"
              >
                Buy Now - $49/year
              </button>
            </div>
          </div>
          
          <p className="text-center text-slate-500 text-sm mt-8">
            Need school/district pricing? <a href="mailto:support@musicmindacademy.com" className="text-blue-600 hover:underline">Contact us</a>
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-blue-600 to-sky-500">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 text-white">
            Ready to Transform Your Music Classroom?
          </h2>
          <p className="text-blue-100 text-xl mb-8 max-w-2xl mx-auto">
            Your students could be creating music in the next 5 minutes.
          </p>
          <button 
            onClick={goToSignup}
            className="bg-white text-blue-600 px-10 py-4 rounded-full font-semibold text-lg hover:shadow-lg hover:-translate-y-1 transition-all"
          >
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-12 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                  </svg>
                </div>
                <span className="font-display font-bold text-slate-800">Music Mind Academy</span>
              </div>
              <p className="text-slate-500 text-sm">
                Empowering music teachers to inspire creativity in every student.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-slate-800">Product</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#features" className="hover:text-blue-600 transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-blue-600 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Demo</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-slate-800">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Tutorials</a></li>
                <li><a href="mailto:support@musicmindacademy.com" className="hover:text-blue-600 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-slate-800">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
                <li><a href="#privacy" className="hover:text-blue-600 transition-colors">Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} Music Mind Academy. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              FERPA · COPPA · Ed Law 2-D Compliant
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;