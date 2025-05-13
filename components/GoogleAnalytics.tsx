'use client';

export default function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            if (window.location.hostname === 'brucelim.com') {
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${measurementId}');
            } else {
              console.log('Google Analytics disabled for this environment');
            }
          `,
        }}
      />
    </>
  );
}