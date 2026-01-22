import Hero from '@/components/Hero';
import FeaturedWork from '@/components/FeaturedWork';
import WritingList from '@/components/WritingList';
import Footer from '@/components/Footer';
import HeroSceneWrapper from '@/components/HeroSceneWrapper';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <HeroSceneWrapper />
      <div className="w-full max-w-5xl px-6 md:px-0">
        <Hero />
        <FeaturedWork />
        <WritingList />
      </div>
      <Footer />
    </main>
  );
}
