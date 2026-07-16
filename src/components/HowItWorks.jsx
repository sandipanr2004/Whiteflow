import React from 'react';
import styles from './HowItWorks.module.css';

const steps = [
  {
    numeral: '01',
    title: 'Install the package',
    desc: 'Add Flux to your project with a single command. It works with all major frameworks right out of the box.'
  },
  {
    numeral: '02',
    title: 'Configure tokens',
    desc: 'Set your brand colors, fonts, and spacing once. Flux automatically generates a complete design system.'
  },
  {
    numeral: '03',
    title: 'Ship it',
    desc: 'Use our pre-built, high-converting components to assemble your pages in minutes, not weeks.'
  }
];

const HowItWorks = () => {
  return (
    <section className={styles.section} id="how-it-works">
      <div className={styles.leftCol}>
        <h2 className={styles.stickyTitle}>How it<br/>works</h2>
      </div>
      
      <div className={styles.rightCol}>
        {steps.map((step, index) => (
          <div key={index} className={styles.step}>
            <div className={styles.numeral}>{step.numeral}</div>
            <div className={styles.stepContent}>
              <h3 className={styles.stepTitle}>{step.title}</h3>
              <p className={styles.stepDesc}>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
