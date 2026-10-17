'use client';

import { useRef, useEffect } from 'react';
import {
    CloudflareIcon,
    NextJsIcon,
    NodeJsIcon,
    ReactIcon,
    TailwindIcon,
    TypeScriptIcon,
} from './icons/BrandIcons';
import { SPARKLE, EXTRA_PALETTE } from '@/lib/pixel-extra';
import styles from './TechChips.module.css';

const chips = [
    { label: 'React', Icon: ReactIcon },
    { label: 'Next.js', Icon: NextJsIcon },
    { label: 'TypeScript', Icon: TypeScriptIcon },
    { label: 'Tailwind', Icon: TailwindIcon },
    { label: 'Cloudflare', Icon: CloudflareIcon },
    { label: 'Node.js', Icon: NodeJsIcon },
];

const LIFT = -4;
const FALLOFF = 0.45;
const EASE_IN = 'cubic-bezier(0.22, 1, 0.36, 1)';
const EASE_OUT = 'cubic-bezier(0.34, 3.85, 0.64, 1)';

function useHoverLift() {
    const rootRef = useRef<HTMLUListElement>(null);

    const setShifts = (activeIdx: number | null, phase: 'in' | 'out') => {
        const root = rootRef.current;
        if (!root) return;
        const ease = phase === 'out' ? EASE_OUT : EASE_IN;
        root.querySelectorAll<HTMLElement>('[data-chip]').forEach((el, i) => {
            el.style.transitionTimingFunction = ease;
            if (activeIdx === null) {
                el.style.setProperty('--shift', '0px');
                return;
            }
            const d = Math.abs(i - activeIdx);
            el.style.setProperty('--shift', `${(LIFT * Math.pow(FALLOFF, d)).toFixed(3)}px`);
        });
    };

    return { rootRef, setShifts };
}

function ChipSparkle() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        SPARKLE.forEach((row, y) => {
            Array.from(row).forEach((key, x) => {
                const c = EXTRA_PALETTE[key];
                if (c) {
                    ctx.fillStyle = c;
                    ctx.fillRect(x, y, 1, 1);
                }
            });
        });
    }, []);

    return (
        <span className={styles.sparkleHost} aria-hidden="true">
            <canvas
                ref={canvasRef}
                width={SPARKLE[0].length}
                height={SPARKLE.length}
                className={styles.sparkleCanvas}
            />
        </span>
    );
}

export default function TechChips() {
    const { rootRef, setShifts } = useHoverLift();

    return (
        <ul
            ref={rootRef}
            className="mt-10 flex flex-wrap gap-2.5"
            aria-label="Tech stack"
            onMouseLeave={() => setShifts(null, 'out')}
        >
            {chips.map(({ label, Icon }, i) => (
                <li
                    key={label}
                    data-chip
                    tabIndex={0}
                    className={`${styles.chip} inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/5 py-2 pr-3.5 pl-3 text-[13px] font-medium tracking-wide text-white/85`}
                    onMouseEnter={() => setShifts(i, 'in')}
                    onFocus={() => setShifts(i, 'in')}
                    onBlur={() => setShifts(null, 'out')}
                >
                    <span className="relative inline-flex items-center justify-center">
                        <Icon size={16} />
                        <ChipSparkle />
                    </span>
                    {label}
                </li>
            ))}
        </ul>
    );
}
