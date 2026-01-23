/**
 * FILE: robot-melody-maker/components/RobotAvatar.jsx
 *
 * Dancing Robot with multiple dance styles!
 * - Dance moves sync to tempo
 * - Pitch controls move height/intensity
 * - Multiple dance styles to choose from
 *
 * ✅ FIXED: Arms now bend INWARD correctly (not outward)
 * ✅ FIXED: Tighter spring physics so arms feel connected
 * ✅ FIXED: Better elbow tracking - forearm follows upper arm naturally
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import * as PIXI from 'pixi.js';
import styles from './RobotAvatar.module.css';

// Convert hex color to number for PIXI
const hexToNumber = (hex) => {
  if (!hex) return 0x8B5CF6;
  return parseInt(hex.replace('#', ''), 16);
};

// Lighten/darken color
const adjustColor = (hex, amount) => {
  const num = hexToNumber(hex);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return (r << 16) | (g << 8) | b;
};

// Lerp helper
const lerp = (current, target, ease = 0.15) => {
  return current + (target - current) * ease;
};

// Easing functions for smoother animation
const easeInOutQuad = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const easeOutBack = (t) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2);

// === SPRING PHYSICS FOR NATURAL ARM MOVEMENT ===
const springPhysics = (current, target, velocity, config) => {
  const { stiffness, damping, mass = 1 } = config;
  
  const displacement = current - target;
  const springForce = -stiffness * displacement;
  const dampingForce = -damping * velocity;
  const acceleration = (springForce + dampingForce) / mass;
  
  const newVelocity = velocity + acceleration;
  const newPosition = current + newVelocity;
  
  return { position: newPosition, velocity: newVelocity };
};

// ✅ FIXED: Tighter spring configs - arms feel more connected now
const getSpringConfig = (danceStyle) => {
  switch (danceStyle) {
    case 'robot':
      // Snappy mechanical feel
      return { forearm: { stiffness: 0.4, damping: 0.5 }, wrist: { stiffness: 0.5, damping: 0.6 } };
    case 'disco':
    case 'hipHop':
      // Nice snap with slight overshoot
      return { forearm: { stiffness: 0.25, damping: 0.4 }, wrist: { stiffness: 0.3, damping: 0.45 } };
    case 'wave':
    case 'smooth':
      // Flowy but still connected
      return { forearm: { stiffness: 0.15, damping: 0.35 }, wrist: { stiffness: 0.12, damping: 0.3 } };
    case 'silly':
    case 'hyper':
      // Bouncy energy
      return { forearm: { stiffness: 0.3, damping: 0.35 }, wrist: { stiffness: 0.25, damping: 0.3 } };
    case 'headbang':
    case 'bounce':
      // Punchy with bounce
      return { forearm: { stiffness: 0.3, damping: 0.4 }, wrist: { stiffness: 0.25, damping: 0.35 } };
    case 'swagger':
      // Cool and smooth
      return { forearm: { stiffness: 0.18, damping: 0.38 }, wrist: { stiffness: 0.15, damping: 0.35 } };
    case 'glitch':
      // Snappy with weird bounce
      return { forearm: { stiffness: 0.35, damping: 0.3 }, wrist: { stiffness: 0.3, damping: 0.28 } };
    default:
      // Default medium spring
      return { forearm: { stiffness: 0.25, damping: 0.4 }, wrist: { stiffness: 0.2, damping: 0.4 } };
  }
};

const RobotAvatar = ({
  config,
  animationState,
  isPlaying,
  tempo = 120,
  previewDance = false,
  size = 'normal', // 'normal' (280x350) or 'small' (140x175)
  isActive = true, // For split view - highlights active robot
}) => {
  // Size configurations
  const sizeConfig = size === 'small'
    ? { width: 140, height: 175, robotX: 70, robotY: 95, scale: 0.5 }
    : { width: 280, height: 350, robotX: 140, robotY: 190, scale: 1 };
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const robotRef = useRef(null);
  const animationFrameRef = useRef(null);
  const isInitializedRef = useRef(false);
  const isLowEndRef = useRef(false); // ✅ Track for conditional particle rendering

  // ✅ CHROMEBOOK OPTIMIZATION: Reusable graphics objects (avoid destroy/create cycle)
  const graphicsRef = useRef({
    shadow: null,
    leftLeg: null,
    rightLeg: null,
    body: null,
    pattern: null,
    leftArm: null,
    rightArm: null,
    head: null,
    accessory: null,
    eyeSlants: [], // For angry eyes
  });
  
  // Dance state
  const dance = useRef({
    time: 0,
    beatTime: 0,
    
    // Body positions
    bodyY: 0,
    bodyRotation: 0,
    headTilt: 0,
    headBob: 0,
    
    // Arms - upper arm angles (degrees, 0 = down, negative = up)
    leftArmAngle: 25,
    rightArmAngle: 25,
    leftArmTarget: 25,
    rightArmTarget: 25,
    
    // ✅ Forearms - BEND amount relative to upper arm (radians, positive = bent inward)
    leftForearmAngle: 0.4,
    rightForearmAngle: 0.4,
    leftForearmVelocity: 0,
    rightForearmVelocity: 0,
    leftForearmTarget: 0.4,
    rightForearmTarget: 0.4,
    
    // Wrists - extra follow-through
    leftWristAngle: 0,
    rightWristAngle: 0,
    leftWristVelocity: 0,
    rightWristVelocity: 0,
    
    // Legs
    leftLegAngle: 0,
    rightLegAngle: 0,
    crouch: 0,
    
    // Effects
    bounce: 0,
    sway: 0,
    
    // Current state
    pitch: 0.5,
    intensity: 0,
  });
  
  const previewRef = useRef(previewDance);

  // Config
  const safeConfig = config || {};
  const {
    bodyColor = '#8B5CF6',
    bodyShape = 'blob',
    eyeStyle = 'big',
    mouthStyle = 'happy',
    accessory = 'none',
    pattern = 'none',
    danceStyle = 'robot',
  } = safeConfig;

  const configRef = useRef({ bodyColor, bodyShape, eyeStyle, mouthStyle, accessory, pattern, danceStyle });
  useEffect(() => {
    configRef.current = { bodyColor, bodyShape, eyeStyle, mouthStyle, accessory, pattern, danceStyle };
  }, [bodyColor, bodyShape, eyeStyle, mouthStyle, accessory, pattern, danceStyle]);

  const tempoRef = useRef(tempo);
  const isPlayingRef = useRef(isPlaying);
  const animStateRef = useRef(animationState);
  
  useEffect(() => { tempoRef.current = tempo; }, [tempo]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { animStateRef.current = animationState; }, [animationState]);
  useEffect(() => { previewRef.current = previewDance; }, [previewDance]);

  // Initialize PIXI with Chromebook optimizations
  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return;

    // Track if component is still mounted during async init
    let isMounted = true;

    const initPixi = async () => {
      const app = new PIXI.Application();

      // Detect if we're on a Chromebook or low-end device
      const isChromebook = /CrOS/.test(navigator.userAgent);
      const isLowEnd = navigator.hardwareConcurrency <= 4 || isChromebook;

      // Use lower resolution and disable antialias for Chromebooks
      const resolution = isLowEnd ? 1 : Math.min(window.devicePixelRatio || 1, 2);

      await app.init({
        width: sizeConfig.width,
        height: sizeConfig.height,
        backgroundAlpha: 0,
        antialias: !isLowEnd && size !== 'small', // Disable antialias on Chromebooks and small views
        resolution: resolution,
        autoDensity: true,
        powerPreference: isLowEnd ? 'low-power' : 'high-performance',
      });

      // Check if component unmounted during async init - prevents NotFoundError
      if (!isMounted || !containerRef.current) {
        app.destroy(true);
        return;
      }

      containerRef.current.appendChild(app.canvas);
      appRef.current = app;

      // Store performance mode for animation throttling
      appRef.current.isLowEnd = isLowEnd;
      appRef.current.isSmall = size === 'small';
      isLowEndRef.current = isLowEnd; // ✅ Store for particle rendering

      // Dev logging for performance mode detection (only for normal size to reduce spam)
      if (import.meta.env.DEV && size === 'normal') {
        console.log(`🤖 Robot Avatar Init:`, {
          isChromebook,
          isLowEnd,
          resolution,
          antialias: !isLowEnd,
          cores: navigator.hardwareConcurrency,
          userAgent: navigator.userAgent.substring(0, 50) + '...',
        });
      }

      const robot = new PIXI.Container();
      robot.x = sizeConfig.robotX;
      robot.y = sizeConfig.robotY;
      robot.scale.set(sizeConfig.scale);
      app.stage.addChild(robot);
      robotRef.current = robot;

      isInitializedRef.current = true;
      startAnimationLoop();
    };

    initPixi();

    return () => {
      // Mark as unmounted to prevent async init from continuing
      isMounted = false;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true });
        appRef.current = null;
      }
      // Reset graphics refs (objects destroyed by app.destroy)
      graphicsRef.current = {
        shadow: null, leftLeg: null, rightLeg: null, body: null,
        pattern: null, leftArm: null, rightArm: null, head: null,
        accessory: null, eyeSlants: [],
      };
      isInitializedRef.current = false;
    };
  }, []);

  // Calculate dance moves
  const updateDance = useCallback(() => {
    const d = dance.current;
    const playing = isPlayingRef.current;
    const preview = previewRef.current;
    const anim = animStateRef.current;
    const currentTempo = tempoRef.current;
    const { danceStyle } = configRef.current;
    
    const beatSpeed = currentTempo / 60 / 120;
    d.time += 0.016;
    
    if (playing || preview) {
      d.beatTime += beatSpeed;
    }
    
    const shouldDance = (playing && anim?.singing) || preview;
    
    const pitch = anim?.pitch ?? 3.5;
    const targetPitch = 1 - (pitch / 7);
    const previewPitch = preview ? 0.5 + Math.sin(d.time * 0.3) * 0.4 : targetPitch;
    // ✅ SMOOTHER pitch transitions (was 0.1, now 0.03) - prevents jolty movements
    d.pitch = lerp(d.pitch, shouldDance ? previewPitch : 0.5, 0.03);
    
    const targetIntensity = shouldDance ? 1 : 0;
    // ✅ SMOOTHER intensity ramp (was 0.08, now 0.04)
    d.intensity = lerp(d.intensity, targetIntensity, 0.04);
    
    if (shouldDance) {
      const beat = d.beatTime * Math.PI * 2;
      const halfBeat = beat * 2;
      const intensity = d.intensity;
      const pitchFactor = d.pitch;
      
      switch (danceStyle) {
        case 'disco':
          d.bounce = Math.abs(Math.sin(halfBeat)) * 20 * intensity;
          d.crouch = 0;
          d.sway = Math.sin(beat) * 15 * intensity;
          d.bodyRotation = Math.sin(beat) * 0.1 * intensity;
          d.headTilt = Math.sin(beat * 2) * 15 * intensity;
          d.headBob = Math.sin(halfBeat) * 5 * intensity;
          if (Math.sin(beat) > 0) {
            d.leftArmTarget = -85;
            d.rightArmTarget = 30;
          } else {
            d.leftArmTarget = 30;
            d.rightArmTarget = -85;
          }
          d.leftLegAngle = Math.sin(beat) * 20 * intensity;
          d.rightLegAngle = Math.sin(beat + Math.PI) * 20 * intensity;
          break;
          
        case 'hiphop':
          d.bounce = Math.abs(Math.sin(halfBeat)) * 25 * intensity;
          d.crouch = 20 * intensity;
          d.sway = Math.sin(beat * 0.5) * 10 * intensity;
          d.bodyRotation = Math.sin(beat) * 0.05 * intensity;
          d.headTilt = Math.sin(beat) * 8 * intensity;
          d.headBob = Math.abs(Math.sin(halfBeat)) * 10 * intensity;
          const hipHopPhase = Math.sin(beat);
          if (hipHopPhase > 0.3) {
            d.leftArmTarget = 20;
            d.rightArmTarget = 20;
          } else if (hipHopPhase < -0.3) {
            d.leftArmTarget = -75;
            d.rightArmTarget = -75;
          } else {
            d.leftArmTarget = -30;
            d.rightArmTarget = -30;
          }
          d.leftLegAngle = Math.sin(halfBeat) * 12 * intensity;
          d.rightLegAngle = Math.sin(halfBeat + Math.PI) * 12 * intensity;
          break;
          
        case 'silly':
          d.bounce = (Math.sin(halfBeat) + Math.sin(beat * 3)) * 15 * intensity;
          d.crouch = Math.abs(Math.sin(beat * 1.5)) * 20 * intensity;
          d.sway = (Math.sin(beat) + Math.sin(beat * 2.5) * 0.5) * 20 * intensity;
          d.bodyRotation = Math.sin(beat * 1.7) * 0.15 * intensity;
          d.headTilt = Math.sin(beat * 2.3) * 25 * intensity;
          d.headBob = Math.sin(beat * 3) * 15 * intensity;
          d.leftArmTarget = Math.sin(beat * 1.3) * 90;
          d.rightArmTarget = Math.sin(beat * 1.7 + 1) * 90;
          d.leftLegAngle = Math.sin(beat * 1.5) * 25 * intensity;
          d.rightLegAngle = Math.sin(beat * 1.8) * 25 * intensity;
          break;
          
        case 'wave':
          d.bounce = Math.sin(beat) * 10 * intensity;
          d.crouch = Math.sin(beat * 0.5) * 10 * intensity;
          d.sway = Math.sin(beat * 0.7) * 12 * intensity;
          d.bodyRotation = Math.sin(beat * 0.5) * 0.08 * intensity;
          d.headTilt = Math.sin(beat * 0.8) * 10 * intensity;
          d.headBob = Math.sin(beat * 0.6) * 8 * intensity;
          d.leftArmTarget = Math.sin(beat) * 85;
          d.rightArmTarget = Math.sin(beat + Math.PI * 0.5) * 85;
          d.leftLegAngle = Math.sin(beat * 0.5) * 10 * intensity;
          d.rightLegAngle = Math.sin(beat * 0.5 + Math.PI) * 10 * intensity;
          break;
          
        case 'bounce':
          d.bounce = Math.abs(Math.sin(halfBeat)) * 35 * intensity;
          d.crouch = Math.max(0, -Math.sin(halfBeat) * 15) * intensity;
          d.sway = Math.sin(beat * 2) * 5 * intensity;
          d.bodyRotation = 0;
          d.headTilt = Math.sin(beat * 2) * 8 * intensity;
          d.headBob = d.bounce * 0.3;
          const pumpPhase = Math.sin(halfBeat);
          const pumpAngle = pumpPhase > 0 ? -85 : -20;
          d.leftArmTarget = pumpAngle;
          d.rightArmTarget = pumpAngle;
          d.leftLegAngle = Math.sin(halfBeat) * 8 * intensity;
          d.rightLegAngle = Math.sin(halfBeat) * 8 * intensity;
          break;
          
        case 'headbang':
          d.bounce = Math.abs(Math.sin(halfBeat)) * 15 * intensity;
          d.crouch = 10 * intensity;
          d.sway = Math.sin(beat * 0.5) * 5 * intensity;
          d.bodyRotation = Math.sin(beat) * 0.05 * intensity;
          d.headTilt = 0;
          d.headBob = Math.abs(Math.sin(halfBeat * 2)) * 25 * intensity;
          d.leftArmTarget = -75 + Math.sin(halfBeat) * 20;
          d.rightArmTarget = -75 + Math.sin(halfBeat + Math.PI) * 20;
          d.leftLegAngle = Math.sin(beat) * 8 * intensity;
          d.rightLegAngle = Math.sin(beat + Math.PI) * 8 * intensity;
          break;
          
        case 'smooth':
          d.bounce = Math.sin(beat * 0.5) * 8 * intensity;
          d.crouch = 5 * intensity;
          d.sway = Math.sin(beat * 0.5) * 10 * intensity;
          d.bodyRotation = Math.sin(beat * 0.25) * 0.06 * intensity;
          d.headTilt = Math.sin(beat * 0.5) * 8 * intensity;
          d.headBob = Math.sin(beat) * 4 * intensity;
          d.leftArmTarget = -40 + Math.sin(beat * 0.5) * 50;
          d.rightArmTarget = -40 + Math.sin(beat * 0.5 + Math.PI) * 50;
          d.leftLegAngle = Math.sin(beat * 0.5) * 8 * intensity;
          d.rightLegAngle = Math.sin(beat * 0.5 + Math.PI) * 8 * intensity;
          break;
          
        case 'hyper':
          d.bounce = Math.abs(Math.sin(halfBeat * 2)) * 30 * intensity;
          d.crouch = Math.abs(Math.sin(beat * 2)) * 15 * intensity;
          d.sway = Math.sin(beat * 2) * 15 * intensity;
          d.bodyRotation = Math.sin(beat * 2) * 0.1 * intensity;
          d.headTilt = Math.sin(beat * 3) * 15 * intensity;
          d.headBob = Math.sin(halfBeat * 2) * 12 * intensity;
          d.leftArmTarget = Math.sin(beat * 2) * 95;
          d.rightArmTarget = Math.sin(beat * 2 + Math.PI) * 95;
          d.leftLegAngle = Math.sin(beat * 2) * 20 * intensity;
          d.rightLegAngle = Math.sin(beat * 2 + Math.PI) * 20 * intensity;
          break;
          
        case 'chill':
          d.bounce = Math.sin(beat * 0.25) * 5 * intensity;
          d.crouch = 0;
          d.sway = Math.sin(beat * 0.25) * 8 * intensity;
          d.bodyRotation = Math.sin(beat * 0.25) * 0.04 * intensity;
          d.headTilt = Math.sin(beat * 0.3) * 6 * intensity;
          d.headBob = Math.sin(beat * 0.5) * 4 * intensity;
          d.leftArmTarget = -25 + Math.sin(beat * 0.25) * 45;
          d.rightArmTarget = -25 + Math.sin(beat * 0.25 + Math.PI * 0.5) * 45;
          d.leftLegAngle = Math.sin(beat * 0.25) * 5 * intensity;
          d.rightLegAngle = Math.sin(beat * 0.25 + Math.PI) * 5 * intensity;
          break;
          
        case 'glitch':
          const glitchPhase = Math.floor(d.beatTime * 4) % 8;
          const glitchFreeze = glitchPhase === 3 || glitchPhase === 7;
          if (!glitchFreeze) {
            d.bounce = Math.abs(Math.sin(halfBeat)) * 20 * intensity;
            d.sway = (Math.random() > 0.7 ? Math.random() * 20 - 10 : Math.sin(beat) * 10) * intensity;
            d.bodyRotation = Math.sin(beat * 2) * 0.08 * intensity;
            d.headTilt = Math.random() > 0.8 ? (Math.random() * 30 - 15) * intensity : Math.sin(beat) * 10 * intensity;
            d.headBob = Math.sin(halfBeat) * 10 * intensity;
            const glitchArmL = Math.random() > 0.85 ? -90 : Math.sin(beat) * 60;
            const glitchArmR = Math.random() > 0.85 ? -90 : Math.sin(beat + Math.PI) * 60;
            d.leftArmTarget = glitchArmL;
            d.rightArmTarget = glitchArmR;
          }
          d.crouch = 0;
          d.leftLegAngle = Math.sin(beat) * 10 * intensity;
          d.rightLegAngle = Math.sin(beat + Math.PI) * 10 * intensity;
          break;
          
        case 'swagger':
          d.bounce = Math.abs(Math.sin(beat)) * 12 * intensity;
          d.crouch = 8 * intensity;
          d.sway = Math.sin(beat * 0.5) * 15 * intensity;
          d.bodyRotation = Math.sin(beat * 0.5) * 0.1 * intensity;
          d.headTilt = -Math.sin(beat * 0.5) * 12 * intensity;
          d.headBob = Math.sin(beat) * 6 * intensity;
          const swagPhase = Math.sin(beat * 0.5);
          if (swagPhase > 0) {
            d.leftArmTarget = -70 + Math.sin(beat) * 25;
            d.rightArmTarget = 35;
          } else {
            d.leftArmTarget = 35;
            d.rightArmTarget = -70 + Math.sin(beat) * 25;
          }
          d.leftLegAngle = Math.sin(beat * 0.5) * 12 * intensity;
          d.rightLegAngle = Math.sin(beat * 0.5 + Math.PI) * 8 * intensity;
          break;
          
        default: // 'robot'
          // ✅ CONSISTENT dancing - reduced pitch dependency to prevent jolts
          d.bounce = Math.abs(Math.sin(halfBeat)) * 18 * intensity;
          d.crouch = 12 * intensity;
          d.sway = Math.sin(beat) * 8 * intensity;
          d.bodyRotation = Math.sin(beat) * 0.08 * intensity;
          d.headBob = Math.sin(halfBeat) * 8 * intensity;
          d.headTilt = Math.sin(beat * 0.5) * 12 * intensity;
          
          // ✅ Consistent arm movement - smooth wave pattern, no sudden style switches
          d.leftArmTarget = Math.sin(beat) * 70;
          d.rightArmTarget = Math.sin(beat + Math.PI) * 70;
          
          d.leftLegAngle = Math.sin(beat) * 15 * intensity;
          d.rightLegAngle = Math.sin(beat + Math.PI) * 15 * intensity;
          break;
      }
      
    } else {
      // === IDLE ===
      const idleTime = d.time * 0.5;
      
      d.bounce = Math.sin(idleTime * 2) * 2;
      d.crouch = 0;
      d.sway = Math.sin(idleTime) * 2;
      d.bodyRotation = Math.sin(idleTime * 0.7) * 0.02;
      d.headBob = Math.sin(idleTime * 1.5) * 2;
      d.headTilt = Math.sin(idleTime * 0.8) * 3;
      d.leftArmTarget = 25;
      d.rightArmTarget = 25;
      d.leftLegAngle = 0;
      d.rightLegAngle = 0;
    }
    
    // Smooth arm movement
    d.leftArmAngle = lerp(d.leftArmAngle, d.leftArmTarget, 0.12);
    d.rightArmAngle = lerp(d.rightArmAngle, d.rightArmTarget, 0.12);
    
    // === SPRING PHYSICS FOR FOREARMS ===
    const springConfig = getSpringConfig(danceStyle);
    
    // ✅ FIXED: Forearm bend follows upper arm movement naturally
    // When arm swings up fast, forearm lags behind (more bend)
    // When arm swings down, forearm extends (less bend)
    const leftArmRad = d.leftArmAngle * Math.PI / 180;
    const rightArmRad = d.rightArmAngle * Math.PI / 180;
    
    // Calculate arm angular velocity (how fast the arm is moving)
    const leftArmVelocity = (d.leftArmTarget - d.leftArmAngle) * 0.1;
    const rightArmVelocity = (d.rightArmTarget - d.rightArmAngle) * 0.1;
    
    // Base bend + extra bend when arm is raised + lag from velocity
    // Arm up (negative angle) = more bend, arm down = less bend
    const baseBend = 0.4; // Natural resting bend (~23 degrees)
    const leftBendTarget = baseBend + Math.max(0, -leftArmRad) * 0.5 + Math.abs(leftArmVelocity) * 2;
    const rightBendTarget = baseBend + Math.max(0, -rightArmRad) * 0.5 + Math.abs(rightArmVelocity) * 2;
    
    d.leftForearmTarget = Math.min(1.8, leftBendTarget); // Cap at ~103 degrees
    d.rightForearmTarget = Math.min(1.8, rightBendTarget);
    
    // Apply spring physics to forearm bend
    const leftForearmSpring = springPhysics(
      d.leftForearmAngle, 
      d.leftForearmTarget, 
      d.leftForearmVelocity, 
      springConfig.forearm
    );
    d.leftForearmAngle = leftForearmSpring.position;
    d.leftForearmVelocity = leftForearmSpring.velocity;
    
    const rightForearmSpring = springPhysics(
      d.rightForearmAngle, 
      d.rightForearmTarget, 
      d.rightForearmVelocity, 
      springConfig.forearm
    );
    d.rightForearmAngle = rightForearmSpring.position;
    d.rightForearmVelocity = rightForearmSpring.velocity;
    
    // Wrist follow-through (reacts to forearm velocity)
    const leftWristTarget = d.leftForearmVelocity * 3;
    const rightWristTarget = d.rightForearmVelocity * 3;
    
    const leftWristSpring = springPhysics(
      d.leftWristAngle, 
      leftWristTarget, 
      d.leftWristVelocity, 
      springConfig.wrist
    );
    d.leftWristAngle = leftWristSpring.position;
    d.leftWristVelocity = leftWristSpring.velocity;
    
    const rightWristSpring = springPhysics(
      d.rightWristAngle, 
      rightWristTarget, 
      d.rightWristVelocity, 
      springConfig.wrist
    );
    d.rightWristAngle = rightWristSpring.position;
    d.rightWristVelocity = rightWristSpring.velocity;
    
  }, []);

  // Draw the robot
  const drawRobot = useCallback(() => {
    if (!robotRef.current || !appRef.current) return;

    const robot = robotRef.current;
    const d = dance.current;
    const { bodyColor, bodyShape, eyeStyle, mouthStyle, accessory, pattern } = configRef.current;
    const playing = isPlayingRef.current;
    const singing = animStateRef.current?.singing;
    const gfx = graphicsRef.current;

    // ✅ CHROMEBOOK OPTIMIZATION: Reuse graphics objects instead of destroy/create
    // Helper to get or create a graphics object
    const getGraphics = (key) => {
      if (!gfx[key]) {
        gfx[key] = new PIXI.Graphics();
        robot.addChild(gfx[key]);
      } else {
        gfx[key].clear();
      }
      return gfx[key];
    };

    const mainColor = hexToNumber(bodyColor);
    const lightColor = adjustColor(bodyColor, 60);
    const darkColor = adjustColor(bodyColor, -40);
    const accentColor = 0x00ffff;

    const getBodyRadius = () => {
      switch (bodyShape) {
        case 'round': return 20;
        case 'square': return 4;
        case 'fuzzy': return 15;
        case 'triangle': return 8;
        case 'hexagon': return 10;
        case 'star': return 6;
        case 'diamond': return 6;
        case 'ghost': return 18;
        case 'spike': return 4;
        default: return 12;
      }
    };

    const bodyRadius = getBodyRadius();
    const bodyY = -d.bounce + d.crouch;

    // === SHADOW ===
    const shadow = getGraphics('shadow');
    const shadowScale = 1 - d.bounce * 0.008 + d.crouch * 0.01;
    shadow.ellipse(d.sway * 0.3, 95 + d.crouch * 0.5, 40 * shadowScale, 10);
    shadow.fill({ color: 0x000000, alpha: 0.2 });

    // === LEGS ===
    const drawLeg = (legGraphics, xOffset, angle) => {
      const legX = xOffset + d.sway * 0.3;
      const angleRad = angle * Math.PI / 180;

      const thighEndX = legX + Math.sin(angleRad) * 30;
      const thighEndY = 50 + bodyY + Math.cos(angleRad) * 30;

      legGraphics.moveTo(legX, 45 + bodyY);
      legGraphics.lineTo(thighEndX, thighEndY);
      legGraphics.stroke({ color: mainColor, width: 18, cap: 'round' });

      legGraphics.circle(thighEndX, thighEndY, 8);
      legGraphics.fill({ color: lightColor });

      legGraphics.moveTo(thighEndX, thighEndY);
      legGraphics.lineTo(thighEndX + Math.sin(angleRad * 0.3) * 28, thighEndY + 28);
      legGraphics.stroke({ color: darkColor, width: 14, cap: 'round' });

      const footX = thighEndX + Math.sin(angleRad * 0.3) * 28;
      const footY = thighEndY + 28;
      legGraphics.ellipse(footX, footY + 5, 14, 8);
      legGraphics.fill({ color: darkColor });
    };

    drawLeg(getGraphics('leftLeg'), -18, d.leftLegAngle);
    drawLeg(getGraphics('rightLeg'), 18, d.rightLegAngle);

    // === BODY ===
    const body = getGraphics('body');
    const bodyX = d.sway;
    
    if (bodyShape === 'triangle') {
      body.moveTo(bodyX, -10 + bodyY);
      body.lineTo(bodyX - 38, 50 + bodyY);
      body.lineTo(bodyX + 38, 50 + bodyY);
      body.closePath();
      body.fill({ color: mainColor });
    } else if (bodyShape === 'fuzzy') {
      body.roundRect(bodyX - 32, -5 + bodyY, 64, 55, bodyRadius);
      body.fill({ color: mainColor });
      body.circle(bodyX - 28, 5 + bodyY, 10);
      body.circle(bodyX + 28, 5 + bodyY, 10);
      body.circle(bodyX - 25, 40 + bodyY, 8);
      body.circle(bodyX + 25, 40 + bodyY, 8);
      body.fill({ color: mainColor });
    } else if (bodyShape === 'hexagon') {
      const hx = bodyX, hy = 22 + bodyY;
      body.moveTo(hx, hy - 32);
      body.lineTo(hx + 28, hy - 16);
      body.lineTo(hx + 28, hy + 16);
      body.lineTo(hx, hy + 32);
      body.lineTo(hx - 28, hy + 16);
      body.lineTo(hx - 28, hy - 16);
      body.closePath();
      body.fill({ color: mainColor });
    } else if (bodyShape === 'star') {
      const sx = bodyX, sy = 22 + bodyY;
      for (let i = 0; i < 5; i++) {
        const outerAngle = (i / 5) * Math.PI * 2 - Math.PI / 2;
        const innerAngle = outerAngle + Math.PI / 5;
        if (i === 0) {
          body.moveTo(sx + Math.cos(outerAngle) * 35, sy + Math.sin(outerAngle) * 35);
        } else {
          body.lineTo(sx + Math.cos(outerAngle) * 35, sy + Math.sin(outerAngle) * 35);
        }
        body.lineTo(sx + Math.cos(innerAngle) * 18, sy + Math.sin(innerAngle) * 18);
      }
      body.closePath();
      body.fill({ color: mainColor });
    } else if (bodyShape === 'diamond') {
      body.moveTo(bodyX, -10 + bodyY);
      body.lineTo(bodyX + 32, 22 + bodyY);
      body.lineTo(bodyX, 55 + bodyY);
      body.lineTo(bodyX - 32, 22 + bodyY);
      body.closePath();
      body.fill({ color: mainColor });
    } else if (bodyShape === 'ghost') {
      body.roundRect(bodyX - 32, -10 + bodyY, 64, 50, 30);
      body.fill({ color: mainColor });
      body.moveTo(bodyX - 32, 30 + bodyY);
      body.lineTo(bodyX - 32, 50 + bodyY);
      for (let i = 0; i < 4; i++) {
        body.quadraticCurveTo(bodyX - 24 + i * 16, 60 + bodyY, bodyX - 16 + i * 16, 50 + bodyY);
      }
      body.lineTo(bodyX + 32, 30 + bodyY);
      body.fill({ color: mainColor });
    } else if (bodyShape === 'spike') {
      body.roundRect(bodyX - 28, 0 + bodyY, 56, 50, 4);
      body.fill({ color: mainColor });
      [-32, 32].forEach(xOff => {
        body.moveTo(bodyX + xOff * 0.85, 5 + bodyY);
        body.lineTo(bodyX + xOff * 1.3, 15 + bodyY);
        body.lineTo(bodyX + xOff * 0.85, 25 + bodyY);
        body.lineTo(bodyX + xOff * 1.3, 35 + bodyY);
        body.lineTo(bodyX + xOff * 0.85, 45 + bodyY);
      });
      body.fill({ color: mainColor });
    } else {
      body.roundRect(bodyX - 32, -5 + bodyY, 64, 55, bodyRadius);
      body.fill({ color: mainColor });
    }
    
    if (!['star', 'ghost'].includes(bodyShape)) {
      body.roundRect(bodyX - 24, 2 + bodyY, 48, 35, Math.min(8, bodyRadius));
      body.fill({ color: darkColor });
    }
    
    const glowAlpha = playing && singing ? 0.9 : 0.4;
    body.roundRect(bodyX - 18, 8 + bodyY, 36, 24, 5);
    body.fill({ color: accentColor, alpha: glowAlpha });
    
    if (playing && singing) {
      for (let i = 0; i < 5; i++) {
        const barPhase = d.beatTime * Math.PI * 4 + i * 1.2;
        const barHeight = 6 + Math.abs(Math.sin(barPhase)) * 12;
        body.rect(bodyX - 14 + i * 7, 26 + bodyY - barHeight, 5, barHeight);
      }
      body.fill({ color: 0xffffff, alpha: 0.9 });
    }
    
    body.rect(bodyX - 33, 42 + bodyY, 66, 10);
    body.fill({ color: darkColor });
    body.circle(bodyX, 47 + bodyY, 6);
    body.fill({ color: accentColor, alpha: glowAlpha });

    // === PATTERN ===
    const patternGfx = getGraphics('pattern');
    if (pattern !== 'none') {
      
      if (pattern === 'spots') {
        patternGfx.circle(bodyX - 15, 15 + bodyY, 6);
        patternGfx.circle(bodyX + 12, 8 + bodyY, 5);
        patternGfx.circle(bodyX + 5, 28 + bodyY, 4);
        patternGfx.circle(bodyX - 8, 35 + bodyY, 5);
        patternGfx.fill({ color: 0xffffff, alpha: 0.3 });
      } else if (pattern === 'stripes') {
        for (let i = 0; i < 4; i++) {
          patternGfx.rect(bodyX - 20, 5 + bodyY + i * 10, 40, 4);
        }
        patternGfx.fill({ color: 0xffffff, alpha: 0.2 });
      } else if (pattern === 'stars') {
        const drawStar = (x, y, size) => {
          for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
            const innerAngle = angle + Math.PI / 5;
            if (i === 0) {
              patternGfx.moveTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size);
            } else {
              patternGfx.lineTo(x + Math.cos(angle) * size, y + Math.sin(angle) * size);
            }
            patternGfx.lineTo(x + Math.cos(innerAngle) * size * 0.4, y + Math.sin(innerAngle) * size * 0.4);
          }
          patternGfx.closePath();
        };
        drawStar(bodyX - 10, 12 + bodyY, 6);
        drawStar(bodyX + 12, 25 + bodyY, 5);
        drawStar(bodyX - 5, 38 + bodyY, 4);
        patternGfx.fill({ color: 0xffffff, alpha: 0.35 });
      } else if (pattern === 'hearts') {
        const drawHeart = (x, y, size) => {
          patternGfx.moveTo(x, y + size * 0.3);
          patternGfx.bezierCurveTo(x - size, y - size * 0.5, x - size, y + size * 0.5, x, y + size);
          patternGfx.bezierCurveTo(x + size, y + size * 0.5, x + size, y - size * 0.5, x, y + size * 0.3);
        };
        drawHeart(bodyX - 8, 15 + bodyY, 5);
        drawHeart(bodyX + 10, 28 + bodyY, 4);
        patternGfx.fill({ color: 0xff6b8a, alpha: 0.4 });
      } else if (pattern === 'lightning') {
        patternGfx.moveTo(bodyX - 5, 5 + bodyY);
        patternGfx.lineTo(bodyX + 8, 5 + bodyY);
        patternGfx.lineTo(bodyX + 2, 18 + bodyY);
        patternGfx.lineTo(bodyX + 10, 18 + bodyY);
        patternGfx.lineTo(bodyX - 5, 40 + bodyY);
        patternGfx.lineTo(bodyX + 2, 22 + bodyY);
        patternGfx.lineTo(bodyX - 8, 22 + bodyY);
        patternGfx.closePath();
        patternGfx.fill({ color: 0xffff00, alpha: 0.6 });
      } else if (pattern === 'flames') {
        const drawFlame = (x, y, h) => {
          patternGfx.moveTo(x, y + h);
          patternGfx.quadraticCurveTo(x - 6, y + h * 0.5, x - 3, y);
          patternGfx.quadraticCurveTo(x, y + h * 0.3, x + 3, y);
          patternGfx.quadraticCurveTo(x + 6, y + h * 0.5, x, y + h);
        };
        drawFlame(bodyX - 12, 30 + bodyY, 18);
        drawFlame(bodyX, 25 + bodyY, 22);
        drawFlame(bodyX + 12, 30 + bodyY, 18);
        patternGfx.fill({ color: 0xff6600, alpha: 0.5 });
      } else if (pattern === 'camo') {
        [[bodyX - 15, 10 + bodyY, 10, 6], [bodyX + 8, 5 + bodyY, 12, 8], 
         [bodyX - 5, 25 + bodyY, 14, 7], [bodyX + 12, 30 + bodyY, 10, 6],
         [bodyX - 10, 38 + bodyY, 11, 5]].forEach(([x, y, w, h]) => {
          patternGfx.ellipse(x, y, w, h);
        });
        patternGfx.fill({ color: 0x228B22, alpha: 0.4 });
      } else if (pattern === 'glitch') {
        for (let i = 0; i < 6; i++) {
          const gx = bodyX - 18 + Math.random() * 36;
          const gy = 5 + bodyY + i * 7;
          patternGfx.rect(gx, gy, 8 + Math.random() * 12, 3);
        }
        patternGfx.fill({ color: 0x00ffff, alpha: 0.4 });
        for (let i = 0; i < 4; i++) {
          patternGfx.rect(bodyX - 15 + i * 8, 8 + bodyY + (i % 2) * 20, 6, 2);
        }
        patternGfx.fill({ color: 0xff00ff, alpha: 0.4 });
      } else if (pattern === 'binary') {
        patternGfx.rect(bodyX - 18, 6 + bodyY, 3, 6);
        patternGfx.rect(bodyX - 12, 6 + bodyY, 3, 6);
        patternGfx.rect(bodyX - 3, 6 + bodyY, 3, 6);
        patternGfx.rect(bodyX + 6, 6 + bodyY, 3, 6);
        patternGfx.rect(bodyX - 15, 16 + bodyY, 3, 6);
        patternGfx.rect(bodyX - 6, 16 + bodyY, 3, 6);
        patternGfx.rect(bodyX + 3, 16 + bodyY, 3, 6);
        patternGfx.rect(bodyX + 12, 16 + bodyY, 3, 6);
        patternGfx.rect(bodyX - 18, 26 + bodyY, 3, 6);
        patternGfx.rect(bodyX - 9, 26 + bodyY, 3, 6);
        patternGfx.rect(bodyX + 9, 26 + bodyY, 3, 6);
        patternGfx.fill({ color: 0x00ff00, alpha: 0.4 });
      } else if (pattern === 'galaxy') {
        for (let i = 0; i < 12; i++) {
          const gx = bodyX - 20 + Math.random() * 40;
          const gy = 5 + bodyY + Math.random() * 40;
          const size = 1 + Math.random() * 2;
          patternGfx.circle(gx, gy, size);
        }
        patternGfx.fill({ color: 0xffffff, alpha: 0.6 });
        patternGfx.circle(bodyX - 10, 15 + bodyY, 3);
        patternGfx.circle(bodyX + 12, 28 + bodyY, 2.5);
        patternGfx.fill({ color: 0xaaddff, alpha: 0.7 });
      } else if (pattern === 'drip') {
        const drawDrip = (x, startY) => {
          patternGfx.circle(x, startY, 4);
          patternGfx.rect(x - 2, startY, 4, 15 + Math.random() * 10);
          patternGfx.circle(x, startY + 15 + Math.random() * 10, 3);
        };
        drawDrip(bodyX - 14, 8 + bodyY);
        drawDrip(bodyX, 5 + bodyY);
        drawDrip(bodyX + 14, 10 + bodyY);
        patternGfx.fill({ color: 0xffffff, alpha: 0.35 });
      }
    }
    // Note: pattern graphics cleared by getGraphics() when pattern === 'none'

    body.rotation = d.bodyRotation;

    // === ARMS === ✅ FIXED: Now bend INWARD correctly!
    const drawArm = (armGfx, side, angle) => {
      const isLeft = side === 'left';
      const xDir = isLeft ? -1 : 1;
      const xBase = isLeft ? -35 : 35;
      const armX = bodyX + xBase;
      const armY = 5 + bodyY;
      const angleRad = angle * Math.PI / 180;

      // === SHOULDER JOINT ===
      armGfx.circle(armX, armY, 10);
      armGfx.fill({ color: darkColor });
      armGfx.circle(armX, armY, 6);
      armGfx.fill({ color: accentColor, alpha: playing ? 0.8 : 0.4 });

      // === UPPER ARM ===
      const upperArmLength = 30;
      const elbowX = armX + Math.sin(angleRad) * upperArmLength;
      const elbowY = armY + Math.cos(angleRad) * upperArmLength;

      // Upper arm segment
      armGfx.moveTo(armX, armY);
      armGfx.lineTo(elbowX, elbowY);
      armGfx.stroke({ color: mainColor, width: 14, cap: 'round' });

      // Highlight
      armGfx.moveTo(armX, armY);
      armGfx.lineTo(elbowX, elbowY);
      armGfx.stroke({ color: lightColor, width: 4, cap: 'round' });

      // === ELBOW JOINT ===
      armGfx.circle(elbowX, elbowY, 9);
      armGfx.fill({ color: darkColor });
      armGfx.circle(elbowX, elbowY, 5);
      armGfx.fill({ color: accentColor, alpha: playing ? 0.9 : 0.5 });

      // === FOREARM ===
      // ✅ KEY FIX: Bend INWARD toward body (subtract for correct direction)
      const forearmBend = isLeft ? d.leftForearmAngle : d.rightForearmAngle;
      // Left arm: bend adds positive angle (toward right/center)
      // Right arm: bend subtracts (toward left/center)
      const forearmAngle = angleRad - forearmBend * xDir;

      const forearmLength = 26;
      const wristX = elbowX + Math.sin(forearmAngle) * forearmLength;
      const wristY = elbowY + Math.cos(forearmAngle) * forearmLength;

      // Forearm segment
      armGfx.moveTo(elbowX, elbowY);
      armGfx.lineTo(wristX, wristY);
      armGfx.stroke({ color: darkColor, width: 12, cap: 'round' });

      // Forearm highlight
      armGfx.moveTo(elbowX, elbowY);
      armGfx.lineTo(wristX, wristY);
      armGfx.stroke({ color: mainColor, width: 4, cap: 'round' });

      // === WRIST JOINT ===
      armGfx.circle(wristX, wristY, 7);
      armGfx.fill({ color: lightColor });
      armGfx.circle(wristX, wristY, 4);
      armGfx.fill({ color: accentColor, alpha: 0.6 });

      // === HAND ===
      const wristAngle = isLeft ? d.leftWristAngle : d.rightWristAngle;
      const handAngle = forearmAngle + wristAngle * 0.5;

      // Hand opens when singing
      const clawOpen = playing && singing ? 0.35 : 0.12;

      const handDirX = Math.sin(handAngle);
      const handDirY = Math.cos(handAngle);

      // Palm base
      const palmX = wristX + handDirX * 8;
      const palmY = wristY + handDirY * 8;
      armGfx.circle(palmX, palmY, 6);
      armGfx.fill({ color: lightColor });

      // Three fingers in a claw arrangement
      const fingerLength = 12;
      const fingerWidth = 4;

      // Left finger
      const leftFingerAngle = handAngle - clawOpen;
      const leftFingerX = palmX + Math.sin(leftFingerAngle) * fingerLength;
      const leftFingerY = palmY + Math.cos(leftFingerAngle) * fingerLength;
      armGfx.moveTo(palmX, palmY);
      armGfx.lineTo(leftFingerX, leftFingerY);
      armGfx.stroke({ color: lightColor, width: fingerWidth, cap: 'round' });
      armGfx.circle(leftFingerX, leftFingerY, 3);
      armGfx.fill({ color: accentColor, alpha: playing ? 0.8 : 0.4 });

      // Center finger (slightly longer)
      const centerFingerX = palmX + handDirX * (fingerLength + 3);
      const centerFingerY = palmY + handDirY * (fingerLength + 3);
      armGfx.moveTo(palmX, palmY);
      armGfx.lineTo(centerFingerX, centerFingerY);
      armGfx.stroke({ color: lightColor, width: fingerWidth, cap: 'round' });
      armGfx.circle(centerFingerX, centerFingerY, 3);
      armGfx.fill({ color: accentColor, alpha: playing ? 0.8 : 0.4 });

      // Right finger
      const rightFingerAngle = handAngle + clawOpen;
      const rightFingerX = palmX + Math.sin(rightFingerAngle) * fingerLength;
      const rightFingerY = palmY + Math.cos(rightFingerAngle) * fingerLength;
      armGfx.moveTo(palmX, palmY);
      armGfx.lineTo(rightFingerX, rightFingerY);
      armGfx.stroke({ color: lightColor, width: fingerWidth, cap: 'round' });
      armGfx.circle(rightFingerX, rightFingerY, 3);
      armGfx.fill({ color: accentColor, alpha: playing ? 0.8 : 0.4 });
    };

    // Arms drawn AFTER head so hands appear in front of face
    // Note: We'll call these after drawing the head
    const leftArmGfx = getGraphics('leftArm');
    const rightArmGfx = getGraphics('rightArm');

    // === HEAD ===
    const head = getGraphics('head');
    const headX = bodyX + d.sway * 0.2;
    const headY = -45 + bodyY - d.headBob;
    
    head.roundRect(headX - 10, headY + 32, 20, 18, 4);
    head.fill({ color: darkColor });
    
    if (bodyShape === 'square') {
      head.roundRect(headX - 35, headY - 30, 70, 60, 4);
    } else if (bodyShape === 'round') {
      head.circle(headX, headY, 32);
    } else if (bodyShape === 'triangle') {
      head.moveTo(headX, headY - 35);
      head.lineTo(headX - 35, headY + 25);
      head.lineTo(headX + 35, headY + 25);
      head.closePath();
    } else if (bodyShape === 'fuzzy') {
      head.roundRect(headX - 35, headY - 30, 70, 60, 20);
      head.circle(headX - 30, headY - 15, 8);
      head.circle(headX + 30, headY - 15, 8);
      head.circle(headX - 25, headY + 15, 6);
      head.circle(headX + 25, headY + 15, 6);
    } else {
      head.roundRect(headX - 35, headY - 30, 70, 60, 15);
    }
    head.fill({ color: mainColor });
    
    const faceRadius = bodyShape === 'square' ? 4 : bodyShape === 'round' ? 12 : 10;
    head.roundRect(headX - 28, headY - 22, 56, 42, faceRadius);
    head.fill({ color: darkColor });
    
    head.pivot.set(headX, headY);
    head.position.set(headX, headY);
    head.rotation = d.headTilt * Math.PI / 180;
    
    const eyeGlow = playing && singing ? 1 : 0.6;

    // Hide angry eye slants by default (only show when angry eyes selected)
    gfx.eyeSlants.forEach(slant => {
      if (slant) slant.visible = false;
    });

    if (eyeStyle === 'cyclops') {
      head.roundRect(headX - 18, headY - 18, 36, 26, 8);
      head.fill({ color: 0x001a1a });
      head.roundRect(headX - 14, headY - 14, 28, 18, 6);
      head.fill({ color: accentColor, alpha: eyeGlow });
      head.circle(headX, headY - 5, 6);
      head.fill({ color: 0xffffff });
    } else if (eyeStyle === 'sleepy') {
      [-15, 15].forEach(x => {
        head.roundRect(headX + x - 10, headY - 12, 20, 8, 4);
        head.fill({ color: 0x001a1a });
        head.roundRect(headX + x - 8, headY - 10, 16, 4, 2);
        head.fill({ color: accentColor, alpha: eyeGlow * 0.7 });
      });
    } else if (eyeStyle === 'angry') {
      [-15, 15].forEach((x, i) => {
        head.roundRect(headX + x - 10, headY - 16, 20, 14, 4);
        head.fill({ color: 0x001a1a });
        // Reuse slant graphics instead of creating new ones each frame
        if (!gfx.eyeSlants[i]) {
          gfx.eyeSlants[i] = new PIXI.Graphics();
          robot.addChild(gfx.eyeSlants[i]);
        }
        const slant = gfx.eyeSlants[i];
        slant.clear();
        slant.rect(-8, -3, 16, 6);
        slant.fill({ color: 0xff4444, alpha: eyeGlow });
        slant.x = headX + x;
        slant.y = headY - 9;
        slant.rotation = (i === 0 ? 0.25 : -0.25);
        slant.visible = true;
      });
    } else if (eyeStyle === 'multiple') {
      [-20, 0, 20].forEach(x => {
        head.roundRect(headX + x - 7, headY - 14, 14, 12, 4);
        head.fill({ color: 0x001a1a });
        head.roundRect(headX + x - 5, headY - 12, 10, 8, 3);
        head.fill({ color: accentColor, alpha: eyeGlow });
      });
    } else if (eyeStyle === 'robot') {
      [-15, 15].forEach(x => {
        head.roundRect(headX + x - 10, headY - 15, 20, 16, 3);
        head.fill({ color: 0x001a1a });
        for (let row = 0; row < 3; row++) {
          for (let col = 0; col < 3; col++) {
            head.rect(headX + x - 8 + col * 6, headY - 13 + row * 5, 4, 3);
          }
        }
        head.fill({ color: 0x00ff00, alpha: eyeGlow });
      });
    } else if (eyeStyle === 'cool') {
      head.roundRect(headX - 28, headY - 14, 56, 16, 4);
      head.fill({ color: 0x111111 });
      head.roundRect(headX - 26, headY - 12, 22, 12, 3);
      head.roundRect(headX + 4, headY - 12, 22, 12, 3);
      head.fill({ color: 0x222244, alpha: 0.9 });
      head.rect(headX - 24, headY - 11, 8, 3);
      head.rect(headX + 6, headY - 11, 8, 3);
      head.fill({ color: 0xffffff, alpha: 0.3 });
    } else if (eyeStyle === 'hearts') {
      [-15, 15].forEach(x => {
        const hx = headX + x, hy = headY - 8;
        head.moveTo(hx, hy - 5);
        head.bezierCurveTo(hx - 10, hy - 12, hx - 10, hy + 2, hx, hy + 8);
        head.bezierCurveTo(hx + 10, hy + 2, hx + 10, hy - 12, hx, hy - 5);
        head.fill({ color: 0xff1493, alpha: eyeGlow });
      });
    } else if (eyeStyle === 'money') {
      [-15, 15].forEach(x => {
        head.circle(headX + x, headY - 6, 11);
        head.fill({ color: 0x228B22, alpha: eyeGlow });
        head.circle(headX + x, headY - 6, 8);
        head.fill({ color: 0x32CD32, alpha: eyeGlow });
        head.rect(headX + x - 1, headY - 14, 2, 16);
        head.fill({ color: 0xffffff, alpha: 0.8 });
      });
    } else if (eyeStyle === 'dead') {
      [-15, 15].forEach(x => {
        head.roundRect(headX + x - 10, headY - 15, 20, 18, 4);
        head.fill({ color: 0x001a1a });
        head.moveTo(headX + x - 6, headY - 10);
        head.lineTo(headX + x + 6, headY + 2);
        head.stroke({ color: 0xffffff, width: 3 });
        head.moveTo(headX + x + 6, headY - 10);
        head.lineTo(headX + x - 6, headY + 2);
        head.stroke({ color: 0xffffff, width: 3 });
      });
    } else if (eyeStyle === 'laser') {
      [-15, 15].forEach(x => {
        head.circle(headX + x, headY - 6, 10);
        head.fill({ color: 0x330000 });
        head.circle(headX + x, headY - 6, 7);
        head.fill({ color: 0xff0000, alpha: eyeGlow });
        head.circle(headX + x, headY - 6, 4);
        head.fill({ color: 0xff6666, alpha: eyeGlow });
        head.circle(headX + x, headY - 6, 2);
        head.fill({ color: 0xffffff });
      });
    } else if (eyeStyle === 'anime') {
      [-15, 15].forEach(x => {
        head.roundRect(headX + x - 12, headY - 18, 24, 22, 8);
        head.fill({ color: 0x001a1a });
        head.roundRect(headX + x - 10, headY - 16, 20, 18, 6);
        head.fill({ color: accentColor, alpha: eyeGlow });
        head.circle(headX + x - 4, headY - 12, 4);
        head.fill({ color: 0xffffff, alpha: 0.9 });
        head.circle(headX + x + 3, headY - 8, 2);
        head.fill({ color: 0xffffff, alpha: 0.7 });
      });
    } else {
      [-15, 15].forEach(x => {
        head.roundRect(headX + x - 11, headY - 17, 22, 20, 6);
        head.fill({ color: 0x001a1a });
        head.roundRect(headX + x - 8, headY - 14, 16, 14, 4);
        head.fill({ color: accentColor, alpha: eyeGlow });
        head.roundRect(headX + x - 6, headY - 12, 6, 5, 2);
        head.fill({ color: 0xffffff, alpha: 0.8 });
      });
    }
    
    const mouthOpen = playing && singing ? 8 + Math.abs(Math.sin(d.beatTime * Math.PI * 4)) * 8 : 0;
    
    if (mouthStyle === 'toothy') {
      head.roundRect(headX - 14, headY + 4, 28, 8 + mouthOpen, 4);
      head.fill({ color: 0x001a1a });
      if (mouthOpen > 2) {
        for (let i = 0; i < 4; i++) {
          head.rect(headX - 10 + i * 6, headY + 6, 4, 5);
        }
        head.fill({ color: 0xffffff });
        head.roundRect(headX - 10, headY + 12, 20, mouthOpen - 4, 3);
        head.fill({ color: accentColor, alpha: 0.7 });
      } else {
        for (let i = 0; i < 4; i++) {
          head.rect(headX - 10 + i * 6, headY + 6, 4, 4);
        }
        head.fill({ color: 0xffffff });
      }
    } else if (mouthStyle === 'tongue') {
      head.roundRect(headX - 12, headY + 6, 24, 5 + mouthOpen, 4);
      head.fill({ color: 0x001a1a });
      if (mouthOpen > 2) {
        head.roundRect(headX - 9, headY + 9, 18, mouthOpen - 2, 3);
        head.fill({ color: accentColor, alpha: 0.7 });
      }
      const tongueOut = playing && singing ? 8 : 3;
      head.ellipse(headX, headY + 10 + tongueOut, 6, tongueOut);
      head.fill({ color: 0xff6b8a });
    } else if (mouthStyle === 'surprised') {
      const mouthSize = 8 + mouthOpen * 0.5;
      head.circle(headX, headY + 10, mouthSize);
      head.fill({ color: 0x001a1a });
      head.circle(headX, headY + 10, mouthSize - 3);
      head.fill({ color: accentColor, alpha: 0.6 });
    } else if (mouthStyle === 'grumpy') {
      head.roundRect(headX - 12, headY + 8, 24, 5 + mouthOpen * 0.3, 2);
      head.fill({ color: 0x001a1a });
      if (!singing) {
        head.moveTo(headX - 10, headY + 12);
        head.quadraticCurveTo(headX, headY + 8, headX + 10, headY + 12);
        head.stroke({ color: accentColor, width: 2, alpha: 0.5 });
      } else {
        head.roundRect(headX - 9, headY + 10, 18, mouthOpen * 0.3, 2);
        head.fill({ color: accentColor, alpha: 0.5 });
      }
    } else if (mouthStyle === 'fangs') {
      head.roundRect(headX - 14, headY + 4, 28, 8 + mouthOpen, 4);
      head.fill({ color: 0x001a1a });
      head.moveTo(headX - 8, headY + 6);
      head.lineTo(headX - 6, headY + 14 + mouthOpen * 0.5);
      head.lineTo(headX - 4, headY + 6);
      head.moveTo(headX + 4, headY + 6);
      head.lineTo(headX + 6, headY + 14 + mouthOpen * 0.5);
      head.lineTo(headX + 8, headY + 6);
      head.fill({ color: 0xffffff });
      if (mouthOpen > 2) {
        head.roundRect(headX - 10, headY + 12, 20, mouthOpen - 4, 3);
        head.fill({ color: 0x660000, alpha: 0.8 });
      }
    } else if (mouthStyle === 'braces') {
      head.roundRect(headX - 14, headY + 4, 28, 8 + mouthOpen, 4);
      head.fill({ color: 0x001a1a });
      for (let i = 0; i < 5; i++) {
        head.rect(headX - 12 + i * 5, headY + 6, 4, 5);
      }
      head.fill({ color: 0xffffff });
      head.rect(headX - 12, headY + 8, 24, 2);
      head.fill({ color: 0xcccccc });
      for (let i = 0; i < 5; i++) {
        head.rect(headX - 11 + i * 5, headY + 7, 2, 3);
      }
      head.fill({ color: 0x3498db });
    } else if (mouthStyle === 'smile') {
      head.moveTo(headX - 12, headY + 10);
      head.quadraticCurveTo(headX, headY + 6 - mouthOpen * 0.3, headX + 14, headY + 4);
      head.stroke({ color: 0x001a1a, width: 4 + mouthOpen * 0.3 });
    } else if (mouthStyle === 'drool') {
      head.roundRect(headX - 12, headY + 6, 24, 5 + mouthOpen, 4);
      head.fill({ color: 0x001a1a });
      if (mouthOpen > 2) {
        head.roundRect(headX - 9, headY + 9, 18, mouthOpen - 2, 3);
        head.fill({ color: accentColor, alpha: 0.7 });
      }
      const droolLen = 8 + (playing && singing ? Math.sin(d.beatTime * 2) * 5 : 0);
      head.ellipse(headX + 8, headY + 12 + droolLen, 3, 4 + droolLen * 0.3);
      head.fill({ color: 0x88ccff, alpha: 0.7 });
    } else if (mouthStyle === 'zipper') {
      head.roundRect(headX - 14, headY + 6, 28, 8, 2);
      head.fill({ color: 0x001a1a });
      for (let i = 0; i < 7; i++) {
        head.rect(headX - 12 + i * 4, headY + 7, 2, 6);
      }
      head.fill({ color: 0xcccccc });
      head.rect(headX + 10, headY + 6, 6, 8);
      head.fill({ color: 0xffd700 });
    } else if (mouthStyle === 'fire') {
      head.roundRect(headX - 12, headY + 6, 24, 5 + mouthOpen, 4);
      head.fill({ color: 0x001a1a });
      if (playing && singing && mouthOpen > 3) {
        const fireY = headY + 12;
        head.moveTo(headX - 8, fireY);
        head.quadraticCurveTo(headX - 12, fireY + 10 + mouthOpen, headX - 6, fireY + mouthOpen);
        head.quadraticCurveTo(headX, fireY + 15 + mouthOpen, headX + 6, fireY + mouthOpen);
        head.quadraticCurveTo(headX + 12, fireY + 10 + mouthOpen, headX + 8, fireY);
        head.fill({ color: 0xff6600, alpha: 0.8 });
        head.moveTo(headX - 5, fireY);
        head.quadraticCurveTo(headX, fireY + 10 + mouthOpen * 0.7, headX + 5, fireY);
        head.fill({ color: 0xffff00, alpha: 0.8 });
      }
    } else if (mouthStyle === 'grill') {
      head.roundRect(headX - 14, headY + 4, 28, 10 + mouthOpen, 4);
      head.fill({ color: 0x001a1a });
      for (let i = 0; i < 5; i++) {
        head.rect(headX - 12 + i * 5, headY + 6, 4, 6);
      }
      head.fill({ color: 0xffd700 });
      head.rect(headX - 11, headY + 7, 2, 2);
      head.rect(headX + 2, headY + 7, 2, 2);
      head.fill({ color: 0xffffff, alpha: 0.6 });
    } else {
      head.roundRect(headX - 12, headY + 6, 24, 5 + mouthOpen, 4);
      head.fill({ color: 0x001a1a });
      if (mouthOpen > 2) {
        head.roundRect(headX - 9, headY + 9, 18, mouthOpen - 2, 3);
        head.fill({ color: accentColor, alpha: 0.7 });
      }
    }
    
    head.circle(headX - 38, headY - 5, 5);
    head.circle(headX + 38, headY - 5, 5);
    head.fill({ color: accentColor, alpha: playing && singing ? 0.9 : 0.3 });

    // === ACCESSORY ===
    const acc = getGraphics('accessory');
    if (accessory !== 'none') {
      const accY = headY - 35 - d.headBob;
      
      if (accessory === 'antenna') {
        const wiggle = Math.sin(d.time * 5) * 3;
        acc.moveTo(headX - 18, headY - 25);
        acc.lineTo(headX - 22 + wiggle, accY - 15);
        acc.stroke({ color: darkColor, width: 3 });
        acc.circle(headX - 22 + wiggle, accY - 15, 6);
        acc.fill({ color: 0xff4444, alpha: 0.5 + Math.sin(d.beatTime * 8) * 0.5 });
        acc.moveTo(headX + 18, headY - 25);
        acc.lineTo(headX + 22 - wiggle, accY - 15);
        acc.stroke({ color: darkColor, width: 3 });
        acc.circle(headX + 22 - wiggle, accY - 15, 6);
        acc.fill({ color: 0x44ff44, alpha: 0.5 + Math.sin(d.beatTime * 8 + 1) * 0.5 });
      } else if (accessory === 'horns') {
        acc.moveTo(headX - 25, headY - 25);
        acc.quadraticCurveTo(headX - 35, headY - 50, headX - 20, headY - 55);
        acc.lineTo(headX - 22, headY - 25);
        acc.fill({ color: 0xaa0000 });
        acc.moveTo(headX + 25, headY - 25);
        acc.quadraticCurveTo(headX + 35, headY - 50, headX + 20, headY - 55);
        acc.lineTo(headX + 22, headY - 25);
        acc.fill({ color: 0xaa0000 });
      } else if (accessory === 'crown') {
        acc.moveTo(headX - 28, headY - 25);
        acc.lineTo(headX - 20, accY - 10);
        acc.lineTo(headX - 10, headY - 28);
        acc.lineTo(headX, accY - 18);
        acc.lineTo(headX + 10, headY - 28);
        acc.lineTo(headX + 20, accY - 10);
        acc.lineTo(headX + 28, headY - 25);
        acc.closePath();
        acc.fill({ color: 0xffd700 });
        acc.circle(headX, accY - 12, 4);
        acc.fill({ color: 0x44ffff });
      } else if (accessory === 'headphones') {
        acc.moveTo(headX - 38, headY - 10);
        acc.quadraticCurveTo(headX - 42, headY - 45, headX - 15, headY - 38);
        acc.quadraticCurveTo(headX, headY - 48, headX + 15, headY - 38);
        acc.quadraticCurveTo(headX + 42, headY - 45, headX + 38, headY - 10);
        acc.stroke({ color: 0x333333, width: 6 });
        acc.roundRect(headX - 48, headY - 18, 16, 26, 6);
        acc.roundRect(headX + 32, headY - 18, 16, 26, 6);
        acc.fill({ color: 0x222222 });
        acc.roundRect(headX - 46, headY - 14, 12, 18, 4);
        acc.roundRect(headX + 34, headY - 14, 12, 18, 4);
        acc.fill({ color: 0x444444 });
      } else if (accessory === 'cap') {
        acc.ellipse(headX, headY - 26, 38, 10);
        acc.fill({ color: mainColor });
        acc.roundRect(headX - 32, headY - 45, 64, 22, 12);
        acc.fill({ color: mainColor });
        acc.ellipse(headX, headY - 24, 42, 8);
        acc.fill({ color: darkColor });
        acc.ellipse(headX + 8, headY - 20, 35, 12);
        acc.fill({ color: darkColor });
      } else if (accessory === 'beanie') {
        acc.roundRect(headX - 36, headY - 50, 72, 30, 20);
        acc.fill({ color: mainColor });
        acc.roundRect(headX - 34, headY - 30, 68, 10, 4);
        acc.fill({ color: darkColor });
        acc.circle(headX, headY - 55, 10);
        acc.fill({ color: lightColor });
      } else if (accessory === 'mohawk') {
        for (let i = 0; i < 5; i++) {
          const spikeX = headX - 16 + i * 8;
          const spikeH = 20 + Math.sin(d.time * 3 + i) * 5;
          acc.moveTo(spikeX - 5, headY - 28);
          acc.lineTo(spikeX, headY - 28 - spikeH);
          acc.lineTo(spikeX + 5, headY - 28);
          acc.closePath();
        }
        acc.fill({ color: 0xff00ff });
      } else if (accessory === 'halo') {
        const haloY = headY - 50;
        const haloGlow = 0.6 + Math.sin(d.time * 2) * 0.2;
        acc.ellipse(headX, haloY, 30, 8);
        acc.stroke({ color: 0xffd700, width: 6, alpha: haloGlow });
        acc.ellipse(headX, haloY, 30, 8);
        acc.stroke({ color: 0xffff88, width: 3, alpha: haloGlow });
      } else if (accessory === 'flames') {
        const drawFlame = (x, h) => {
          acc.moveTo(x - 6, headY - 28);
          acc.quadraticCurveTo(x - 10, headY - 28 - h * 0.5, x - 3, headY - 28 - h * 0.8);
          acc.quadraticCurveTo(x, headY - 28 - h, x + 3, headY - 28 - h * 0.8);
          acc.quadraticCurveTo(x + 10, headY - 28 - h * 0.5, x + 6, headY - 28);
        };
        const flicker = Math.sin(d.time * 10) * 5;
        drawFlame(headX - 15, 25 + flicker);
        drawFlame(headX, 35 + flicker);
        drawFlame(headX + 15, 25 + flicker);
        acc.fill({ color: 0xff6600, alpha: 0.8 });
        drawFlame(headX - 10, 18 + flicker);
        drawFlame(headX + 5, 22 + flicker);
        acc.fill({ color: 0xffff00, alpha: 0.7 });
      } else if (accessory === 'gaming') {
        acc.roundRect(headX - 35, headY - 22, 70, 30, 8);
        acc.fill({ color: 0x222222 });
        acc.roundRect(headX - 32, headY - 18, 30, 22, 4);
        acc.roundRect(headX + 2, headY - 18, 30, 22, 4);
        acc.fill({ color: 0x000066, alpha: 0.8 });
        acc.rect(headX - 30, headY - 20, 26, 2);
        acc.rect(headX + 4, headY - 20, 26, 2);
        acc.fill({ color: 0x00ff00, alpha: 0.5 + Math.sin(d.beatTime * 6) * 0.5 });
        acc.moveTo(headX - 35, headY - 8);
        acc.quadraticCurveTo(headX - 50, headY - 20, headX - 38, headY - 35);
        acc.moveTo(headX + 35, headY - 8);
        acc.quadraticCurveTo(headX + 50, headY - 20, headX + 38, headY - 35);
        acc.stroke({ color: 0x333333, width: 4 });
      } else if (accessory === 'alien') {
        acc.ellipse(headX, headY - 45, 25, 20);
        acc.fill({ color: 0x88ff88, alpha: 0.7 });
        acc.ellipse(headX - 15, headY - 50, 12, 10);
        acc.ellipse(headX + 15, headY - 50, 12, 10);
        acc.fill({ color: 0x88ff88, alpha: 0.7 });
        acc.moveTo(headX - 10, headY - 55);
        acc.quadraticCurveTo(headX, headY - 45, headX + 10, headY - 55);
        acc.stroke({ color: 0x44aa44, width: 1, alpha: 0.5 });
      } else if (accessory === 'bow') {
        acc.circle(headX - 18, headY - 35, 12);
        acc.circle(headX + 18, headY - 35, 12);
        acc.fill({ color: 0xff69b4 });
        acc.circle(headX, headY - 35, 8);
        acc.fill({ color: 0xff1493 });
      } else if (accessory === 'hat') {
        acc.ellipse(headX, headY - 28, 40, 8);
        acc.fill({ color: 0x1a1a2e });
        acc.roundRect(headX - 25, headY - 65, 50, 40, 4);
        acc.fill({ color: 0x1a1a2e });
        acc.rect(headX - 26, headY - 42, 52, 8);
        acc.fill({ color: accentColor, alpha: 0.5 + Math.sin(d.beatTime * 4) * 0.3 });
      }
    }
    // Note: accessory graphics cleared by getGraphics() when accessory === 'none'

    // ✅ Arms drawn LAST so hands appear IN FRONT of face when raised
    drawArm(leftArmGfx, 'left', d.leftArmAngle);
    drawArm(rightArmGfx, 'right', d.rightArmAngle);

  }, []);

  const startAnimationLoop = useCallback(() => {
    let lastTime = 0;
    const isLowEnd = appRef.current?.isLowEnd;
    const isSmall = appRef.current?.isSmall;

    // Dev-only FPS tracking
    let frameCount = 0;
    let fpsLastTime = performance.now();
    const isDev = import.meta.env.DEV;

    if (isDev && !isSmall) {
      console.log(`🤖 Robot Animation: ${isLowEnd ? 'LOW-END MODE' : 'NORMAL MODE'}`);
    }

    const animate = (currentTime) => {
      animationFrameRef.current = requestAnimationFrame(animate);

      // ✅ CHROMEBOOK OPTIMIZATION: Dynamic FPS based on play state
      // - Playing: 30fps on Chromebook, 60fps normal
      // - Idle: 15fps on Chromebook, 30fps normal (robot just breathes)
      const playing = isPlayingRef.current;
      let targetFPS;
      if (isSmall) {
        targetFPS = playing ? 24 : 12; // Split view: lower FPS
      } else if (isLowEnd) {
        targetFPS = playing ? 30 : 15; // Chromebook: 30fps playing, 15fps idle
      } else {
        targetFPS = playing ? 60 : 30; // Normal: 60fps playing, 30fps idle
      }
      const frameInterval = 1000 / targetFPS;

      // Throttle frame rate
      const elapsed = currentTime - lastTime;
      if (elapsed < frameInterval) return;
      lastTime = currentTime - (elapsed % frameInterval);

      updateDance();
      drawRobot();

      // Dev-only: Log FPS every 2 seconds (skip for small robots to reduce spam)
      if (isDev && !isSmall) {
        frameCount++;
        const fpsDelta = currentTime - fpsLastTime;
        if (fpsDelta >= 2000) {
          const fps = Math.round((frameCount * 1000) / fpsDelta);
          console.log(`🎯 Robot FPS: ${fps} (target: ${targetFPS}, playing: ${playing})`);
          frameCount = 0;
          fpsLastTime = currentTime;
        }
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [updateDance, drawRobot]);

  return (
    <div className={styles.avatarContainer}>
      <div 
        ref={containerRef} 
        className={styles.pixiContainer}
        style={{
          filter: isPlaying && animationState?.singing 
            ? `drop-shadow(0 0 20px ${bodyColor}88) drop-shadow(0 0 8px #00ffff55)` 
            : 'none',
        }}
      />
      
      {/* ✅ CHROMEBOOK OPTIMIZATION: Skip particles on low-end devices */}
      {isPlaying && animationState?.singing && !isLowEndRef.current && (
        <div className={styles.particles}>
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={styles.particle}
              style={{
                left: `${15 + (i * 17)}%`,
                animationDelay: `${i * 0.12}s`,
                animationDuration: `${0.7 + (tempo / 200)}s`,
                color: ['#00ffff', '#ff00ff', '#ffff00', '#00ff88', '#ff6600'][i],
              }}
            >
              {['♪', '♫', '⚡', '✦', '♬'][i]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default RobotAvatar;