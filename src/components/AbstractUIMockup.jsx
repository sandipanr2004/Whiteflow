import React from 'react';
import styles from './AbstractUIMockup.module.css';

const CursorSvg = () => (
  <svg className={styles.cursorIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"></path>
    <path d="M13 13l6 6"></path>
  </svg>
);

const AbstractUIMockup = () => {
  return (
    <div className={styles.mockupContainer}>
      <div className={styles.header}>
        <div className={styles.trafficLights}>
          <div className={`${styles.dot} ${styles.dotRed}`}></div>
          <div className={`${styles.dot} ${styles.dotYellow}`}></div>
          <div className={`${styles.dot} ${styles.dotGreen}`}></div>
        </div>
        <div className={styles.title}>editor.flux.design</div>
      </div>
      
      <div className={styles.body}>
        {/* Sidebar */}
        <div className={styles.sidebar}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className={styles.skeletonLine} style={{ width: `${Math.random() * 40 + 40}%` }}></div>
          ))}
        </div>
        
        {/* Main Canvas */}
        <div className={styles.canvas}>
          <div className={styles.canvasCard}></div>
          <div className={styles.cursor}>
            <CursorSvg />
            <div className={styles.cursorLabel}>SARAH</div>
          </div>
        </div>
        
        {/* Properties Panel */}
        <div className={styles.properties}>
          <div>
            <div className={styles.propSectionTitle}>Typography</div>
            <div className={styles.fontDisplay}>ANTON</div>
          </div>
          
          <div>
            <div className={styles.propSectionTitle}>Alignment</div>
            <div className={styles.alignmentGroup}>
              {[1, 2, 3].map(i => (
                <div key={i} className={styles.alignIcon}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '60%' }}>
                    <div className={styles.alignIconLine} style={{ width: '100%' }}></div>
                    <div className={styles.alignIconLine} style={{ width: i === 2 ? '100%' : '60%', alignSelf: i === 1 ? 'flex-start' : i === 3 ? 'flex-end' : 'center' }}></div>
                    <div className={styles.alignIconLine} style={{ width: '100%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <div className={styles.propSectionTitle}>Color</div>
            <div className={styles.colorSwatchContainer}>
              <div className={styles.colorSwatch}></div>
              <span className={styles.colorHex}>#FFE17C</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbstractUIMockup;
