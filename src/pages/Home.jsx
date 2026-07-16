import React from 'react';
import Hero from '../components/Hero';
import { RulerCarousel } from '../components/RulerCarousel';
import Testimonials from '../components/Testimonials';
import WhyChooseUs from '../components/WhyChooseUs';

const carouselItems = [
  { id: 1, title: "Live Collaboration" },
  { id: 2, title: "Infinite Canvas" },
  { id: 3, title: "Smart Drawing" },
  { id: 4, title: "Sticky Notes" },
  { id: 5, title: "Team Chat" },
  { id: 6, title: "Board Sharing" },
  { id: 7, title: "Export Boards" },
  { id: 8, title: "Version History" },
  { id: 9, title: "Private Workspace" },
];

export const Home = () => {
  return (
    <>
      <Hero />
      <RulerCarousel originalItems={carouselItems} />
      <Testimonials />
      <WhyChooseUs />
      {/* Huge subtle watermark between sections */}
      <div className="w-full flex items-center justify-center -mt-[40vh] pb-12 relative z-10">
        <div className="text-[18vw] md:text-[14vw] lg:text-[12vw] leading-none text-center font-sonder text-foreground/[0.03] dark:text-foreground/[0.08] pointer-events-none select-none whitespace-nowrap">
          WHITE FLOW
        </div>
      </div>
    </>
  );
};
