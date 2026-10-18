'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Reveal from './Reveal';
import LinkArrow from './LinkArrow';
import SpeechBubble from './SpeechBubble';
import BreakoutMode, { breakoutSupported } from './BreakoutMode';
import styles from './LinkArrow.module.css';
import breakoutStyles from './BreakoutMode.module.css';

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export const articles = [
  {
    title: 'Arcade games in the browser: getting MAME to finally run',
    date: '2026-10-18',
    href: '/blog/arcade-games-in-the-browser',
  },
  {
    title: 'Building Ghostty on WSL: A Journey from Snap to Source',
    date: '2025-11-05',
    href: '/blog/ghostty-wsl-install',
  },
  {
    title: "My Mac Wouldn't Boot Up Recovery Guide",
    date: '2025-09-23',
    href: '/blog/my-mac-wouldnt-boot-up-recovery-guide',
  },
  {
    title: 'Browser Gamepad Support',
    date: '2025-04-20',
    href: '/blog/browser-gamepad-support',
  },
  {
    title: 'My Thoughts on Vibe Coding',
    date: '2025-04-13',
    href: '/blog/my-thoughts-on-vibe-coding',
  },
  {
    title: 'Launch Your Website Using Cloudflare Pages',
    date: '2025-04-05',
    href: '/blog/launch-your-website-using-cloudflare-pages',
  },
  {
    title: 'Three.js Plane Demo: Creating a 3D Experience',
    date: '2025-03-28',
    href: '/blog/threejs-plane-demo',
  },
  {
    title: 'Digging SSH: Mastering Secure Connections',
    date: '2025-03-24',
    href: '/blog/digging-ssh-mastering-secure-connections',
  },
  {
    title: 'Hello World',
    date: '2025-03-16',
    href: '/blog/hello-world',
  },
];

const pad = (n: number) => String(n).padStart(2, '0');

export default function WritingList() {
  const [isBreakout, setIsBreakout] = useState(false);
  // Stable so BreakoutMode's game effect doesn't restart on re-render.
  const closeBreakout = useCallback(() => setIsBreakout(false), []);
  const playBtnRef = useRef<HTMLButtonElement>(null);
  const wasPlayingRef = useRef(false);
  const startBreakout = useCallback(() => {
    if (!breakoutSupported()) return;
    setIsBreakout(true);
  }, []);

  // Return focus to the PLAY button when the game exits, without scrolling:
  // plain focus() would yank the page to the button and undo the scroll
  // restore. Deferred attempts guard against mid-restore states.
  useEffect(() => {
    if (wasPlayingRef.current && !isBreakout) {
      wasPlayingRef.current = false;
      const focusBtn = () => playBtnRef.current?.focus({ preventScroll: true });
      focusBtn();
      requestAnimationFrame(() => {
        if (document.activeElement !== playBtnRef.current) focusBtn();
      });
      setTimeout(() => {
        if (document.activeElement !== playBtnRef.current) focusBtn();
      }, 200);
    }
    if (isBreakout) wasPlayingRef.current = true;
  }, [isBreakout]);

  // Shift+B is the only hotkey; plain B must not toggle anything.
  useEffect(() => {
    if (isBreakout) return; // the game owns the keyboard while open
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.shiftKey || (e.key !== 'B' && e.key !== 'b')) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      startBreakout();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isBreakout, startBreakout]);

  return (
    <section id="writing" className="hv-section">
      <Reveal className="hv-sec-head">
        <h2 className="hv-sec-title">Ramblings</h2>
        <div className="hv-sec-right">
          <button
            ref={playBtnRef}
            type="button"
            onClick={startBreakout}
            aria-label="Play Breakout with the article list"
            className={breakoutStyles.playBtn}
          >
            <span className={breakoutStyles.playDot} aria-hidden="true" />
            <span>PLAY</span>
          </button>
          <span className="hv-sec-kicker">({pad(articles.length)}) articles</span>
          <Link
            href="/blog"
            className={`hv-view-all ${styles.slidingUnderline} inline-flex items-center gap-1.5`}
          >
            <span>View all</span>
            <LinkArrow />
          </Link>
        </div>
      </Reveal>

      <div className="hv-list">
        {isBreakout && <BreakoutMode onClose={closeBreakout} />}
        {articles.map((article, index) => (
          <Reveal key={article.href} delay={index * 0.04}>
            <Link href={article.href} className="hv-post-row group">
              <h3>{article.title}</h3>
              <span className="relative flex items-center gap-2.5 shrink-0">
                <SpeechBubble />
                <time>{formatDate(article.date)}</time>
                <LinkArrow />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
