import React, { useCallback, useLayoutEffect, useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useNavigate } from 'react-router-dom';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const StaggeredMenu = ({
  position = 'right',
  colors = ['#1a1a1b', '#2a2a2b', '#ffffff'],
  items = [],
  socialItems = [],
  displaySocials = true,
  displayItemNumbering = true,
  className,
  menuButtonColor = 'currentColor',
  openMenuButtonColor = '#000000',
  changeMenuColorOnOpen = true,
  accentColor = '#5227FF',
  closeOnClickAway = true,
  onMenuOpen,
  onMenuClose,
  customTrigger,
  footerContent,
}) => {
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const panelRef = useRef(null);
  const preLayersRef = useRef(null);
  const preLayerElsRef = useRef([]);
  const plusHRef = useRef(null);
  const plusVRef = useRef(null);
  const iconRef = useRef(null);
  const textInnerRef = useRef(null);
  const [textLines, setTextLines] = useState(['Menu', 'Close']);
  
  const openTlRef = useRef(null);
  const closeTweenRef = useRef(null);
  const spinTweenRef = useRef(null);
  const textCycleAnimRef = useRef(null);
  const colorTweenRef = useRef(null);
  const toggleBtnRef = useRef(null);
  const busyRef = useRef(false);

  useEffect(() => {
    if (!open) return;

    // Aggressively capture and kill all scroll events to stop Lenis without losing scroll position
    const preventScroll = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    };
    
    // capture: true ensures this runs before ANY other listeners (including Lenis)
    window.addEventListener('wheel', preventScroll, { passive: false, capture: true });
    window.addEventListener('touchmove', preventScroll, { passive: false, capture: true });
    // Also block keydown for arrow keys/spacebar scrolling
    const preventKeys = (e) => {
      if (['ArrowUp', 'ArrowDown', 'Space', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.code)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    };
    window.addEventListener('keydown', preventKeys, { passive: false, capture: true });

    return () => {
      window.removeEventListener('wheel', preventScroll, { capture: true });
      window.removeEventListener('touchmove', preventScroll, { capture: true });
      window.removeEventListener('keydown', preventKeys, { capture: true });
    };
  }, [open]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;
      const plusH = plusHRef.current;
      const plusV = plusVRef.current;
      const icon = iconRef.current;
      const textInner = textInnerRef.current;
      
      if (!panel) return;

      let preLayers = [];
      if (preContainer) {
        preLayers = Array.from(preContainer.querySelectorAll('.sm-prelayer'));
      }
      preLayerElsRef.current = preLayers;

      const offscreen = position === 'left' ? -100 : 100;
      gsap.set([panel, ...preLayers], { xPercent: offscreen });
      
      if (plusH && plusV && icon && textInner) {
        gsap.set(plusH, { transformOrigin: '50% 50%', rotate: 0 });
        gsap.set(plusV, { transformOrigin: '50% 50%', rotate: 90 });
        gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' });
        gsap.set(textInner, { yPercent: 0 });
      }
      
      if (toggleBtnRef.current && !customTrigger) gsap.set(toggleBtnRef.current, { color: menuButtonColor });
    });
    return () => ctx.revert();
  }, [menuButtonColor, position, customTrigger]);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    if (closeTweenRef.current) {
      closeTweenRef.current.kill();
      closeTweenRef.current = null;
    }

    const itemEls = Array.from(panel.querySelectorAll('.sm-panel-itemLabel'));
    const socialTitle = panel.querySelector('.sm-socials-title');
    const socialLinks = Array.from(panel.querySelectorAll('.sm-socials-link'));
    const logoutBtn = panel.querySelector('.sm-logout-btn');

    const layerStates = layers.map(el => ({ el, start: Number(gsap.getProperty(el, 'xPercent')) }));
    const panelStart = Number(gsap.getProperty(panel, 'xPercent'));

    if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });
    if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
    if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });
    if (logoutBtn) gsap.set(logoutBtn, { opacity: 0, y: 20 });

    const tl = gsap.timeline({ paused: true });

    layerStates.forEach((ls, i) => {
      tl.fromTo(ls.el, { xPercent: ls.start }, { xPercent: 0, duration: 0.35, ease: 'power4.out' }, i * 0.03);
    });

    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.03 : 0;
    const panelInsertTime = lastTime + (layerStates.length ? 0.04 : 0);
    const panelDuration = 0.5;

    tl.fromTo(
      panel,
      { xPercent: panelStart },
      { xPercent: 0, duration: panelDuration, ease: 'power4.out' },
      panelInsertTime
    );

    if (itemEls.length) {
      const itemsStart = panelInsertTime + panelDuration * 0.15;
      tl.to(
        itemEls,
        { 
          yPercent: 0, 
          rotate: 0, 
          duration: 1, 
          ease: 'power4.out', 
          stagger: { each: 0.1, from: 'start' } 
        },
        itemsStart
      );
    }

    if (socialTitle || socialLinks.length || logoutBtn) {
      const socialsStart = panelInsertTime + panelDuration * 0.4;
      if (socialTitle) tl.to(socialTitle, { opacity: 1, duration: 0.5, ease: 'power2.out' }, socialsStart);
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: 'power3.out',
            stagger: { each: 0.08, from: 'start' }
          },
          socialsStart + 0.04
        );
      }
      if (logoutBtn) {
        tl.to(logoutBtn, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, socialsStart + 0.2);
      }
    }

    openTlRef.current = tl;
    return tl;
  }, [position]);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback('onComplete', () => {
        busyRef.current = false;
      });
      tl.play(0);
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    const all = [...layers, panel];
    closeTweenRef.current?.kill();
    const offscreen = position === 'left' ? -100 : 100;

    closeTweenRef.current = gsap.to(all, {
      xPercent: offscreen,
      duration: 0.35,
      ease: 'power3.in',
      stagger: {
        each: 0.05,
        from: 'end'
      },
      overwrite: 'auto',
      onComplete: () => {
        busyRef.current = false;
      }
    });
  }, [position]);

  const animateIcon = useCallback((opening) => {
    const icon = iconRef.current;
    const h = plusHRef.current;
    const v = plusVRef.current;
    if (!icon || !h || !v) return;

    spinTweenRef.current?.kill();
    if (opening) {
      spinTweenRef.current = gsap.timeline({ defaults: { ease: 'power4.out' } })
        .to(h, { rotate: 45, duration: 0.5 }, 0)
        .to(v, { rotate: -45, duration: 0.5 }, 0);
    } else {
      spinTweenRef.current = gsap.timeline({ defaults: { ease: 'power3.inOut' } })
        .to(h, { rotate: 0, duration: 0.35 }, 0)
        .to(v, { rotate: 90, duration: 0.35 }, 0);
    }
  }, []);

  const animateColor = useCallback((opening) => {
    const btn = toggleBtnRef.current;
    if (!btn || customTrigger) return;
    colorTweenRef.current?.kill();
    
    if (changeMenuColorOnOpen) {
      const targetColor = opening ? openMenuButtonColor : menuButtonColor;
      colorTweenRef.current = gsap.to(btn, { color: targetColor, delay: 0.18, duration: 0.3, ease: 'power2.out' });
    }
  }, [openMenuButtonColor, menuButtonColor, changeMenuColorOnOpen, customTrigger]);

  const animateText = useCallback((opening) => {
    const inner = textInnerRef.current;
    if (!inner) return;
    textCycleAnimRef.current?.kill();

    const targetLabel = opening ? 'Close' : 'Menu';
    const seq = opening ? ['Menu', '...', 'Close'] : ['Close', '...', 'Menu'];
    
    setTextLines(seq);
    gsap.set(inner, { yPercent: 0 });
    
    const lineCount = seq.length;
    const finalShift = ((lineCount - 1) / lineCount) * 100;
    
    textCycleAnimRef.current = gsap.to(inner, {
      yPercent: -finalShift,
      duration: 0.5,
      ease: 'power4.out'
    });
  }, []);

  const toggleMenu = useCallback((e) => {
    if (e && e.preventDefault) e.preventDefault();
    const target = !openRef.current;
    openRef.current = target;
    setOpen(target);
    
    if (target) {
      onMenuOpen?.();
      playOpen();
    } else {
      onMenuClose?.();
      playClose();
    }
    
    if (!customTrigger) {
      animateIcon(target);
      animateColor(target);
      animateText(target);
    }
  }, [playOpen, playClose, animateIcon, animateColor, animateText, onMenuOpen, onMenuClose, customTrigger]);

  useEffect(() => {
    if (!closeOnClickAway || !open) return;
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target) && 
          toggleBtnRef.current && !toggleBtnRef.current.contains(event.target)) {
        toggleMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeOnClickAway, open, toggleMenu]);

  // The sliding panels that will be portaled to document.body
  const menuPortal = typeof document !== 'undefined' ? createPortal(
    <div 
      className={cn("staggered-menu-wrapper pointer-events-none fixed inset-0 z-[999]", className)}
      style={{ '--sm-accent': accentColor }}
      data-position={position}
    >
      {/* Layer Backgrounds */}
      <div ref={preLayersRef} className={cn(
        "sm-prelayers absolute top-0 bottom-0 pointer-events-none w-[100vw] sm:w-[50vw] md:w-[40vw] lg:w-[35vw]",
        position === 'left' ? 'left-0' : 'right-0'
      )}>
        {colors.slice(0, -1).map((c, i) => (
          <div 
            key={i} 
            className="sm-prelayer absolute inset-0" 
            style={{ background: c, willChange: 'transform' }} 
          />
        ))}
      </div>

      {/* Menu Panel */}
      <aside
        ref={panelRef}
        className={cn(
          "staggered-menu-panel absolute top-0 bottom-0 pointer-events-auto flex flex-col pt-32 pb-12 px-8 sm:px-12 overflow-y-auto shadow-2xl w-[100vw] sm:w-[50vw] md:w-[40vw] lg:w-[35vw]",
          position === 'left' ? 'left-0' : 'right-0'
        )}
        style={{ background: colors[colors.length - 1], willChange: 'transform' }}
      >
        {/* Close Button inside panel (if customTrigger is used, we still need a way to close it on mobile if clicking outside is disabled) */}
        {customTrigger && (
          <button 
            onClick={toggleMenu}
            className="absolute top-8 right-8 w-10 h-10 rounded-full bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white flex items-center justify-center transition-colors focus:outline-none"
          >
            ✕
          </button>
        )}

        <div className="flex-1 flex flex-col">
          <nav>
            <ul className="flex flex-col gap-4 list-none p-0 m-0">
              {items.map((item, idx) => (
                <FlowingMenuItem 
                  key={idx}
                  item={item}
                  idx={idx}
                  closeMenu={toggleMenu}
                  displayItemNumbering={displayItemNumbering}
                  marqueeBgColor="var(--sm-accent)"
                  marqueeTextColor="var(--color-charcoal)"
                />
              ))}
            </ul>
          </nav>

          {(displaySocials && socialItems.length > 0) || footerContent ? (
            <div className="mt-auto pt-12">
              {displaySocials && socialItems.length > 0 && (
                <>
                  <h3 className="sm-socials-title text-xs font-bold uppercase tracking-widest mb-6 opacity-40 dark:text-white">Quick Links</h3>
                  <ul className="flex flex-wrap gap-x-8 gap-y-2 list-none p-0 m-0">
                    {socialItems.map((social, i) => (
                      <li key={i}>
                        <a
                          href={social.link}
                          className="sm-socials-link text-sm font-medium text-black dark:text-white no-underline hover:text-[var(--sm-accent)] transition-colors py-1 inline-block"
                        >
                          {social.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {typeof footerContent === 'function' ? footerContent({ closeMenu: toggleMenu }) : footerContent}
            </div>
          ) : null}
        </div>
      </aside>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <div 
        ref={toggleBtnRef} 
        onClick={toggleMenu}
        className={cn("inline-block", !customTrigger && "cursor-pointer")}
      >
        {customTrigger ? (
          customTrigger
        ) : (
          <button
            className="sm-toggle pointer-events-auto flex items-center gap-3 px-6 py-3 rounded-full bg-transparent hover:bg-foreground/5 transition-colors focus:outline-none"
            aria-expanded={open}
          >
            <div className="relative h-[1.2em] overflow-hidden min-w-[50px] text-left text-black">
              <div ref={textInnerRef} className="flex flex-col font-medium uppercase tracking-wider text-sm">
                {textLines.map((line, i) => (
                  <span key={i} className="h-[1.2em] leading-tight flex items-center">{line}</span>
                ))}
              </div>
            </div>
            <div ref={iconRef} className="relative w-4 h-4 text-black">
              <span ref={plusHRef} className="absolute top-1/2 left-0 w-full h-0.5 bg-current rounded-full -translate-y-1/2" />
              <span ref={plusVRef} className="absolute top-0 left-1/2 w-0.5 h-full bg-current rounded-full -translate-x-1/2" />
            </div>
          </button>
        )}
      </div>
      
      {menuPortal}
    </>
  );
};

const FlowingMenuItem = ({
  item,
  idx,
  closeMenu,
  displayItemNumbering,
  marqueeBgColor,
  marqueeTextColor
}) => {
  const navigate = useNavigate();
  const itemRef = useRef(null);
  const marqueeRef = useRef(null);
  const marqueeInnerRef = useRef(null);
  const [repetitions, setRepetitions] = useState(4);
  const animationDefaults = { duration: 0.6, ease: 'expo.out' };

  const findClosestEdge = (mouseX, mouseY, width, height) => {
    const topEdgeDist = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY, 2);
    const bottomEdgeDist = Math.pow(mouseX - width / 2, 2) + Math.pow(mouseY - height, 2);
    return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
  };

  useEffect(() => {
    const calculateRepetitions = () => {
      if (!marqueeInnerRef.current) return;
      const marqueeContent = marqueeInnerRef.current.querySelector('.marquee-part');
      if (!marqueeContent) return;
      const contentWidth = marqueeContent.offsetWidth;
      const viewportWidth = window.innerWidth;
      const needed = Math.ceil(viewportWidth / (contentWidth || 100)) + 2;
      setRepetitions(Math.max(4, needed));
    };

    calculateRepetitions();
    window.addEventListener('resize', calculateRepetitions);
    return () => window.removeEventListener('resize', calculateRepetitions);
  }, [item.label]);

  const handleMouseEnter = (ev) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);
    
    gsap.timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .set(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' }, 0);
  };

  const handleMouseLeave = (ev) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(ev.clientX - rect.left, ev.clientY - rect.top, rect.width, rect.height);
    
    gsap.timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .to(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0);
  };

  return (
    <li className="relative overflow-hidden list-none" ref={itemRef}>
      <a
        href={item.link}
        onClick={(e) => {
          e.preventDefault();
          if (item.onClick) {
            item.onClick(closeMenu);
          } else if (item.link && item.link !== '#') {
            closeMenu();
            setTimeout(() => {
              if (item.link === '/' && window.location.pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                navigate(item.link);
              }
            }, 300);
          }
        }}
        className="group relative flex items-baseline gap-4 no-underline cursor-pointer py-1"
        aria-label={item.ariaLabel}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {displayItemNumbering && (
          <span className="text-sm font-medium opacity-40 translate-y-[-0.5rem] dark:text-white transition-opacity group-hover:opacity-0">
            {(idx + 1).toString().padStart(2, '0')}
          </span>
        )}
        {/* We keep sm-panel-itemLabel so the entrance animation still works! */}
        <span className="sm-panel-itemLabel inline-block font-display font-bold text-3xl sm:text-4xl lg:text-4xl text-black dark:text-white uppercase tracking-tighter transition-opacity group-hover:opacity-0 whitespace-nowrap">
          {item.label}
        </span>
      </a>

      {/* Marquee Element Overlay */}
      <div
        className="absolute top-0 left-[-20vw] w-[150vw] h-full overflow-hidden pointer-events-none translate-y-[101%] z-10"
        ref={marqueeRef}
        style={{ backgroundColor: marqueeBgColor }}
      >
        <div 
          className="h-full w-fit flex items-center" 
          ref={marqueeInnerRef}
          style={{ animation: 'sm-marquee 10s linear infinite' }}
        >
          {[...Array(repetitions)].map((_, i) => (
            <div className="marquee-part flex items-center flex-shrink-0 px-4" key={i} style={{ color: marqueeTextColor }}>
              <span className="whitespace-nowrap font-display font-bold text-3xl sm:text-4xl lg:text-4xl uppercase tracking-tighter">{item.label}</span>
              <div className="w-2 h-2 rounded-full bg-current mx-4 opacity-50" />
            </div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes sm-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / ${repetitions})); }
        }
      `}</style>
    </li>
  );
};
