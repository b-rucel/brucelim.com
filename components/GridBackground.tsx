'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const GridItem = ({ delay }: { delay: number }) => {
  return (
    <div className="flex flex-col items-start justify-center w-60 shrink-0">
      <div className="flex items-center justify-center">
        <div className="h-6 w-6 bg-white dark:bg-neutral-900 flex items-center justify-center rounded-full border border-neutral-200 dark:border-neutral-800 z-10">
          <div className="h-2 w-2 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
        </div>
        <div className="relative w-[300px] h-[1px]">
          {/* Static Line */}
          <div className="absolute inset-0 bg-neutral-300 dark:bg-neutral-700 opacity-50"></div>
          {/* Moving Beam */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-500 w-1/2"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
              delay: delay,
              repeatDelay: Math.random() * 2
            }}
          />
        </div>
      </div>

      <div className="relative w-[1px] h-[160px] ml-3">
        {/* Static Line */}
        <div className="absolute inset-0 bg-neutral-300 dark:bg-neutral-700 opacity-50"></div>
        {/* Moving Beam */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-neutral-300 to-transparent dark:via-neutral-500 h-1/2"
          initial={{ y: '-100%' }}
          animate={{ y: '200%' }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
            delay: delay + 1,
            repeatDelay: Math.random() * 2
          }}
        />
      </div>
    </div>
  );
};

export default function GridBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 h-screen w-full pointer-events-none z-0 overflow-hidden">
      {/* Grid Container */}
      <div className="flex flex-wrap -ml-10 -mt-20 scale-125 origin-center">
        {Array.from({ length: 40 }).map((_, i) => (
          <GridItem key={i} delay={Math.random() * 5} />
        ))}
      </div>
    </div>
  );
}
