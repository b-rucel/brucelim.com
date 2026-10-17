'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import { motion, useReducedMotion, useScroll } from 'framer-motion';
import NavSprite from './NavSprite';

const links = [
  { label: 'Work', href: '#work' },
  { label: 'Writing', href: '#writing' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

export default function HomeNav() {
  const [scrolled, setScrolled] = useState(false);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    const el = document.querySelector(href);
    if (!el) return;
    event.preventDefault();
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <header>
      <nav aria-label="Main navigation" className={`hv-nav${scrolled ? ' hv-nav--scrolled' : ''}`}>
        <a href="#top" className="hv-logo" onClick={(event) => go(event, '#top')}>
          <NavSprite />
          <span>Bruce Lim</span>
        </a>
        <ul className="hv-nav-links">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="hv-nav-link"
                onClick={(event) => go(event, link.href)}
              >
                <span>{link.label}</span>
                <span aria-hidden="true">{link.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <motion.div className="hv-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />
    </header>
  );
}
