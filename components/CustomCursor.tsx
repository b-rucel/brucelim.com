'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
  const [isClicking, setIsClicking] = useState(false);

  // Use MotionValues to track mouse position without triggering re-renders
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for the outer ring (the "follower") to create the trail effect
  const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  // Stiffer springs for the inner dot for snappy response
  const dotSpringConfig = { damping: 25, stiffness: 400, mass: 0.2 };
  const dotX = useSpring(mouseX, dotSpringConfig);
  const dotY = useSpring(mouseY, dotSpringConfig);

  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [mouseX, mouseY]);

  return (
    <>
      {/* Outer ring - The Follower (Trail) */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-50 mix-blend-difference border-2 border-white rounded-full opacity-75"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%', // Center the cursor
          translateY: '-50%'
        }}
        animate={{
          scale: isClicking ? 0.8 : 1,
        }}
        transition={{
          scale: { duration: 0.1 }
        }}
      />

      {/* Inner dot - The Pointer */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 pointer-events-none z-50 mix-blend-difference bg-white rounded-full"
        style={{
          x: dotX,
          y: dotY,
          translateX: '-50%', // Center the cursor
          translateY: '-50%'
        }}
        animate={{
          scale: isClicking ? 1.5 : 1,
        }}
        transition={{
          scale: { duration: 0.1 }
        }}
      />
    </>
  );
}