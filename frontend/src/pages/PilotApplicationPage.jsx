import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';

const PilotApplicationPage = () => {
  // Required fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [schoolEmail, setSchoolEmail] = useState('');
  const [schoolName, setSchoolName] = useState('');

  // Optional fields
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [grades, setGrades] = useState([]);
  const [devices, setDevices] = useState([]);
  const [classSize, setClassSize] = useState('');
  const [biggestChallenge, setBiggestChallenge] = useState('');
  const [whyPilot, setWhyPilot] = useState('');
  const [toolsUsed, setToolsUsed] = useState([]);
  const [anythingElse, setAnythingElse] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const gradeOptions = ['5th', '6th', '7th', '8th', 'Other'];
  const deviceOptions = ['Chromebooks', 'iPads', 'Windows', 'Mac', 'Mixed', 'Other'];
  const toolOptions = ['Soundtrap', 'BandLab', 'Chrome Music Lab', 'Flat.io', 'Noteflight', 'GarageBand', 'Other', 'None'];

  const toggleArrayItem = (arr, setArr, item) => {
    if (arr.includes(item)) {
      setArr(arr.filter(i => i !== item));
    } else {
      setArr([...arr, item]);
    }
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = firstName.trim() && lastName.trim() && personalEmail.trim() && schoolEmail.trim() && schoolName.trim() && isValidEmail(personalEmail.trim()) && isValidEmail(schoolEmail.trim());

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError('');
    try {
      const applicationData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        personalEmail: personalEmail.trim().toLowerCase(),
        schoolEmail: schoolEmail.trim().toLowerCase(),
        schoolName: schoolName.trim(),
        city: city.trim(),
        state: state.trim(),
        grades,
        devices,
        classSize: classSize.trim(),
        biggestChallenge: biggestChallenge.trim(),
        whyPilot: whyPilot.trim(),
        toolsUsed,
        anythingElse: anythingElse.trim()
      };

      // Submit through backend (handles Firebase write, admin email, HubSpot)
      const res = await fetch('/api/applications/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(applicationData)
      });

      const result = await res.json();
      if (result.success) {
        setSubmitted(true);
      } else {
        setError('Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Could not connect to the server. Please check your internet and try again.');
    }
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Received!</h2>
          <p className="text-gray-600">
            Thank you for applying to the Music Mind Academy pilot program. You'll receive an email when your account is ready.
          </p>
          <p className="text-gray-500 text-sm mt-4">You can close this tab.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 to-blue-700 px-6 py-5">
          <h1 className="text-xl font-bold text-white">
            Join the Pilot Program
          </h1>
          <p className="text-sky-100 text-sm mt-1">
            Free access now through June 20, 2026
          </p>
        </div>

        <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
          {/* Required Fields */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="font-semibold text-gray-800 mb-3 text-sm uppercase tracking-wide">Your Information</p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Personal Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={personalEmail}
                onChange={(e) => setPersonalEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="your@email.com"
              />
            </div>

            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                School Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={schoolEmail}
                onChange={(e) => setSchoolEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="you@school.edu"
              />
              <p className="text-xs text-gray-500 mt-1">This is the email you'll use to log in</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                School Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Your school name"
              />
            </div>
          </div>

          {/* City / State */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="City"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="State"
              />
            </div>
          </div>

          {/* Grades Taught */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Grades Taught</p>
            <div className="flex flex-wrap gap-2">
              {gradeOptions.map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => toggleArrayItem(grades, setGrades, grade)}
                  className={`px-4 py-2 rounded-lg border-2 text-sm transition-all ${
                    grades.includes(grade)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>
          </div>

          {/* Student Devices */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">What devices do your students use?</p>
            <p className="text-xs text-amber-600 mb-2">Music Mind Academy is only optimized for Chromebooks. Other devices may not work properly.</p>
            <div className="flex flex-wrap gap-2">
              {deviceOptions.map((device) => (
                <button
                  key={device}
                  type="button"
                  onClick={() => toggleArrayItem(devices, setDevices, device)}
                  className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                    devices.includes(device)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {device}
                </button>
              ))}
            </div>
          </div>

          {/* Class Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Typical class size</label>
            <input
              type="text"
              value={classSize}
              onChange={(e) => setClassSize(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="e.g., 25 students"
            />
          </div>

          {/* Biggest Challenge */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Biggest challenge teaching general music
            </label>
            <textarea
              value={biggestChallenge}
              onChange={(e) => setBiggestChallenge(e.target.value)}
              placeholder="What's your biggest pain point?"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none h-20 text-sm"
            />
          </div>

          {/* Why Pilot */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Why do you want to be part of the pilot?
            </label>
            <textarea
              value={whyPilot}
              onChange={(e) => setWhyPilot(e.target.value)}
              placeholder="What are you hoping to get out of this?"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none h-20 text-sm"
            />
          </div>

          {/* Tools Used */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Music ed tools used before</p>
            <div className="flex flex-wrap gap-2">
              {toolOptions.map((tool) => (
                <button
                  key={tool}
                  type="button"
                  onClick={() => toggleArrayItem(toolsUsed, setToolsUsed, tool)}
                  className={`px-3 py-2 rounded-lg border-2 text-sm transition-all ${
                    toolsUsed.includes(tool)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {tool}
                </button>
              ))}
            </div>
          </div>

          {/* Anything Else */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anything else?
            </label>
            <textarea
              value={anythingElse}
              onChange={(e) => setAnythingElse(e.target.value)}
              placeholder="Optional - anything else you'd like to share"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none h-16 text-sm"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-3 text-center">{error}</p>
          )}
          {(personalEmail.trim() && !isValidEmail(personalEmail.trim())) || (schoolEmail.trim() && !isValidEmail(schoolEmail.trim())) ? (
            <p className="text-xs text-red-500 mb-2 text-center">Please enter valid email addresses</p>
          ) : null}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit || submitting}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              !canSubmit || submitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
          <p className="text-xs text-gray-500 text-center mt-2">
            You'll log in with your school email after approval
          </p>
        </div>
      </div>
    </div>
  );
};

export default PilotApplicationPage;
