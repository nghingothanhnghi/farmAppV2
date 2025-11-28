import { Link } from "react-router";
import { useProduct } from "../../../hooks/useProduct";
import ShopItemCard from "./ShopItemCard";

const ShopSection = () => {
  const { products, loading, error } = useProduct();
  return (

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
        {/* Loading State */}
        {loading && <p className="text-center text-zinc-500">Loading products…</p>}

        {/* Error State */}
        {error && (
          <p className="text-center text-red-500">
            {error}
          </p>
        )}
        {/* Products Grid */}
        {!loading && !error && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.slice(0, 4).map((product) => (
              <ShopItemCard key={product.id} item={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  )

}

export default ShopSection;
