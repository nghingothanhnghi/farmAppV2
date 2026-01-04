// src/pages/Landing/components/AboutSection.tsx
import React from "react";
import { IconDroplet, IconLeaf, IconBolt } from "@tabler/icons-react";

interface FeatureItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

const features: FeatureItem[] = [
  {
    id: "water-quality",
    icon: <IconDroplet className="size-6 text-emerald-600" />,
    title: "Water Quality Monitoring",
    description:
      "Track pH, EC/TDS, temperature, and dissolved oxygen in real time.",
  },
  {
    id: "nutrient-dosing",
    icon: <IconLeaf className="size-6 text-emerald-600" />,
    title: "Nutrient Dosing",
    description:
      "Automated proportional dosing keeps nutrient balance optimal.",
  },
  {
    id: "energy-efficient",
    icon: <IconBolt className="size-6 text-emerald-600" />,
    title: "Energy Efficient",
    description:
      "Smart schedules and thresholds reduce pump and light usage.",
  },
];

const AboutSection: React.FC = () => {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 lg:h-screen flex items-center">
      <div className="grid gap-8 lg:gap-40 md:grid-cols-2">
        {/* Left text content */}
        <div className="space-y-6">
          <h2 className="text-2xl sm:text-4xl font-semibold text-zinc-900 dark:text-white">
            About Our Farm
          </h2>
          <div className="mt-4 space-y-4 text-zinc-600 dark:text-zinc-300">
            <p>
              Hydroponics lets you grow plants in a controlled, soil-less
              environment. Our platform helps you manage pH, EC, water flow,
              lighting, and nutrients with automation and insights.
            </p>
            <p>
              Scale from a small balcony setup to a multi-channel commercial
              system while keeping consistency, health, and yields high.
            </p>
          </div>
        </div>

        {/* Right card with features */}
        <div className="rounded-xl p-6 bg-white shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
          <ul className="space-y-4">
            {features.map((feature) => (
              <li key={feature.id} className="flex items-start gap-3">
                {feature.icon}
                <div>
                  <p className="font-medium">{feature.title}</p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    {feature.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
