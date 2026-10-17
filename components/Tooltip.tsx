'use client';

import { cloneElement, useId } from 'react';
import type { ReactElement } from 'react';
import styles from './Tooltip.module.css';

type TooltipProps = {
    label: string;
    children: ReactElement<{ 'aria-describedby'?: string }>;
};

export default function Tooltip({ label, children }: TooltipProps) {
    const id = useId();

    return (
        <span className={styles.wrap}>
            {cloneElement(children, { 'aria-describedby': id })}
            <span role="tooltip" id={id} className={styles.bubble}>
                {label}
            </span>
        </span>
    );
}
