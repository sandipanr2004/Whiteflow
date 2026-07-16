import React, { useRef } from 'react';
import { motion, useMotionTemplate, useScroll, useTransform } from "motion/react";
import ReactLenis from "lenis/react";

const WhyChooseUs = () => {
  const targetRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const yMotionValue = useTransform(scrollYProgress, [0, 1], [487, 0]);
  const rotateXValue = useTransform(scrollYProgress, [0, 1], [30, 0]);
  const transform = useMotionTemplate`rotateX(${rotateXValue}deg) translateY(${yMotionValue}px) translateZ(10px)`;

  return (
    <section id="about" className="relative bg-transparent mt-20 text-foreground overflow-hidden">
      {/* Huge subtle watermark in the background */}
      <div className="absolute top-[350px] left-1/2 -translate-x-1/2 text-[18vw] md:text-[14vw] lg:text-[12vw] leading-none text-center font-sonder text-foreground/[0.03] dark:text-foreground/[0.08] pointer-events-none select-none z-0">
        WELCOME<br />TO
      </div>
      <div className="container relative z-10 mx-auto px-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto text-center"
        >
          <h2 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl tracking-tighter mt-5 uppercase text-center relative inline-block"
            style={{ fontFamily: 'var(--font-anton)' }}
          >
            <span className="relative z-10">About</span>
            <svg
              className="absolute -bottom-2 md:-bottom-4 left-0 w-full h-auto text-[var(--color-yellow)] z-0"
              viewBox="0 0 300 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="10"
              strokeLinecap="round"
            >
              <motion.path
                d="M 5 15 C 80 5, 200 20, 295 10"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.1 }}
              />
            </svg>
          </h2>
          <p className="mt-5 opacity-75 mb-16">
            Discover what makes our platform the perfect choice for your team.
          </p>
          
          <motion.div 
            className="flex flex-col items-center justify-center gap-4 mt-8"
            animate={{ y: [0, 15, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <span className="text-sm font-medium uppercase tracking-widest text-foreground/50">
              Scroll down to read
            </span>
            <div className="w-[1px] h-16 bg-gradient-to-b from-foreground/50 to-transparent" />
          </motion.div>
        </motion.div>
      </div>

      <ReactLenis root>
        <div
          ref={targetRef}
          className="relative z-0 h-[300vh] w-full bg-transparent text-foreground mb-4"
        >
          <div
            className="sticky top-0 mx-auto flex items-center justify-center bg-transparent py-20"
            style={{
              transformStyle: "preserve-3d",
              perspective: "200px",
            }}
          >

            <motion.div
              style={{
                transformStyle: "preserve-3d",
                transform,
              }}
              className="font-geist w-full max-w-4xl text-center text-6xl font-bold tracking-tighter text-[#ff5800]"
            >
              WhiteFlow is a real-time collaborative whiteboard platform designed to help teams, students, educators, and professionals turn ideas into reality. Whether you're brainstorming concepts, designing system architectures, creating wireframes, or planning projects, WhiteFlow provides an intuitive digital workspace where everyone can collaborate seamlessly. With powerful drawing tools, live synchronization, board sharing, version history, and secure cloud storage, WhiteFlow makes teamwork faster, smarter, and more productive—all on a single infinite canvas.
              <div className="absolute bottom-0 left-0 h-[60vh] w-full bg-gradient-to-b from-transparent to-background" />
            </motion.div>
          </div>
        </div>
      </ReactLenis>
    </section>
  );
};

export default WhyChooseUs;
