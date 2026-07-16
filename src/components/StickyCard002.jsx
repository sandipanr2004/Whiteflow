import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ReactLenis from 'lenis/react';
import styles from './StickyCard002.module.css';

const StickyCard002 = ({ cards }) => {
  const container = useRef(null);
  const cardRefs = useRef([]);

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      const cardElements = cardRefs.current.filter(Boolean);
      const totalCards = cardElements.length;

      if (!cardElements[0]) return;

      gsap.set(cardElements[0], { y: '0%', scale: 1, rotation: 0 });

      for (let i = 1; i < totalCards; i++) {
        if (!cardElements[i]) continue;
        gsap.set(cardElements[i], { y: '100%', scale: 1, rotation: 0 });
      }

      const scrollTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: `.${styles.stickyCards}`,
          start: 'top top',
          end: `+=${window.innerHeight * (totalCards - 1)}`,
          pin: true,
          scrub: 0.5,
          pinSpacing: true,
        },
      });

      for (let i = 0; i < totalCards - 1; i++) {
        const currentCard = cardElements[i];
        const nextCard = cardElements[i + 1];
        const position = i;
        if (!currentCard || !nextCard) continue;

        scrollTimeline.to(
          currentCard,
          {
            scale: 0.7,
            rotation: 5,
            duration: 1,
            ease: 'none',
          },
          position,
        );

        scrollTimeline.to(
          nextCard,
          {
            y: '0%',
            duration: 1,
            ease: 'none',
          },
          position,
        );
      }

      const resizeObserver = new ResizeObserver(() => {
        ScrollTrigger.refresh();
      });

      if (container.current) {
        resizeObserver.observe(container.current);
      }

      return () => {
        resizeObserver.disconnect();
        scrollTimeline.kill();
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };
    },
    { scope: container }
  );

  return (
    <div className={styles.wrapper} ref={container}>
      <div className={styles.stickyCards}>
        <div className={styles.containerWrapper}>
          {cards.map((card, i) => (
            <div
              key={i}
              className={styles.cardItem}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
            >
              <img
                src={card.src}
                alt={card.alt || card.title || ''}
                className={styles.image}
              />
              {(card.title || card.description) && (
                <div className={styles.overlay}>
                  {card.title && <h3 className={styles.title}>{card.title}</h3>}
                  {card.description && (
                    <p className={styles.description}>{card.description}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StickyCard002;
