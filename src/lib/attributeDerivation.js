/**
 * Utility to extract unique attributes and their terms from a list of products.
 * This implements the "Super Performance" client-side derivation strategy.
 * 
 * @param {Array} products - List of products fetched from the API
 * @returns {Array} - List of unique attribute objects with their options
 */
export function extractAttributesFromProducts(products) {
    if (!products || !Array.isArray(products)) return [];

    const attributesMap = new Map();

    products.forEach((product) => {
        // Check both standard attributes and variations
        const allAttributes = [
            ...(product.attributes || []),
            ...(product.variations?.flatMap(v => v.attributes || []) || [])
        ];

        allAttributes.forEach((attr) => {
            // Use ID as primary key if available, otherwise use name
            const key = attr.id && String(attr.id) !== "0" ? String(attr.id) : attr.name;
            if (!key) return;

            if (!attributesMap.has(key)) {
                attributesMap.set(key, {
                    id: attr.id || key,
                    name: attr.name,
                    slug: attr.slug || attr.name.toLowerCase().replace(/\s+/g, '-'),
                    options: new Set(),
                    variation: !!attr.variation,
                    visible: !!attr.visible
                });
            }

            // Add options/values
            const attrEntry = attributesMap.get(key);

            // Handle different formats: options (array of strings) or option/value (single string)
            if (Array.isArray(attr.options)) {
                attr.options.forEach(opt => {
                    if (opt) attrEntry.options.add(String(opt));
                });
            } else if (attr.option) {
                attrEntry.options.add(String(attr.option));
            } else if (attr.value) {
                attrEntry.options.add(String(attr.value));
            }
        });
    });

    // Convert Map back to array format that components expect
    return Array.from(attributesMap.values()).map(attr => ({
        ...attr,
        options: Array.from(attr.options)
    }));
}

/**
 * Scans localStorage for cached products and derives attributes from them.
 */
export function deriveAttributesFromCache() {
    if (typeof window === 'undefined') return [];

    const allProducts = [];

    try {
        // Iterate through all localStorage keys to find cached product pages
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes('api_cache_products_page_')) {
                const cached = localStorage.getItem(key);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    // Data might be in .data or .products or direct
                    const data = parsed.data || parsed;
                    const products = Array.isArray(data) ? data : (data?.products || []);
                    allProducts.push(...products);
                }
            }
        }
    } catch (e) {
        console.warn('[Attribute Derivation] Error reading cache:', e);
    }

    return extractAttributesFromProducts(allProducts);
}
