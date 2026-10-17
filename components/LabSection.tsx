'use client';

import Image from 'next/image';
import Reveal from './Reveal';
import LinkArrow from './LinkArrow';
import PixelCoin from './PixelCoin';

export const experiments = [
  {
    title: 'Terminal 1989',
    description: 'Retro CRT workstation with a working shell and WebGL shader.',
    image: '/images/lab/terminal-1989.webp',
    href: '/lab/terminal-1989/index.html',
    tag: 'Concept',
  },
  {
    title: 'Signal Room',
    description: 'Scroll story with a pinned oscilloscope stage.',
    image: '/images/lab/signal-room.webp',
    href: '/lab/signal-room/index.html',
    tag: 'Concept',
  },
];

const pad = (n: number) => String(n).padStart(2, '0');

export default function LabSection() {
  return (
    <section id="lab" className="hv-section">
      <Reveal className="hv-sec-head">
        <h2 className="hv-sec-title">Lab</h2>
        <div className="flex items-center gap-3">
          <span className="hv-sec-kicker">({pad(experiments.length)}) concepts</span>
        </div>
      </Reveal>

      <div className="hv-list relative">
        {experiments.map((exp, index) => (
          <Reveal key={exp.href} delay={index * 0.06}>
            <a
              href={exp.href}
              className="hv-work-row group"
            >
              <span className="hv-work-no">
                {pad(index + 1)}
                <PixelCoin />
              </span>
              <span className="hv-work-main">
                <span className="hv-work-thumb">
                  <Image
                    src={exp.image}
                    alt={exp.title}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="hv-work-title">{exp.title}</span>
                  <span className="text-xs text-[var(--hv-dim)] block md:hidden mt-0.5 line-clamp-1">
                    {exp.description}
                  </span>
                </span>
              </span>
              <span className="hv-work-desc">{exp.description}</span>
              <span className="hv-work-tag inline-flex items-center justify-end gap-1.5">
                <span>{exp.tag}</span>
                <LinkArrow />
              </span>
            </a>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
