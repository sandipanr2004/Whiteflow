import React from 'react';
import styles from './Hero.module.css';
import RotatingText from './RotatingText';
import { motion, LayoutGroup } from 'motion/react';

const Hero = () => {
  return (
    <section className={styles.heroSection}>
      <div className={styles.badge}>
        <div className={styles.badgeDot}></div>
        Draw Together. Think Without Limits.
      </div>
      
      <h1 className={styles.headline}>
        One Canvas.<br />
        <span className={styles.highlightWrapper}>
          <span className={styles.highlightText}>Endless Possibilities.</span>
          <span className={styles.highlight}></span>
        </span>
      </h1>
      
      <p className={styles.subheadline}>
        Collaborate in real time, brainstorm ideas, and turn thoughts into visuals with WhiteFlow.
      </p>
      
      <LayoutGroup id="hero-layout">
        <motion.div layout transition={{ type: "spring", damping: 25, stiffness: 120 }} style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', fontSize: '4rem', fontWeight: 'bold', textTransform: 'uppercase', fontFamily: 'var(--font-anton)' }}>
          <motion.div 
            layout="position"
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            style={{ 
              fontFamily: 'var(--font-script)', 
              color: '#ff5800', 
              textTransform: 'none', 
              fontWeight: 'normal',
              fontSize: '1.2em',
              whiteSpace: 'nowrap',
              paddingRight: '0.1em'
            }}
          >
            Create
          </motion.div>
          <RotatingText
            texts={['Collaborate', 'Innovate', 'Share', 'Succeed', 'Sketch', 'Plan', 'Share', 'Repeat']}
            mainClassName="px-2 sm:px-2 md:px-3 bg-yellow text-black overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg"
            staggerFrom={"last"}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-120%" }}
            staggerDuration={0.025}
            splitLevelClassName="overflow-hidden pb-0.5"
            transition={{ type: "spring", damping: 25, stiffness: 120 }}
            rotationInterval={1200}
            animatePresenceMode="popLayout"
          />
        </motion.div>
      </LayoutGroup>
    </section>
  );
};

export default Hero;
