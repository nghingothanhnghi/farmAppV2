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


/**
 * Clean a string into a SKU-friendly token
 */
export const cleanToken = (name: string): string => {
    return name
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, "-") // replace non-alphanumeric
        .replace(/-+/g, "-")         // merge multiple dashes
        .replace(/^-|-$/g, "");      // trim leading/trailing dash
};

/**
 * Generate a variant SKU based on product SKU + variant name.
 * Ensures uniqueness across existing variants.
 *
 * Example:
 *  product SKU = "APPLE-1234"
 *  variant name = "Red Large"
 *  result => "APPLE-1234-RED-LARGE"
 */
export const generateVariantSKU = (
    productSKU: string,
    variantName: string,
    existingSKUs: string[] = []
): string => {
    const base = cleanToken(variantName || "VARIANT");
    let sku = `${productSKU}-${base}`;
    
    // Ensure uniqueness
    let counter = 1;
    while (existingSKUs.includes(sku)) {
        sku = `${productSKU}-${base}-${String(counter).padStart(2, "0")}`;
        counter++;
    }

    return sku;
};
