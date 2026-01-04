import { Link } from "react-router";
import { useProductContext } from "../../../contexts/productContext";
import Carousel from "../../common/carousel/Carousel";
import ShopItemCard from "./ShopItemCard";

interface ShopSectionProps {
  itemsToShow?: number; // number of products to show
}
const ShopSection: React.FC<ShopSectionProps> = ({ itemsToShow = 8 }) => {
  const { products, loading, error } = useProductContext();

  return (
    <section className="py-20 lg:h-screen flex items-center">
      <div className="mx-auto max-w-6xl px-6 space-y-6">
        <div className="flex items-end justify-between w-full">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-4xl font-semibold text-zinc-900 dark:text-white">Equipment Shop</h2>
            <p className=" text-zinc-600 dark:text-zinc-300">Essential parts to build or expand your system.</p>
          </div>
          <Link to="#" className="hidden text-sm font-medium text-emerald-700 hover:underline md:block">
            View all
          </Link>
        </div>
        {/* Loading State */}
        {loading && <p className="text-center text-zinc-500">Loading products…</p>}

        {/* Error State */}
        {error && (
          <p className="text-center text-red-500">
            {error}
          </p>
        )}

        {/* Carousel */}
        {!loading && !error && (
          <Carousel
            options={{ loop: true }}
            className="embla w-full"
          >
            {products.slice(0, itemsToShow).map((product) => (
              <div
                key={product.id}
                className="
                  flex-[0_0_80%] 
                  sm:flex-[0_0_50%] 
                  lg:flex-[0_0_25%] 
                  px-3
                "
              >
                <ShopItemCard item={product} />
              </div>
            ))}
          </Carousel>
        )}
      </div>
    </section>
  )

}

export default ShopSection;
