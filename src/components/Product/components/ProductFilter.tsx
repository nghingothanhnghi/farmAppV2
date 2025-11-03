import React from "react";
import useToggle from "../../../hooks/useToggle";
import { IconAdjustmentsHorizontal, IconX } from '@tabler/icons-react';
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
    const { value: expanded, toggle, setOff } = useToggle(false);
      const clearFilters = () => {
    setFilters({
      name: "",
      description: "",
      priceMin: undefined,
      priceMax: undefined,
      variantName: "",
      variantSku: "",
    });
    setOff(); // collapse filters when cleared
  };
  return (
    <div className="flex flex-col items-center justify-center">
      {/* 🔍 Search by Name */}
      <div 
        className={`flex items-center gap-2 transition-all duration-300 ${
          expanded ? "w-full max-w-5xl" : "w-full sm:w-1/2 lg:w-1/3"
        }`}
      >
        <input
          type="text"
          placeholder="Search by product name..."
          value={filters.name ?? ""}
          onChange={(e) => setFilters((f) => ({ ...f, name: e.target.value }))}
          className="border border-gray-300 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-500"
        />
        {filters.name && (
          <button
            onClick={() => setFilters((f) => ({ ...f, name: "" }))}
            className="text-gray-500 hover:text-gray-700 p-2"
            title="Clear name filter"
          >
            <IconX size={18} />
          </button>
        )}
      </div>

      {/* 🧩 Toggle Advanced Filters */}
      <div>
        <button
          onClick={toggle}
          className="text-sm text-blue-600 hover:underline flex items-center gap-1"
        >
          {expanded ? (
            <>
              <IconAdjustmentsHorizontal size={16} /> Hide advanced filters
            </>
          ) : (
            <>
              <IconAdjustmentsHorizontal size={16} /> More filters
            </>
          )}
        </button>
      </div>

      {/* 🧱 Advanced Filters Section */}
      {expanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
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

          {/* Clear All */}
          <button
            type="button"
            onClick={clearFilters}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md px-3 py-2 font-medium transition"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};
