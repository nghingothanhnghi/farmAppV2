import React from 'react';

type SetupCardProps = {
  title: string;
  steps: string[];
};

const SetupCard: React.FC<SetupCardProps> = ({ title, steps }) => (
  <div className="rounded-xl border border-zinc-200 p-6 shadow-sm dark:border-white/10">
    <h3 className="font-medium">{title}</h3>
    <ol className="mt-3 list-decimal space-y-2 ps-5 text-sm text-zinc-600 dark:text-zinc-400">
      {steps.map((s) => <li key={s}>{s}</li>)}
    </ol>
  </div>
);

export default SetupCard;
