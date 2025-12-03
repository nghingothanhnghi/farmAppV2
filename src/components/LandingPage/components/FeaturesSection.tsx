// src/components/LandingPage/components/FeaturesSection.tsx
import { IconChartBar, IconDroplet, IconRipple } from "@tabler/icons-react";
import { FeatureCard } from "./FeatureCard";

const FEATURES = [
  { icon: IconChartBar, title: "Analytics Dashboard", desc: "Trends for pH, EC, temperature, water level, and alerts." },
  { icon: IconDroplet, title: "Water & Level", desc: "Live tank levels, auto-refill triggers, and overflow protection." },
  { icon: IconRipple, title: "Pumps & Valves", desc: "Manual/auto control, prime routines, and runtime reports." },
];

const FeaturesSection = () => (
  <section className="py-20 lg:h-screen flex items-center">
    <div className="mx-auto max-w-6xl px-6 space-y-6">
      <h2 className="text-2xl sm:text-4xl font-semibold text-zinc-900 dark:text-white">Featured Automation</h2>
      <div className="space-y-4">
        <p className=" text-zinc-600 dark:text-zinc-300">Actionable insights and full control for your hydroponic system.</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default FeaturesSection;
