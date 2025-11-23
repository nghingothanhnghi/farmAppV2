/**
 * Generate a SKU for a product.
 * Example output: "APPLE-1234"
 * 
 * @param name - Product name
 * @returns string - Generated SKU
 */
export const generateSKU = (name: string): string => {
    if (!name) return "";
    // Take first 5 letters of the cleaned name
    const cleanName = name.trim().toUpperCase().replace(/\s+/g, "-").slice(0, 5);
    // 4-digit random number
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${cleanName}-${random}`;
};
