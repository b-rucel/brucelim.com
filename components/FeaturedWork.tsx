'use client';

import { useState } from 'react';
import Image from 'next/image';
import Reveal from './Reveal';
import LinkArrow from './LinkArrow';
import PixelCoin from './PixelCoin';
import BugSquash, { BugScoreBadge } from './BugSquash';

export const projects = [
  {
    title: 'Prompt Genius',
    description: 'Explore curated collections of prompts for ChatGPT, Midjourney, and more.',
    image: '/images/featured/promptgenius.webp',
    href: 'https://promptgenius.net',
    tech: ['Next.js', 'TypeScript', 'Tailwind'],
  },
  {
    title: 'Caricature Studio',
    description: 'Interactive tool for creating locally running AI caricatures.',
    image: '/images/featured/caricature-studio.webp',
    href: 'https://caricature-studio.pages.dev/',
    tech: ['React', 'Cloudflare', 'Tailwind'],
  },
  {
    title: 'Artoo',
    description: 'A modern file management system with intuitive interface.',
    image: '/images/featured/artoo.webp',
    href: 'https://artoo.pages.dev',
    tech: ['React', 'TypeScript', 'Tailwind'],
  },
  {
    title: 'Next Base',
    description: 'A modern Next.js starter template with MDX support.',
    image: '/images/nextbase.png',
    href: 'https://nextbase.pages.dev',
    tech: ['Next.js', 'Templates', 'MDX'],
  },
];

const pad = (n: number) => String(n).padStart(2, '0');

export default function FeaturedWork() {
  const [bugScore, setBugScore] = useState(0);

  return (
    <section id="work" className="hv-section">
      <Reveal className="hv-sec-head">
        <h2 className="hv-sec-title">Featured work</h2>
        <div className="flex items-center gap-3">
          <BugScoreBadge score={bugScore} />
          <span className="hv-sec-kicker">({pad(projects.length)}) projects</span>
        </div>
      </Reveal>

      <div className="hv-list relative">
        <BugSquash onScoreChange={setBugScore} />
        {projects.map((project, index) => (
          <Reveal key={project.href} delay={index * 0.06}>
            <a
              href={project.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hv-work-row group"
            >
              <span className="hv-work-no">
                {pad(index + 1)}
                <PixelCoin />
              </span>
              <span className="hv-work-main">
                <span className="hv-work-thumb">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </span>
                <span className="hv-work-title">{project.title}</span>
              </span>
              <span className="hv-work-desc">{project.description}</span>
              <span className="hv-work-tag inline-flex items-center justify-end gap-1.5">
                <span>{project.tech[0]}</span>
                <LinkArrow />
              </span>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
