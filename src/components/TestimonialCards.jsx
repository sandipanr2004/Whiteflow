import React from 'react';
import styles from './TestimonialCards.module.css';

const StarIcon = () => (
  <svg className={styles.starIcon} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const TestimonialCards = () => {
  const testimonials = [
    {
      text: "Flux entirely changed our development workflow. We shipped our new landing page in a matter of hours instead of weeks.",
      name: "Alex Rivera",
      role: "CTO, TechFlow",
      isDark: false
    },
    {
      text: "The brutalist aesthetic out of the box is incredible. Our conversion rates jumped 40% immediately after deploying.",
      name: "Jordan Lee",
      role: "Founder, GrowthKit",
      isDark: true
    },
    {
      text: "I've never used a design system that feels this fast and looks this good. It's the perfect balance of form and function.",
      name: "Casey Smith",
      role: "Lead Designer, StudioX",
      isDark: false
    }
  ];

  return (
    <section className={styles.section} id="testimonials">
      <h2 className={styles.title}>Don't just take our word for it</h2>
      
      <div className={styles.grid}>
        {testimonials.map((testimonial, index) => (
          <div 
            key={index} 
            className={`${styles.card} ${testimonial.isDark ? styles.cardDark : styles.cardLight} ${index === 1 ? styles.offsetY : ''}`}
          >
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map(i => <StarIcon key={i} />)}
            </div>
            
            <p className={styles.bodyText}>"{testimonial.text}"</p>
            
            <div className={styles.footer}>
              {/* Using a solid color block as a placeholder for the avatar since we don't have images */}
              <div className={styles.avatar}></div>
              <div className={styles.authorInfo}>
                <span className={styles.authorName}>{testimonial.name}</span>
                <span className={styles.authorRole}>{testimonial.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default TestimonialCards;
