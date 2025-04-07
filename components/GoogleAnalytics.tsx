'use client';

import { useEffect } from 'react';

type GTagEvent = {
  action: string;
  category: string;
  label: string;
  value: number;
};

export default function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname.endsWith('.pages.dev')
    ) {
      console.log('Google Analytics is disabled for development.');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.async = true;

    script.onload = () => {
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: [string, Date | string | GTagEvent, ...unknown[]]) {
        window.dataLayer.push(args);
      }
      gtag('js', new Date());
      gtag('config', measurementId);
    };

    document.head.appendChild(script);
  }, [measurementId]);

  return null;
}