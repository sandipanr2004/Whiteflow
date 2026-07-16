import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DefaultFontStyle, DefaultSizeStyle, DefaultTextAlignStyle } from 'tldraw';
import { Type, AlignLeft, AlignCenter, AlignRight, AlignJustify, CaseUpper, CaseLower, ChevronRight } from 'lucide-react';

const FONTS = [
  { id: 'draw', label: 'Draw' },
  { id: 'sans', label: 'Sans' },
  { id: 'serif', label: 'Serif' },
  { id: 'mono', label: 'Mono' },
];

const ALIGNS = [
  { id: 'start', icon: <AlignLeft size={16} /> },
  { id: 'middle', icon: <AlignCenter size={16} /> },
  { id: 'end', icon: <AlignRight size={16} /> },
];

const SIZES = [
  { id: 's', label: 'S' },
  { id: 'm', label: 'M' },
  { id: 'l', label: 'L' },
  { id: 'xl', label: 'XL' },
];

export const CustomTextToolbar = ({ editor }) => {
  const [activeMenu, setActiveMenu] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!editor) return;
    
    // Check if the current tool is text, or if a text shape is selected
    const checkVisibility = () => {
      const selectedShapes = editor.getSelectedShapes();
      const currentTool = editor.getCurrentToolId();
      
      const isTextTool = currentTool === 'text';
      const hasTextSelected = selectedShapes.some(s => s.type === 'text');
      
      setIsVisible(isTextTool || hasTextSelected);
      
      if (!isTextTool && !hasTextSelected) {
        setActiveMenu(null);
      }
    };

    const unsubscribe = editor.store.listen(checkVisibility);
    checkVisibility();
    
    return () => unsubscribe();
  }, [editor]);

  const toggleMenu = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const setFont = (fontId) => {
    if (!editor) return;
    editor.setStyleForNextShapes(DefaultFontStyle, fontId);
    editor.setStyleForSelectedShapes(DefaultFontStyle, fontId);
    setActiveMenu(null);
  };

  const setAlign = (alignId) => {
    if (!editor) return;
    editor.setStyleForNextShapes(DefaultTextAlignStyle, alignId);
    editor.setStyleForSelectedShapes(DefaultTextAlignStyle, alignId);
    setActiveMenu(null);
  };

  const setSize = (sizeId) => {
    if (!editor) return;
    editor.setStyleForNextShapes(DefaultSizeStyle, sizeId);
    editor.setStyleForSelectedShapes(DefaultSizeStyle, sizeId);
    setActiveMenu(null);
  };

  const menuVariants = {
    hidden: { opacity: 0, x: -10, scale: 0.95 },
    visible: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -10, scale: 0.95 }
  };

  if (!editor) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="absolute top-1/2 -translate-y-1/2 left-16 ml-6 z-[9999] flex flex-col gap-4"
        >
          {/* Main Toggle Button */}
          <button 
            onClick={() => toggleMenu(activeMenu ? null : 'all')}
            className={`bg-white/90 dark:bg-black/90 backdrop-blur-md p-3.5 rounded-full shadow-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-gray-700 dark:text-gray-300 ${activeMenu ? 'ring-2 ring-blue-500' : ''}`}
            title="Text Options"
          >
            <Type size={22} />
          </button>

          {/* Options Panel */}
          <AnimatePresence>
            {activeMenu && (
              <motion.div 
                variants={menuVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-black/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-gray-200 dark:border-white/10 flex gap-4 w-max"
              >
                {/* Font Family */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase text-center">Font</span>
                  <div className="flex flex-col gap-1">
                    {FONTS.map(f => (
                      <button
                        key={f.id}
                        onClick={() => setFont(f.id)}
                        className="px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white rounded-lg text-xs font-medium transition-colors text-left"
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-px bg-gray-200 dark:bg-white/10" />

                {/* Alignment */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase text-center">Align</span>
                  <div className="flex flex-col gap-1">
                    {ALIGNS.map(a => (
                      <button
                        key={a.id}
                        onClick={() => setAlign(a.id)}
                        className="p-1.5 bg-gray-100 dark:bg-zinc-800 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white rounded-lg transition-colors flex justify-center"
                        title={a.id}
                      >
                        {a.icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="w-px bg-gray-200 dark:bg-white/10" />

                {/* Size */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-widest uppercase text-center">Size</span>
                  <div className="flex flex-col gap-1">
                    {SIZES.map(s => (
                      <button
                        key={s.id}
                        onClick={() => setSize(s.id)}
                        className="px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white rounded-lg text-xs font-bold transition-colors text-center"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
