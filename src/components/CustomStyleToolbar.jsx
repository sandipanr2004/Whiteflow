import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DefaultColorStyle, DefaultSizeStyle, DefaultFillStyle } from 'tldraw';
import { Palette, Maximize, Layers } from 'lucide-react';

const COLORS = [
  { id: 'black', hex: '#1d1d1d' },
  { id: 'grey', hex: '#9d9d9d' },
  { id: 'white', hex: '#ffffff' },
  { id: 'light-red', hex: '#ff8787' },
  { id: 'red', hex: '#e03131' },
  { id: 'orange', hex: '#f76707' },
  { id: 'yellow', hex: '#ffb020' },
  { id: 'light-green', hex: '#8ce99a' },
  { id: 'green', hex: '#2f9e44' },
  { id: 'light-blue', hex: '#74c0fc' },
  { id: 'blue', hex: '#1971c2' },
  { id: 'light-violet', hex: '#b197fc' },
  { id: 'violet', hex: '#845ef7' },
];


const SIZES = [
  { id: 's', label: 'S' },
  { id: 'm', label: 'M' },
  { id: 'l', label: 'L' },
  { id: 'xl', label: 'XL' },
];

const FILLS = [
  { id: 'none', label: 'None' },
  { id: 'semi', label: 'Semi' },
  { id: 'solid', label: 'Solid' },
  { id: 'pattern', label: 'Pattern' }
];

export const CustomStyleToolbar = ({ editor }) => {
  const [activeMenu, setActiveMenu] = useState(null);

  const toggleMenu = (menu) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const setColor = (colorId) => {
    if (!editor) return;
    editor.setStyleForNextShapes(DefaultColorStyle, colorId);
    editor.setStyleForSelectedShapes(DefaultColorStyle, colorId);
    setActiveMenu(null);
  };

  const setSize = (sizeId) => {
    if (!editor) return;
    editor.setStyleForNextShapes(DefaultSizeStyle, sizeId);
    editor.setStyleForSelectedShapes(DefaultSizeStyle, sizeId);
    setActiveMenu(null);
  };

  const setFill = (fillId) => {
    if (!editor) return;
    editor.setStyleForNextShapes(DefaultFillStyle, fillId);
    editor.setStyleForSelectedShapes(DefaultFillStyle, fillId);
    setActiveMenu(null);
  };

  const menuVariants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 10, scale: 0.95 }
  };

  if (!editor) return null;

  return (
    <div className="absolute top-20 right-4 z-[9999] flex gap-4">
      {/* Colors Button */}
      <div className="relative flex flex-col items-center">
        <AnimatePresence>
          {activeMenu === 'colors' && (
            <motion.div 
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute top-full mt-4 right-0 bg-white/90 dark:bg-black/90 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-gray-200 dark:border-white/10 flex gap-2"
            >
              <div className="flex flex-wrap w-64 gap-3 justify-center">
                {COLORS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setColor(c.id)}
                    className="w-8 h-8 rounded-full border-2 border-transparent hover:scale-110 transition-transform hover:shadow-md flex-shrink-0"
                    style={{ backgroundColor: c.hex }}
                    title={c.id}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <button 
          onClick={() => toggleMenu('colors')}
          className={`bg-white/90 dark:bg-black/90 backdrop-blur-md p-3.5 rounded-full shadow-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-gray-700 dark:text-gray-300 ${activeMenu === 'colors' ? 'ring-2 ring-blue-500' : ''}`}
        >
          <Palette size={22} />
        </button>
      </div>



      {/* Transparency/Fill Button */}
      <div className="relative flex flex-col items-center">
        <AnimatePresence>
          {activeMenu === 'fill' && (
            <motion.div 
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute top-full mt-4 right-0 bg-white/90 dark:bg-black/90 backdrop-blur-md p-2 rounded-2xl shadow-lg border border-gray-200 dark:border-white/10 flex flex-col gap-2 min-w-[80px]"
            >
              {FILLS.map(f => (
                <button
                  key={f.id}
                  onClick={() => setFill(f.id)}
                  className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 dark:hover:text-white rounded-xl text-sm font-bold transition-colors"
                >
                  {f.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <button 
          onClick={() => toggleMenu('fill')}
          className={`bg-white/90 dark:bg-black/90 backdrop-blur-md p-3.5 rounded-full shadow-lg border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-gray-700 dark:text-gray-300 ${activeMenu === 'fill' ? 'ring-2 ring-blue-500' : ''}`}
        >
          <Layers size={22} />
        </button>
      </div>
    </div>
  );
};
