'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

// Helper function to format date
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });
};

const articles = [
    {
        title: 'Building Ghostty on WSL: A Journey from Snap to Source',
        date: '2025-11-05',
        href: '/blog/ghostty-wsl-install'
    },
    {
        title: "My Mac Wouldn't Boot Up Recovery Guide",
        date: '2025-09-23',
        href: '/blog/my-mac-wouldnt-boot-up-recovery-guide'
    },
    {
        title: 'Browser Gamepad Support',
        date: '2025-04-20',
        href: '/blog/browser-gamepad-support'
    },
    {
        title: 'My Thoughts on Vibe Coding',
        date: '2025-04-13',
        href: '/blog/my-thoughts-on-vibe-coding'
    },
    {
        title: 'Launch Your Website Using Cloudflare Pages',
        date: '2025-04-05',
        href: '/blog/launch-your-website-using-cloudflare-pages'
    },
    {
        title: 'Three.js Plane Demo: Creating a 3D Experience',
        date: '2025-03-28',
        href: '/blog/threejs-plane-demo'
    },
    {
        title: 'Digging SSH: Mastering Secure Connections',
        date: '2025-03-24',
        href: '/blog/digging-ssh-mastering-secure-connections'
    },
    {
        title: 'Hello World',
        date: '2025-03-16',
        href: '/blog/hello-world'
    }
];

export default function WritingList() {
    return (
        <section className="py-24 space-y-12">
            <div className="flex justify-between items-baseline">
                <motion.h2
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-4xl font-bold tracking-tight"
                >
                    Ramblings
                </motion.h2>
                <Link href="/blog" className="text-sm border-b border-transparent hover:border-foreground transition-colors">
                    View all
                </Link>
            </div>

            <div className="divide-y divide-border">
                {articles.map((article, index) => (
                    <motion.article
                        key={article.href}
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.05, duration: 0.4 }}
                        className="group py-6"
                    >
                        <Link href={article.href} className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 md:gap-8">
                            <h3 className="text-xl font-medium group-hover:text-primary transition-colors">
                                {article.title}
                            </h3>
                            <time className="text-sm text-muted-foreground whitespace-nowrap">
                                {formatDate(article.date)}
                            </time>
                        </Link>
                    </motion.article>
                ))}
            </div>
        </section>
    );
}
