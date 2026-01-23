'use client';

import { useEffect, useRef } from 'react';
import type p5 from 'p5';

export default function SquigglyLine() {
  const sketchRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  useEffect(() => {
    if (!sketchRef.current) return;

    let myP5: p5 | null = null;
    let isMounted = true;

    const init = async () => {
      try {
        const p5Module = await import('p5');
        if (!isMounted) return;

        const p5 = p5Module.default;

        const sketch = (p: p5) => {
          const numParticles = 2000;
          const noiseScale = 0.01;

          // Structure of Arrays (SoA) - effectively what WebGL buffers are
          // This avoids the overhead of 2000 JS objects and p5.Vector allocations per frame
          const posX = new Float32Array(numParticles);
          const posY = new Float32Array(numParticles);
          const velX = new Float32Array(numParticles);
          const velY = new Float32Array(numParticles);
          const hues = new Float32Array(numParticles);

          // Constants for physics
          const maxSpeed = 2;

          p.setup = () => {
            p.createCanvas(p.windowWidth, p.windowHeight);
            p.colorMode(p.HSB, 360, 100, 100, 1);

            // Initialize arrays
            for (let i = 0; i < numParticles; i++) {
              posX[i] = p.random(p.width);
              posY[i] = p.random(p.height);
              velX[i] = 0;
              velY[i] = 0;
              hues[i] = 0;
            }

            p.background(0);
          };

          p.draw = () => {
            p.background(0, 0.05);
            p.strokeWeight(2);

            const width = p.width;
            const height = p.height;
            const time = p.frameCount * 0.001;
            const twoPi = p.TWO_PI * 2;

            for (let i = 0; i < numParticles; i++) {
              // 1. Update Physics
              // Calculate noise based flow field angle
              const n = p.noise(posX[i] * noiseScale, posY[i] * noiseScale, time);
              const angle = n * twoPi;

              // Calculate acceleration (raw trig instead of p5.Vector.fromAngle)
              const accX = Math.cos(angle);
              const accY = Math.sin(angle);

              // Apply acceleration to velocity
              velX[i] += accX;
              velY[i] += accY;

              // Limit velocity (raw math instead of p5.Vector.limit)
              // magSq = x*x + y*y
              const magSq = velX[i] * velX[i] + velY[i] * velY[i];
              if (magSq > maxSpeed * maxSpeed) {
                const mag = Math.sqrt(magSq);
                velX[i] = (velX[i] / mag) * maxSpeed;
                velY[i] = (velY[i] / mag) * maxSpeed;
              }

              // Apply velocity to position
              posX[i] += velX[i];
              posY[i] += velY[i];

              // Update hue based on noise
              hues[i] = p.map(n, 0, 1, 0, 360);

              // 2. Draw
              p.stroke(hues[i], 80, 100, 0.5);
              p.point(posX[i], posY[i]);

              // 3. Check Edges (Wrap around)
              if (posX[i] > width) posX[i] = 0;
              if (posX[i] < 0) posX[i] = width;
              if (posY[i] > height) posY[i] = 0;
              if (posY[i] < 0) posY[i] = height;
            }
          };

          p.windowResized = () => {
            p.resizeCanvas(p.windowWidth, p.windowHeight);
            p.background(0);
          };
        };

        if (!sketchRef.current) return;
        myP5 = new p5(sketch, sketchRef.current);
        p5InstanceRef.current = myP5;
      } catch (error) {
        console.error("Error loading p5:", error);
      }
    };

    init();

    return () => {
      isMounted = false;
      if (myP5) {
        myP5.remove();
      }
      p5InstanceRef.current = null;
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 h-[100%] w-full overflow-hidden bg-background">
      <div ref={sketchRef} className="w-full h-full" />
    </div>
  );
}
