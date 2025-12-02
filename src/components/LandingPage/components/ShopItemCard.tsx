// src/components/LandingPage/components/ShopItemCard.tsx
import { IconShoppingCart } from '@tabler/icons-react';
import type { Product } from '../../../models/interfaces/Product';
import ProductImage from '../../common/ProductImage';
import { useCart } from '../../../contexts/cartContext';
import { useAlert } from '../../../contexts/alertContext';

interface ShopItemCardProps {
  item: Product; // <-- from your model
}

const ShopItemCard = ({ item }: ShopItemCardProps) => {
  const { addToCart } = useCart();
  const { setAlert } = useAlert();

  const handleAddToCart = () => {
    addToCart(item);
    // ✅ Show alert
    setAlert({
      message: `${item.name} added to cart!`,
      type: "success",
    });
  };
  return (
    <div className="group overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-zinc-900">
      <div className="h-36 w-full bg-zinc-100 object-cover dark:bg-zinc-800">
        {/* <img src={item.img} alt={item.name} className="h-36 w-full object-cover" /> */}
        <ProductImage
          imageUrl={item.image_url}
          alt={item.name}
          size={40}
          rounded="md"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <p className="font-medium text-zinc-900 dark:text-white">{item.name}</p>
          <span className="text-sm text-zinc-600 dark:text-zinc-300">{item.base_price}</span>
        </div>
        <button onClick={handleAddToCart} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500">
          <IconShoppingCart className="size-4" /> Add to cart
        </button>
      </div>
    </div>
  );
}

export default ShopItemCard;
