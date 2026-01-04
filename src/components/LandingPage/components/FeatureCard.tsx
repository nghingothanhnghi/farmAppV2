// src/components/LandingPage/components/FeatureCard.tsx
export const FeatureCard = ({
  icon: Icon,
  title,
  desc,
}: { icon: any; title: string; desc: string }) => (
  <div className="rounded-xl p-6 bg-white shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
    <div className="flex items-center gap-3 text-emerald-600">
      <Icon className="size-6" />
      <span className="font-medium text-zinc-900 dark:text-white">{title}</span>
    </div>
    <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{desc}</p>
    <div className="mt-4 h-24 rounded-lg bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-900/20 dark:to-emerald-800/10" />
  </div>
);
