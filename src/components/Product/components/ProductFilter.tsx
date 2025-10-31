import React from "react";

interface ProductFilterProps {
  filters: {
    name?: string;
    description?: string;
    priceMin?: number;
    priceMax?: number;
    variantName?: string;
    variantSku?: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      name?: string;
      description?: string;
      priceMin?: number;
      priceMax?: number;
      variantName?: string;
      variantSku?: string;
    }>
  >;
}

export const ProductFilter: React.FC<ProductFilterProps> = ({ filters, setFilters }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Product Name */}
      <input
        type="text"
        placeholder="Filter by product name"
        value={filters.name ?? ""}
        onChange={(e) => setFilters((f) => ({ ...f, name: e.target.value }))}
        className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
      />

      {/* Description */}
      <input
        type="text"
        placeholder="Filter by description"
        value={filters.description ?? ""}
        onChange={(e) => setFilters((f) => ({ ...f, description: e.target.value }))}
        className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
      />

      {/* Price Range */}
      <div className="flex gap-2">
        <input
          type="number"
          placeholder="Min price"
          value={filters.priceMin ?? ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              priceMin: e.target.value ? parseFloat(e.target.value) : undefined,
            }))
          }
          className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Max price"
          value={filters.priceMax ?? ""}
          onChange={(e) =>
            setFilters((f) => ({
              ...f,
              priceMax: e.target.value ? parseFloat(e.target.value) : undefined,
            }))
          }
          className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Variant Name */}
      <input
        type="text"
        placeholder="Filter by variant name"
        value={filters.variantName ?? ""}
        onChange={(e) => setFilters((f) => ({ ...f, variantName: e.target.value }))}
        className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
      />

      {/* Variant SKU */}
      <input
        type="text"
        placeholder="Filter by variant SKU"
        value={filters.variantSku ?? ""}
        onChange={(e) => setFilters((f) => ({ ...f, variantSku: e.target.value }))}
        className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
      />

      {/* Clear Filters */}
      <button
        type="button"
        onClick={() =>
          setFilters({
            name: "",
            description: "",
            priceMin: undefined,
            priceMax: undefined,
            variantName: "",
            variantSku: "",
          })
        }
        className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md px-3 py-2 font-medium transition"
      >
        Clear Filters
      </button>
    </div>
  );
};
