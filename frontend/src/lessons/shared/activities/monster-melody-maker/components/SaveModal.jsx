/**
 * FILE: monster-melody-maker/components/SaveModal.jsx
 * Popup modal for naming and saving student creations
 */

import React from 'react';
import styles from './SaveModal.module.css';

const SaveModal = ({ 
  name, 
  onNameChange, 
  onSave, 
  onCancel, 
  isSaving 
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSave();
    }
  };

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>💾 Save Your Creation</h2>
          <button className={styles.closeButton} onClick={onCancel}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              Give your monster melody a name:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g., Disco Monster Dance"
              className={styles.input}
              maxLength={50}
              autoFocus
            />
            <span className={styles.charCount}>{name.length}/50</span>
          </div>
          
          <div className={styles.preview}>
            <span className={styles.previewLabel}>Preview:</span>
            <span className={styles.previewName}>
              {name || 'Untitled Monster Melody'}
            </span>
          </div>
          
          <div className={styles.actions}>
            <button 
              type="button" 
              className={styles.cancelButton}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={styles.saveButton}
              disabled={!name.trim() || isSaving}
            >
              {isSaving ? (
                <>
                  <span className={styles.spinner}>⏳</span>
                  Saving...
                </>
              ) : (
                <>
                  💾 Save
                </>
              )}
            </button>
          </div>
        </form>
        
        <div className={styles.tip}>
          💡 Tip: You can come back and edit your creation later!
        </div>
      </div>
    </div>
  );
};

export default SaveModal;