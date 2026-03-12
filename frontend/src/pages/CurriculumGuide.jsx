// File: /pages/CurriculumGuide.jsx
// Comprehensive Curriculum Guide - Standards, Units, and Scope & Sequence
// Reference page for teachers

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Check, BookOpen, Music, Target, Award } from 'lucide-react';

// Full 6-Unit Curriculum Data with detailed info
const CURRICULUM_DATA = {
  overview: {
    title: 'Music Mind Academy Curriculum',
    subtitle: 'A Complete Middle School General Music Curriculum',
    grades: '6-8',
    totalUnits: 6,
    totalLessons: 30,
    duration: '5 lessons per unit',
    description: 'A standards-aligned curriculum that takes students from listening and responding to creating and performing. Six units span the full school year at one lesson per week, with built-in flex weeks for catch-up and enrichment. Students build skills in media composition, critical listening, cultural awareness, rhythm creation, songwriting, and film scoring.'
  },
  units: [
    {
      id: 1,
      title: 'The Loop Lab',
      subtitle: 'Loop-Based Composition',
      icon: '🎬',
      color: '#3b82f6',
      focus: 'Creating',
      duration: '~40 min per lesson',
      overview: 'Students create soundtracks for video using loops, learning how music creates mood, texture, form, and energy in media.',
      essentialQuestion: 'How does music enhance visual storytelling?',
      standards: {
        primary: ['MU:Cr1.1', 'MU:Cr2.1', 'MU:Cn10.0'],
        description: 'Creating and Connecting standards - composing for purpose'
      },
      iCanStatements: [
        'I can select loops that match the mood of a video',
        'I can layer loops to create texture and interest',
        'I can organize music into sections that follow video structure',
        'I can use rhythm and beat to match video energy',
        'I can explain my musical choices using music vocabulary'
      ],
      portfolioPiece: 'Video Soundtrack Composition',
      lessons: [
        { num: 1, title: 'Score the Adventure', concept: 'Mood & Expression' },
        { num: 2, title: 'City Soundscapes', concept: 'Texture & Layering' },
        { num: 3, title: 'Epic Wildlife', concept: 'Form & Structure' },
        { num: 4, title: 'Sports Highlight Reel', concept: 'Rhythm & Beat' },
        { num: 5, title: 'Game On!', concept: 'Melody & Contour' }
      ],
      status: 'pilot'
    },
    {
      id: 2,
      title: 'The Listening Lab',
      subtitle: 'Elements of Music',
      icon: '🎧',
      color: '#8b5cf6',
      focus: 'Responding',
      duration: '~40 min per lesson',
      overview: 'Students develop critical listening skills by exploring one instrument family per lesson alongside a core music element. Each lesson features a famous classical piece and builds toward a capstone Listening Journey project.',
      essentialQuestion: 'How do the elements of music work together to create meaning and emotion?',
      standards: {
        primary: ['MU:Re7.2', 'MU:Re8.1', 'MU:Re9.1'],
        description: 'Responding standards - analyzing and evaluating music'
      },
      iCanStatements: [
        'I can identify instruments from the four orchestral families by sight and sound',
        'I can describe dynamics (pp through ff) and tempo (Largo through Presto) using Italian terms',
        'I can track dynamic and tempo changes on a listening map',
        'I can identify musical form and label sections with letters (A, B)',
        'I can create a Listening Journey that demonstrates dynamics, tempo, and form'
      ],
      portfolioPiece: 'Listening Journey (Capstone Animation)',
      lessons: [
        { num: 1, title: 'Strings & Dynamics', concept: 'String Family + Dynamic Markings', piece: 'Vivaldi — Spring' },
        { num: 2, title: 'Woodwinds & Tempo', concept: 'Woodwind Family + Tempo Markings', piece: 'Brahms — Hungarian Dance No. 5' },
        { num: 3, title: 'Brass & Form', concept: 'Brass Family + Ternary Form (ABA)', piece: 'Grieg — In the Hall of the Mountain King' },
        { num: 4, title: 'Percussion & Review', concept: 'Percussion Family + Review All Elements', piece: 'Student Choice Capstone' },
        { num: 5, title: 'Worktime + Presentation', concept: 'Finish & Share Listening Journeys', piece: 'Student Journeys' }
      ]
    },
    {
      id: 3,
      title: 'Music Around the World',
      subtitle: 'Global Sounds & Cultures',
      icon: '🌍',
      color: '#14b8a6',
      focus: 'Connecting',
      duration: '~40 min per lesson',
      overview: 'Students explore music traditions from Africa, Asia, Latin America, and beyond, discovering how culture shapes musical expression.',
      essentialQuestion: 'How does music reflect the people and places that create it?',
      standards: {
        primary: ['MU:Cn11.0', 'MU:Re7.1', 'MU:Re8.1'],
        description: 'Connecting standards - relating music to culture and context'
      },
      iCanStatements: [
        'I can identify music from different world regions by sound',
        'I can explain how culture influences musical choices',
        'I can describe instruments unique to different cultures',
        'I can compare and contrast musical traditions',
        'I can respect and appreciate diverse musical expressions'
      ],
      portfolioPiece: 'World Music Research Presentation',
      lessons: [
        { num: 1, title: 'Drums of Africa', concept: 'Rhythm & Community' },
        { num: 2, title: 'Asian Melodies', concept: 'Scales & Instruments' },
        { num: 3, title: 'Latin Grooves', concept: 'Dance & Rhythm' },
        { num: 4, title: 'European Traditions', concept: 'Folk & Classical' },
        { num: 5, title: 'World Fusion', concept: 'Blending Cultures' }
      ]
    },
    {
      id: 4,
      title: 'Beat Lab',
      subtitle: 'Rhythm & Groove',
      icon: '🥁',
      color: '#ef4444',
      focus: 'Creating',
      duration: '~40 min per lesson',
      overview: 'Students create original beats using loops and discover how rhythm drives music across genres from hip-hop to EDM.',
      essentialQuestion: 'How does rhythm make us move and feel?',
      standards: {
        primary: ['MU:Cr1.1', 'MU:Cr2.1', 'MU:Cr3.1'],
        description: 'Creating standards - generating and developing musical ideas'
      },
      iCanStatements: [
        'I can identify and create steady beat patterns',
        'I can layer multiple rhythm parts together',
        'I can recognize and create rhythms in different genres',
        'I can use loops to build a complete beat',
        'I can refine my beat based on feedback'
      ],
      portfolioPiece: 'Original Beat Composition',
      lessons: [
        { num: 1, title: 'Feel the Beat', concept: 'Pulse & Meter' },
        { num: 2, title: 'Layer It Up', concept: 'Building Beats' },
        { num: 3, title: 'Genre Grooves', concept: 'Hip-Hop to EDM' },
        { num: 4, title: 'Remix Culture', concept: 'Sampling & Loops' },
        { num: 5, title: 'Your Beat Drop', concept: 'Original Creation' }
      ]
    },
    {
      id: 5,
      title: 'Song Lab',
      subtitle: 'Melody & Structure',
      icon: '🎵',
      color: '#ec4899',
      focus: 'Creating + Performing',
      duration: '~40 min per lesson',
      overview: 'Students explore song form (verse, chorus, bridge) and create melodic ideas using digital tools.',
      essentialQuestion: 'What makes a song memorable?',
      standards: {
        primary: ['MU:Cr1.1', 'MU:Cr2.1', 'MU:Pr4.3'],
        description: 'Creating and Performing standards - melody and song structure'
      },
      iCanStatements: [
        'I can identify melodic contour (up, down, same)',
        'I can create a memorable melodic hook',
        'I can structure a song with verse and chorus',
        'I can combine lyrics with rhythmic patterns',
        'I can perform my song sketch for others'
      ],
      portfolioPiece: 'Original Song Sketch',
      lessons: [
        { num: 1, title: 'Melodic Shapes', concept: 'Contour & Motion' },
        { num: 2, title: 'Hook & Chorus', concept: 'Memorable Moments' },
        { num: 3, title: 'Verse & Bridge', concept: 'Song Sections' },
        { num: 4, title: 'Lyrics & Rhythm', concept: 'Words & Music' },
        { num: 5, title: 'Your Song Sketch', concept: 'Original Creation' }
      ]
    },
    {
      id: 6,
      title: 'Film Music',
      subtitle: 'Scoring the Story',
      icon: '🎼',
      color: '#f59e0b',
      focus: 'Creating + Performing',
      duration: '~40 min per lesson',
      overview: 'Students score original compositions to narrative video scenes using keyboard, applying all musical elements to create professional film music.',
      essentialQuestion: 'How do composers use music to tell stories?',
      standards: {
        primary: ['MU:Cr3.1', 'MU:Pr4.2', 'MU:Pr5.1', 'MU:Cn11.0'],
        description: 'Creating, Performing, and Connecting standards - capstone integration'
      },
      iCanStatements: [
        'I can create a character theme (leitmotif) using melody',
        'I can play bass notes to support my melody',
        'I can use silence and sound effects purposefully',
        'I can build tension and release using harmony',
        'I can explain my compositional choices in writing'
      ],
      portfolioPiece: 'Complete Film Score with Composer\'s Notes',
      lessons: [
        { num: 1, title: 'WHO Is In The Story?', concept: 'Leitmotif & Melody' },
        { num: 2, title: 'WHAT Do They Feel?', concept: 'Orchestration & Bass' },
        { num: 3, title: 'WHEN Does Music Speak?', concept: 'Spotting & Silence' },
        { num: 4, title: 'HOW Does Tension Build?', concept: 'Tension & Harmony' },
        { num: 5, title: 'Complete Story', concept: 'Integration' }
      ]
    }
  ],
  standards: {
    creating: {
      code: 'Creating (Cr)',
      color: '#3b82f6',
      description: 'Generate and conceptualize artistic ideas and work',
      standards: [
        { code: 'Cr1', name: 'Imagine', description: 'Generate musical ideas for various purposes' },
        { code: 'Cr2', name: 'Plan & Make', description: 'Select and develop musical ideas' },
        { code: 'Cr3', name: 'Evaluate & Refine', description: 'Evaluate and refine work' }
      ],
      coveredIn: [1, 4, 5, 6]
    },
    performing: {
      code: 'Performing (Pr)',
      color: '#f59e0b',
      description: 'Realize artistic ideas and work through interpretation and presentation',
      standards: [
        { code: 'Pr4', name: 'Select', description: 'Select and analyze music for presentation' },
        { code: 'Pr5', name: 'Rehearse & Refine', description: 'Develop and refine technique' },
        { code: 'Pr6', name: 'Present', description: 'Convey meaning through presentation' }
      ],
      coveredIn: [5, 6]
    },
    responding: {
      code: 'Responding (Re)',
      color: '#8b5cf6',
      description: 'Understand and evaluate how music conveys meaning',
      standards: [
        { code: 'Re7', name: 'Select', description: 'Select music for listening based on interest' },
        { code: 'Re8', name: 'Analyze', description: 'Analyze music using appropriate vocabulary' },
        { code: 'Re9', name: 'Interpret', description: 'Support interpretations with evidence' }
      ],
      coveredIn: [2, 3]
    },
    connecting: {
      code: 'Connecting (Cn)',
      color: '#14b8a6',
      description: 'Relate music to personal experience, culture, and other disciplines',
      standards: [
        { code: 'Cn10', name: 'Synthesize', description: 'Synthesize knowledge to create music' },
        { code: 'Cn11', name: 'Relate', description: 'Relate music to culture, history, and context' }
      ],
      coveredIn: [1, 3, 6]
    }
  }
};

function CurriculumGuide() {
  const navigate = useNavigate();
  const isEduSite = import.meta.env.VITE_SITE_MODE === 'edu';
  const [activeTab, setActiveTab] = useState('overview');

  const { overview, units, standards } = CURRICULUM_DATA;

  // Mobile responsiveness
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleDownloadPDF = () => {
    // Build a clean printable HTML document
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow pop-ups to download the PDF.');
      return;
    }

    const unitSections = units.map(unit => `
      <div style="page-break-inside: avoid; margin-bottom: 32px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        <div style="background-color: ${unit.color}; color: white; padding: 16px 24px;">
          <div style="font-size: 13px; opacity: 0.9;">Unit ${unit.id} &bull; ${unit.duration}</div>
          <h2 style="font-size: 22px; margin: 4px 0;">${unit.title}: ${unit.subtitle}</h2>
        </div>
        <div style="padding: 20px 24px;">
          <p style="font-size: 14px; color: #475569; margin-bottom: 12px;">${unit.overview}</p>
          <p style="font-size: 14px; color: #1e293b; font-style: italic; margin-bottom: 16px;"><strong>Essential Question:</strong> "${unit.essentialQuestion}"</p>

          <h3 style="font-size: 13px; color: #64748b; text-transform: uppercase; margin-bottom: 8px;">Students Will Be Able To...</h3>
          <ul style="font-size: 13px; color: #475569; margin-bottom: 16px; padding-left: 20px;">
            ${unit.iCanStatements.map(s => `<li style="margin-bottom: 4px;">${s}</li>`).join('')}
          </ul>

          <h3 style="font-size: 13px; color: #64748b; text-transform: uppercase; margin-bottom: 8px;">Lessons</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background-color: #f8fafc;">
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0; width: 30px;">#</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Title</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #e2e8f0;">Concept</th>
              </tr>
            </thead>
            <tbody>
              ${unit.lessons.map(l => `
                <tr>
                  <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9;">${l.num}</td>
                  <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; font-weight: 500;">${l.title}</td>
                  <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9; color: #64748b;">${l.concept}${l.piece ? `<br/><em style="font-size:11px;color:#94a3b8;">${l.piece}</em>` : ''}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="margin-top: 12px; display: flex; gap: 16px; font-size: 12px;">
            <span><strong>Standards:</strong> ${unit.standards.primary.join(', ')}</span>
            <span><strong>Portfolio:</strong> ${unit.portfolioPiece}</span>
          </div>
        </div>
      </div>
    `).join('');

    const monthlySchedule = [
      { month: 'September', content: 'Unit 1: The Loop Lab', weeks: 'Weeks 1–5 + Flex Week', focus: 'Creating' },
      { month: 'October', content: 'Unit 2: The Listening Lab', weeks: 'Weeks 7–11 + Flex Week', focus: 'Responding' },
      { month: 'November', content: 'Unit 3: World Music Workshop', weeks: 'Weeks 13–17 + Flex Week', focus: 'Connecting' },
      { month: 'Dec – Jan', content: 'Unit 4: The Beat Lab', weeks: 'Weeks 19–23 + Winter Break', focus: 'Creating' },
      { month: 'Feb – Mar', content: 'Unit 5: Songwriter\'s Studio', weeks: 'Weeks 24–28 + Flex Week', focus: 'Creating & Performing' },
      { month: 'Apr – May', content: 'Unit 6: Film Scoring Academy', weeks: 'Weeks 30–34 + Flex Week', focus: 'Creating & Connecting' },
      { month: 'June', content: 'Showcase & Review', weeks: 'Weeks 35–36', focus: 'Reflection & Celebration' }
    ];

    const scheduleRows = monthlySchedule.map(({ month, content, weeks, focus }) => {
      return `<tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${month}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${content}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">${weeks}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; color: #64748b;">${focus}</td>
      </tr>`;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>${isEduSite ? 'Music Room Tools' : 'Music Mind Academy'} - Curriculum Guide</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 900px; margin: 0 auto; padding: 40px; color: #1e293b; }
          h1 { font-size: 28px; margin-bottom: 4px; }
          h2 { margin: 0; }
          @media print { body { padding: 20px; } div { page-break-inside: avoid; } }
        </style>
      </head>
      <body>
        <h1>${isEduSite ? 'Music Room Tools' : 'Music Mind Academy'} Curriculum Guide</h1>
        <p style="font-size: 16px; color: #64748b; margin-bottom: 4px;">${overview.subtitle}</p>
        <p style="font-size: 14px; color: #64748b; margin-bottom: 24px;">Grades ${overview.grades} &bull; ${overview.totalUnits} Units &bull; ${overview.totalLessons} Lessons &bull; ~40 min per lesson</p>
        <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 32px;">${overview.description}</p>

        <h2 style="font-size: 20px; margin-bottom: 16px;">Scope & Sequence</h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 32px;">
          <thead>
            <tr style="background-color: #f8fafc;">
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e2e8f0;">Timeframe</th>
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e2e8f0;">Content</th>
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e2e8f0;">Pacing</th>
              <th style="padding: 8px; text-align: left; border-bottom: 2px solid #e2e8f0;">Focus</th>
            </tr>
          </thead>
          <tbody>${scheduleRows}</tbody>
        </table>

        <h2 style="font-size: 20px; margin-bottom: 16px;">Unit Details</h2>
        ${unitSections}
      </body>
      </html>
    `);
    printWindow.document.close();

    // Wait for content to render, then trigger print
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e2e8f0',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: isMobile ? '12px 12px' : '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '16px', minWidth: 0 }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: isMobile ? '8px' : '8px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#64748b',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <ArrowLeft size={18} />
              {!isMobile && 'Back to Units'}
            </button>
            {!isMobile && <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={20} color="#3b82f6" />
              <span style={{ fontSize: isMobile ? '15px' : '18px', fontWeight: '700', color: '#1e293b', whiteSpace: 'nowrap' }}>
                Curriculum Guide
              </span>
            </div>
          </div>
          <button
            onClick={handleDownloadPDF}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: isMobile ? '8px 10px' : '10px 16px',
              backgroundColor: '#3b82f6',
              border: 'none',
              borderRadius: '8px',
              fontSize: isMobile ? '12px' : '14px',
              fontWeight: '600',
              color: 'white',
              cursor: 'pointer',
              flexShrink: 0,
              whiteSpace: 'nowrap'
            }}
          >
            <Download size={16} />
            {isMobile ? 'PDF' : 'Download PDF'}
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: isMobile ? '0 8px' : '0 24px',
          display: 'flex',
          gap: '2px',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'units', label: 'Unit Details' },
            { id: 'standards', label: 'Standards' },
            { id: 'scope', label: 'Scope & Sequence' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: isMobile ? '10px 12px' : '12px 20px',
                whiteSpace: 'nowrap',
                backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? '600' : '500',
                color: activeTab === tab.id ? '#3b82f6' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '16px 12px' : '32px 24px' }}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Hero Section */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: isMobile ? '20px 16px' : '32px',
              marginBottom: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h1 style={{ fontSize: isMobile ? '22px' : '32px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
                {isEduSite ? 'Music Room Tools Curriculum' : overview.title}
              </h1>
              <p style={{ fontSize: isMobile ? '15px' : '18px', color: '#64748b', marginBottom: '24px' }}>
                {overview.subtitle}
              </p>

              {/* Quick Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
                gap: isMobile ? '10px' : '16px',
                marginBottom: '24px'
              }}>
                {[
                  { label: 'Units', value: overview.totalUnits },
                  { label: 'Lessons', value: overview.totalLessons },
                  { label: 'Grades', value: overview.grades },
                  { label: 'Duration', value: overview.duration }
                ].map((stat) => (
                  <div key={stat.label} style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
                      {stat.value}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.7' }}>
                {overview.description}
              </p>
            </div>

            {/* Unit Cards Grid */}
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>
              Unit Overview
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '16px'
            }}>
              {units.map((unit) => (
                <div key={unit.id} style={{
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  borderLeft: `4px solid ${unit.color}`
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '28px' }}>{unit.icon}</span>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: unit.color }}>
                        Unit {unit.id}
                      </div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                        {unit.title}
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '12px' }}>
                    {unit.overview}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#475569',
                      backgroundColor: '#f1f5f9',
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}>
                      {unit.focus}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: unit.color,
                      backgroundColor: `${unit.color}15`,
                      padding: '4px 8px',
                      borderRadius: '4px'
                    }}>
                      {unit.standards.primary.join(', ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Units Tab */}
        {activeTab === 'units' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {units.map((unit) => (
              <div key={unit.id} style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                {/* Unit Header */}
                <div style={{
                  background: `linear-gradient(135deg, ${unit.color}, ${unit.color}dd)`,
                  padding: isMobile ? '16px' : '24px 32px',
                  color: 'white'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '12px' : '16px' }}>
                    <span style={{ fontSize: isMobile ? '32px' : '40px' }}>{unit.icon}</span>
                    <div>
                      <div style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '500', opacity: 0.9 }}>
                        Unit {unit.id} &bull; {unit.duration}
                      </div>
                      <h2 style={{ fontSize: isMobile ? '20px' : '28px', fontWeight: '700', marginBottom: '4px' }}>
                        {unit.title}
                      </h2>
                      <p style={{ fontSize: isMobile ? '14px' : '16px', opacity: 0.9 }}>
                        {unit.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Unit Content */}
                <div style={{ padding: isMobile ? '16px' : '24px 32px' }}>
                  {/* Overview & Essential Question */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
                    gap: isMobile ? '16px' : '24px',
                    marginBottom: '24px'
                  }}>
                    <div>
                      <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
                        Overview
                      </h3>
                      <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.6' }}>
                        {unit.overview}
                      </p>
                    </div>
                    <div style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '12px',
                      padding: '16px',
                      borderLeft: `3px solid ${unit.color}`
                    }}>
                      <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
                        Essential Question
                      </h3>
                      <p style={{ fontSize: '15px', color: '#1e293b', fontStyle: 'italic', fontWeight: '500' }}>
                        "{unit.essentialQuestion}"
                      </p>
                    </div>
                  </div>

                  {/* I Can Statements */}
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase' }}>
                      Students Will Be Able To...
                    </h3>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: '8px'
                    }}>
                      {unit.iCanStatements.map((statement, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '8px',
                          fontSize: '14px',
                          color: '#475569'
                        }}>
                          <Check size={16} color={unit.color} style={{ marginTop: '2px', flexShrink: 0 }} />
                          {statement}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lessons Table */}
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase' }}>
                      Lessons
                    </h3>
                    <div style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}>
                      {unit.lessons.map((lesson, idx) => (
                        <div key={lesson.num} style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px 16px',
                          borderBottom: idx < unit.lessons.length - 1 ? '1px solid #e2e8f0' : 'none'
                        }}>
                          <span style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: unit.color,
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '12px'
                          }}>
                            {lesson.num}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontWeight: '600', color: '#1e293b' }}>{lesson.title}</span>
                            {isMobile ? (
                              <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '2px' }}>{lesson.concept}</div>
                            ) : (
                              <span style={{ color: '#94a3b8', marginLeft: '8px' }}>— {lesson.concept}</span>
                            )}
                            {lesson.piece && (
                              <div style={{ fontSize: '12px', color: '#94a3b8', fontStyle: 'italic', marginTop: '2px' }}>
                                {lesson.piece}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Standards & Portfolio */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: '16px'
                  }}>
                    <div style={{
                      backgroundColor: '#f8fafc',
                      borderRadius: '8px',
                      padding: '16px'
                    }}>
                      <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>
                        Standards Addressed
                      </h3>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {unit.standards.primary.map((std) => (
                          <span key={std} style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: unit.color,
                            backgroundColor: `${unit.color}15`,
                            padding: '4px 10px',
                            borderRadius: '4px'
                          }}>
                            {std}
                          </span>
                        ))}
                      </div>
                      <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>
                        {unit.standards.description}
                      </p>
                    </div>
                    <div style={{
                      backgroundColor: '#fef3c7',
                      borderRadius: '8px',
                      padding: '16px'
                    }}>
                      <h3 style={{ fontSize: '13px', fontWeight: '600', color: '#92400e', marginBottom: '8px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Award size={14} />
                        Portfolio Piece
                      </h3>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#78350f' }}>
                        {unit.portfolioPiece}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Standards Tab */}
        {activeTab === 'standards' && (
          <div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: isMobile ? '20px 16px' : '32px',
              marginBottom: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
                National Core Arts Standards Alignment
              </h2>
              <p style={{ fontSize: isMobile ? '14px' : '15px', color: '#64748b', marginBottom: '24px' }}>
                This curriculum is fully aligned with the National Core Arts Standards for Music (2014).
                Each unit addresses specific anchor standards across the four artistic processes.
              </p>

              {/* Standards Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: isMobile ? '16px' : '20px'
              }}>
                {Object.values(standards).map((category) => (
                  <div key={category.code} style={{
                    backgroundColor: '#f8fafc',
                    borderRadius: '12px',
                    padding: '20px',
                    borderTop: `4px solid ${category.color}`
                  }}>
                    <div style={{
                      fontSize: '18px',
                      fontWeight: '700',
                      color: category.color,
                      marginBottom: '4px'
                    }}>
                      {category.code}
                    </div>
                    <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                      {category.description}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                      {category.standards.map((std) => (
                        <div key={std.code} style={{
                          backgroundColor: 'white',
                          padding: '10px 12px',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0'
                        }}>
                          <div style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: category.color
                          }}>
                            {std.code}: {std.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>
                            {std.description}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      <strong>Covered in Units:</strong> {category.coveredIn.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coverage Matrix */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: isMobile ? '16px 12px' : '32px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>
                Standards Coverage by Unit
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Standard</th>
                      {units.map((unit) => (
                        <th key={unit.id} style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e2e8f0', minWidth: '80px' }}>
                          <div style={{ fontSize: '16px' }}>{unit.icon}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>Unit {unit.id}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {['Cr1', 'Cr2', 'Cr3', 'Pr4', 'Pr5', 'Pr6', 'Re7', 'Re8', 'Re9', 'Cn10', 'Cn11'].map((std) => (
                      <tr key={std}>
                        <td style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0', fontWeight: '500' }}>
                          {std}
                        </td>
                        {units.map((unit) => {
                          const hasStandard = unit.standards.primary.some(s => s.includes(std));
                          return (
                            <td key={unit.id} style={{ padding: '10px 12px', textAlign: 'center', borderBottom: '1px solid #e2e8f0' }}>
                              {hasStandard ? (
                                <Check size={18} color="#22c55e" />
                              ) : (
                                <span style={{ color: '#e2e8f0' }}>—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Scope & Sequence Tab */}
        {activeTab === 'scope' && (
          <div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: isMobile ? '20px 16px' : '32px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
                Scope & Sequence
              </h2>
              <p style={{ fontSize: '15px', color: '#64748b', marginBottom: '8px' }}>
                A suggested pacing guide for the full school year. One lesson per week, approximately 40 minutes each.
              </p>
              <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '32px' }}>
                Each unit includes a built-in flex week for catch-up, reteaching, or enrichment activities.
              </p>

              {/* Visual Timeline Bar */}
              <div style={{ marginBottom: '32px', overflowX: isMobile ? 'auto' : 'visible', WebkitOverflowScrolling: 'touch' }}>
                <div style={{ minWidth: isMobile ? '500px' : 'auto' }}>
                <div style={{ display: 'flex', marginBottom: '8px' }}>
                  {['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m) => (
                    <div key={m} style={{
                      flex: 1,
                      textAlign: 'center',
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}>
                      {m}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '2px', height: '48px', borderRadius: '8px', overflow: 'hidden' }}>
                  {[
                    { unitId: 1, spans: 6 },
                    { unitId: 2, spans: 6 },
                    { unitId: 3, spans: 6 },
                    { unitId: 4, spans: 6 },
                    { unitId: 5, spans: 6 },
                    { unitId: 6, spans: 6 }
                  ].map(({ unitId, spans }) => {
                    const unit = units.find(u => u.id === unitId);
                    return (
                      <div key={unitId} style={{
                        flex: spans,
                        backgroundColor: unit.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '600',
                        padding: '0 8px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden'
                      }}>
                        <span style={{ fontSize: '16px' }}>{unit.icon}</span>
                        <span>Unit {unit.id}</span>
                      </div>
                    );
                  })}
                  <div style={{
                    flex: 2,
                    backgroundColor: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#64748b'
                  }}>
                    Review
                  </div>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '16px',
                  marginTop: '12px',
                  fontSize: '11px',
                  color: '#94a3b8'
                }}>
                  <span>36 weeks total</span>
                  <span>|</span>
                  <span>30 lessons + 6 flex weeks</span>
                </div>
                </div>
              </div>

              {/* Month-by-Month Breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { month: 'September', unitId: 1, weeks: 'Weeks 1–5', detail: '5 lessons + flex week', extra: null },
                  { month: 'October', unitId: 2, weeks: 'Weeks 7–11', detail: '5 lessons + flex week', extra: null },
                  { month: 'November', unitId: 3, weeks: 'Weeks 13–17', detail: '5 lessons + Thanksgiving flex', extra: null },
                  { month: 'Dec – Jan', unitId: 4, weeks: 'Weeks 19–23', detail: '5 lessons + winter break', extra: 'Winter break falls naturally between lessons' },
                  { month: 'Feb – Mar', unitId: 5, weeks: 'Weeks 24–28', detail: '5 lessons + flex week', extra: null },
                  { month: 'Apr – May', unitId: 6, weeks: 'Weeks 30–34', detail: '5 lessons + flex week', extra: null },
                  { month: 'June', unitId: null, weeks: 'Weeks 35–36', detail: 'Showcase & review', extra: 'Student showcase performances, portfolio review, end-of-year celebration' }
                ].map((period) => {
                  const unit = period.unitId ? units.find(u => u.id === period.unitId) : null;
                  return (
                    <div key={period.month} style={{
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : 'row',
                      alignItems: isMobile ? 'stretch' : 'stretch',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '1px solid #e2e8f0'
                    }}>
                      <div style={{
                        width: isMobile ? 'auto' : '120px',
                        backgroundColor: unit ? `${unit.color}10` : '#f8fafc',
                        borderRight: isMobile ? 'none' : `3px solid ${unit ? unit.color : '#94a3b8'}`,
                        borderBottom: isMobile ? `3px solid ${unit ? unit.color : '#94a3b8'}` : 'none',
                        padding: isMobile ? '10px 14px' : '14px 16px',
                        display: 'flex',
                        flexDirection: isMobile ? 'row' : 'column',
                        alignItems: isMobile ? 'center' : 'flex-start',
                        gap: isMobile ? '8px' : '0',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                          {period.month}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: isMobile ? '0' : '2px' }}>
                          {period.weeks}
                        </div>
                      </div>
                      <div style={{
                        flex: 1,
                        padding: isMobile ? '12px 14px' : '14px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        backgroundColor: 'white'
                      }}>
                        {unit ? (
                          <>
                            <span style={{ fontSize: '28px' }}>{unit.icon}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '12px', fontWeight: '600', color: unit.color }}>
                                  Unit {unit.id}
                                </span>
                                <span style={{
                                  fontSize: '10px',
                                  fontWeight: '600',
                                  color: '#64748b',
                                  backgroundColor: '#f1f5f9',
                                  padding: '2px 6px',
                                  borderRadius: '4px'
                                }}>
                                  {unit.focus}
                                </span>
                              </div>
                              <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b', marginTop: '2px' }}>
                                {unit.title}: {unit.subtitle}
                              </div>
                              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                                {period.detail}{period.extra ? ` — ${period.extra}` : ''}
                              </div>
                            </div>
                            <div style={{
                              display: isMobile ? 'none' : 'flex',
                              gap: '3px',
                              flexShrink: 0
                            }}>
                              {[1,2,3,4,5].map(n => (
                                <div key={n} style={{
                                  width: '8px',
                                  height: '24px',
                                  borderRadius: '3px',
                                  backgroundColor: unit.color,
                                  opacity: 0.6 + (n * 0.08)
                                }} title={`Lesson ${n}`} />
                              ))}
                              <div style={{
                                width: '8px',
                                height: '24px',
                                borderRadius: '3px',
                                backgroundColor: '#e2e8f0'
                              }} title="Flex week" />
                            </div>
                          </>
                        ) : (
                          <>
                            <span style={{ fontSize: '28px' }}>🎉</span>
                            <div>
                              <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>
                                Showcase & Review
                              </div>
                              <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                                {period.extra}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Full Lesson Table */}
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginTop: '32px', marginBottom: '16px' }}>
                Complete Lesson List
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Week</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Unit</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Lesson</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Title</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Concept</th>
                    </tr>
                  </thead>
                  <tbody>
                    {units.flatMap((unit, unitIdx) => {
                      const baseWeek = unitIdx * 6 + 1;
                      return [
                        ...unit.lessons.map((lesson, idx) => (
                          <tr key={`${unit.id}-${lesson.num}`} style={{
                            backgroundColor: idx === 0 ? `${unit.color}08` : 'white'
                          }}>
                            <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: '500' }}>
                              {baseWeek + idx}
                            </td>
                            {idx === 0 && (
                              <td rowSpan={unit.lessons.length + 1} style={{
                                padding: '12px',
                                borderBottom: '1px solid #e2e8f0',
                                verticalAlign: 'top',
                                fontWeight: '600',
                                color: unit.color
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '20px' }}>{unit.icon}</span>
                                  {unit.title}
                                </div>
                              </td>
                            )}
                            <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0' }}>
                              {lesson.num}
                            </td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', fontWeight: '500' }}>
                              {lesson.title}
                            </td>
                            <td style={{ padding: '12px', borderBottom: '1px solid #e2e8f0', color: '#64748b' }}>
                              {lesson.concept}
                              {lesson.piece && (
                                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', fontStyle: 'italic' }}>
                                  {lesson.piece}
                                </div>
                              )}
                            </td>
                          </tr>
                        )),
                        <tr key={`${unit.id}-flex`} style={{ backgroundColor: '#f8fafc' }}>
                          <td style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', color: '#94a3b8', fontWeight: '500' }}>
                            {baseWeek + 5}
                          </td>
                          <td colSpan={3} style={{ padding: '12px', borderBottom: '2px solid #e2e8f0', color: '#94a3b8', fontStyle: 'italic' }}>
                            Flex week — catch-up, reteaching, or enrichment
                          </td>
                        </tr>
                      ];
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        backgroundColor: 'white',
        borderTop: '1px solid #e2e8f0',
        padding: '24px',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '14px', color: '#64748b' }}>
          Full curriculum available <strong>August 2026</strong>.
          {!isEduSite && <>Questions? Contact <a href="mailto:rob@musicmindacademy.com" style={{ color: '#3b82f6' }}>rob@musicmindacademy.com</a></>}
        </p>
      </div>
    </div>
  );
}

export default CurriculumGuide;
