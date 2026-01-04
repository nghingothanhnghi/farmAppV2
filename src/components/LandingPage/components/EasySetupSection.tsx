import SetupCard from "./SetupCard";

const STEPS_HOME = [
  "Assemble reservoir, channels, and pump",
  "Fill water and set base nutrients",
  "Place seedlings and set light schedule",
  "Calibrate sensors and start automation",
];

const STEPS_PRO = [
  "Plan multi-channel layout with manifolds",
  "Setup dosing pumps and return lines",
  "Define zones, thresholds, and schedules",
  "Enable alerts and daily reports",
];

const EasySetupSection = () => (
  <section className="py-20 lg:h-screen flex items-center w-full">
    <div className="mx-auto max-w-6xl px-6 space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl sm:text-4xl font-semibold text-zinc-900 dark:text-white">Easy Setup</h2>
        <p className=" text-zinc-600 dark:text-zinc-300">From home hobby systems to large, multi-channel farms.</p>
      </div>
      <div className="grid gap-8 grid-cols-1 sm:grid-flow-col sm:auto-cols-fr">
        <SetupCard title="Home Setup" steps={STEPS_HOME} />
        <SetupCard title="Large Farm" steps={STEPS_PRO} />
      </div>
    </div>
  </section>
);

export default EasySetupSection;
