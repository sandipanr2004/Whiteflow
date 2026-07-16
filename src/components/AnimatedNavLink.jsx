import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Link } from 'react-router-dom';

export const AnimatedNavLink = ({ children, onClick, href, to, className = '', style = {} }) => {
  const containerRef = useRef(null);
  const circleRef = useRef(null);
  const labelRef = useRef(null);
  const hoverLabelRef = useRef(null);
  const tlRef = useRef(null);
  const activeTweenRef = useRef(null);

  useEffect(() => {
    const layout = () => {
      const container = containerRef.current;
      const circle = circleRef.current;
      if (!container || !circle) return;
      
      const rect = container.getBoundingClientRect();
      const { width: w, height: h } = rect;
      
      // Calculate the radius for the expanding circle to cover the container
      const R = ((w * w) / 4 + h * h) / (2 * h);
      const D = Math.ceil(2 * R) + 2;
      const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
      const originY = D - delta;

      circle.style.width = `${D}px`;
      circle.style.height = `${D}px`;
      circle.style.bottom = `-${delta}px`;
      
      gsap.set(circle, {
        xPercent: -50,
        scale: 0,
        transformOrigin: `50% ${originY}px`
      });

      if (labelRef.current) gsap.set(labelRef.current, { y: 0 });
      if (hoverLabelRef.current) gsap.set(hoverLabelRef.current, { y: h + 12, opacity: 0 });

      tlRef.current?.kill();
      const tl = gsap.timeline({ paused: true });
      
      tl.to(circle, { 
        scale: 1.2, 
        xPercent: -50, 
        duration: 0.8, 
        ease: 'power3.out', 
        overwrite: 'auto' 
      }, 0);
      
      if (labelRef.current) {
        tl.to(labelRef.current, { 
          y: -(h + 8), 
          duration: 0.6, 
          ease: 'power3.out', 
          overwrite: 'auto' 
        }, 0);
      }
      
      if (hoverLabelRef.current) {
        gsap.set(hoverLabelRef.current, { y: Math.ceil(h + 20), opacity: 0 });
        tl.to(hoverLabelRef.current, { 
          y: 0, 
          opacity: 1, 
          duration: 0.6, 
          ease: 'power3.out', 
          overwrite: 'auto' 
        }, 0);
      }
      
      tlRef.current = tl;
    };

    layout();
    
    const onResize = () => layout();
    window.addEventListener('resize', onResize);
    if (document.fonts) {
      document.fonts.ready.then(layout).catch(() => {});
    }

    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleEnter = () => {
    const tl = tlRef.current;
    if (!tl) return;
    activeTweenRef.current?.kill();
    activeTweenRef.current = tl.tweenTo(tl.duration(), {
      duration: 0.4,
      ease: 'power3.out',
      overwrite: 'auto'
    });
  };

  const handleLeave = () => {
    const tl = tlRef.current;
    if (!tl) return;
    activeTweenRef.current?.kill();
    activeTweenRef.current = tl.tweenTo(0, {
      duration: 0.3,
      ease: 'power3.out',
      overwrite: 'auto'
    });
  };

  const Component = to ? Link : (href ? 'a' : 'button');

  return (
    <Component
      ref={containerRef}
      href={href}
      to={to}
      onClick={onClick}
      className={`relative overflow-hidden inline-flex items-center justify-center px-4 py-2 rounded-full cursor-pointer no-underline ${className}`}
      style={style}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <span
        ref={circleRef}
        className="absolute left-1/2 bottom-0 rounded-full z-[1] block pointer-events-none bg-black dark:bg-white"
        style={{ willChange: 'transform' }}
        aria-hidden="true"
      />
      <span className="relative inline-block leading-none z-[2] overflow-hidden py-1">
        <span ref={labelRef} className="relative z-[2] inline-block" style={{ willChange: 'transform' }}>
          {children}
        </span>
        <span
          ref={hoverLabelRef}
          className="absolute left-0 top-1 z-[3] inline-block w-full text-center text-white dark:text-black font-medium"
          style={{ willChange: 'transform, opacity' }}
          aria-hidden="true"
        >
          {children}
        </span>
      </span>
    </Component>
  );
};
