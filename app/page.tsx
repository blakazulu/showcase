import TopBar from "@/components/TopBar";
import Hero from "@/components/Hero";
import CadenceChart from "@/components/CadenceChart";
import StatStrip from "@/components/StatStrip";
import HomeFilter from "@/components/HomeFilter";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <TopBar />
      <Hero>
        <CadenceChart />
        <StatStrip />
      </Hero>
      <HomeFilter />
      <Footer />
    </>
  );
}
