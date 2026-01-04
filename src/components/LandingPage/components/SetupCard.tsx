import React from 'react';

type SetupCardProps = {
  title: string;
  steps: string[];
};

const SetupCard: React.FC<SetupCardProps> = ({ title, steps }) => (
  <div className="rounded-xl border border-zinc-200 p-6 bg-white shadow dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
    <h3 className="font-medium">{title}</h3>
    <ol className="mt-3 list-decimal space-y-2 ps-5 text-sm text-zinc-600 dark:text-zinc-400">
      {steps.map((s) => <li key={s}>{s}</li>)}
    </ol>
  </div>
);

export default SetupCard;
