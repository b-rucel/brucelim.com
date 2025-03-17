'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function BlogNav() {
  return (
    <motion.nav 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 w-full backdrop-blur-sm bg-white/70 dark:bg-black/70 border-b border-gray-200 dark:border-gray-800"
    >
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-lg font-semibold hover:text-gray-600 dark:hover:text-gray-300">
            Bruce Lim
          </Link>
          {/*
          <div className="flex space-x-6">
            <Link href="/blog" className="hover:text-gray-600 dark:hover:text-gray-300">
              Blog
            </Link>
            <Link href="/about" className="hover:text-gray-600 dark:hover:text-gray-300">
              About
            </Link>
          </div>
          */}
        </div>
      </div>
    </motion.nav>
  );
}