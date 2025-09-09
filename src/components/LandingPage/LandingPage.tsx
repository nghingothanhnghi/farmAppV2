import React from 'react';
import { Link } from 'react-router';
import {
  IconDroplet, IconChartBar, IconRipple, IconLeaf,
  IconBolt, IconShoppingCart
} from '@tabler/icons-react';
import HeroSection from './components/HeroSection';


// --- Constants ---
const FEATURES = [
  { icon: IconChartBar, title: 'Analytics Dashboard', desc: 'Trends for pH, EC, temperature, water level, and alerts.' },
  { icon: IconDroplet, title: 'Water & Level', desc: 'Live tank levels, auto-refill triggers, and overflow protection.' },
  { icon: IconRipple, title: 'Pumps & Valves', desc: 'Manual/auto control, prime routines, and runtime reports.' },
];

const STEPS_HOME = [
  'Assemble reservoir, channels, and pump',
  'Fill water and set base nutrients',
  'Place seedlings and set light schedule',
  'Calibrate sensors and start automation',
];

const STEPS_PRO = [
  'Plan multi-channel layout with manifolds',
  'Setup dosing pumps and return lines',
  'Define zones, thresholds, and schedules',
  'Enable alerts and daily reports',
];

const SHOP_ITEMS = [
  { id: 1, name: 'pH Sensor Kit', price: '$39', img: '/screenshot/camera.png' },
  { id: 2, name: 'EC/TDS Probe', price: '$49', img: '/screenshot/chart-realtime-hydro.png' },
  { id: 3, name: 'Mini Dosing Pump', price: '$29', img: '/screenshot/overview-realtime-hydro.png' },
  { id: 4, name: 'Water Level Sensor', price: '$19', img: '/screenshot/schedule-job-automation.png' },
  { id: 5, name: 'Inline Valve', price: '$15', img: '/assets/react.svg' },
];

// --- Reusable UI ---
const FeatureCard = ({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) => (
  <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900">
    <div className="flex items-center gap-3 text-emerald-600">
      <Icon className="size-6" />
      <span className="font-medium text-zinc-900 dark:text-white">{title}</span>
    </div>
    <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">{desc}</p>
    <div className="mt-4 h-24 rounded-lg bg-gradient-to-r from-emerald-100 to-emerald-200 dark:from-emerald-900/20 dark:to-emerald-800/10" />
  </div>
);

const SetupCard = ({ title, steps }: { title: string; steps: string[] }) => (
  <div className="rounded-xl border border-zinc-200 p-6 shadow-sm dark:border-white/10">
    <h3 className="font-medium">{title}</h3>
    <ol className="mt-3 list-decimal space-y-2 ps-5 text-sm text-zinc-600 dark:text-zinc-400">
      {steps.map((s) => <li key={s}>{s}</li>)}
    </ol>
  </div>
);

const ShopItemCard = ({ item }: { item: typeof SHOP_ITEMS[number] }) => (
  <div className="group overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-zinc-900">
    <div className="h-36 w-full bg-zinc-100 object-cover dark:bg-zinc-800">
      <img src={item.img} alt={item.name} className="h-36 w-full object-cover" />
    </div>
    <div className="p-4">
      <div className="flex items-center justify-between">
        <p className="font-medium text-zinc-900 dark:text-white">{item.name}</p>
        <span className="text-sm text-zinc-600 dark:text-zinc-300">{item.price}</span>
      </div>
      <button className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500">
        <IconShoppingCart className="size-4" /> Add to cart
      </button>
    </div>
  </div>
);

function FeaturesSection() {
  return (
    <section id="features" className="bg-zinc-50 py-16 dark:bg-zinc-900/30">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">Featured Automation</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-300">Actionable insights and full control for your hydroponic system.</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => <FeatureCard key={f.title} {...f} />)}
        </div>
      </div>
    </section>
  );
}

function EasySetupSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">Easy Setup</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-300">From home hobby systems to large, multi-channel farms.</p>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <SetupCard title="Home Setup" steps={STEPS_HOME} />
        <SetupCard title="Large Farm" steps={STEPS_PRO} />
      </div>
    </section>
  );
}

function ShopSection() {
  return (
    <section className="bg-zinc-50 py-16 dark:bg-zinc-900/30">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">Equipment Shop</h2>
            <p className="mt-2 text-zinc-600 dark:text-zinc-300">Essential parts to build or expand your system.</p>
          </div>
          <Link to="#" className="hidden text-sm font-medium text-emerald-700 hover:underline md:block">View all</Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SHOP_ITEMS.slice(0, 4).map((it) => <ShopItemCard key={it.id} item={it} />)}
        </div>
      </div>
    </section>
  );
}

function FooterSection() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-zinc-200 bg-white py-10 dark:border-white/10 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-6">
        {/* ...same layout... */}
        <p className="mt-8 text-center text-xs text-zinc-500">© {year} HydroFarm. All rights reserved.</p>
      </div>
    </footer>
  );
}

const LandingPage: React.FC = () => (
  <main className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-white">
    <HeroSection />
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-white">About Our Farm</h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-300">
            Hydroponics lets you grow plants in a controlled, soil-less environment. Our platform helps you manage pH, EC, water flow, lighting, and nutrients with automation and insights.
          </p>
          <p className="mt-3 text-zinc-600 dark:text-zinc-300">
            Scale from a small balcony setup to a multi-channel commercial system while keeping consistency, health, and yields high.
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 p-6 shadow-sm dark:border-white/10">
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <IconDroplet className="size-6 text-emerald-600" />
              <div>
                <p className="font-medium">Water Quality Monitoring</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Track pH, EC/TDS, temperature, and dissolved oxygen in real time.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <IconLeaf className="size-6 text-emerald-600" />
              <div>
                <p className="font-medium">Nutrient Dosing</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Automated proportional dosing keeps nutrient balance optimal.</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <IconBolt className="size-6 text-emerald-600" />
              <div>
                <p className="font-medium">Energy Efficient</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Smart schedules and thresholds reduce pump and light usage.</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
    <FeaturesSection />
    <EasySetupSection />
    <ShopSection />
    <FooterSection />
  </main>
);

export default LandingPage;
