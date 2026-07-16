import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import Header from './components/Header';
import { Footer } from './components/Footer';
import { PageLoader } from './components/PageLoader';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Board } from './pages/Board';
import { FAQ } from './pages/FAQ';
import { Terms } from './pages/Terms';
import { Policies } from './pages/Policies';
import { Share } from './pages/Share';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { JoinSharedBoard } from './pages/JoinSharedBoard';

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex-1 flex flex-col w-full"
    >
      {children}
    </motion.div>
  );
};

function App() {
  const location = useLocation();
  const [loaderKey, setLoaderKey] = useState(0);
  const isInitialLoad = useRef(true);
  const [reducedMotion, setReducedMotion] = useState(
    localStorage.getItem('reduced-motion') === 'true'
  );

  useEffect(() => {
    const handleReducedMotion = () => {
      setReducedMotion(localStorage.getItem('reduced-motion') === 'true');
    };
    window.addEventListener('reducedMotionChanged', handleReducedMotion);
    return () => window.removeEventListener('reducedMotionChanged', handleReducedMotion);
  }, []);

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }
    if (location.pathname.startsWith('/board')) {
      setLoaderKey(prev => prev + 1);
    }
  }, [location.pathname]);

  return (
    <MotionConfig reducedMotion={reducedMotion ? "always" : "never"}>
      <div style={{ position: 'relative' }} className="min-h-screen flex flex-col overflow-x-hidden">
      <PageLoader key={loaderKey} />
      <Header />
      <main className="flex-1 flex flex-col relative w-full">
        <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/dashboard" element={<PageTransition><Dashboard /></PageTransition>} />
            <Route path="/board" element={<PageTransition><Board /></PageTransition>} />
            <Route path="/board/:roomId" element={<PageTransition><Board /></PageTransition>} />
            <Route path="/share" element={<PageTransition><Share /></PageTransition>} />
            <Route path="/faq" element={<PageTransition><FAQ /></PageTransition>} />
            <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
            <Route path="/policies" element={<PageTransition><Policies /></PageTransition>} />
            <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/join/:token" element={<PageTransition><JoinSharedBoard /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </main>
      {!location.pathname.startsWith('/board') && <Footer />}
      </div>
    </MotionConfig>
  );
}

export default App;
