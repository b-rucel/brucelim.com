import Link from 'next/link';
import type { Metadata } from 'next';
import PixelText from '@/components/PixelText';
import InvadersGame from '@/components/InvadersGame';

export const metadata: Metadata = {
  title: '404 — Bruce Lim',
  description: 'Page not found.',
};

export default function NotFound() {
  return (
    <div className="home-v2 flex min-h-screen flex-col items-center justify-center p-6">
      <main className="flex w-full flex-col items-center justify-center text-center">
        <h1 className="sr-only">Game over: 404, this page doesn&apos;t exist</h1>
        <PixelText text="GAME OVER" className="hv-404-title" />
        <PixelText text="404" colour="#84cdfa" className="hv-404-code" />
        <p className="mt-6 text-base sm:text-lg text-white/85">This page doesn&apos;t exist.</p>
        <InvadersGame scale={3} className="hv-404-game" />
        <Link href="/" className="hv-press-start" aria-label="Press start: back home">
          Press start
        </Link>
      </main>
    </div>
  );
}
