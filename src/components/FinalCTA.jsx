import React from 'react';
import styles from './FinalCTA.module.css';

const FinalCTA = () => {
  return (
    <section className={styles.section}>
      <div className={styles.bgText}>SHIP FASTER</div>
      
      <div className={styles.content}>
        <h2 className={styles.title}>Ready to ship?</h2>
        <p className={styles.subtitle}>
          Join thousands of developers who are already building faster and better with Flux. Stop compromising on design for speed.
        </p>
        
        <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
          <input 
            type="email" 
            placeholder="Enter your email address" 
            className={styles.input} 
            required 
          />
          <button type="submit" className={styles.button}>
            Get Started
          </button>
        </form>
      </div>
    </section>
  );
};

export default FinalCTA;
