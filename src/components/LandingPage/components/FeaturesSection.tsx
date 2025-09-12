// src/components/LandingPage/components/FeaturesSection.tsx
import { IconChartBar, IconDroplet, IconRipple } from "@tabler/icons-react";
import { FeatureCard } from "./FeatureCard";

const FEATURES = [
  { icon: IconChartBar, title: "Analytics Dashboard", desc: "Trends for pH, EC, temperature, water level, and alerts." },
  { icon: IconDroplet, title: "Water & Level", desc: "Live tank levels, auto-refill triggers, and overflow protection." },
  { icon: IconRipple, title: "Pumps & Valves", desc: "Manual/auto control, prime routines, and runtime reports." },
];

const FeaturesSection = () => (
  <section id="features" className="bg-zinc-50 py-16 dark:bg-zinc-900/30">
    <div className="mx-auto max-w-6xl px-6">
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">Featured Automation</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-300">Actionable insights and full control for your hydroponic system.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <FeatureCard key={f.title} {...f} />
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
