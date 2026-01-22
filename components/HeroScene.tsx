'use client';

import { useEffect, useRef } from 'react';
import p5 from 'p5';

const sketch = (p: p5) => {
  const particles: Particle[] = [];
  const numParticles = 2000;
  const noiseScale = 0.01;

  class Particle {
    pos: p5.Vector;
    vel: p5.Vector;
    acc: p5.Vector;
    maxSpeed: number;
    h: number;

    constructor() {
      this.pos = p.createVector(p.random(p.width), p.random(p.height));
      this.vel = p.createVector(0, 0);
      this.acc = p.createVector(0, 0);
      this.maxSpeed = 2;
      this.h = 0;
    }

    update() {
      const n = p.noise(this.pos.x * noiseScale, this.pos.y * noiseScale, p.frameCount * 0.001);
      const angle = n * p.TWO_PI * 2;
      this.acc = p5.Vector.fromAngle(angle);
      this.vel.add(this.acc);
      this.vel.limit(this.maxSpeed);
      this.pos.add(this.vel);
      this.h = p.map(n, 0, 1, 0, 360);
    }

    show() {
      p.stroke(this.h, 80, 100, 0.5);
      p.strokeWeight(2);
      p.point(this.pos.x, this.pos.y);
    }

    checkEdges() {
      if (this.pos.x > p.width) this.pos.x = 0;
      if (this.pos.x < 0) this.pos.x = p.width;
      if (this.pos.y > p.height) this.pos.y = 0;
      if (this.pos.y < 0) this.pos.y = p.height;
    }
  }

  p.setup = () => {
    p.createCanvas(p.windowWidth, p.windowHeight);
    p.colorMode(p.HSB, 360, 100, 100, 1);
    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle());
    }
    p.background(0);
  };

  p.draw = () => {
    p.background(0, 0.05);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].show();
      particles[i].checkEdges();
    }
  };

  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight);
    p.background(0);
  };
};

const P5Sketch = () => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const p5Instance = new p5(sketch, canvasRef.current);
      return () => {
        p5Instance.remove();
      };
    }
  }, []);

  return <div ref={canvasRef} />;
};


export default function HeroScene() {
    return (
        <div className="absolute inset-0 z-0 h-[100%] w-full overflow-hidden bg-background">
            <P5Sketch />
        </div>
    );
}