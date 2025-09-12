// src/components/LandingPage/components/FeatureCard.tsx
export const FeatureCard = ({
  icon: Icon,
  title,
  desc,
}: { icon: any; title: string; desc: string }) => (
  <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
    <div className="flex items-center gap-3 text-emerald-600">
      <Icon className="size-6" />
      <span className="font-medium text-zinc-900 dark:text-white">{title}</span>
    </div>
    <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{desc}</p>
    <div className="mt-4 h-24 rounded-lg bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-900/20 dark:to-emerald-800/10" />
  </div>
);
