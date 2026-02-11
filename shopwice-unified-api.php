<?php
/**
 * Plugin Name: Shopwice Unified Mobile & Vendor API
 * Description: High-performance unified REST API for Shopwice Mobile App (Customer) and Vendor PWA (WCFM).
 * Version: 1.8.0
 * Author: Shopwice
 */

if (!defined('ABSPATH')) exit;

/**
 * ---------------------------------------------------
 * AUTH HELPERS
 * ---------------------------------------------------
 */
function shopwice_require_auth() {
    return get_current_user_id() > 0;
}

function shopwice_require_vendor() {
    $user = wp_get_current_user();
    if (!$user || !$user->ID) return false;

    // Support for multiple vendor plugins (WCFM, Dokan, WC Vendors)
    $allowed = ['administrator', 'vendor', 'seller', 'wcfm_vendor'];
    return (bool) array_intersect($allowed, (array) $user->roles);
}

/**
 * ---------------------------------------------------
 * REST ROUTES
 * ---------------------------------------------------
 */
add_action('rest_api_init', function () {
    // FIX: Disable ONLY_FULL_GROUP_BY for this request to prevent WCFM/SQL Mode crashes
    global $wpdb;
    $wpdb->query("SET SESSION sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''))");

    $ns = 'shopwice/v1';

    /** --- AUTH --- **/
    register_rest_route($ns, '/auth/login', [
        'methods' => 'POST',
        'callback' => 'shopwice_enterprise_login',
        'permission_callback' => '__return_true',
    ]);
    register_rest_route($ns, '/auth/register', [
        'methods' => 'POST',
        'callback' => 'shopwice_auth_register',
        'permission_callback' => '__return_true',
    ]);
    register_rest_route($ns, '/auth/password-reset/request', ['methods' => 'POST', 'callback' => 'shopwice_auth_password_reset_stub', 'permission_callback' => '__return_true']);
    register_rest_route($ns, '/auth/password-reset/confirm', ['methods' => 'POST', 'callback' => 'shopwice_auth_password_reset_stub', 'permission_callback' => '__return_true']);


    /** --- PRODUCTS (Unified) --- **/
    register_rest_route($ns, '/products', [
        'methods' => 'GET',
        'callback' => 'shopwice_get_products_customer',
        'permission_callback' => '__return_true',
    ]);
    register_rest_route($ns, '/products/(?P<id>\d+)', [
        'methods' => 'GET',
        'callback' => 'shopwice_get_product_detail',
        'permission_callback' => '__return_true',
    ]);

    // PUBLIC TAXONOMIES & ATTRIBUTES (No Auth Required)
    register_rest_route($ns, '/products/categories', ['methods' => 'GET', 'callback' => 'shopwice_get_categories', 'permission_callback' => '__return_true']);
    register_rest_route($ns, '/categories',          ['methods' => 'GET', 'callback' => 'shopwice_get_categories', 'permission_callback' => '__return_true']); // Legacy alias
    register_rest_route($ns, '/tags',                ['methods' => 'GET', 'callback' => 'shopwice_get_tags',       'permission_callback' => '__return_true']);
    register_rest_route($ns, '/brands',              ['methods' => 'GET', 'callback' => 'shopwice_get_brands',     'permission_callback' => '__return_true']);
    register_rest_route($ns, '/locations',           ['methods' => 'GET', 'callback' => 'shopwice_get_locations',  'permission_callback' => '__return_true']);
    register_rest_route($ns, '/attributes',          ['methods' => 'GET', 'callback' => 'shopwice_vendor_get_attributes',      'permission_callback' => '__return_true']);
    register_rest_route($ns, '/attributes/(?P<id>\d+)/terms', ['methods' => 'GET', 'callback' => 'shopwice_vendor_get_attribute_terms', 'permission_callback' => '__return_true']);

    // Vendor specialized product view
    register_rest_route($ns, '/vendor/products', [
        'methods'             => 'GET',
        'callback'            => 'shopwice_vendor_get_products',
        'permission_callback' => 'shopwice_require_vendor',
    ]);

    register_rest_route($ns, '/vendor/products/(?P<id>\d+)', [
        'methods'             => 'GET',
        'callback'            => 'shopwice_vendor_get_product_detail',
        'permission_callback' => 'shopwice_require_vendor',
    ]);

    register_rest_route($ns, '/vendor/products', [
        'methods'             => 'POST',
        'callback'            => 'shopwice_vendor_create_product',
        'permission_callback' => 'shopwice_require_vendor',
    ]);

    register_rest_route($ns, '/media', [
        'methods'             => 'POST',
        'callback'            => 'shopwice_upload_media',
        'permission_callback' => 'shopwice_require_vendor',
    ]);

    register_rest_route($ns, '/vendor/media', [
        'methods'             => 'POST',
        'callback'            => 'shopwice_upload_media',
        'permission_callback' => 'shopwice_require_vendor',
    ]);

    register_rest_route($ns, '/orders', [
        'methods' => 'GET',
        'callback' => 'shopwice_get_orders_customer',
        'permission_callback' => 'shopwice_require_auth',
    ]);
    register_rest_route($ns, '/orders', [
        'methods' => 'POST',
        'callback' => 'shopwice_create_order_customer',
        'permission_callback' => 'shopwice_require_auth',
    ]);

    /** --- VENDOR SPECIALIZED (Bypasses SQL Bugs) --- **/
    register_rest_route($ns, '/vendor/stats', [
        'methods' => 'GET',
        'callback' => 'shopwice_vendor_get_stats',
        'permission_callback' => 'shopwice_require_vendor',
    ]);
    register_rest_route($ns, '/vendor/orders', [
        'methods' => 'GET',
        'callback' => 'shopwice_vendor_get_orders_optimized',
        'permission_callback' => 'shopwice_require_vendor',
    ]);
});

/**
 * ---------------------------------------------------
 * SHARED FORMATTER & HELPERS
 * ---------------------------------------------------
 */
function shopwice_format_product_basic(WC_Product $p) {
    return [
        'id'            => $p->get_id(),
        'name'          => $p->get_name(),
        'status'        => $p->get_status(),
        'price'         => $p->get_price(),
        'regular_price' => $p->get_regular_price(),
        'stock_status'  => $p->get_stock_status(),
        'stock_quantity'=> $p->get_stock_quantity(),
        'image'         => wp_get_attachment_image_url($p->get_image_id(), 'medium'),
        'images'        => array_map(fn($id) => ['src' => wp_get_attachment_image_url($id, 'medium')], $p->get_gallery_image_ids()),
        'categories'    => wp_get_post_terms($p->get_id(), 'product_cat', ['fields' => 'slugs']),
    ];
}

/**
 * ---------------------------------------------------
 * AUTH & LOGIN (Enterprise Bridge)
 * ---------------------------------------------------
 */
function shopwice_enterprise_login(WP_REST_Request $r) {
    $u = sanitize_user($r->get_param('username'));
    $p = (string)$r->get_param('password');

    $user = wp_authenticate($u, $p);
    if (is_wp_error($user)) return new WP_Error('auth_failed', 'Invalid credentials', ['status' => 401]);

    // Fetch Token from JWT Auth Plugin
    $jwt_res = wp_remote_post(home_url('/wp-json/jwt-auth/v1/token'), [
        'headers' => ['Content-Type' => 'application/json'],
        'body' => wp_json_encode(['username' => $u, 'password' => $p]),
        'timeout' => 15
    ]);

    if (is_wp_error($jwt_res)) return new WP_Error('jwt_error', 'JWT Server unreachable', ['status' => 500]);
    
    $body = json_decode(wp_remote_retrieve_body($jwt_res), true);
    if (empty($body['token'])) return new WP_Error('jwt_error', 'Token generation failed', ['status' => 500]);

    // Additive Data for PWA
    $body['user'] = [
        'id'           => $user->ID,
        'display_name' => $user->display_name,
        'email'        => $user->user_email,
        'role'         => $user->roles[0]
    ];

    return rest_ensure_response($body);
}

function shopwice_auth_register(WP_REST_Request $r) {
    $data = $r->get_json_params();
    $email = sanitize_email($data['email'] ?? '');
    $pass = $data['password'] ?? '';

    if (!is_email($email) || empty($pass)) return new WP_Error('bad_data', 'Valid email/password required', ['status' => 400]);
    if (email_exists($email)) return new WP_Error('email_exists', 'Email already registered', ['status' => 400]);

    $username = sanitize_user(current(explode('@', $email)));
    if (username_exists($username)) $username .= '_' . wp_generate_password(4, false);

    $uid = wp_create_user($username, $pass, $email);
    if (is_wp_error($uid)) return $uid;

    // Log them in immediately to get token
    return shopwice_enterprise_login($r);
}

function shopwice_auth_password_reset_stub() { return ['success' => true, 'message' => 'Stubbed: Requires email server config']; }

/**
 * ---------------------------------------------------
 * PRODUCTS (Customer View)
 * ---------------------------------------------------
 */
function shopwice_get_products_customer(WP_REST_Request $r) {
    $args = [
        'status' => 'publish',
        'limit'  => min(50, (int)$r->get_param('per_page') ?: 20),
        'page'   => max(1, (int)$r->get_param('page') ?: 1),
    ];
    if ($r['category']) $args['category'] = [$r['category']];
    if ($r['search']) $args['search'] = $r['search'];

    $products = wc_get_products($args);
    return rest_ensure_response(array_map('shopwice_format_product_basic', $products));
}

function shopwice_get_product_detail(WP_REST_Request $r) {
    $p = wc_get_product((int)$r['id']);
    return $p ? rest_ensure_response(shopwice_format_product_basic($p)) : new WP_Error('404');
}

/**
 * ---------------------------------------------------
 * VENDOR SPECIALIZED (Optimized for WCFM)
 * ---------------------------------------------------
 */
function shopwice_vendor_get_products(WP_REST_Request $r) {
    $args = [
        'post_type'   => 'product',
        'author'      => get_current_user_id(),
        'post_status' => 'any',
        'posts_per_page' => (int)$r->get_param('per_page') ?: 20,
        'paged'       => (int)$r->get_param('page') ?: 1
    ];
    $query = new WP_Query($args);
    $products = [];
    foreach ($query->posts as $post) {
        $products[] = shopwice_format_product_basic(wc_get_product($post->ID));
    }
    $res = rest_ensure_response($products);
    $res->header('X-WP-Total', $query->found_posts);
    $res->header('X-WP-TotalPages', $query->max_num_pages);
    return $res;
}

function shopwice_vendor_get_orders_optimized(WP_REST_Request $r) {
    global $wpdb;
    // Layer 1: Force SQL mode fix for this specific connection
    $wpdb->query("SET SESSION sql_mode=(SELECT REPLACE(@@sql_mode,'ONLY_FULL_GROUP_BY',''))");

    $vid = get_current_user_id();
    $page = (int)$r->get_param('page') ?: 1;
    $per_page = (int)$r->get_param('per_page') ?: 20;
    $status = $r->get_param('status');

    // Layer 2: Fetch specific Order IDs belonging to this vendor first.
    // We query postmeta directly to bypass WCFM's buggy JOIN/GROUP BY logic.
    $order_ids = $wpdb->get_col($wpdb->prepare(
        "SELECT DISTINCT post_id FROM {$wpdb->postmeta} 
         WHERE meta_key IN ('_wcfm_vendor', '_vendor_id') 
         AND meta_value = %d",
        $vid
    ));

    if (empty($order_ids)) {
        $response = rest_ensure_response([]);
        $response->header('X-WP-Total', 0);
        $response->header('X-WP-TotalPages', 0);
        return $response;
    }

    // Layer 3: Use standard WooCommerce fetching for ONLY these pre-filtered IDs
    $args = [
        'post__in' => $order_ids,
        'limit'    => $per_page,
        'offset'   => ($page - 1) * $per_page,
        'paginate' => true,
        'orderby'  => 'date',
        'order'    => 'DESC',
    ];

    if ($status && $status !== 'all') {
        $args['status'] = $status;
    }

    try {
        $orders_data = wc_get_orders($args);
    } catch (Exception $e) {
        $orders_data = (object)['orders' => [], 'total' => 0, 'max_num_pages' => 0];
    }

    $out = [];
    foreach ($orders_data->orders as $o) {
        $out[] = [
            'id'            => $o->get_id(),
            'status'        => $o->get_status(),
            'total'         => $o->get_total(),
            'date_created'  => $o->get_date_created() ? $o->get_date_created()->date('Y-m-d H:i:s') : '',
            'customer_name' => $o->get_billing_first_name() . ' ' . $o->get_billing_last_name()
        ];
    }

    $res = rest_ensure_response($out);
    $res->header('X-WP-Total', $orders_data->total);
    $res->header('X-WP-TotalPages', $orders_data->max_num_pages);
    return $res;
}

function shopwice_vendor_get_stats() {
    $vid = get_current_user_id();
    $total_products = (int)count_user_posts($vid, 'product');
    
    // Revenue Calculation (WCFM Compatible)
    $revenue = 0;
    if (function_exists('wcfm_get_vendor_sales_stats')) {
        $stats = wcfm_get_vendor_sales_stats($vid);
        $revenue = $stats['total_sales'] ?? 0;
    }

    return rest_ensure_response([
        'totalRevenue'  => round((float)$revenue, 2),
        'totalProducts' => $total_products,
        'totalOrders'   => 0 // PWA will aggregate from orders endpoint
    ]);
}

/**
 * VENDOR: Detailed product view (Pruned for PWA)
 */
function shopwice_vendor_get_product_detail(WP_REST_Request $r) {
    $p = wc_get_product((int)$r['id']);
    if (!$p) return new WP_Error('404', 'Product not found', ['status' => 404]);
    
    // Prune the massive WC object to only what the PWA edit screen needs
    return rest_ensure_response([
        'id'                => $p->get_id(),
        'name'              => $p->get_name(),
        'slug'              => $p->get_slug(),
        'status'            => $p->get_status(),
        'type'              => $p->get_type(),
        'description'       => $p->get_description(),
        'short_description' => $p->get_short_description(),
        'sku'               => $p->get_sku(),
        'price'             => $p->get_price(),
        'regular_price'     => $p->get_regular_price(),
        'manage_stock'      => $p->get_manage_stock(),
        'stock_quantity'    => $p->get_stock_quantity(),
        'stock_status'      => $p->get_stock_status(),
        'weight'            => $p->get_weight(),
        'dimensions'        => $p->get_dimensions(false),
        'categories'        => wp_get_post_terms($p->get_id(), 'product_cat', ['fields' => 'ids']),
        'brands'            => taxonomy_exists('product_brand') ? wp_get_post_terms($p->get_id(), 'product_brand', ['fields' => 'ids']) : [],
        'locations'         => taxonomy_exists('product_location') ? wp_get_post_terms($p->get_id(), 'product_location', ['fields' => 'ids']) : [],
        'tags'              => wp_get_post_terms($p->get_id(), 'product_tag', ['fields' => 'ids']),
        'images'            => array_map(fn($id) => ['id' => $id, 'src' => wp_get_attachment_image_url($id, 'full')], array_merge([$p->get_image_id()], $p->get_gallery_image_ids())),
        'attributes'        => array_values(array_map(function($attr) {
                                    return [
                                        'id'      => $attr->get_id(),
                                        'name'    => wc_attribute_label($attr->get_name()),
                                        'options' => $attr->get_options(),
                                        'visible' => $attr->get_visible(),
                                        'variation' => $attr->get_variation()
                                    ];
                               }, $p->get_attributes()))
    ]);
}

/**
 * ATTRIBUTES & TERMS
 */
function shopwice_vendor_get_attributes() {
    $attrs = wc_get_attribute_taxonomies();
    return array_map(fn($a) => ['id' => (int)$a->attribute_id, 'name' => $a->attribute_label, 'slug' => 'pa_'.$a->attribute_name], $attrs);
}

function shopwice_vendor_get_attribute_terms(WP_REST_Request $r) {
    $id = (int)$r['id'];
    $taxonomy = wc_attribute_taxonomy_name_by_id($id);
    if (!$taxonomy) return [];
    $terms = get_terms(['taxonomy' => $taxonomy, 'hide_empty' => false]);
    return array_map(fn($t) => ['id' => $t->term_id, 'name' => $t->name, 'slug' => $t->slug], $terms);
}

/**
 * ---------------------------------------------------
 * TAXONOMIES (Shared Logic)
 * ---------------------------------------------------
 */
function shopwice_get_categories() {
    $terms = get_terms(['taxonomy'=>'product_cat', 'hide_empty'=>false]);
    return array_map(fn($t) => ['id'=>$t->term_id, 'name'=>$t->name, 'slug'=>$t->slug, 'parent'=>$t->parent, 'count'=>$t->count], $terms);
}
function shopwice_get_tags()      { $terms = get_terms(['taxonomy'=>'product_tag', 'hide_empty'=>true]); return array_map(fn($t) => ['id'=>$t->term_id, 'name'=>$t->name, 'slug'=>$t->slug], $terms); }
function shopwice_get_brands()    { if(!taxonomy_exists('product_brand')) return []; $terms = get_terms(['taxonomy'=>'product_brand', 'hide_empty'=>false]); return array_map(fn($t) => ['id'=>$t->term_id, 'name'=>$t->name, 'slug'=>$t->slug, 'parent'=>$t->parent], $terms); }
function shopwice_get_locations() { if(!taxonomy_exists('product_location')) return []; $terms = get_terms(['taxonomy'=>'product_location', 'hide_empty'=>false]); return array_map(fn($t) => ['id'=>$t->term_id, 'name'=>$t->name, 'slug'=>$t->slug, 'parent'=>$t->parent], $terms); }

/**
 * ---------------------------------------------------
 * CUSTOMER ORDERS
 * ---------------------------------------------------
 */
function shopwice_get_orders_customer() {
    $orders = wc_get_orders(['customer_id' => get_current_user_id(), 'limit' => 20]);
    return array_map(fn($o) => ['id'=>$o->get_id(), 'status'=>$o->get_status(), 'total'=>$o->get_total(), 'date'=>$o->get_date_created()?->date('c')], $orders);
}
function shopwice_create_order_customer(WP_REST_Request $r) {
    $d = $r->get_json_params();
    if(empty($d['items'])) return new WP_Error('400', 'No items');
    $order = wc_create_order(['customer_id' => get_current_user_id()]);
    foreach($d['items'] as $i) { $order->add_product(wc_get_product($i['product_id']), $i['quantity'] ?: 1); }
    $order->calculate_totals();
    return ['id' => $order->get_id(), 'success' => true];
}

/**
 * VENDOR: Create Product
 */
function shopwice_vendor_create_product(WP_REST_Request $r) {
    try {
        $params = $r->get_json_params();
        $name = sanitize_text_field($params['name'] ?? '');
        if (!$name) return new WP_Error('missing_name', 'Product name is required', ['status' => 400]);

        $type = sanitize_text_field($params['type'] ?? 'simple');
        $product = ($type === 'variable') ? new WC_Product_Variable() : new WC_Product_Simple();

        $product->set_name($name);
        $product->set_status('pending'); // Vendors always start pending
        $product->set_description(wp_kses_post($params['description'] ?? ''));
        $product->set_short_description(wp_kses_post($params['short_description'] ?? ''));
        $product->set_sku(sanitize_text_field($params['sku'] ?? ''));
        $product->set_regular_price(sanitize_text_field($params['regular_price'] ?? '0'));
        $product->set_sale_price(sanitize_text_field($params['sale_price'] ?? ''));
        $product->set_manage_stock(true);
        $product->set_stock_quantity((int)($params['stock_quantity'] ?? 0));
        
        // Author
        $product->set_reviews_allowed(true);

        // Taxonomies
        if (!empty($params['categories'])) {
            $cat_ids = array_map(fn($c) => (int)$c['id'], $params['categories']);
            $product->set_category_ids($cat_ids);
        }

        // Images
        if (!empty($params['images'])) {
            $img_ids = array_map(fn($img) => (int)$img['id'], $params['images']);
            $product->set_image_id($img_ids[0]);
            if (count($img_ids) > 1) {
                $product->set_gallery_image_ids(array_slice($img_ids, 1));
            }
        }

        // Weight & Dimensions
        $product->set_weight(sanitize_text_field($params['weight'] ?? ''));
        if (!empty($params['dimensions'])) {
            $product->set_length(sanitize_text_field($params['dimensions']['length'] ?? ''));
            $product->set_width(sanitize_text_field($params['dimensions']['width'] ?? ''));
            $product->set_height(sanitize_text_field($params['dimensions']['height'] ?? ''));
        }

        $pid = $product->save();
        
        // Custom Taxonomies (Brands, Locations)
        if (!empty($params['brands'])) {
            $brand_ids = array_map(fn($b) => (int)$b['id'], $params['brands']);
            wp_set_object_terms($pid, $brand_ids, 'product_brand');
        }
        if (!empty($params['locations'])) {
            $loc_ids = array_map(fn($l) => (int)$l['id'], $params['locations']);
            wp_set_object_terms($pid, $loc_ids, 'product_location');
        }

        // WCFM Attribution
        update_post_meta($pid, '_wcfm_vendor', get_current_user_id());
        wp_update_post(['ID' => $pid, 'post_author' => get_current_user_id()]);

        return rest_ensure_response(shopwice_format_product_basic($product));
    } catch (Exception $e) {
        return new WP_Error('create_failed', $e->getMessage(), ['status' => 500]);
    }
}

/**
 * MEDIA: Handle Multipart Upload
 */
function shopwice_upload_media(WP_REST_Request $r) {
    if (!function_exists('wp_handle_upload')) {
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        require_once(ABSPATH . 'wp-admin/includes/media.php');
    }

    $files = $r->get_file_params();
    if (empty($files['file'])) return new WP_Error('no_file', 'No file uploaded', ['status' => 400]);

    $upload = wp_handle_upload($files['file'], ['test_form' => false]);
    if (isset($upload['error'])) return new WP_Error('upload_error', $upload['error'], ['status' => 500]);

    $attachment = [
        'guid'           => $upload['url'],
        'post_mime_type' => $upload['type'],
        'post_title'     => basename($upload['file']),
        'post_content'   => '',
        'post_status'    => 'inherit'
    ];

    $attachment_id = wp_insert_attachment($attachment, $upload['file']);
    $attachment_data = wp_generate_attachment_metadata($attachment_id, $upload['file']);
    wp_update_attachment_metadata($attachment_id, $attachment_data);

    return rest_ensure_response([
        'id'         => $attachment_id,
        'source_url' => $upload['url']
    ]);
}
