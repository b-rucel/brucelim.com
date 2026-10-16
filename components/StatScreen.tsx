'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import PixelText from './PixelText';
import styles from './StatScreen.module.css';

/**
 * =============================================================================
 * CHARACTER STAT LEVELS (0 to 10 scale).
 * Set the real values here:
 * =============================================================================
 */
export const STAT_LEVELS = {
  FRONTEND: 9, // default 9/10
  BACKEND: 7, // default 7/10
  GAME_DEV: 6, // default 6/10
} as const;

type StatKey = keyof typeof STAT_LEVELS;

const STAT_CONFIG: { key: StatKey; label: string; color: string }[] = [
  { key: 'FRONTEND', label: 'FRONTEND', color: '#5ad1cd' },
  { key: 'BACKEND', label: 'BACKEND', color: '#9b59b6' },
  { key: 'GAME_DEV', label: 'GAME DEV', color: '#f5c542' },
];

export default function StatScreen() {
  const panelRef = useRef<HTMLDivElement>(null);
  const [filledLevels, setFilledLevels] = useState<Record<StatKey, number>>({
    FRONTEND: 0,
    BACKEND: 0,
    GAME_DEV: 0,
  });

  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setFilledLevels({
        FRONTEND: STAT_LEVELS.FRONTEND,
        BACKEND: STAT_LEVELS.BACKEND,
        GAME_DEV: STAT_LEVELS.GAME_DEV,
      });
      return;
    }

    let timer: number | null = null;
    let step = 0;

    const startFilling = () => {
      const maxTarget = Math.max(
        STAT_LEVELS.FRONTEND,
        STAT_LEVELS.BACKEND,
        STAT_LEVELS.GAME_DEV
      );

      timer = window.setInterval(() => {
        step++;
        setFilledLevels({
          FRONTEND: Math.min(step, STAT_LEVELS.FRONTEND),
          BACKEND: Math.min(step, STAT_LEVELS.BACKEND),
          GAME_DEV: Math.min(step, STAT_LEVELS.GAME_DEV),
        });

        if (step >= maxTarget && timer !== null) {
          clearInterval(timer);
          timer = null;
        }
      }, 70);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          startFilling();
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (timer !== null) clearInterval(timer);
    };
  }, []);

  return (
    <div
      ref={panelRef}
      className={styles.panel}
      role="region"
      aria-label="Character select and stats: Bruce, Software Engineer"
    >
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>
          <span aria-hidden="true">&bull;</span>
          <span>CHARACTER PROFILE</span>
        </span>
        <span className={styles.panelTitle}>
          <span>LVL 99</span>
        </span>
      </div>

      <div className={styles.panelContent}>
        {/* Left: Avatar & Info */}
        <div className={styles.charCol}>
          <div className={styles.avatarFrame}>
            <Image
              src="/images/vibing.jpg"
              alt="Bruce pixel portrait"
              fill
              sizes="88px"
              className={styles.avatarImg}
            />
          </div>
          <div className={styles.charInfo}>
            <div className={styles.charName}>
              <PixelText text="BRUCE" colour="#84cdfa" />
            </div>
            <span className={styles.charClass}>SOFTWARE ENGINEER</span>
          </div>
        </div>

        {/* Right: Stat bars */}
        <div className={styles.statsCol}>
          {STAT_CONFIG.map(({ key, label, color }) => {
            const current = filledLevels[key];
            return (
              <div key={key} className={styles.statRow}>
                <div className={styles.statMeta}>
                  <span>{label}</span>
                  <span aria-hidden="true">{current}/10</span>
                </div>
                <div
                  className={styles.statBar}
                  aria-hidden="true"
                  style={{ borderColor: `${color}40` }}
                >
                  {Array.from({ length: 10 }, (_, i) => {
                    const isFilled = i < current;
                    return (
                      <span
                        key={i}
                        className={`${styles.segment} ${isFilled ? styles.segmentFilled : ''}`}
                        style={{
                          backgroundColor: isFilled ? color : undefined,
                          boxShadow: isFilled ? `0 0 6px ${color}80` : undefined,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="sr-only">
        Bruce. Class: Software Engineer. Frontend: {STAT_LEVELS.FRONTEND} out of 10. Backend:{' '}
        {STAT_LEVELS.BACKEND} out of 10. Game Dev: {STAT_LEVELS.GAME_DEV} out of 10.
      </div>
    </div>
  );
}
