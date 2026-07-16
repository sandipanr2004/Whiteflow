import React from 'react';
import styles from './ProblemSolution.module.css';
import { FeatureSteps } from './FeatureSteps';

const defaultImages = [
  { 
    src: "/images/posters/takeda_shingen_poster_1783170960862.png", 
    alt: "Takeda Shingen", 
    title: "Takeda Shingen",
    description: "Fierce samurai vector poster design."
  },
  { 
    src: "/images/posters/dreamer_poster_1783170976438.png", 
    alt: "Dreamer", 
    title: "Dreamer",
    description: "Typography masked poster design."
  },
  { 
    src: "/images/posters/the_high_one_poster_1783170994052.png", 
    alt: "The High One", 
    title: "The High One",
    description: "Gritty punk rock concert poster."
  },
  { 
    src: "/images/posters/zesty_spirit_poster_1783171009650.png", 
    alt: "Zesty Spirit", 
    title: "Zesty Spirit",
    description: "Vintage retro typographic poster design."
  },
  { 
    src: "/images/posters/combinate_poster_1783171027987.png", 
    alt: "Combinate", 
    title: "Combinate",
    description: "Bold font duo showcase poster."
  },
  { 
    src: "https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?q=80&w=400&h=800&auto=format&fit=crop", 
    alt: "Auto Save & Version History", 
    title: "💾 Auto Save",
    description: "Every change is saved automatically and versions can be restored."
  },
  { 
    src: "https://images.unsplash.com/photo-1618005191244-6b92a2a7a40c?q=80&w=400&h=800&auto=format&fit=crop", 
    alt: "Export & Share", 
    title: "📤 Export & Share",
    description: "Download boards as PNG, PDF, or JSON for presentations."
  },
  { 
    src: "https://images.unsplash.com/photo-1618004912476-29818d81ae2e?q=80&w=400&h=800&auto=format&fit=crop", 
    alt: "Private Workspaces", 
    title: "🔒 Private Workspaces",
    description: "Keep your ideas secure with access-controlled private boards."
  },
  { 
    src: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=400&h=800&auto=format&fit=crop", 
    alt: "Lightning Fast Sync", 
    title: "⚡ Lightning Fast Sync",
    description: "See updates instantly with ultra-low latency syncing."
  },
];

const ProblemSolution = () => {
  const mappedFeatures = defaultImages.map((img, idx) => ({
    step: `Step ${idx + 1}`,
    title: img.title,
    content: img.description,
    image: img.src
  }));

  return (
    <section className={styles.container}>
      <FeatureSteps features={mappedFeatures} title="Turn Ideas into Action." autoPlayInterval={4000} />
    </section>
  );
};

export default ProblemSolution;
