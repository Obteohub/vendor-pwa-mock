<?php
/**
 * Generate Static JSON Files for Vendor Dashboard
 * 
 * This script generates static JSON files containing:
 * - Categories (with hierarchy)
 * - Brands (with hierarchy)
 * - Attributes (with terms)
 * - Locations
 * 
 * Run this script:
 * 1. Manually via browser: yoursite.com/generate-static-data.php
 * 2. Via WP-CRON: Schedule to run weekly
 * 3. Via command line: php generate-static-data.php
 */

// Load WordPress
require_once(__DIR__ . '/wp-load.php');

// Check if user is admin (if running via browser)
if (!is_admin() && !defined('DOING_CRON') && php_sapi_name() !== 'cli') {
    wp_die('Unauthorized access');
}

// Output directory
$upload_dir = wp_upload_dir();
$json_dir = $upload_dir['basedir'] . '/shopwice-json';

// Create directory if it doesn't exist
if (!file_exists($json_dir)) {
    mkdir($json_dir, 0755, true);
}

echo "🔄 Generating static JSON files...\n\n";

// ============================================
// 1. GENERATE CATEGORIES
// ============================================
echo "📁 Generating categories.json...\n";

$categories_args = array(
    'taxonomy'   => 'product_cat',
    'hide_empty' => false,
    'number'     => 0, // Get all
);

$categories = get_terms($categories_args);
$categories_data = array();

foreach ($categories as $category) {
    $categories_data[] = array(
        'id'     => $category->term_id,
        'name'   => $category->name,
        'slug'   => $category->slug,
        'parent' => $category->parent,
        'count'  => $category->count,
    );
}

// Build tree structure
function build_tree($items, $parent_id = 0) {
    $tree = array();
    foreach ($items as $item) {
        if ($item['parent'] == $parent_id) {
            $children = build_tree($items, $item['id']);
            if ($children) {
                $item['children'] = $children;
            } else {
                $item['children'] = array();
            }
            $tree[] = $item;
        }
    }
    return $tree;
}

$categories_tree = build_tree($categories_data);

$categories_output = array(
    'categories' => $categories_data,
    'categoryTree' => $categories_tree,
    'total' => count($categories_data),
    'generated' => current_time('mysql'),
    'timestamp' => time(),
);

file_put_contents($json_dir . '/categories.json', json_encode($categories_output, JSON_PRETTY_PRINT));
echo "✓ Categories: " . count($categories_data) . " items\n\n";

// ============================================
// 2. GENERATE BRANDS
// ============================================
echo "🏷️  Generating brands.json...\n";

$brands_args = array(
    'taxonomy'   => 'product_brand',
    'hide_empty' => false,
    'number'     => 0,
);

$brands = get_terms($brands_args);
$brands_data = array();

foreach ($brands as $brand) {
    $brands_data[] = array(
        'id'     => $brand->term_id,
        'name'   => $brand->name,
        'slug'   => $brand->slug,
        'parent' => $brand->parent,
        'count'  => $brand->count,
    );
}

$brands_tree = build_tree($brands_data);

$brands_output = array(
    'brands' => $brands_data,
    'brandTree' => $brands_tree,
    'total' => count($brands_data),
    'generated' => current_time('mysql'),
    'timestamp' => time(),
);

file_put_contents($json_dir . '/brands.json', json_encode($brands_output, JSON_PRETTY_PRINT));
echo "✓ Brands: " . count($brands_data) . " items\n\n";

// ============================================
// 3. GENERATE ATTRIBUTES
// ============================================
echo "🔧 Generating attributes.json...\n";

$attributes = wc_get_attribute_taxonomies();
$attributes_data = array();

foreach ($attributes as $attribute) {
    $taxonomy = wc_attribute_taxonomy_name($attribute->attribute_name);
    
    // Get terms for this attribute
    $terms = get_terms(array(
        'taxonomy'   => $taxonomy,
        'hide_empty' => false,
    ));
    
    $terms_data = array();
    if (!is_wp_error($terms)) {
        foreach ($terms as $term) {
            $terms_data[] = array(
                'id'   => $term->term_id,
                'name' => $term->name,
                'slug' => $term->slug,
            );
        }
    }
    
    $attributes_data[] = array(
        'id'    => $attribute->attribute_id,
        'name'  => $attribute->attribute_label,
        'slug'  => $attribute->attribute_name,
        'type'  => $attribute->attribute_type,
        'terms' => $terms_data,
    );
}

$attributes_output = array(
    'attributes' => $attributes_data,
    'total' => count($attributes_data),
    'generated' => current_time('mysql'),
    'timestamp' => time(),
);

file_put_contents($json_dir . '/attributes.json', json_encode($attributes_output, JSON_PRETTY_PRINT));
echo "✓ Attributes: " . count($attributes_data) . " items\n\n";

// ============================================
// 4. GENERATE LOCATIONS
// ============================================
echo "📍 Generating locations.json...\n";

$locations_args = array(
    'taxonomy'   => 'product_location',
    'hide_empty' => false,
    'number'     => 0,
);

$locations = get_terms($locations_args);
$locations_data = array();

if (!is_wp_error($locations)) {
    foreach ($locations as $location) {
        $locations_data[] = array(
            'id'     => $location->term_id,
            'name'   => $location->name,
            'slug'   => $location->slug,
            'parent' => $location->parent,
            'count'  => $location->count,
        );
    }
}

$locations_output = array(
    'locations' => $locations_data,
    'total' => count($locations_data),
    'generated' => current_time('mysql'),
    'timestamp' => time(),
);

file_put_contents($json_dir . '/locations.json', json_encode($locations_output, JSON_PRETTY_PRINT));
echo "✓ Locations: " . count($locations_data) . " items\n\n";

// ============================================
// 5. GENERATE MANIFEST
// ============================================
$manifest = array(
    'version' => '1.0',
    'generated' => current_time('mysql'),
    'timestamp' => time(),
    'files' => array(
        'categories' => array(
            'url' => $upload_dir['baseurl'] . '/shopwice-json/categories.json',
            'count' => count($categories_data),
        ),
        'brands' => array(
            'url' => $upload_dir['baseurl'] . '/shopwice-json/brands.json',
            'count' => count($brands_data),
        ),
        'attributes' => array(
            'url' => $upload_dir['baseurl'] . '/shopwice-json/attributes.json',
            'count' => count($attributes_data),
        ),
        'locations' => array(
            'url' => $upload_dir['baseurl'] . '/shopwice-json/locations.json',
            'count' => count($locations_data),
        ),
    ),
);

file_put_contents($json_dir . '/manifest.json', json_encode($manifest, JSON_PRETTY_PRINT));

echo "✅ All files generated successfully!\n\n";
echo "📂 Files location: " . $json_dir . "\n";
echo "🌐 Public URL: " . $upload_dir['baseurl'] . "/shopwice-json/\n\n";
echo "Files generated:\n";
echo "  - categories.json (" . count($categories_data) . " items)\n";
echo "  - brands.json (" . count($brands_data) . " items)\n";
echo "  - attributes.json (" . count($attributes_data) . " items)\n";
echo "  - locations.json (" . count($locations_data) . " items)\n";
echo "  - manifest.json\n\n";
echo "🔗 Access via:\n";
echo "  " . $upload_dir['baseurl'] . "/shopwice-json/categories.json\n";
echo "  " . $upload_dir['baseurl'] . "/shopwice-json/brands.json\n";
echo "  " . $upload_dir['baseurl'] . "/shopwice-json/attributes.json\n";
echo "  " . $upload_dir['baseurl'] . "/shopwice-json/locations.json\n";
?>
