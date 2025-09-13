import React from "react";
import { Link } from "react-router";
import ShopItemCard  from "./ShopItemCard";

const SHOP_ITEMS = [
  { id: 1, name: "pH Sensor Kit", price: "$39", img: "/screenshot/camera.png" },
  { id: 2, name: "EC/TDS Probe", price: "$49", img: "/screenshot/chart-realtime-hydro.png" },
  { id: 3, name: "Mini Dosing Pump", price: "$29", img: "/screenshot/overview-realtime-hydro.png" },
  { id: 4, name: "Water Level Sensor", price: "$19", img: "/screenshot/schedule-job-automation.png" },
  { id: 5, name: "Inline Valve", price: "$15", img: "/assets/react.svg" },
];

const ShopSection = () => (
  <section className="bg-zinc-50 py-20 lg:h-screen dark:bg-zinc-900/30 flex items-center">
    <div className="mx-auto max-w-6xl px-6 space-y-6">
      <div className="flex items-end justify-between">
        <div className="space-y-6">
          <h2 className="text-2x sm:text-4xl font-semibold text-zinc-900 dark:text-white">Equipment Shop</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-300">Essential parts to build or expand your system.</p>
        </div>
        <Link to="#" className="hidden text-sm font-medium text-emerald-700 hover:underline md:block">
          View all
        </Link>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {SHOP_ITEMS.slice(0, 4).map((it) => (
          <ShopItemCard key={it.id} item={it} />
        ))}
      </div>
    </div>
  </section>
);

export default ShopSection;
