import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSearch from "@/components/home/HeroSearch";
import BannerSection from "@/components/home/BannerSection";
import PopularRoutes from "@/components/home/PopularRoutes";
import HowItWorks from "@/components/home/HowItWorks";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-1">
        <HeroSearch />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BannerSection />
        </div>
        <PopularRoutes />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
