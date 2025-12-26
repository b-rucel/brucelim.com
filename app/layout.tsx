import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from '@/components/GoogleAnalytics';
import 'highlight.js/styles/github-dark.css';

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: {
    default: "Bruce Lim",
    template: "%s | Bruce Lim",
  },
  description: "Welcome to my corner of the web",

  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://brucelim.com",
    siteName: "Bruce Lim",
    title: "Bruce Lim",
    description: "Welcome to my corner of the web",
  },

  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "Bruce Lim",
    description: "Welcome to my corner of the web",
  },

  // Robots
  robots: {
    index: true,
    follow: true,
  },
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
        <GoogleAnalytics measurementId="G-GDLTB1K7CS" />
      </head>
      <body className={`${outfit.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
