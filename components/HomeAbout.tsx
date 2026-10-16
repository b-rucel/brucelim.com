'use client';

import Reveal from './Reveal';
import StatTicker from './StatTicker';
import TechChips from './TechChips';
import StatScreen from './StatScreen';
import PixelText from './PixelText';
import { projects } from './FeaturedWork';
import { articles } from './WritingList';

export default function HomeAbout() {
    return (
        <section id="about" className="hv-section">
            <Reveal>
                <span className="hv-sec-kicker">About</span>
            </Reveal>
            <Reveal delay={0.05}>
                <p className="hv-about-statement">
                    I&apos;m a software engineer based in Los Angeles. I specialize in building
                    high-quality web applications with modern technologies like React, Next.js,
                    and TypeScript. Currently exploring the intersection of web technologies, AI
                    models, and game development while building immersive applications.
                </p>
            </Reveal>
            <Reveal delay={0.08}>
                <TechChips />
            </Reveal>
            <Reveal delay={0.1}>
                <div className="hv-stats">
                    <div className="hv-stat">
                        <b>
                            <StatTicker value={projects.length} />
                        </b>
                        <span className="inline-flex items-center gap-2">
                            <span className="inline-flex items-center border border-[#84cdfa]/40 bg-[#84cdfa]/10 px-1 py-0.5 rounded text-[10px]">
                                <PixelText text="P1" colour="#84cdfa" className="w-[14px]" />
                            </span>
                            <span>Selected projects</span>
                        </span>
                    </div>
                    <div className="hv-stat">
                        <b>
                            <StatTicker value={articles.length} />
                        </b>
                        <span className="inline-flex items-center gap-2">
                            <span className="inline-flex items-center border border-[#f5c542]/40 bg-[#f5c542]/10 px-1 py-0.5 rounded text-[10px]">
                                <PixelText text="P2" colour="#f5c542" className="w-[14px]" />
                            </span>
                            <span>Essays published</span>
                        </span>
                    </div>
                </div>
            </Reveal>
            <Reveal delay={0.12}>
                <StatScreen />
            </Reveal>
        </section>
    );
}
