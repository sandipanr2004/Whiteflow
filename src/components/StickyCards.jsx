import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import ReactLenis from 'lenis/react';
import styles from './StickyCards.module.css';

const StickyCard = ({
  i,
  title,
  description,
  src,
  alt,
  progress,
  range,
  targetScale,
}) => {
  const container = useRef(null);
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div ref={container} className={styles.stickyWrapper}>
      <motion.div
        style={{
          scale,
          top: `calc(15vh + ${i * 30}px)`,
        }}
        className={styles.cardContent}
      >
        <img src={src} alt={alt || title} className={styles.image} />
        {(title || description) && (
          <div className={styles.overlay}>
            {title && <h3 className={styles.title}>{title}</h3>}
            {description && <p className={styles.description}>{description}</p>}
          </div>
        )}
      </motion.div>
    </div>
  );
};

const StickyCards = ({ projects }) => {
  const container = useRef(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  return (
    <ReactLenis root>
      <div
        ref={container}
        className={styles.mainContainer}
      >
        <div className={styles.hintWrapper}>
          <span className={styles.hintText}>
            scroll down to see card stack
          </span>
        </div>
        {projects.map((project, i) => {
          const targetScale = Math.max(
            0.5,
            1 - (projects.length - i - 1) * 0.05
          );
          return (
            <StickyCard
              key={`p_${i}`}
              i={i}
              {...project}
              progress={scrollYProgress}
              range={[i * 0.15, 1]}
              targetScale={targetScale}
            />
          );
        })}
      </div>
    </ReactLenis>
  );
};

export default StickyCards;
