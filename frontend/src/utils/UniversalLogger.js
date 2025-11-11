// Universal Logger for Music Mind Academy
// Works in both classroom (edu) and commercial modes
// src/utils/UniversalLogger.js

import { ref, push } from 'firebase/database';
import database from '../firebase/config';

class UniversalLogger {
  constructor() {
    this.studentId = null;
    this.sessionCode = null;
    this.lessonId = null;
    this.studentName = null;
    this.siteMode = import.meta.env.VITE_SITE_MODE || 'commercial';
    this.isInitialized = false;
  }

  /**
   * Initialize logger when student joins session
   */
  init({ studentId, sessionCode, lessonId = 'unknown', studentName = null }) {
    this.studentId = studentId;
    this.sessionCode = sessionCode;
    this.lessonId = lessonId;
    this.studentName = studentName;
    this.isInitialized = true;

    console.log('📝 Logger initialized:', {
      studentId,
      sessionCode,
      lessonId,
      studentName,
      siteMode: this.siteMode
    });

    // Log successful join
    this._log('info', 'Student joined session');
  }

  /**
   * Write log entry to Firebase
   */
  _log(type, message, data = {}) {
    if (!this.isInitialized) {
      console.warn('⚠️ Logger not initialized, skipping log:', message);
      return;
    }

    try {
      // Write to session-specific logs
      const logRef = ref(
        database,
        `session-logs/${this.sessionCode}/${this.studentId}`
      );

      const logEntry = {
        type,
        message,
        lessonId: this.lessonId,
        studentName: this.studentName,
        siteMode: this.siteMode,
        timestamp: Date.now(),
        data,
        userAgent: navigator.userAgent,
        url: window.location.href
      };

      push(logRef, logEntry);

      // Also write to centralized problem list for admin dashboard
      if (type === 'error' || type === 'kick') {
        this._writeToProblemsList(type, message, data);
      }
    } catch (error) {
      console.error('Failed to log to Firebase:', error);
    }
  }

  /**
   * Write critical issues to centralized problems list
   */
  _writeToProblemsList(type, message, data) {
    try {
      const problemsRef = ref(database, 'all-problems');
      
      push(problemsRef, {
        type,
        message,
        sessionCode: this.sessionCode,
        studentId: this.studentId,
        studentName: this.studentName,
        lessonId: this.lessonId,
        siteMode: this.siteMode,
        timestamp: Date.now(),
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        time: new Date().toLocaleTimeString(),
        data,
        resolved: false
      });
    } catch (error) {
      console.error('Failed to write to problems list:', error);
    }
  }

  /**
   * Log an error
   */
  error(message, data = {}) {
    console.error(`🔴 ERROR: ${message}`, data);
    this._log('error', message, data);
  }

  /**
   * Log a warning
   */
  warning(message, data = {}) {
    console.warn(`⚠️ WARNING: ${message}`, data);
    this._log('warning', message, data);
  }

  /**
   * Log when a student gets kicked (CRITICAL)
   */
  kick(reason, data = {}) {
    console.error(`🚨 STUDENT KICKED: ${reason}`, data);
    this._log('kick', reason, {
      ...data,
      kickTime: new Date().toISOString()
    });
  }

  /**
   * Log general info
   */
  info(message, data = {}) {
    console.log(`ℹ️ INFO: ${message}`, data);
    this._log('info', message, data);
  }

  /**
   * Log stage transitions
   */
  stageChange(fromStage, toStage) {
    this._log('info', 'Stage transition', {
      fromStage,
      toStage
    });
  }

  /**
   * Cleanup when session ends
   */
  cleanup() {
    if (this.isInitialized) {
      this._log('info', 'Student left session');
    }
    this.isInitialized = false;
  }
}

// Export singleton instance
export const logger = new UniversalLogger();