'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Hero() {
  return (
    <section className="min-h-[90vh] flex flex-col justify-center py-20 relative">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="space-y-8 relative z-10"
      >
        <div className="relative w-24 h-24 md:w-32 md:h-32 mb-8 overflow-hidden rounded-full border-2 border-primary/20 backdrop-blur-2xl bg-white/5">
          <Image
            src="/images/vibing.jpg"
            alt="Bruce Lim"
            className="object-cover"
            fill
            sizes="(max-width: 768px) 96px, 128px"
          />
        </div>

        <h1 className="tracking-wide text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.9] mix-blend-difference">
          Bruce Lim
        </h1>

        <div className="max-w-xl">
          <p className="text-gray-200 text-xl md:text-2xl leading-relaxed mix-blend-difference">
            Software Engineer & Retro video game nerd focused on building elegant, performant, and user-centric web experiences.
          </p>
        </div>

        {/* About Section */}
        <section className="space-y-2 mb-12">
          <h2 className="text-lg font-semibold">About me</h2>
          <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-lg">
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
