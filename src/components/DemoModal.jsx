import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Whiteboard } from './Whiteboard';
import { ChevronUp, ChevronDown, Clock, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import NumberFlow from '@number-flow/react';

export const DemoModal = ({ isOpen, onClose }) => {
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  // Reset timer when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(300);
      setIsHeaderHidden(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  const isDemoEnded = timeLeft <= 0;
  
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  const isWarning = timeLeft <= 60 && timeLeft > 0;

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[500] flex flex-col bg-white overflow-hidden">
      {/* Demo Header */}
      <motion.div 
        initial={false}
        animate={{ y: isHeaderHidden ? '-100%' : '0%' }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="absolute top-0 left-0 w-full flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white z-[510]"
      >
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-display font-bold uppercase tracking-tight">WhiteFlow Demo</h2>
        </div>
        <button 
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
          title="Exit Demo"
        >
          ✕
        </button>
      </motion.div>
      
      {/* Toggle Header Button */}
      <motion.button
        animate={{ y: isHeaderHidden ? 0 : 73 }} // 73px is approx height of header
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        onClick={() => setIsHeaderHidden(!isHeaderHidden)}
        className="absolute top-0 left-1/2 -translate-x-1/2 h-8 px-8 bg-white rounded-b-xl shadow-md border border-t-0 border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors z-[520]"
        title="Toggle Navigation Bar"
      >
        {isHeaderHidden ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </motion.button>

      {/* Floating Timer */}
      <div className={`absolute bottom-6 right-6 backdrop-blur-md px-6 py-2.5 rounded-2xl shadow-lg border flex items-center gap-1.5 transition-colors z-[530] font-mono font-bold tracking-wider text-xl ${isDemoEnded ? 'bg-red-500 text-white border-red-600' : isWarning ? 'bg-orange-500 text-white border-orange-600 animate-pulse' : 'bg-white/90 text-gray-800 border-gray-200'}`}
           style={{ transition: 'background-color 0.3s' }}>
        <Clock size={20} className="mr-1" />
        <NumberFlow value={minutes} format={{ minimumIntegerDigits: 2 }} />
        <span className="opacity-80" style={{ transform: "translateY(-1px)" }}>:</span>
        <NumberFlow value={seconds} format={{ minimumIntegerDigits: 2 }} />
      </div>
      
      {/* Demo Content */}
      <div className="flex-1 relative w-full h-full" style={{ paddingTop: isHeaderHidden ? 0 : 73, transition: 'padding 0.3s ease-in-out' }}>
        <Whiteboard isDemoEnded={isDemoEnded} isDemo={true} />
      </div>

      {/* Demo Ended Overlay */}
      <AnimatePresence>
        {isDemoEnded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-[10000] bg-black/40 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full mx-4 text-center border border-gray-200 flex flex-col items-center gap-6"
            >
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-2">
                <Clock size={32} />
              </div>
              
              <div className="flex flex-col gap-2">
                <h2 className="font-anton text-3xl tracking-wide text-gray-900 uppercase">Session Terminated</h2>
                <p className="text-gray-500 font-medium">Your demo session has been terminated. The board is now in read-only mode.</p>
              </div>
              
              <button 
                onClick={onClose}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg flex justify-center items-center gap-2"
              >
                <Home size={18} /> Exit Demo
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>,
    document.body
  );
};
