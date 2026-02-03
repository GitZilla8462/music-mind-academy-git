// File: /pages/CurriculumGuide.jsx
// Comprehensive Curriculum Guide - Standards, Units, and Scope & Sequence
// Reference page for teachers

import React, { useState } from 'react';
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
    duration: 'Full Year (~36 weeks)',
    description: 'A standards-aligned curriculum that takes students from listening and responding to creating and performing. Students progress through six units, building skills in critical listening, cultural awareness, rhythm creation, media composition, songwriting, and film scoring.'
  },
  units: [
    {
      id: 1,
      title: 'The Listening Lab',
      subtitle: 'Elements of Music',
      icon: '🎧',
      color: '#8b5cf6',
      focus: 'Responding',
      duration: '~6 weeks',
      overview: 'Students develop critical listening skills by identifying instruments, dynamics, texture, and form in orchestral and popular music.',
      essentialQuestion: 'How do the elements of music work together to create meaning and emotion?',
      standards: {
        primary: ['MU:Re7.2', 'MU:Re8.1', 'MU:Re9.1'],
        description: 'Responding standards - analyzing and evaluating music'
      },
      iCanStatements: [
        'I can identify instruments by their sound (timbre)',
        'I can describe dynamics (loud/soft) and tempo (fast/slow) using music vocabulary',
        'I can recognize texture changes in music (thick/thin)',
        'I can identify form and structure (ABA, verse-chorus, rondo)',
        'I can analyze how composers use elements to create emotion'
      ],
      portfolioPiece: 'Comprehensive Listening Map Analysis',
      lessons: [
        { num: 1, title: 'Meet the Orchestra', concept: 'Instruments & Timbre' },
        { num: 2, title: 'Volume & Speed', concept: 'Dynamics & Tempo' },
        { num: 3, title: 'Thick or Thin', concept: 'Texture & Layers' },
        { num: 4, title: 'Section Spotter', concept: 'Form & Structure' },
        { num: 5, title: 'The Full Picture', concept: 'Putting It All Together' }
      ]
    },
    {
      id: 2,
      title: 'Music Around the World',
      subtitle: 'Global Sounds & Cultures',
      icon: '🌍',
      color: '#14b8a6',
      focus: 'Connecting',
      duration: '~6 weeks',
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
      id: 3,
      title: 'Beat Lab',
      subtitle: 'Rhythm & Groove',
      icon: '🥁',
      color: '#ef4444',
      focus: 'Creating',
      duration: '~6 weeks',
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
      id: 4,
      title: 'Music for Media',
      subtitle: 'Loop-Based Composition',
      icon: '🎬',
      color: '#3b82f6',
      focus: 'Creating',
      duration: '~6 weeks',
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
      id: 5,
      title: 'Song Lab',
      subtitle: 'Melody & Structure',
      icon: '🎵',
      color: '#ec4899',
      focus: 'Creating + Performing',
      duration: '~6 weeks',
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
      duration: '~6 weeks',
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
      coveredIn: [3, 4, 5, 6]
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
      coveredIn: [1, 2]
    },
    connecting: {
      code: 'Connecting (Cn)',
      color: '#14b8a6',
      description: 'Relate music to personal experience, culture, and other disciplines',
      standards: [
        { code: 'Cn10', name: 'Synthesize', description: 'Synthesize knowledge to create music' },
        { code: 'Cn11', name: 'Relate', description: 'Relate music to culture, history, and context' }
      ],
      coveredIn: [2, 4, 6]
    }
  }
};

function CurriculumGuide() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { overview, units, standards } = CURRICULUM_DATA;

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
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#64748b',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={18} />
              Back to Units
            </button>
            <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={20} color="#3b82f6" />
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
                Curriculum Guide
              </span>
            </div>
          </div>
          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              backgroundColor: '#3b82f6',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            <Download size={16} />
            Download PDF
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          display: 'flex',
          gap: '4px'
        }}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'units', label: 'Unit Details' },
            { id: 'standards', label: 'Standards Alignment' },
            { id: 'scope', label: 'Scope & Sequence' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
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
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Hero Section */}
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              marginBottom: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
                {overview.title}
              </h1>
              <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '24px' }}>
                {overview.subtitle}
              </p>

              {/* Quick Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '16px',
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
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
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
                  padding: '24px 32px',
                  color: 'white'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '40px' }}>{unit.icon}</span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500', opacity: 0.9 }}>
                        Unit {unit.id} &bull; {unit.duration}
                      </div>
                      <h2 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>
                        {unit.title}
                      </h2>
                      <p style={{ fontSize: '16px', opacity: 0.9 }}>
                        {unit.subtitle}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Unit Content */}
                <div style={{ padding: '24px 32px' }}>
                  {/* Overview & Essential Question */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr',
                    gap: '24px',
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
                      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
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
                          <div style={{ flex: 1 }}>
                            <span style={{ fontWeight: '600', color: '#1e293b' }}>{lesson.title}</span>
                            <span style={{ color: '#94a3b8', marginLeft: '8px' }}>— {lesson.concept}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Standards & Portfolio */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
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
              padding: '32px',
              marginBottom: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
                National Core Arts Standards Alignment
              </h2>
              <p style={{ fontSize: '15px', color: '#64748b', marginBottom: '24px' }}>
                This curriculum is fully aligned with the National Core Arts Standards for Music (2014).
                Each unit addresses specific anchor standards across the four artistic processes.
              </p>

              {/* Standards Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '20px'
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
              padding: '32px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>
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
              padding: '32px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '8px' }}>
                Scope & Sequence
              </h2>
              <p style={{ fontSize: '15px', color: '#64748b', marginBottom: '24px' }}>
                A suggested pacing guide for the full school year. Each unit is designed for approximately 6 weeks.
              </p>

              {/* Timeline */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { quarter: 'Q1 (Sept-Oct)', units: [1] },
                  { quarter: 'Q2 (Nov-Dec)', units: [2] },
                  { quarter: 'Q3 (Jan-Mar)', units: [3, 4] },
                  { quarter: 'Q4 (Apr-Jun)', units: [5, 6] }
                ].map((period) => (
                  <div key={period.quarter} style={{
                    display: 'flex',
                    alignItems: 'stretch',
                    gap: '16px'
                  }}>
                    <div style={{
                      width: '140px',
                      backgroundColor: '#1e293b',
                      color: 'white',
                      padding: '16px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '600',
                      fontSize: '14px',
                      flexShrink: 0
                    }}>
                      {period.quarter}
                    </div>
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      gap: '12px'
                    }}>
                      {period.units.map((unitId) => {
                        const unit = units.find(u => u.id === unitId);
                        return (
                          <div key={unitId} style={{
                            flex: 1,
                            backgroundColor: '#f8fafc',
                            borderRadius: '8px',
                            padding: '16px',
                            borderLeft: `4px solid ${unit.color}`,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                          }}>
                            <span style={{ fontSize: '28px' }}>{unit.icon}</span>
                            <div>
                              <div style={{ fontSize: '12px', color: unit.color, fontWeight: '600' }}>
                                Unit {unit.id}
                              </div>
                              <div style={{ fontSize: '15px', fontWeight: '600', color: '#1e293b' }}>
                                {unit.title}
                              </div>
                              <div style={{ fontSize: '12px', color: '#64748b' }}>
                                {unit.focus} • 5 Lessons
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Full Lesson Table */}
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1e293b', marginTop: '32px', marginBottom: '16px' }}>
                Complete Lesson List
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8fafc' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Unit</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Lesson</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Title</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Concept</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Focus</th>
                    </tr>
                  </thead>
                  <tbody>
                    {units.flatMap((unit) =>
                      unit.lessons.map((lesson, idx) => (
                        <tr key={`${unit.id}-${lesson.num}`} style={{
                          backgroundColor: idx === 0 ? `${unit.color}08` : 'white'
                        }}>
                          {idx === 0 && (
                            <td rowSpan={unit.lessons.length} style={{
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
                          </td>
                          {idx === 0 && (
                            <td rowSpan={unit.lessons.length} style={{
                              padding: '12px',
                              borderBottom: '1px solid #e2e8f0',
                              verticalAlign: 'top'
                            }}>
                              <span style={{
                                fontSize: '11px',
                                fontWeight: '600',
                                color: unit.color,
                                backgroundColor: `${unit.color}15`,
                                padding: '4px 8px',
                                borderRadius: '4px'
                              }}>
                                {unit.focus}
                              </span>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
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
          Questions? Contact <a href="mailto:rob@musicmindacademy.com" style={{ color: '#3b82f6' }}>rob@musicmindacademy.com</a>
        </p>
      </div>
    </div>
  );
}

export default CurriculumGuide;
