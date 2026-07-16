import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import styles from './HoverExpand001.module.css';

const HoverExpand001 = ({ images }) => {
  const [activeImage, setActiveImage] = useState(1);

  return (
    <motion.div
      initial={{ opacity: 0, translateY: 20 }}
      whileInView={{ opacity: 1, translateY: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className={styles.container}
    >
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.flexContainer}>
          {images.map((image, index) => (
            <motion.div
              key={index}
              className={styles.imageCard}
              initial={{ flex: 1, height: "30rem" }}
              animate={{
                flex: activeImage === index ? 10 : 1,
                height: "30rem",
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onClick={() => setActiveImage(index)}
              onHoverStart={() => setActiveImage(index)}
            >
              <AnimatePresence>
                {activeImage === index && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={styles.gradientOverlay}
                  />
                )}
              </AnimatePresence>
              <AnimatePresence>
                {activeImage === index && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={styles.textOverlay}
                  >
                    {image.title && <h3 className={styles.title}>{image.title}</h3>}
                    {image.description && (
                      <p className={styles.description}>{image.description}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              <img
                src={image.src}
                className={styles.image}
                alt={image.alt || image.title || ''}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HoverExpand001;
