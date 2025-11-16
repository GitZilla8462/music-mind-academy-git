// Student Header Component
// Shows musical name and score at top of student screen
// src/components/StudentHeader.jsx

import React, { useState, useEffect } from 'react';
import { useSession } from '../context/SessionContext';
import { User, Trophy } from 'lucide-react';

const StudentHeader = () => {
  const { sessionData, userId } = useSession();
  const [studentName, setStudentName] = useState('');
  const [studentScore, setStudentScore] = useState(0);
  const [studentRank, setStudentRank] = useState(null);

  useEffect(() => {
    if (!sessionData || !userId) return;

    const student = sessionData.studentsJoined?.[userId];
    if (!student) return;

    setStudentName(student.name || 'Student');
    setStudentScore(student.score || 0);

    // Calculate rank
    const allStudents = Object.values(sessionData.studentsJoined || {});
    const sorted = allStudents
      .map(s => ({ id: s.id, score: s.score || 0 }))
      .sort((a, b) => b.score - a.score);
    
    const rank = sorted.findIndex(s => s.id === userId) + 1;
    setStudentRank(rank);
  }, [sessionData, userId]);

  if (!sessionData || !userId) return null;

  const totalStudents = Object.keys(sessionData.studentsJoined || {}).length;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Student Name */}
        <div className="flex items-center space-x-2">
          <User size={20} />
          <span className="font-bold text-lg">
            You are: <span className="text-yellow-300">{studentName}</span>
          </span>
        </div>

        {/* Score and Rank */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Trophy size={20} className="text-yellow-300" />
            <span className="font-bold text-lg">
              {studentScore} pts
            </span>
          </div>
          
          {studentRank && (
            <div className="bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
              Rank: #{studentRank}/{totalStudents}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentHeader;