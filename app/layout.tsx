import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from '@/components/GoogleAnalytics';

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Bruce Lim",
  description: "Welcome to my corner of the web",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {(typeof window === 'undefined' || (
          window.location.hostname === 'localhost' ||
          window.location.hostname.endsWith('.pages.dev')
        )) ? <></> : <GoogleAnalytics measurementId="G-GDLTB1K7CS" /> }
      </head>
      <body className={`${outfit.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
