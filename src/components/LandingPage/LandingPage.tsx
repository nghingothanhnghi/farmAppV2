import React from 'react';
import LandingMenu from './components/LandingMenu';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import FeaturesSection from './components/FeaturesSection';
import EasySetupSection from './components/EasySetupSection';
import ShopSection from './components/ShopSection';
import FooterSection from './components/FooterSection';

const LandingPage: React.FC = () => (
  <main className="min-h-screen bg-mesh text-zinc-900 dark:text-white">
    <LandingMenu />
    {/* <HeroSection />
    <AboutSection />
    <FeaturesSection />
    <EasySetupSection />
    <ShopSection /> */}
        <section id="hero"><HeroSection /></section>
    <section id="about"><AboutSection /></section>
    <section id="features"><FeaturesSection /></section>
    <section id="setup"><EasySetupSection /></section>
    <section id="shop"><ShopSection /></section>
    <FooterSection />
  </main>
);

export default LandingPage;
