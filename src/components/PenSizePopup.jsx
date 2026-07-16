import React, { useState } from 'react';
import { useValue, DefaultSizeStyle } from 'tldraw';
import { motion, AnimatePresence } from 'motion/react';

const SIZES = [
  { id: 's', label: 'S' },
  { id: 'm', label: 'M' },
  { id: 'l', label: 'L' },
  { id: 'xl', label: 'XL' },
];

export const PenSizePopup = ({ editor }) => {
  const currentTool = useValue('tool', () => editor?.getCurrentToolId(), [editor]);
  const currentSize = useValue('size', () => editor?.getSharedStyles().getAsKnownValue(DefaultSizeStyle), [editor]);

  const setSize = (sizeId) => {
    if (!editor) return;
    editor.setStyleForNextShapes(DefaultSizeStyle, sizeId);
    editor.setStyleForSelectedShapes(DefaultSizeStyle, sizeId);
  };

  // The draw tool id is 'draw'
  if (!editor || currentTool !== 'draw') return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-black/90 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-gray-200 dark:border-white/10 flex gap-2 z-[9999]"
    >
      {SIZES.map(s => (
        <button
          key={s.id}
          onClick={() => setSize(s.id)}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
            currentSize === s.id 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          {s.label}
        </button>
      ))}
    </motion.div>
  );
};
