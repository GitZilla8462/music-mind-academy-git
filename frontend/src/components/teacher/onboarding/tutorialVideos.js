// Tutorial Videos Registry
// Central config for all teacher tutorial videos
// Videos are self-hosted MP4s in /public/videos/tutorials/

import { Play, GraduationCap, Users, Monitor, Wrench } from 'lucide-react';

export const TUTORIAL_VIDEOS = [
  {
    id: 'quick-start',
    title: 'Run Your First Lesson',
    description: 'Make a roster, print login cards, start a session, and navigate the lesson view.',
    duration: '2 min',
    category: 'Getting Started',
    icon: Play,
    src: '/videos/tutorials/quick-start.mp4',
    priority: 1
  },
  {
    id: 'grading',
    title: 'Grading Student Work',
    description: 'View saved student work, use SpeedGrader, and manage answer keys.',
    duration: '2-3 min',
    category: 'Grading',
    icon: GraduationCap,
    src: '/videos/tutorials/grading.mp4',
    priority: 2
  },
  {
    id: 'session-modes',
    title: 'Quick Join vs Classroom Mode',
    description: 'When to use each mode and how student data is saved differently.',
    duration: '2 min',
    category: 'Session Modes',
    icon: Users,
    src: '/videos/tutorials/session-modes.mp4',
    priority: 3
  },
  {
    id: 'student-view',
    title: 'What Students See',
    description: 'A walkthrough of the student experience — logging in, completing activities, saving work.',
    duration: '1-2 min',
    category: 'Student View',
    icon: Monitor,
    src: '/videos/tutorials/student-view.mp4',
    priority: 4
  },
  {
    id: 'troubleshooting',
    title: 'Common Issues & Fixes',
    description: 'Audio not playing, students can\'t connect, and other quick fixes.',
    duration: '2 min',
    category: 'Troubleshooting',
    icon: Wrench,
    src: '/videos/tutorials/troubleshooting.mp4',
    priority: 5
  }
];

// localStorage keys
const WATCHED_KEY = 'teacher-tutorials-watched';

export const getWatchedVideos = () => {
  try {
    return JSON.parse(localStorage.getItem(WATCHED_KEY) || '{}');
  } catch {
    return {};
  }
};

export const markVideoWatched = (videoId) => {
  const watched = getWatchedVideos();
  watched[videoId] = Date.now();
  localStorage.setItem(WATCHED_KEY, JSON.stringify(watched));
};

export const isVideoWatched = (videoId) => {
  return !!getWatchedVideos()[videoId];
};

export const getUnwatchedCount = () => {
  const watched = getWatchedVideos();
  return TUTORIAL_VIDEOS.filter(v => !watched[v.id]).length;
};

export const getVideoById = (videoId) => {
  return TUTORIAL_VIDEOS.find(v => v.id === videoId);
};
