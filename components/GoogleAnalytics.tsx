'use client';

export default function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  if (typeof window === 'undefined' || (
    window.location.hostname === 'localhost' ||
    window.location.hostname.endsWith('.pages.dev')
  )) {
    console.log('Google Analytics is disabled for development.')
    return null;
  }

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${measurementId}');
          `,
        }}
      />
    </>
  );
}