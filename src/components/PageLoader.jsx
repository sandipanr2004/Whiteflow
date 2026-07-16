import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export const PageLoader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isRendered, setIsRendered] = useState(true);

  useEffect(() => {
    // Keep loader on screen for a bit, then fade out
    const fadeOutTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2500); // Wait 2.5 seconds before fading out

    const unmountTimer = setTimeout(() => {
      setIsRendered(false);
    }, 3000); // Fully remove from DOM after 3 seconds

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(unmountTimer);
    };
  }, []);

  if (!isRendered) return null;

  return createPortal(
    <>
      <style>{`
        .loader-wrapper {
          position: fixed;
          inset: 0;
          z-index: 9999;
          background: #FDFDFD;
          transition: opacity 500ms ease-in-out;
        }

        .loader {
          position: absolute;
          top: 50%;
          margin-left: -50px;
          left: 50%;
          animation: speeder 0.4s linear infinite;
          z-index: 10;
        }

        .loader > span {
          height: 5px;
          width: 35px;
          background: #000;
          position: absolute;
          top: -19px;
          left: 60px;
          border-radius: 2px 10px 1px 0;
        }

        .base span {
          position: absolute;
          width: 0;
          height: 0;
          border-top: 6px solid transparent;
          border-right: 100px solid #000;
          border-bottom: 6px solid transparent;
        }

        .base span:before {
          content: "";
          height: 22px;
          width: 22px;
          border-radius: 50%;
          background: #000;
          position: absolute;
          right: -110px;
          top: -16px;
        }

        .base span:after {
          content: "";
          position: absolute;
          width: 0;
          height: 0;
          border-top: 0 solid transparent;
          border-right: 55px solid #000;
          border-bottom: 16px solid transparent;
          top: -16px;
          right: -98px;
        }

        .face {
          position: absolute;
          height: 12px;
          width: 20px;
          background: #000;
          border-radius: 20px 20px 0 0;
          transform: rotate(-40deg);
          right: -125px;
          top: -15px;
        }

        .face:after {
          content: "";
          height: 12px;
          width: 12px;
          background: #000;
          right: 4px;
          top: 7px;
          position: absolute;
          transform: rotate(40deg);
          transform-origin: 50% 50%;
          border-radius: 0 0 0 2px;
        }

        .loader > span > span:nth-child(1),
        .loader > span > span:nth-child(2),
        .loader > span > span:nth-child(3),
        .loader > span > span:nth-child(4) {
          width: 30px;
          height: 1px;
          background: #000;
          position: absolute;
          animation: fazer1 0.2s linear infinite;
        }

        .loader > span > span:nth-child(2) {
          top: 3px;
          animation: fazer2 0.4s linear infinite;
        }

        .loader > span > span:nth-child(3) {
          top: 1px;
          animation: fazer3 0.4s linear infinite;
          animation-delay: -1s;
        }

        .loader > span > span:nth-child(4) {
          top: 4px;
          animation: fazer4 1s linear infinite;
          animation-delay: -1s;
        }

        @keyframes fazer1 {
          0% { left: 0; }
          100% { left: -80px; opacity: 0; }
        }
        @keyframes fazer2 {
          0% { left: 0; }
          100% { left: -100px; opacity: 0; }
        }
        @keyframes fazer3 {
          0% { left: 0; }
          100% { left: -50px; opacity: 0; }
        }
        @keyframes fazer4 {
          0% { left: 0; }
          100% { left: -150px; opacity: 0; }
        }

        @keyframes speeder {
          0% { transform: translate(2px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -3px) rotate(-1deg); }
          20% { transform: translate(-2px, 0px) rotate(1deg); }
          30% { transform: translate(1px, 2px) rotate(0deg); }
          40% { transform: translate(1px, -1px) rotate(1deg); }
          50% { transform: translate(-1px, 3px) rotate(-1deg); }
          60% { transform: translate(-1px, 1px) rotate(0deg); }
          70% { transform: translate(3px, 1px) rotate(-1deg); }
          80% { transform: translate(-2px, -1px) rotate(1deg); }
          90% { transform: translate(2px, 1px) rotate(0deg); }
          100% { transform: translate(1px, -2px) rotate(-1deg); }
        }

        .longfazers {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }

        .longfazers span {
          position: absolute;
          height: 2px;
          width: 20%;
          background: #000;
          opacity: 0.1;
        }

        .longfazers span:nth-child(1) {
          top: 20%;
          animation: lf 0.6s linear infinite;
          animation-delay: -5s;
        }

        .longfazers span:nth-child(2) {
          top: 40%;
          animation: lf2 0.8s linear infinite;
          animation-delay: -1s;
        }

        .longfazers span:nth-child(3) {
          top: 60%;
          animation: lf3 0.6s linear infinite;
        }

        .longfazers span:nth-child(4) {
          top: 80%;
          animation: lf4 0.5s linear infinite;
          animation-delay: -3s;
        }

        @keyframes lf { 0% { left: 200%; } 100% { left: -200%; opacity: 0; } }
        @keyframes lf2 { 0% { left: 200%; } 100% { left: -200%; opacity: 0; } }
        @keyframes lf3 { 0% { left: 200%; } 100% { left: -100%; opacity: 0; } }
        @keyframes lf4 { 0% { left: 200%; } 100% { left: -100%; opacity: 0; } }

        .noise-bg {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
          opacity: 0.03;
        }

        .progress-bar-anim {
          animation: progress_bar_anim 3s ease-in-out infinite;
        }

        @keyframes progress_bar_anim {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(50%); }
          100% { transform: translateX(200%); }
        }
      `}</style>

      <div className={`loader-wrapper flex flex-col items-center justify-center overflow-hidden ${isLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        
        {/* Background Texture */}
        <div className="absolute inset-0 noise-bg pointer-events-none"></div>

        {/* Long Fazers Background */}
        <div className="longfazers">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>

        {/* Loader Component Container */}
        <div className="relative w-full max-w-2xl h-[300px] flex items-center justify-center">
          <div className="loader">
            <span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </span>
            <div className="base">
              <span></span>
              <div className="face"></div>
            </div>
          </div>
        </div>

        {/* Content Overlay */}
        <div className="z-20 text-center mt-8 space-y-4">
          <h1 className="font-display text-4xl font-bold tracking-tighter text-black uppercase animate-pulse flex items-center justify-center gap-1">
            WhiteFlow<span className="text-[var(--color-yellow)]">.</span>
          </h1>

          {/* Progress Bar Mockup */}
          <div className="w-64 h-1 bg-gray-200 rounded-full mx-auto mt-12 overflow-hidden relative">
            <div className="h-full bg-black w-1/3 progress-bar-anim"></div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};
