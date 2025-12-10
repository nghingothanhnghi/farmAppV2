// src/components/LandingPage/components/ShopItemCard.tsx
import type { Product } from '../../../models/interfaces/Product';
import ProductImage from '../../common/ProductImage';
import CartActionButton from '../../common/cart/CartActionButton';

interface ShopItemCardProps {
  item: Product; // <-- from your model
}

const ShopItemCard = ({ item }: ShopItemCardProps) => {
  return (
    <div className="group overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md dark:border-white/10 dark:bg-zinc-900">
      <div className="h-36 w-full bg-zinc-100 flex items-center justify-center dark:bg-zinc-800">
        <ProductImage
          imageUrl={item.image_url}
          alt={item.name}
          rounded="md"
          className='h-full w-auto'
        />
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <p className="font-medium text-zinc-900 dark:text-white">{item.name}</p>
          <span className="text-sm text-zinc-600 dark:text-zinc-300">{item.base_price}</span>
        </div>
        <CartActionButton product={item} size="sm" rounded="md" />
      </div>
    </div>
  );
}

export default ShopItemCard;
