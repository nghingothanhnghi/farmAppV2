import React from 'react';
import { IconShoppingCart } from '@tabler/icons-react';

type ShopItem = {
  id: number;
  name: string;
  price: string;
  img: string;
};

const ShopItemCard: React.FC<{ item: ShopItem }> = ({ item }) => (
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

export default ShopItemCard;
