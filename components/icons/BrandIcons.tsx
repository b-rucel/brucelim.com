/**
 * Brand icons.
 *
 * Path data taken from the Appica Icons set — MIT License (Appica).
 * Source: /Users/bruce/projects/labs/ui/collection/sources/github/appica-icons/assets/brands/
 * (brand-react.svg, brand-nextjs.svg, brand-typescript.svg, brand-tailwind.svg,
 *  brand-cloudflare.svg, brand-nodejs.svg, brand-github.svg, brand-linkedin.svg, brand-x.svg)
 * Line style kept from source: viewBox 0 0 24 24, fill none, stroke currentColor,
 * stroke-width 1.5, round caps and joins.
 */

import type { ReactNode } from 'react';

export type BrandIconProps = {
    className?: string;
    size?: number;
    'aria-hidden'?: boolean;
};

function IconBase({
    size = 20,
    className,
    'aria-hidden': ariaHidden = true,
    children,
}: BrandIconProps & { children: ReactNode }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden={ariaHidden}
            focusable="false"
        >
            {children}
        </svg>
    );
}

export function ReactIcon(props: BrandIconProps) {
    return (
        <IconBase {...props}>
            <path d="M6.306 8.67C3.704 9.402 2 10.62 2 12c0 2.237 4.477 4.05 10 4.05.773 0 1.526-.036 2.248-.104m3.444-.616C20.295 14.599 22 13.38 22 12c0-2.237-4.477-4.05-10-4.05-.773 0-1.526.036-2.25.104m-3.445 7.274c-.676 2.647-.485 4.75.695 5.44 1.913 1.118 5.703-1.901 8.464-6.743.387-.678.733-1.356 1.036-2.025m1.194-3.325c.677-2.648.487-4.754-.694-5.442-1.913-1.119-5.703 1.9-8.464 6.742A25 25 0 0 0 7.499 12M12 5.343c-1.925-1.916-3.82-2.8-5-2.11-1.913 1.118-1.226 5.95 1.536 10.792.386.678.793 1.32 1.212 1.92M12 18.654c1.926 1.917 3.821 2.802 5 2.112 1.913-1.117 1.226-5.95-1.536-10.792a25 25 0 0 0-1.212-1.92M11.5 12.877a.993.993 0 0 0 1.372-.367 1.02 1.02 0 0 0-.372-1.387.99.99 0 0 0-1.36.374 1.024 1.024 0 0 0 .36 1.38" />
        </IconBase>
    );
}

export function NextJsIcon(props: BrandIconProps) {
    return (
        <IconBase {...props}>
            <path d="M9 15V9l7.745 10.65A9 9 0 1 1 19 17.657M15 12V9" />
        </IconBase>
    );
}

export function TypeScriptIcon(props: BrandIconProps) {
    return (
        <IconBase {...props}>
            <path d="M15 17.5c.32.32.754.5 1.207.5h.543c.69 0 1.25-.56 1.25-1.25v-.25a1.5 1.5 0 0 0-1.5-1.5 1.5 1.5 0 0 1-1.5-1.5v-.25c0-.69.56-1.25 1.25-1.25h.543c.453 0 .887.18 1.207.5M9 12h4m-2 0v6m10 1V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2" />
        </IconBase>
    );
}

export function TailwindIcon(props: BrandIconProps) {
    return (
        <IconBase {...props}>
            <path d="M11.667 6Q7.933 6 7 9.667q1.4-1.834 3.267-1.375c.71.174 1.217.68 1.778 1.24.916.912 2 1.968 4.288 1.968q3.734 0 4.667-3.667-1.4 1.834-3.267 1.375c-.71-.174-1.217-.68-1.778-1.24C15.039 7.056 13.98 6 11.667 6m-4 6.5Q3.933 12.5 3 16.167q1.4-1.834 3.267-1.375c.71.174 1.217.68 1.778 1.24.916.912 1.975 1.968 4.288 1.968q3.734 0 4.667-3.667-1.4 1.834-3.267 1.375c-.71-.174-1.217-.68-1.778-1.24-.916-.912-1.975-1.968-4.288-1.968" />
        </IconBase>
    );
}

export function CloudflareIcon(props: BrandIconProps) {
    return (
        <IconBase {...props}>
            <path d="M17 9.995C16.326 8.294 15.5 6.993 13.031 7S8.66 8.052 8 9.995c-2 0-3 1.502-3 3.003-1.64.046-3.001 1.36-3 3.002h20c-.006-2.177-1-6.005-5-6.005m0 0L14.5 16M12 12.998h6" />
        </IconBase>
    );
}

export function NodeJsIcon(props: BrandIconProps) {
    return (
        <IconBase {...props}>
            <path d="M9 8.996v8.056a2.005 2.005 0 0 1-1.997 2.003c-.35 0-.695-.091-.999-.266l-1.568-.901A3 3 0 0 1 3 15.323V8.677a3.01 3.01 0 0 1 1.436-2.564l6-3.672a3 3 0 0 1 3.128 0l6 3.672A3 3 0 0 1 21 8.678v6.645a3.01 3.01 0 0 1-1.436 2.564l-6 3.672a3 3 0 0 1-3.128 0M17 8.996h-3.5a1.5 1.5 0 0 0-1.5 1.502 1.504 1.504 0 0 0 1.5 1.503h2a1.5 1.5 0 0 1 1.5 1.502 1.504 1.504 0 0 1-1.5 1.502H12" />
        </IconBase>
    );
}

export function GitHubIcon(props: BrandIconProps) {
    return (
        <IconBase {...props}>
            <path d="M9.5 18.991c-4.3 1.406-4.3-2.51-6-3.013M15.5 21v-3.515c0-1.005.1-1.406-.5-2.009 2.8-.301 5.5-1.406 5.5-6.026a4.63 4.63 0 0 0-1.3-3.214 4.24 4.24 0 0 0-.1-3.214s-1.1-.3-3.5 1.306a12.25 12.25 0 0 0-6.2 0C7 2.721 5.9 3.022 5.9 3.022a4.24 4.24 0 0 0-.1 3.214A4.63 4.63 0 0 0 4.5 9.45c0 4.62 2.7 5.725 5.5 6.026-.6.603-.6 1.205-.5 2.009V21" />
        </IconBase>
    );
}

export function LinkedInIcon(props: BrandIconProps) {
    return (
        <IconBase {...props}>
            <path d="M8 11v5m0-8v.01M12 16v-5m4 5v-3a2 2 0 0 0-4 0M3 7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z" />
        </IconBase>
    );
}

export function XIcon(props: BrandIconProps) {
    return (
        <IconBase {...props}>
            <path d="m4 20 6.768-6.768m2.46-2.46L20 4M4 4l11.733 16H20L8.267 4z" />
        </IconBase>
    );
}
