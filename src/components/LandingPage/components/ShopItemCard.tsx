// src/components/LandingPage/components/ShopItemCard.tsx
import { useState } from 'react';
import type { Product } from '../../../models/interfaces/Product';
import { HoverSlideIn } from "../../common/HoverSlideIn";
import { formatMoney } from "../../../utils/currency";
import ProductImage from '../../common/ProductImage';
import CartActionButton from '../../common/cart/CartActionButton';
import WishlistActionButton from '../../common/wishList/WishlistActionButton';
import QRCodeActionButton from '../../common/QRCodeActionButton';

interface ShopItemCardProps {
  item: Product; // <-- from your model
}

const ShopItemCard = ({ item }: ShopItemCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <>
      <div
        className="
          group relative overflow-hidden 
          rounded-xl bg-white shadow border border-gray-100
        dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)]
        "
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <HoverSlideIn
          isHovered={isHovered}
          from="top"
          className="absolute top-4 right-4"
        >
          <div className="bg-white dark:bg-gray-900 space-x-1 rounded-full shadow-md flex items-center p-1">
            <CartActionButton product={item} size="sm" rounded="full" />
            <WishlistActionButton product={item} size="sm" rounded="full" />
              <QRCodeActionButton product={item} size="sm" rounded="full" />
          </div>
        </HoverSlideIn>
        <div className="h-80 w-full bg-zinc-100 flex items-center justify-center dark:bg-zinc-800">
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
            <span className="text-sm text-zinc-600 dark:text-zinc-300">{formatMoney(item.base_price)}</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default ShopItemCard;
