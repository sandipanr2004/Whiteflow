import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import styles from './FeatureSteps.module.css';

export function FeatureSteps({
  features,
  title = "Your Journey Starts Here",
  autoPlayInterval = 3000,
}) {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (progress < 100) {
        setProgress((prev) => prev + 100 / (autoPlayInterval / 100));
      } else {
        setCurrentFeature((prev) => (prev + 1) % features.length);
        setProgress(0);
      }
    }, 100);

    return () => clearInterval(timer);
  }, [progress, features.length, autoPlayInterval]);

  return (
    <div className={styles.container}>
      <div className={styles.inner}>
        <h2 className={styles.title}>{title}</h2>

        <div className={styles.grid}>
          <div className={styles.list}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={styles.featureItem}
                initial={{ opacity: 0.3 }}
                animate={{ opacity: index === currentFeature ? 1 : 0.3 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className={`${styles.iconWrapper} ${
                    index === currentFeature ? styles.iconActive : styles.iconInactive
                  }`}
                >
                  {index <= currentFeature ? (
                    <span className={styles.checkIcon}>✓</span>
                  ) : (
                    <span className={styles.numberIcon}>{index + 1}</span>
                  )}
                </motion.div>

                <div className={styles.featureText}>
                  <h3 className={styles.featureTitle}>
                    {feature.title || feature.step}
                  </h3>
                  <p className={styles.featureContent}>
                    {feature.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className={styles.imageContainer}>
            <AnimatePresence mode="wait">
              {features.map(
                (feature, index) =>
                  index === currentFeature && (
                    <motion.div
                      key={index}
                      className={styles.imageWrapper}
                      initial={{ y: 100, opacity: 0, rotateX: -20 }}
                      animate={{ y: 0, opacity: 1, rotateX: 0 }}
                      exit={{ y: -100, opacity: 0, rotateX: 20 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                      <img
                        src={feature.image}
                        alt={feature.step}
                        className={styles.image}
                      />
                      <div className={styles.gradient} />
                    </motion.div>
                  )
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
