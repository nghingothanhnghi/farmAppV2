import React from "react";
import useToggle from "../../../hooks/useToggle";
import { FormInput, FormSelect } from "../../common/Form";
import Button from "../../common/Button";
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
        className={`flex items-center gap-2 transition-all duration-300 ${expanded ? "w-full max-w-5xl" : "w-full sm:w-1/2 lg:w-1/3"
          }`}
      >
        <div className="relative flex-1">
          <FormInput
            type="text"
            id="productName"
            placeholder="Search by product name..."
            value={filters.name ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, name: e.target.value }))}
            className="w-full"
          />
          {filters.name && (
            <Button
              variant="secondary"
              icon={<IconX size={18} />}
              iconOnly
              label="Clear name filter"
              className='bg-transparent absolute right-3 top-1/2 -translate-y-1/2'
              onClick={() => setFilters((f) => ({ ...f, name: "" }))}
              rounded='full'
              size="xxs"
            />
          )}
        </div>
        {/* 🧩 Toggle Advanced Filters */}
        <Button
          type="button"
          onClick={toggle}
          variant="link"
          icon={<IconAdjustmentsHorizontal size={16} />}
          iconPosition="left"
          label={expanded ? "Hide advanced filters" : "More filters"}
          className="shrink-0 text-gray-700 dark:text-gray-300"
        />
      </div>

      {/* 🧱 Advanced Filters Section */}
      {expanded && (
        <div className="max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mt-3">
          {/* Description */}
          <FormInput
            type="text"
            id="description"
            placeholder="Filter by description"
            value={filters.description ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, description: e.target.value }))}
            className="min-w-[150]"
          />

            {/* Min Price */}
            <FormSelect
              id="priceMin"
              value={filters.priceMin ?? ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  priceMin: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              className="min-w-[150]"
            >
              <option value="">Min price</option>
              <option value="0">0</option>
              <option value="1000000">1,000,000</option>
              <option value="3000000">3,000,000</option>
              <option value="5000000">5,000,000</option>
              <option value="10000000">10,000,000</option>
              <option value="20000000">20,000,000</option>
            </FormSelect>

            {/* Max Price */}
            <FormSelect
              id="priceMax"
              value={filters.priceMax ?? ""}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  priceMax: e.target.value ? Number(e.target.value) : undefined,
                }))
              }
              className="min-w-[150]"
            >
              <option value="">Max price</option>
              <option value="1000000">1,000,000</option>
              <option value="3000000">3,000,000</option>
              <option value="5000000">5,000,000</option>
              <option value="10000000">10,000,000</option>
              <option value="20000000">20,000,000</option>
              <option value="50000000">50,000,000</option>
            </FormSelect>
      
          {/* Variant Name */}
          <FormInput
            type="text"
            id="variantName"
            placeholder="variant name"
            value={filters.variantName ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, variantName: e.target.value }))}
            className="min-w-[150]"
          />

          {/* Variant SKU */}
          <FormInput
            type="text"
            id="variantSku"
            placeholder="SKU"
            value={filters.variantSku ?? ""}
            onChange={(e) => setFilters((f) => ({ ...f, variantSku: e.target.value }))}
            className="min-w-[150]"
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
