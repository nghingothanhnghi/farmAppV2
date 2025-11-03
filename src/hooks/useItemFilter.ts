import { useState, useMemo, useEffect } from "react";
import type { Product } from "../models/interfaces/Product";
import { useSearchParams } from "react-router";

interface ItemFilter {
  name?: string;
  description?: string;
  priceMin?: number;
  priceMax?: number;
  variantName?: string;
  variantSku?: string;
}

export function useItemFilter(products: Product[]) {
//   const [filters, setFilters] = useState<ItemFilter>({
//     name: "",
//     description: "",
//     priceMin: undefined,
//     priceMax: undefined,
//     variantName: "",
//     variantSku: "",
//   });

//   const [debouncedFilters, setDebouncedFilters] = useState(filters);

//     // ✅ Debounce only text filters (name, description, variantName, variantSku)
//   useEffect(() => {
//     const handler = setTimeout(() => {
//       setDebouncedFilters(filters);
//     }, 300);
//     return () => clearTimeout(handler);
//   }, [filters.name, filters.description, filters.variantName, filters.variantSku]);

//     // ✅ Immediately apply numeric filters (price range)
//   useEffect(() => {
//     setDebouncedFilters((prev) => ({
//       ...prev,
//       priceMin: filters.priceMin,
//       priceMax: filters.priceMax,
//     }));
//   }, [filters.priceMin, filters.priceMax]);

// // ✅ Apply filtering logic
//   const filteredProducts = useMemo(() => {
//     const trimLower = (val?: string) => val?.trim().toLowerCase() || "";

//     return products.filter((p) => {
//       const name = trimLower(p.name);
//       const desc = trimLower(p.description);
//       const matchName = debouncedFilters.name
//         ? name.includes(trimLower(debouncedFilters.name))
//         : true;

//       const matchDescription = debouncedFilters.description
//         ? desc.includes(trimLower(debouncedFilters.description))
//         : true;

//       const matchPriceMin =
//         debouncedFilters.priceMin !== undefined
//           ? p.base_price >= debouncedFilters.priceMin
//           : true;

//       const matchPriceMax =
//         debouncedFilters.priceMax !== undefined
//           ? p.base_price <= debouncedFilters.priceMax
//           : true;

//       const matchVariantName = debouncedFilters.variantName
//         ? p.variants?.some((v) =>
//             trimLower(v.name).includes(trimLower(debouncedFilters.variantName))
//           )
//         : true;

//       const matchVariantSku = debouncedFilters.variantSku
//         ? p.variants?.some((v) =>
//             trimLower(v.sku).includes(trimLower(debouncedFilters.variantSku))
//           )
//         : true;

//       return (
//         matchName &&
//         matchDescription &&
//         matchPriceMin &&
//         matchPriceMax &&
//         matchVariantName &&
//         matchVariantSku
//       );
//     });
//   }, [products, debouncedFilters]);

//   return useMemo(
//     () => ({
//       filters,
//       setFilters,
//       filteredProducts,
//     }),
//     [filters, filteredProducts]
//   );

  const [searchParams, setSearchParams] = useSearchParams();

  // ✅ Initialize filters from URL params
  const [filters, setFilters] = useState<ItemFilter>({
    name: searchParams.get("name") || "",
    description: searchParams.get("description") || "",
    priceMin: searchParams.get("priceMin")
      ? parseFloat(searchParams.get("priceMin") as string)
      : undefined,
    priceMax: searchParams.get("priceMax")
      ? parseFloat(searchParams.get("priceMax") as string)
      : undefined,
    variantName: searchParams.get("variantName") || "",
    variantSku: searchParams.get("variantSku") || "",
  });

  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  // ✅ Debounce text filters
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 300);
    return () => clearTimeout(handler);
  }, [filters.name, filters.description, filters.variantName, filters.variantSku]);

  // ✅ Immediately apply numeric filters
  useEffect(() => {
    setDebouncedFilters((prev) => ({
      ...prev,
      priceMin: filters.priceMin,
      priceMax: filters.priceMax,
    }));
  }, [filters.priceMin, filters.priceMax]);

  // ✅ Sync filters to URL params
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.name) params.set("name", filters.name);
    if (filters.description) params.set("description", filters.description);
    if (filters.priceMin !== undefined) params.set("priceMin", String(filters.priceMin));
    if (filters.priceMax !== undefined) params.set("priceMax", String(filters.priceMax));
    if (filters.variantName) params.set("variantName", filters.variantName);
    if (filters.variantSku) params.set("variantSku", filters.variantSku);

    setSearchParams(params);
  }, [filters, setSearchParams]);

  // ✅ Apply filtering logic
  const filteredProducts = useMemo(() => {
    const trimLower = (val?: string) => val?.trim().toLowerCase() || "";

    return products.filter((p) => {
      const name = trimLower(p.name);
      const desc = trimLower(p.description);

      const matchName = debouncedFilters.name
        ? name.includes(trimLower(debouncedFilters.name))
        : true;

      const matchDescription = debouncedFilters.description
        ? desc.includes(trimLower(debouncedFilters.description))
        : true;

      const matchPriceMin =
        debouncedFilters.priceMin !== undefined
          ? p.base_price >= debouncedFilters.priceMin
          : true;

      const matchPriceMax =
        debouncedFilters.priceMax !== undefined
          ? p.base_price <= debouncedFilters.priceMax
          : true;

      const matchVariantName = debouncedFilters.variantName
        ? p.variants?.some((v) =>
            trimLower(v.name).includes(trimLower(debouncedFilters.variantName))
          )
        : true;

      const matchVariantSku = debouncedFilters.variantSku
        ? p.variants?.some((v) =>
            trimLower(v.sku).includes(trimLower(debouncedFilters.variantSku))
          )
        : true;

      return (
        matchName &&
        matchDescription &&
        matchPriceMin &&
        matchPriceMax &&
        matchVariantName &&
        matchVariantSku
      );
    });
  }, [products, debouncedFilters]);

  return useMemo(
    () => ({
      filters,
      setFilters,
      filteredProducts,
    }),
    [filters, filteredProducts]
  );

}
