'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import styles from './HeroImage.module.css';

export default function Hero() {
  return (
    <section className="min-h-[90vh] flex flex-col justify-center pt-10 pb-20 md:py-20 relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 p-8 md:p-12 rounded-3xl bg-background/80 border border-white/10 shadow-2xl"
      >
        <div className="flex items-center gap-6 md:gap-8 mb-8">

          {/* Image Container with Glow Effect */}
          <div className="relative w-28 md:w-32 aspect-square flex items-center justify-center shrink-0">
            {/* Rotating Glow Ring */}
            <div className={styles.container}>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </div>

            {/* Static Image */}
            <div className="absolute inset-[10px] overflow-hidden rounded-full border-[3px] border-white z-10 bg-black">
              <Image
                src="/images/vibing.jpg"
                alt="Bruce Lim"
                className="object-cover"
                fill
                sizes="(max-width: 768px) 96px, 128px"
              />
            </div>
          </div>

          <h1 className="tracking-wide text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.9] text-foreground">
            Bruce Lim
          </h1>
        </div>

        <div className="max-w-xl mt-12">
          <p className="text-gray-200 text-xl md:text-2xl leading-relaxed">
            Software Engineer & Retro video game nerd focused on building elegant, performant, and user-centric web experiences.
          </p>
        </div>

        {/* About Section */}
        <section className="space-y-4 mt-12 pt-12 border-t border-white/10">
          <h2 className="text-lg font-semibold text-foreground">About me</h2>
          <p className="text-gray-200 leading-relaxed text-lg">
            I&apos;m a software engineer based in Los Angeles. I specialize in building
            high-quality web applications with modern technologies like React, Next.js,
            and TypeScript. Currently exploring the intersection of web technologies, ai models,
            and game development while building immersive applications.
          </p>
        </section>

        <div className="flex gap-4 pt-4">
          {/* Social links or CTAs could go here if needed, but keeping it minimal for now */}
        </div>
      </motion.div>
    </section>
  );
}