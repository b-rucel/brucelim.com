'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

const projects = [
    {
        title: 'Prompt Genius',
        description: 'Explore curated collections of prompts for ChatGPT, Midjourney, and more.',
        image: '/images/featured/promptgenius.webp',
        href: 'https://promptgenius.net',
        tech: ['Next.js', 'TypeScript', 'Tailwind']
    },
    {
        title: 'Caricature Studio',
        description: 'Interactive tool for creating locally running AI caricatures.',
        image: '/images/featured/caricature-studio.webp',
        href: 'https://caricature-studio.pages.dev/',
        tech: ['React', 'Cloudflare AI', 'Tailwind']
    },
    {
        title: 'Artoo',
        description: 'A modern file management system with intuitive interface.',
        image: '/images/featured/artoo.webp',
        href: 'https://artoo.pages.dev',
        tech: ['React', 'TypeScript', 'Tailwind']
    },
    {
        title: 'Next Base',
        description: 'A modern Next.js starter template with MDX support.',
        image: '/images/nextbase.png',
        href: 'https://nextbase.pages.dev',
        tech: ['Next.js', 'Templates', 'MDX']
    }
];

export default function FeaturedWork() {
    return (
        <section className="py-28 space-y-12">
            <motion.h2
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-4xl font-bold tracking-tight"
            >
                Featured Work
            </motion.h2>

            <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
                {projects.map((project, index) => (
                    <motion.article
                        key={project.title}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="group block space-y-4"
                    >
                        <Link href={project.href} target="_blank" rel="noopener noreferrer" className="block relative aspect-video overflow-hidden rounded-lg bg-muted">
                            <Image
                                src={project.image}
                                alt={project.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        </Link>
                        <div className="space-y-2">
                            <div className="flex justify-between items-start">
                                <h3 className="text-2xl font-medium pt-2">{project.title}</h3>
                                <span className="text-xs font-mono border rounded px-2 py-1 mt-2 text-muted-foreground">{project.tech[0]}</span>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">{project.description}</p>
                        </div>
                    </motion.article>
                ))}
            </div>
        </section>
    );
}
