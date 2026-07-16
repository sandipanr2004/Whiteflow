import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import styles from './Header.module.css';
import { DemoModal } from './DemoModal';
import { PageLoader } from './PageLoader';
import { useAuth } from '../context/AuthContext';
import { UserMenu } from './UserMenu';
import { AnimatedNavLink } from './AnimatedNavLink';
import { ChevronDown } from 'lucide-react';

const Header = () => {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [showDemoLoader, setShowDemoLoader] = useState(false);
  const [isManuallyToggled, setIsManuallyToggled] = useState(false);

  const handleDemoClick = () => {
    setShowDemoLoader(true);
    setIsDemoOpen(true);
    setTimeout(() => {
      setShowDemoLoader(false);
    }, 3500);
  };

  const handleScroll = (e, targetId) => {
    e.preventDefault();
    const target = document.querySelector(targetId);
    if (!target) return;
    
    const targetPosition = target.getBoundingClientRect().top + window.scrollY;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const duration = 2000;
    let start = null;

    const easeInOutQuart = (t) => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const percentage = Math.min(progress / duration, 1);
      
      window.scrollTo(0, startPosition + distance * easeInOutQuart(percentage));
      
      if (progress < duration) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  };

  const isBoardPage = location.pathname.startsWith('/board');
  const shouldHideHeader = isBoardPage && !isManuallyToggled;

  const isHomePage = location.pathname === '/';
  const pageName = location.pathname.substring(1).charAt(0).toUpperCase() + location.pathname.substring(2);

  return (
    <header 
      className={styles.header}
      style={{
        transform: shouldHideHeader ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <Link to="/" className={styles.logo}>
        WhiteFlow<span className={styles.dot}>.</span>
      </Link>
      
      <nav className={styles.nav}>
        {isHomePage ? (
          <>
            <AnimatedNavLink href="#testimonials" onClick={(e) => handleScroll(e, '#testimonials')} className={`${styles.navLink} font-medium text-[var(--color-charcoal)] dark:text-white`}>Testimonials</AnimatedNavLink>
            <AnimatedNavLink href="#about" onClick={(e) => handleScroll(e, '#about')} className={styles.navLink}>About</AnimatedNavLink>
            {!isLoggedIn && (
              <AnimatedNavLink onClick={handleDemoClick} className={styles.navLink} style={{ cursor: 'pointer', background: 'none', border: 'none' }}>DEMO</AnimatedNavLink>
            )}
          </>
        ) : (
          <>
            <span className="font-semibold text-gray-800 dark:text-gray-200 tracking-wide">
              {pageName}
            </span>
          </>
        )}
      </nav>
      
      <div className={styles.actions}>
        {isLoggedIn ? (
          <UserMenu />
        ) : (
          <Link to="/login" className={styles.loginLink} style={{ cursor: 'pointer', background: 'none', border: 'none', textDecoration: 'none' }}>Login</Link>
        )}
      </div>
      
      {/* Pull-down tab for the Whiteboard */}
      {isBoardPage && (
        <button 
          onClick={() => setIsManuallyToggled(!isManuallyToggled)}
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 h-10 px-6 bg-white/90 dark:bg-black/90 backdrop-blur-md rounded-b-xl shadow-md border border-t-0 border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
          title="Toggle Navigation Bar"
        >
          <ChevronDown size={20} className={`transition-transform duration-300 ${!shouldHideHeader ? 'rotate-180' : ''}`} />
        </button>
      )}
      
      {showDemoLoader && <PageLoader />}
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </header>
  );
};

export default Header;
