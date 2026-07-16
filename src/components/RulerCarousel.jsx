import React, { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { Rewind, FastForward } from "lucide-react";
import styles from "./RulerCarousel.module.css";

const createInfiniteItems = (originalItems) => {
  const items = [];
  for (let i = 0; i < 3; i++) {
    originalItems.forEach((item, index) => {
      items.push({
        ...item,
        id: `${i}-${item.id}`,
        originalIndex: index,
      });
    });
  }
  return items;
};

const RulerLines = ({ top = true, totalLines = 100 }) => {
  const lines = [];
  const lineSpacing = 100 / (totalLines - 1);

  for (let i = 0; i < totalLines; i++) {
    const isFifth = i % 5 === 0;
    const isCenter = i === Math.floor(totalLines / 2);

    let lineClass = styles.lineNormal;
    if (isCenter) {
      lineClass = styles.lineCenter;
    } else if (isFifth) {
      lineClass = styles.lineFifth;
    }

    const positionClass = top ? styles.lineTop : styles.lineBottom;

    lines.push(
      <div
        key={i}
        className={`${styles.line} ${lineClass} ${positionClass}`}
        style={{ left: `${i * lineSpacing}%` }}
      />
    );
  }

  return <div className={styles.rulerLinesWrapper}>{lines}</div>;
};

export function RulerCarousel({ originalItems }) {
  const infiniteItems = createInfiniteItems(originalItems);
  const itemsPerSet = originalItems.length;

  const [activeIndex, setActiveIndex] = useState(itemsPerSet + 4);
  const [isResetting, setIsResetting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const previousIndexRef = useRef(itemsPerSet + 4);

  const handleItemClick = (newIndex) => {
    if (isResetting) return;

    const targetOriginalIndex = newIndex % itemsPerSet;

    const possibleIndices = [
      targetOriginalIndex,
      targetOriginalIndex + itemsPerSet,
      targetOriginalIndex + itemsPerSet * 2,
    ];

    let closestIndex = possibleIndices[0];
    let smallestDistance = Math.abs(possibleIndices[0] - activeIndex);

    for (const index of possibleIndices) {
      const distance = Math.abs(index - activeIndex);
      if (distance < smallestDistance) {
        smallestDistance = distance;
        closestIndex = index;
      }
    }

    previousIndexRef.current = activeIndex;
    setActiveIndex(closestIndex);
  };

  const handlePrevious = () => {
    if (isResetting) return;
    setActiveIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (isResetting) return;
    setActiveIndex((prev) => prev + 1);
  };

  useEffect(() => {
    if (isResetting) return;

    if (activeIndex < itemsPerSet) {
      setIsResetting(true);
      setTimeout(() => {
        setActiveIndex(activeIndex + itemsPerSet);
        setIsResetting(false);
      }, 0);
    } else if (activeIndex >= itemsPerSet * 2) {
      setIsResetting(true);
      setTimeout(() => {
        setActiveIndex(activeIndex - itemsPerSet);
        setIsResetting(false);
      }, 0);
    }
  }, [activeIndex, itemsPerSet, isResetting]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (isResetting) return;

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveIndex((prev) => prev - 1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveIndex((prev) => prev + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isResetting]);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => {
        // We handle resetting logic inside the other useEffect, so just increment here
        return prev + 1;
      });
    }, 2000);

    return () => clearInterval(timer);
  }, []);

  const centerPosition = 5;
  const targetX = -500 + (centerPosition - (activeIndex % itemsPerSet)) * 500;

  const currentPage = (activeIndex % itemsPerSet) + 1;
  const totalPages = itemsPerSet;

  return (
    <div className={styles.container}>
      <div className={styles.carouselWrapper}>
        <div className={styles.rulerContainer}>
          <RulerLines top />
        </div>
        
        <div className={styles.viewport}>
          <motion.div
            className={styles.track}
            animate={{ x: targetX }}
            transition={
              isResetting
                ? { duration: 0 }
                : { type: "spring", stiffness: 260, damping: 20, mass: 1 }
            }
          >
            {infiniteItems.map((item, index) => {
              const isActive = index === activeIndex;

              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleItemClick(index)}
                  className={`${styles.item} ${isActive ? styles.itemActive : styles.itemInactive}`}
                  animate={{
                    scale: isActive ? 1 : 0.75,
                    opacity: isActive ? 1 : 0.4,
                  }}
                  transition={
                    isResetting
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 400, damping: 25 }
                  }
                >
                  {item.title}
                </motion.button>
              );
            })}
          </motion.div>
        </div>

        <div className={styles.rulerContainer}>
          <RulerLines top={false} />
        </div>
      </div>
      
      <div className={styles.controls}>
        <button
          onClick={handlePrevious}
          disabled={isResetting}
          className={styles.controlButton}
          aria-label="Previous item"
        >
          <Rewind className="w-5 h-5" />
        </button>

        <div className={styles.pagination}>
          <span className={styles.pageCurrent}>{currentPage}</span>
          <span className={styles.pageSeparator}>/</span>
          <span className={styles.pageTotal}>{totalPages}</span>
        </div>

        <button
          onClick={handleNext}
          disabled={isResetting}
          className={styles.controlButton}
          aria-label="Next item"
        >
          <FastForward className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
