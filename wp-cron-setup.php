<?php
/**
 * WP-CRON Setup for Auto-Generating Static JSON Files
 * 
 * Add this code to your theme's functions.php or create a custom plugin
 */

// Schedule the event on plugin/theme activation
function schedule_vendor_data_generation() {
    if (!wp_next_scheduled('generate_vendor_static_data')) {
        // Schedule to run weekly
        wp_schedule_event(time(), 'weekly', 'generate_vendor_static_data');
    }
}
add_action('wp', 'schedule_vendor_data_generation');

// Hook the generation function
add_action('generate_vendor_static_data', 'generate_vendor_static_data_files');

function generate_vendor_static_data_files() {
    // Get upload directory
    $upload_dir = wp_upload_dir();
    $json_dir = $upload_dir['basedir'] . '/shopwice-json';

    // Create directory if it doesn't exist
    if (!file_exists($json_dir)) {
        mkdir($json_dir, 0755, true);
    }

    // Log start
    error_log('[Vendor Data] Starting static file generation...');

    // ============================================
    // 1. GENERATE CATEGORIES
    // ============================================
    $categories_args = array(
        'taxonomy'   => 'product_cat',
        'hide_empty' => false,
        'number'     => 0,
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

    // Build tree
    $categories_tree = build_vendor_data_tree($categories_data);

    $categories_output = array(
        'categories' => $categories_data,
        'categoryTree' => $categories_tree,
        'total' => count($categories_data),
        'generated' => current_time('mysql'),
        'timestamp' => time(),
    );

    file_put_contents($json_dir . '/categories.json', json_encode($categories_output));
    error_log('[Vendor Data] Categories: ' . count($categories_data) . ' items');

    // ============================================
    // 2. GENERATE BRANDS
    // ============================================
    $brands_args = array(
        'taxonomy'   => 'product_brand',
        'hide_empty' => false,
        'number'     => 0,
    );

    $brands = get_terms($brands_args);
    $brands_data = array();

    if (!is_wp_error($brands)) {
        foreach ($brands as $brand) {
            $brands_data[] = array(
                'id'     => $brand->term_id,
                'name'   => $brand->name,
                'slug'   => $brand->slug,
                'parent' => $brand->parent,
                'count'  => $brand->count,
            );
        }
    }

    $brands_tree = build_vendor_data_tree($brands_data);

    $brands_output = array(
        'brands' => $brands_data,
        'brandTree' => $brands_tree,
        'total' => count($brands_data),
        'generated' => current_time('mysql'),
        'timestamp' => time(),
    );

    file_put_contents($json_dir . '/brands.json', json_encode($brands_output));
    error_log('[Vendor Data] Brands: ' . count($brands_data) . ' items');

    // ============================================
    // 3. GENERATE ATTRIBUTES
    // ============================================
    $attributes = wc_get_attribute_taxonomies();
    $attributes_data = array();

    foreach ($attributes as $attribute) {
        $taxonomy = wc_attribute_taxonomy_name($attribute->attribute_name);
        
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

    file_put_contents($json_dir . '/attributes.json', json_encode($attributes_output));
    error_log('[Vendor Data] Attributes: ' . count($attributes_data) . ' items');

    // ============================================
    // 4. GENERATE LOCATIONS
    // ============================================
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

    file_put_contents($json_dir . '/locations.json', json_encode($locations_output));
    error_log('[Vendor Data] Locations: ' . count($locations_data) . ' items');

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

    error_log('[Vendor Data] ✅ All files generated successfully!');
    
    echo "✅ All files generated successfully!\n";
    echo "📂 Location: " . $json_dir . "\n";
    echo "🌐 Public URL: " . $upload_dir['baseurl'] . "/shopwice-json/\n";
}

// Helper function to build tree
function build_vendor_data_tree($items, $parent_id = 0) {
    $tree = array();
    foreach ($items as $item) {
        if ($item['parent'] == $parent_id) {
            $children = build_vendor_data_tree($items, $item['id']);
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

// Add admin menu item to manually trigger generation
add_action('admin_menu', 'vendor_data_generator_menu');

function vendor_data_generator_menu() {
    add_management_page(
        'Generate Vendor Data',
        'Generate Vendor Data',
        'manage_options',
        'generate-vendor-data',
        'vendor_data_generator_page'
    );
}

function vendor_data_generator_page() {
    if (isset($_POST['generate'])) {
        generate_vendor_static_data_files();
        echo '<div class="notice notice-success"><p>✅ Static files generated successfully!</p></div>';
    }
    
    ?>
    <div class="wrap">
        <h1>Generate Vendor Data Files</h1>
        <p>Generate static JSON files for the vendor dashboard.</p>
        <form method="post">
            <input type="hidden" name="generate" value="1">
            <?php submit_button('Generate Now'); ?>
        </form>
        <p><strong>Files will be saved to:</strong> wp-content/uploads/shopwice-json/</p>
        <p><strong>Scheduled:</strong> Runs automatically every week via WP-CRON</p>
    </div>
    <?php
}
?>
