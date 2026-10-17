import HomeNav from '@/components/HomeNav';
import HomeHero from '@/components/HomeHero';
import HomeMarquee from '@/components/HomeMarquee';
import FeaturedWork from '@/components/FeaturedWork';
import WritingList from '@/components/WritingList';
import HomeAbout from '@/components/HomeAbout';
import HomeContact from '@/components/HomeContact';
import SectionDivider from '@/components/SectionDivider';
import KonamiMode from '@/components/KonamiMode';
import LevelEnd from '@/components/LevelEnd';

export default function Home() {
  return (
    <div className="home-v2">
      <HomeNav />
      <main>
        <HomeHero />
        <HomeMarquee />
        <SectionDivider />
        <FeaturedWork />
        <SectionDivider />
        <WritingList />
        <SectionDivider />
        <HomeAbout />
      </main>
      <SectionDivider />
      <HomeContact />
      <LevelEnd />
      <KonamiMode />
    </div>
  );
}
