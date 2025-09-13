import React from 'react';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import FeaturesSection from './components/FeaturesSection';
import EasySetupSection from './components/EasySetupSection';
import ShopSection from './components/ShopSection';
import FooterSection from './components/FooterSection';

const LandingPage: React.FC = () => (
  <main className="min-h-screen bg-mesh text-zinc-900 dark:text-white">
    <HeroSection />
    <AboutSection />
    <FeaturesSection />
    <EasySetupSection />
    <ShopSection />
    <FooterSection />
  </main>
);

export default LandingPage;
