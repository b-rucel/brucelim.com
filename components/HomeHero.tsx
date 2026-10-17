'use client';

import { motion, useReducedMotion, type Variants } from 'framer-motion';
import Image from 'next/image';
import styles from './HeroImage.module.css';
import RunnerGame from './RunnerGame';

const EASE = [0.16, 1, 0.3, 1] as const;

const LINES = [
  { text: 'Software' },
  { text: 'engineer' },
  { text: 'building things' },
  { text: 'that feel', grad: 'alive' },
];

export default function HomeHero() {
  const reduced = useReducedMotion();

  const line: Variants = {
    hidden: { y: '115%' },
    show: {
      y: 0,
      transition: { duration: reduced ? 0 : 1.1, ease: EASE },
    },
  };

  return (
    <section className="hv-hero" id="top">
      <div className="flex flex-col items-start gap-4 sm:gap-6">
        <motion.h1
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: reduced ? 0 : 0.1,
                delayChildren: reduced ? 0 : 0.15,
              },
            },
          }}
        >
          {LINES.map((entry, index) => (
            <span className="hv-hero-line" key={index}>
              <motion.span className="hv-hero-line-inner" variants={line}>
                {entry.text}
                {entry.grad ? (
                  <>
                    {' '}
                    <span className="hv-grad-text">{entry.grad}</span>
                  </>
                ) : null}
              </motion.span>
            </span>
          ))}
        </motion.h1>
      </div>

      <RunnerGame className="hv-runner" />

      <motion.div
        className="hv-hero-meta"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : 1, delay: reduced ? 0 : 0.9, ease: EASE }}
      >
        <div className="hv-hero-meta-left">
          <div className="relative w-16 md:w-20 aspect-square flex items-center justify-center shrink-0">
            <div className={styles.container}>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="absolute inset-[7px] md:inset-[9px] overflow-hidden rounded-full border-2 border-white z-10 bg-black">
              <Image
                src="/images/vibing.jpg"
                alt="Bruce Lim"
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
          </div>
          <p>
            <b>Bruce Lim</b> — Software Engineer &amp; retro video game nerd focused on building
            elegant, performant, and user-centric web experiences.
          </p>
        </div>
        <span className="hv-scroll-hint" aria-hidden="true">
          <span className="hv-scroll-line" />
          Scroll
        </span>
      </motion.div>
    </section>
  );
}
