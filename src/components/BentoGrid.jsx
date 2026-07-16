import React from 'react';
import styles from './BentoGrid.module.css';
import AbstractUIMockup from './AbstractUIMockup';

const BentoGrid = () => {
  return (
    <section className={styles.section} id="features">
      <h2 className={styles.sectionTitle}>Built for speed</h2>
      
      <div className={styles.grid}>
        {/* Feature 1 - Spans 2 columns */}
        <div className={`${styles.card} ${styles.cardLight} ${styles.span2}`}>
          <h3 className={styles.cardTitle}>Visual Editing</h3>
          <p className={styles.cardDesc}>Design your application without writing a single line of CSS. Real-time feedback.</p>
          <div className={styles.cardContent}>
            <div style={{ width: '80%', height: '120%', position: 'absolute', top: '10%' }}>
              <AbstractUIMockup />
            </div>
          </div>
        </div>

        {/* Feature 2 */}
        <div className={`${styles.card} ${styles.cardDark}`}>
          <h3 className={styles.cardTitle}>Instant Deploy</h3>
          <p className={styles.cardDesc}>Push to production in milliseconds with our edge network.</p>
          <div className={styles.cardContent}>
            <div className={styles.pulseBlock}></div>
          </div>
        </div>

        {/* Feature 3 */}
        <div className={`${styles.card} ${styles.cardLight}`}>
          <h3 className={styles.cardTitle}>Multiplayer</h3>
          <p className={styles.cardDesc}>Collaborate with your team in real-time. No more conflicts.</p>
          <div className={styles.cardContent}>
            <div className={styles.avatarStack}>
              <div className={styles.avatar} style={{ backgroundColor: '#ff5f56' }}>S</div>
              <div className={styles.avatar} style={{ backgroundColor: '#ffbd2e' }}>D</div>
              <div className={styles.avatar} style={{ backgroundColor: '#27c93f' }}>M</div>
              <div className={styles.avatar} style={{ backgroundColor: 'var(--color-charcoal)', color: 'white' }}>+3</div>
            </div>
          </div>
        </div>

        {/* Feature 4 - Spans 2 columns */}
        <div className={`${styles.card} ${styles.cardDark} ${styles.span2}`}>
          <h3 className={styles.cardTitle}>Developer API</h3>
          <p className={styles.cardDesc}>Full programmatic access to your design tokens and components.</p>
          <div className={styles.cardContent}>
            <div className={styles.codeSnippet}>
              <div className={styles.codeLine}><span className={styles.codeKeyword}>import</span> {'{'} <span className={styles.codeFunction}>createTheme</span> {'}'} <span className={styles.codeKeyword}>from</span> <span className={styles.codeString}>'@flux/core'</span>;</div>
              <br />
              <div className={styles.codeLine}><span className={styles.codeKeyword}>const</span> theme = <span className={styles.codeFunction}>createTheme</span>({'{'}</div>
              <div className={styles.codeLine}>&nbsp;&nbsp;colors: {'{'} primary: <span className={styles.codeString}>'#FFE17C'</span> {'}'},</div>
              <div className={styles.codeLine}>&nbsp;&nbsp;fonts: {'{'} display: <span className={styles.codeString}>'Anton'</span> {'}'}</div>
              <div className={styles.codeLine}>{'}'});</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;
