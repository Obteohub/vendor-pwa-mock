import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Define the external API base URL for WooCommerce/Dokan
const WC_API_URL = process.env.NEXT_PUBLIC_WC_API_BASE_URL;

// IMPORTANT: Prevents Next.js from caching the response
export const dynamic = 'force-dynamic';

export async function POST(request) {
    // 0. AUTHENTICATION CHECK
    const cookieStore = await cookies();
    const authToken = cookieStore.get('sw_token')?.value;

    if (!authToken) {
        return NextResponse.json(
            { error: 'Unauthorized. Missing authentication token.' },
            { status: 401 }
        );
    }

    try {
        // --- 1. Parse FormData (Required for file uploads) ---
        const formData = await request.formData();

        // Extract ALL fields
        const name = formData.get('name');
        const productType = formData.get('productType') || 'simple'; // NEW: Get product type
        
        // Pricing/Inventory fields (only relevant for simple products on main object)
        const regular_price = formData.get('regular_price');
        const stock_quantity = formData.get('stock_quantity');
        
        // Extended fields
        const short_description = formData.get('short_description');
        const description = formData.get('description');
        const sku = formData.get('sku');
        const sale_price = formData.get('sale_price');
        const sale_start = formData.get('sale_start');
        const sale_end = formData.get('sale_end');
        const weight = formData.get('weight');
        const length = formData.get('length');
        const width = formData.get('width');
        const height = formData.get('height');

        // JSON-stringified fields (must be parsed back)
        const category_ids_json = formData.get('category_ids_json');
        const brand_ids_json = formData.get('brand_ids_json');
        const location_ids_json = formData.get('location_ids_json');
        const attributes_json = formData.get('attributes_json');
        const variations_json = formData.get('variations_json');
        
        // Image files
        const imageFiles = formData.getAll('images[]'); 

        // Basic Validation
        if (!name) {
             return NextResponse.json(
                { error: 'Missing required product field: Name.' },
                { status: 400 }
            );
        }
        
        // Conditional validation for simple products
        if (productType === 'simple' && (!regular_price || !stock_quantity)) {
            return NextResponse.json(
                { error: 'For Simple products, Regular Price and Stock Quantity are required.' },
                { status: 400 }
            );
        }

        // --- 1.1 Process Complex Data Structures ---
        let categories = [];
        if (category_ids_json) {
            const ids = JSON.parse(category_ids_json);
            // WooCommerce expects category objects { id: X }
            categories = ids.map(id => ({ id: parseInt(id, 10) }));
        }

        let brands = [];
        if (brand_ids_json) {
            const ids = JSON.parse(brand_ids_json);
            // WooCommerce expects brand term IDs
            brands = ids.map(id => parseInt(id, 10));
        }

        let locations = [];
        if (location_ids_json) {
            const ids = JSON.parse(location_ids_json);
            // WooCommerce expects location term IDs
            locations = ids.map(id => parseInt(id, 10));
        }

        let attributes = [];
        if (attributes_json) {
            const rawAttributes = JSON.parse(attributes_json);
            // Transform attributes into WooCommerce format
            attributes = rawAttributes
                .filter(attr => attr.name.trim() !== '') // Ensure only named attributes are included
                .map(attr => ({
                    name: attr.name,
                    visible: true,
                    // CRITICAL: variation must be true for variable products
                    variation: productType === 'variable' ? true : false, 
                    // Options must be an array of strings
                    options: Array.isArray(attr.options) ? attr.options : String(attr.options).split(',').map(s => s.trim()).filter(s => s),
                }));
        }


        // --- 1.2 Helper functions to clean and convert values ---
        const cleanValue = (value) => {
            if (value === null || value === undefined || value === '') {
                return undefined;
            }
            return value;
        };
        
        const toNumber = (value) => {
            if (!value || value === '') return undefined;
            const num = parseFloat(value);
            return isNaN(num) ? undefined : num.toString();
        };

        // --- 1.3 Construct the Full Product Payload ---
        const productData = {
            name,
            type: productType,
            status: 'pending', 
            
            // Descriptions (only include if not empty)
            ...(cleanValue(short_description) && { short_description: cleanValue(short_description) }),
            ...(cleanValue(description) && { description: cleanValue(description) }),

            // Pricing & Inventory (ONLY included if product is simple)
            ...(cleanValue(sku) && { sku: cleanValue(sku) }),
            ...(productType === 'simple' && toNumber(regular_price) && { regular_price: toNumber(regular_price) }),
            ...(productType === 'simple' && toNumber(sale_price) && { sale_price: toNumber(sale_price) }),
            
            // Stock management is ONLY set for simple products
            ...(productType === 'simple' && stock_quantity && { stock_quantity: parseInt(stock_quantity, 10) }),
            ...(productType === 'simple' && { manage_stock: true }),
            
            // Shared Sale Dates (optional, only if not empty) - format as ISO 8601
            ...(cleanValue(sale_start) && { date_on_sale_from: cleanValue(sale_start) + 'T00:00:00' }),
            ...(cleanValue(sale_end) && { date_on_sale_to: cleanValue(sale_end) + 'T23:59:59' }),

            // Shipping (Weight and Dimensions - only include if not empty, must be strings)
            ...(toNumber(weight) && { weight: toNumber(weight) }),
            ...((toNumber(length) || toNumber(width) || toNumber(height)) && {
                dimensions: {
                    ...(toNumber(length) && { length: toNumber(length) }),
                    ...(toNumber(width) && { width: toNumber(width) }),
                    ...(toNumber(height) && { height: toNumber(height) }),
                }
            }),

            // Taxonomy & Attributes
            categories,
            attributes,

            // Don't include images in initial creation - add them via update
            // images: [], 
        };

        // --- 2. Process and Upload Images to WordPress Media Library ---
        if (imageFiles && imageFiles.length > 0) {
            try {
                // Function to upload a single image to WordPress Media Library
                const uploadSingleFile = async (file) => {
                    // WordPress REST API media endpoint
                    const wpMediaUrl = WC_API_URL.replace('/dokan/v1', '/wp/v2') + '/media';

                    // Create FormData for multipart upload (WordPress expects this format)
                    const mediaFormData = new FormData();
                    mediaFormData.append('file', file);
                    mediaFormData.append('title', file.name.split('.')[0]);
                    mediaFormData.append('caption', '');
                    mediaFormData.append('alt_text', file.name.split('.')[0]);

                    const uploadRes = await fetch(wpMediaUrl, {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                            // Don't set Content-Type - let fetch set it with boundary for multipart/form-data
                        },
                        body: mediaFormData,
                    });

                    if (!uploadRes.ok) {
                        const contentType = uploadRes.headers.get('content-type');
                        let errorMessage = 'Media upload failed.';
                        
                        try {
                            if (contentType && contentType.includes('application/json')) {
                                const errorJson = await uploadRes.json();
                                console.error('Media upload error:', errorJson);
                                errorMessage = errorJson.message || errorMessage;
                            } else {
                                const errorText = await uploadRes.text();
                                console.error('Media upload error (non-JSON):', errorText.substring(0, 500));
                                errorMessage = `Media upload failed with status ${uploadRes.status}`;
                            }
                        } catch (parseError) {
                            console.error('Error parsing upload response:', parseError);
                        }
                        
                        throw new Error(errorMessage);
                    }
                    
                    const uploadJson = await uploadRes.json();
                    console.log('Media upload response:', JSON.stringify(uploadJson));
                    
                    // Return image object in WooCommerce format
                    return { 
                        id: uploadJson.id,
                        src: uploadJson.source_url || uploadJson.guid?.rendered,
                        name: uploadJson.title?.rendered || file.name,
                        alt: uploadJson.alt_text || ''
                    };
                };

                // Wait for all uploads to complete successfully
                const uploadedImages = await Promise.all(
                    imageFiles.map(uploadSingleFile)
                );

                console.log('Uploaded images count:', uploadedImages.length);
                console.log('Uploaded images:', JSON.stringify(uploadedImages));

                // Set images: WooCommerce expects array of image objects with id and src
                if (uploadedImages.length > 0) {
                    productData.images = uploadedImages;
                    console.log('Product images set to productData');
                } else {
                    console.warn('No images were uploaded successfully');
                }
            } catch (uploadError) {
                console.error('Image upload failed:', uploadError);
                // Continue without images - log warning but don't fail the product creation
                console.warn('Product will be created without images due to upload failure');
                productData.images = [];
            }
        }

        // --- 3. Send Product Creation Request to Vendor API (Dokan/WC) with Retry ---
        console.log('Sending product data to WooCommerce:', JSON.stringify(productData, null, 2));
        
        let vendorRes;
        let vendorJson;
        let lastError;
        
        // Retry logic with exponential backoff
        const maxRetries = 3;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
                
                vendorRes = await fetch(`${WC_API_URL}/products`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: JSON.stringify(productData),
                    signal: controller.signal,
                });
                
                clearTimeout(timeoutId);
                
                const contentType = vendorRes.headers.get('content-type');
                
                if (contentType && contentType.includes('application/json')) {
                    vendorJson = await vendorRes.json();
                    
                    if (vendorRes.ok) {
                        break; // Success, exit retry loop
                    }
                    
                    // Don't retry on client errors (4xx) except 408, 429
                    if (vendorRes.status >= 400 && vendorRes.status < 500 && ![408, 429].includes(vendorRes.status)) {
                        console.error('Vendor API Client Error:', vendorJson);
                        return NextResponse.json(
                            {
                                error: vendorJson.message || 'Failed to create product on vendor side.',
                                details: vendorJson,
                                retryable: false
                            },
                            { status: vendorRes.status }
                        );
                    }
                } else {
                    const errorText = await vendorRes.text();
                    console.error('Vendor API returned non-JSON response:', errorText.substring(0, 500));
                    
                    // Don't retry on HTML responses (likely auth or config issues)
                    return NextResponse.json(
                        {
                            error: `Product creation failed. Server returned HTML instead of JSON. This usually indicates a configuration or authentication issue.`,
                            details: errorText.substring(0, 200),
                            retryable: false,
                            suggestion: 'Check your WooCommerce API URL and authentication settings.'
                        },
                        { status: vendorRes.status || 500 }
                    );
                }
                
                lastError = new Error(vendorJson?.message || `Request failed with status ${vendorRes.status}`);
                
            } catch (fetchError) {
                lastError = fetchError;
                console.error(`Attempt ${attempt + 1}/${maxRetries + 1} failed:`, fetchError.message);
                
                // Don't retry on abort (timeout)
                if (fetchError.name === 'AbortError') {
                    return NextResponse.json(
                        {
                            error: 'Request timeout. The WooCommerce server took too long to respond.',
                            retryable: true,
                            suggestion: 'Please try again. If the problem persists, contact support.'
                        },
                        { status: 504 }
                    );
                }
            }
            
            // Wait before retry (exponential backoff: 1s, 2s, 4s)
            if (attempt < maxRetries) {
                const delay = Math.pow(2, attempt) * 1000;
                console.log(`Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        // If we exhausted all retries
        if (!vendorRes || !vendorRes.ok) {
            console.error('All retry attempts failed:', lastError);
            return NextResponse.json(
                {
                    error: 'Failed to create product after multiple attempts.',
                    details: lastError?.message || 'Unknown error',
                    retryable: true,
                    suggestion: 'The WooCommerce server may be experiencing issues. Please try again later.'
                },
                { status: 503 }
            );
        }

        // --- 4. Create Variations for Variable Products ---
        if (productType === 'variable' && variations_json) {
            try {
                const variations = JSON.parse(variations_json);
                const wcV3Url = WC_API_URL.replace('/dokan/v1', '/wc/v3');
                
                console.log(`Creating ${variations.length} variations for product ${vendorJson.id}`);
                
                for (const variation of variations) {
                    const variationData = {
                        regular_price: variation.regular_price,
                        sale_price: variation.sale_price || undefined,
                        stock_quantity: variation.stock_quantity,
                        manage_stock: true,
                        sku: variation.sku || undefined,
                        attributes: variation.attributes.map(attr => ({
                            name: attr.name,
                            option: attr.option
                        }))
                    };
                    
                    const varRes = await fetch(`${wcV3Url}/products/${vendorJson.id}/variations`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${authToken}`,
                        },
                        body: JSON.stringify(variationData),
                    });
                    
                    if (!varRes.ok) {
                        const errorData = await varRes.json().catch(() => ({}));
                        console.error('Failed to create variation:', errorData);
                    }
                }
                
                console.log('Variations created successfully');
            } catch (variationError) {
                console.error('Error creating variations:', variationError);
            }
        }

        // --- 5. Update Product with Images and Custom Taxonomies ---
        try {
            const productId = vendorJson.id;
            
            // Update via WooCommerce v3 API to add images
            if (productData.images && productData.images.length > 0) {
                try {
                    console.log('Updating product with images via WooCommerce v3 API');
                    const wcV3Url = WC_API_URL.replace('/dokan/v1', '/wc/v3');
                    
                    const updateRes = await fetch(`${wcV3Url}/products/${productId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${authToken}`,
                        },
                        body: JSON.stringify({
                            images: productData.images
                        }),
                    });
                    
                    if (!updateRes.ok) {
                        const errorData = await updateRes.json().catch(() => ({}));
                        console.error('Failed to update product with images:', errorData);
                    } else {
                        const updateResult = await updateRes.json();
                        console.log('Product images updated successfully:', updateResult.images?.length || 0, 'images');
                    }
                } catch (imageUpdateError) {
                    console.error('Error updating product images:', imageUpdateError);
                }
            }
            
            // Update brands via WooCommerce v3 API
            if (brands && brands.length > 0) {
                try {
                    console.log('Updating product with brands via WooCommerce v3 API');
                    const wcV3Url = WC_API_URL.replace('/dokan/v1', '/wc/v3');
                    
                    const updateRes = await fetch(`${wcV3Url}/products/${productId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${authToken}`,
                        },
                        body: JSON.stringify({
                            brands: brands.map(id => ({ id }))
                        }),
                    });
                    
                    if (!updateRes.ok) {
                        const errorData = await updateRes.json().catch(() => ({}));
                        console.error('Failed to update brands:', errorData);
                    } else {
                        console.log('Brands updated successfully');
                    }
                } catch (updateError) {
                    console.error('Error updating brands:', updateError);
                }
            }
            
            // Update locations via WordPress REST API (custom taxonomy)
            if (locations && locations.length > 0) {
                try {
                    console.log('Updating product with locations via WordPress REST API');
                    const wpApiUrl = WC_API_URL.replace('/dokan/v1', '/wp/v2');
                    
                    const updateRes = await fetch(`${wpApiUrl}/product/${productId}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${authToken}`,
                        },
                        body: JSON.stringify({
                            product_location: locations
                        }),
                    });
                    
                    if (!updateRes.ok) {
                        const errorData = await updateRes.json().catch(() => ({}));
                        console.error('Failed to update locations:', errorData);
                    } else {
                        console.log('Locations updated successfully');
                    }
                } catch (updateError) {
                    console.error('Error updating locations:', updateError);
                }
            }
        } catch (postUpdateError) {
            console.error('Error in post-creation updates:', postUpdateError);
            // Don't fail the whole request - product was created successfully
        }

        // --- 6. Success Response ---
        let responseMessage = 'Product created successfully';
        const debugInfo = {};
        
        if (imageFiles && imageFiles.length > 0) {
            if (!productData.images || productData.images.length === 0) {
                responseMessage = 'Product created successfully, but images could not be uploaded. You can add images later by editing the product.';
            } else {
                debugInfo.imagesUploaded = productData.images.length;
                debugInfo.imageIds = productData.images.map(img => img.id);
            }
        }
            
        return NextResponse.json(
            {
                message: responseMessage,
                product: vendorJson,
                debug: debugInfo,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('=== PRODUCT CREATION ERROR ===');
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('==============================');
        
        return NextResponse.json(
            { 
                error: error.message || 'An internal server error occurred.',
                details: error.stack?.split('\n').slice(0, 3).join('\n')
            },
            { status: 500 }
        );
    }
}