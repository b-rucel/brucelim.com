'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import styles from './StatTicker.module.css';

type StatTickerProps = {
    value: number;
    minDigits?: number;
    className?: string;
};

export default function StatTicker({ value, minDigits = 2, className }: StatTickerProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const [run, setRun] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setRun(true);
            return;
        }
        const io = new IntersectionObserver(
            (entries) => {
                if (entries.some((entry) => entry.isIntersecting)) {
                    setRun(true);
                    io.disconnect();
                }
            },
            { rootMargin: '0px 0px -12% 0px' },
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    const text = String(value).padStart(minDigits, '0');

    return (
        <span
            ref={ref}
            data-run={run ? '' : undefined}
            aria-label={text}
            className={className ? `${styles.ticker} ${className}` : styles.ticker}
        >
            <span aria-hidden="true" className="inline-flex">
                {text.split('').map((char, i) => {
                    const digit = Number(char);
                    return (
                        <span key={i} className={styles.col}>
                            <span
                                className={styles.strip}
                                style={
                                    {
                                        '--stat-target': -digit,
                                        '--stat-delay': `${i * 90}ms`,
                                    } as CSSProperties
                                }
                            >
                                {Array.from({ length: digit + 1 }, (_, n) => (
                                    <span key={n} className={styles.digit}>
                                        {n}
                                    </span>
                                ))}
                            </span>
                        </span>
                    );
                })}
            </span>
            <span className="sr-only">{text}</span>
        </span>
    );
}
