import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, Star, Heart, Droplets } from 'lucide-react';

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const TickerTape = () => {
  const sectionRef = useRef(null);
  const textRef = useRef(null);

  useGSAP(() => {
    if (!sectionRef.current || !textRef.current) return;

    const getScrollAmount = () => {
      const textWidth = textRef.current.scrollWidth;
      const viewportWidth = window.innerWidth;
      // Subtract viewport width so the last word aligns with the right edge (plus some padding)
      return -(textWidth - viewportWidth + 100); 
    };

    const tween = gsap.to(textRef.current, {
      x: getScrollAmount,
      ease: "none",
    });

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: () => `+=${textRef.current.scrollWidth}`,
      pin: true,
      animation: tween,
      scrub: 1,
      invalidateOnRefresh: true, // Recalculates if window resizes
    });

    return () => {
      tween.kill();
    };
  }, { scope: sectionRef });

  return (
    <section 
      ref={sectionRef} 
      className="h-screen w-full text-foreground overflow-hidden flex items-center relative z-20 border-y border-foreground/10"
    >
      
      <div 
        ref={textRef} 
        className="flex items-center gap-8 md:gap-16 whitespace-nowrap text-5xl md:text-7xl lg:text-[10rem] font-bold uppercase tracking-tighter px-4 md:px-20 relative z-10"
        style={{ fontFamily: 'var(--font-anton)' }}
      >
        <span>In every bottle,</span>
        <Sparkles className="w-12 h-12 lg:w-32 lg:h-32 text-[var(--color-yellow)] shrink-0" />
        
        <span>discover the undeniable</span>
        <Star className="w-12 h-12 lg:w-32 lg:h-32 text-[var(--color-yellow)] shrink-0" />
        
        <span>Real Magic</span>
        <Heart className="w-12 h-12 lg:w-32 lg:h-32 text-[var(--color-yellow)] shrink-0" />
        
        <span>of sharing pure</span>
        <Droplets className="w-12 h-12 lg:w-32 lg:h-32 text-[var(--color-yellow)] shrink-0" />
        
        <span>Refreshment</span>
        <Sparkles className="w-12 h-12 lg:w-32 lg:h-32 text-[var(--color-yellow)] shrink-0" />
        
        <span>that brings us</span>
        <Star className="w-12 h-12 lg:w-32 lg:h-32 text-[var(--color-yellow)] shrink-0" />
        
        <span>Together.</span>
      </div>
    </section>
  );
};

export default TickerTape;
