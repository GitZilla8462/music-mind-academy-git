// Right-side planning guide for Build mode
// Shows section-by-section checklist of what stickers/text to add
// Students can check items off, add their own, and remove items

import React, { useState, useRef, useEffect } from 'react';
import { Check, Plus, X } from 'lucide-react';

const DEFAULT_GUIDE = [
  { text: 'Add a dynamics sticker', checked: false },
  { text: 'Add a tempo sticker', checked: false },
  { text: 'Label the instruments you hear', checked: false },
];

const PlanningGuide = ({ sections, activeSectionIndex, guide, onGuideChange }) => {
  const [newItemText, setNewItemText] = useState('');
  const [editingSection, setEditingSection] = useState(null);
  const activeRef = useRef(null);

  // Auto-scroll to active section
  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeSectionIndex]);

  // Initialize guide if empty
  const sectionGuide = guide || {};

  const getItems = (sectionIndex) => {
    if (sectionGuide[sectionIndex]) return sectionGuide[sectionIndex];
    // Default items based on section data
    const section = sections[sectionIndex];
    if (!section) return DEFAULT_GUIDE.map(d => ({ ...d, id: Math.random() }));
    return [
      { id: `${sectionIndex}-dyn`, text: `Add dynamics sticker (${section.dynamics || '?'})`, checked: false },
      { id: `${sectionIndex}-tempo`, text: `Add tempo label (${section.tempo || '?'})`, checked: false },
      { id: `${sectionIndex}-inst`, text: 'Label the instruments', checked: false },
    ];
  };

  const updateItems = (sectionIndex, newItems) => {
    onGuideChange({ ...sectionGuide, [sectionIndex]: newItems });
  };

  const toggleItem = (sectionIndex, itemId) => {
    const items = getItems(sectionIndex);
    updateItems(sectionIndex, items.map(it =>
      it.id === itemId ? { ...it, checked: !it.checked } : it
    ));
  };

  const removeItem = (sectionIndex, itemId) => {
    const items = getItems(sectionIndex);
    updateItems(sectionIndex, items.filter(it => it.id !== itemId));
  };

  const addItem = (sectionIndex) => {
    if (!newItemText.trim()) return;
    const items = getItems(sectionIndex);
    updateItems(sectionIndex, [...items, {
      id: Date.now(),
      text: newItemText.trim(),
      checked: false,
    }]);
    setNewItemText('');
    setEditingSection(null);
  };

  return (
    <div className="w-40 sm:w-48 lg:w-56 flex-shrink-0 bg-black/20 border-l border-white/10 flex flex-col overflow-y-auto custom-scrollbar">
      <div className="p-2">
        <div className="text-[10px] text-white/40 uppercase font-bold mb-2 text-center tracking-wide">Planning Guide</div>

        {sections.length === 0 ? (
          <div className="text-white/30 text-xs text-center py-4">Add scenes to see your planning guide</div>
        ) : (
          <div className="flex flex-col gap-2">
            {sections.map((section, idx) => {
              const items = getItems(idx);
              const isActive = idx === activeSectionIndex;
              const checkedCount = items.filter(i => i.checked).length;

              return (
                <div
                  key={section.id || idx}
                  ref={isActive ? activeRef : null}
                  className={`rounded-lg border transition-all ${
                    isActive
                      ? 'border-white/30 bg-white/5'
                      : 'border-white/5 bg-white/[0.02]'
                  }`}
                >
                  {/* Section header */}
                  <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-white/5">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: section.color }}
                    >
                      {section.label}
                    </div>
                    <span className="text-[11px] text-white/70 font-medium truncate flex-1">
                      {section.sectionLabel || 'Section'}
                    </span>
                    <span className="text-[9px] text-white/30">
                      {checkedCount}/{items.length}
                    </span>
                  </div>

                  {/* Checklist items */}
                  <div className="px-1.5 py-1 flex flex-col gap-0.5">
                    {items.map(item => (
                      <div key={item.id} className="flex items-start gap-1.5 group">
                        <button
                          onClick={() => toggleItem(idx, item.id)}
                          className={`w-4 h-4 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                            item.checked
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'border-white/20 hover:border-white/40'
                          }`}
                        >
                          {item.checked && <Check size={10} className="text-white" />}
                        </button>
                        <span className={`text-[11px] leading-tight flex-1 ${
                          item.checked ? 'text-white/30 line-through' : 'text-white/70'
                        }`}>
                          {item.text}
                        </span>
                        <button
                          onClick={() => removeItem(idx, item.id)}
                          className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 flex-shrink-0 mt-0.5"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}

                    {/* Add item */}
                    {editingSection === idx ? (
                      <div className="flex gap-1 mt-1">
                        <input
                          type="text"
                          value={newItemText}
                          onChange={(e) => setNewItemText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') addItem(idx);
                            if (e.key === 'Escape') { setEditingSection(null); setNewItemText(''); }
                          }}
                          placeholder="Add item..."
                          className="flex-1 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[11px] text-white placeholder-white/30 outline-none focus:border-white/30"
                          autoFocus
                        />
                        <button
                          onClick={() => addItem(idx)}
                          className="text-emerald-400 hover:text-emerald-300"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditingSection(idx)}
                        className="flex items-center gap-1 text-[10px] text-white/25 hover:text-white/50 mt-0.5 pl-5"
                      >
                        <Plus size={10} /> Add item
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanningGuide;
