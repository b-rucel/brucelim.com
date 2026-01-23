import Hero from '@/components/Hero';
import FeaturedWork from '@/components/FeaturedWork';
import WritingList from '@/components/WritingList';
import Footer from '@/components/Footer';
// import CustomCursor from '@/components/CustomCursor';
// import GridBackground from '@/components/GridBackground';
// import HeroSceneWrapper from '@/components/HeroSceneWrapper';
import SquigglyLine from '@/components/SquigglyLine';

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between overflow-hidden">
      {/* <CustomCursor /> */}
      <SquigglyLine  />
      <div className="w-full max-w-5xl px-6 md:px-0">
        <Hero />
        <FeaturedWork />
        <WritingList />
      </div>
      <Footer />
    </main>
  );
}
