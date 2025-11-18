/**
 * Category-Attribute Mapping Configuration
 * 
 * Add your category-attribute mappings below.
 * Format: 'category-slug': ['attribute-slug-1', 'attribute-slug-2']
 */

/**
 * Combined category-attribute map
 * Add your mappings here
 */
export const categoryAttributeMap = {
  // ==========================================
  // FASHION & CLOTHING
  // ==========================================
  
  // Main Fashion Category
  'fashion': ['size', 'color', 'material', 'brand', 'gender', 'style'],
  'clothing': ['size', 'color', 'material', 'brand', 'gender', 'style', 'fit'],
  
  // Men's Fashion
  'mens-fashion': ['size', 'color', 'material', 'brand', 'fit', 'style'],
  'mens-clothing': ['size', 'color', 'material', 'brand', 'fit', 'style'],
  'mens-shirts': ['size', 'color', 'material', 'brand', 'collar-type', 'sleeve-length', 'fit', 'pattern'],
  'mens-t-shirts': ['size', 'color', 'material', 'brand', 'neck-type', 'sleeve-length', 'fit'],
  'mens-polo-shirts': ['size', 'color', 'material', 'brand', 'fit', 'collar-type'],
  'mens-pants': ['size', 'color', 'material', 'brand', 'fit', 'length', 'waist-size', 'style'],
  'mens-jeans': ['size', 'color', 'brand', 'fit', 'length', 'waist-size', 'wash', 'distressed'],
  'mens-shorts': ['size', 'color', 'material', 'brand', 'fit', 'length', 'style'],
  'mens-suits': ['size', 'color', 'material', 'brand', 'fit', 'pieces', 'style'],
  'mens-jackets': ['size', 'color', 'material', 'brand', 'style', 'season', 'waterproof'],
  'mens-coats': ['size', 'color', 'material', 'brand', 'length', 'season', 'insulation'],
  'mens-sweaters': ['size', 'color', 'material', 'brand', 'neck-type', 'sleeve-length', 'pattern'],
  'mens-hoodies': ['size', 'color', 'material', 'brand', 'style', 'fit', 'zipper'],
  'mens-activewear': ['size', 'color', 'material', 'brand', 'sport-type', 'fit'],
  'mens-underwear': ['size', 'color', 'material', 'brand', 'style', 'pack-size'],
  'mens-socks': ['size', 'color', 'material', 'brand', 'length', 'pack-size'],
  'mens-sleepwear': ['size', 'color', 'material', 'brand', 'style', 'season'],
  
  // Women's Fashion
  'womens-fashion': ['size', 'color', 'material', 'brand', 'fit', 'style'],
  'womens-clothing': ['size', 'color', 'material', 'brand', 'fit', 'style'],
  'womens-dresses': ['size', 'color', 'material', 'brand', 'length', 'style', 'occasion', 'neckline'],
  'womens-tops': ['size', 'color', 'material', 'brand', 'sleeve-length', 'neck-type', 'fit', 'style'],
  'womens-blouses': ['size', 'color', 'material', 'brand', 'sleeve-length', 'neck-type', 'fit'],
  'womens-t-shirts': ['size', 'color', 'material', 'brand', 'neck-type', 'sleeve-length', 'fit'],
  'womens-pants': ['size', 'color', 'material', 'brand', 'fit', 'length', 'style'],
  'womens-jeans': ['size', 'color', 'brand', 'fit', 'length', 'wash', 'rise', 'distressed'],
  'womens-skirts': ['size', 'color', 'material', 'brand', 'length', 'style', 'pattern'],
  'womens-shorts': ['size', 'color', 'material', 'brand', 'fit', 'length', 'style'],
  'womens-jackets': ['size', 'color', 'material', 'brand', 'style', 'season', 'length'],
  'womens-coats': ['size', 'color', 'material', 'brand', 'length', 'season', 'style'],
  'womens-sweaters': ['size', 'color', 'material', 'brand', 'neck-type', 'sleeve-length', 'style'],
  'womens-cardigans': ['size', 'color', 'material', 'brand', 'length', 'closure-type'],
  'womens-hoodies': ['size', 'color', 'material', 'brand', 'style', 'fit', 'zipper'],
  'womens-activewear': ['size', 'color', 'material', 'brand', 'sport-type', 'fit', 'support-level'],
  'womens-lingerie': ['size', 'color', 'material', 'brand', 'style', 'support-level'],
  'womens-underwear': ['size', 'color', 'material', 'brand', 'style', 'pack-size'],
  'womens-sleepwear': ['size', 'color', 'material', 'brand', 'style', 'season', 'pieces'],
  'womens-swimwear': ['size', 'color', 'material', 'brand', 'style', 'coverage', 'support-level'],
  
  // Kids & Baby Fashion
  'kids-fashion': ['size', 'color', 'material', 'brand', 'age-group', 'gender'],
  'kids-clothing': ['size', 'color', 'material', 'brand', 'age-group', 'gender', 'style'],
  'boys-clothing': ['size', 'color', 'material', 'brand', 'age-group', 'style'],
  'boys-shirts': ['size', 'color', 'material', 'brand', 'age-group', 'sleeve-length'],
  'boys-pants': ['size', 'color', 'material', 'brand', 'age-group', 'fit', 'style'],
  'boys-shorts': ['size', 'color', 'material', 'brand', 'age-group', 'length'],
  'boys-outerwear': ['size', 'color', 'material', 'brand', 'age-group', 'season'],
  'girls-clothing': ['size', 'color', 'material', 'brand', 'age-group', 'style'],
  'girls-dresses': ['size', 'color', 'material', 'brand', 'age-group', 'length', 'occasion'],
  'girls-tops': ['size', 'color', 'material', 'brand', 'age-group', 'sleeve-length'],
  'girls-pants': ['size', 'color', 'material', 'brand', 'age-group', 'fit'],
  'girls-skirts': ['size', 'color', 'material', 'brand', 'age-group', 'length'],
  'girls-outerwear': ['size', 'color', 'material', 'brand', 'age-group', 'season'],
  'baby-clothing': ['size', 'color', 'material', 'brand', 'age-group', 'gender', 'closure-type'],
  'baby-bodysuits': ['size', 'color', 'material', 'brand', 'age-group', 'sleeve-length', 'pack-size'],
  'baby-sleepwear': ['size', 'color', 'material', 'brand', 'age-group', 'season', 'safety-certified'],
  
  // Footwear
  'footwear': ['size', 'color', 'material', 'brand', 'gender', 'style'],
  'shoes': ['size', 'color', 'material', 'brand', 'gender', 'style', 'closure-type'],
  'mens-shoes': ['size', 'color', 'material', 'brand', 'style', 'width', 'closure-type'],
  'mens-sneakers': ['size', 'color', 'material', 'brand', 'style', 'sport-type'],
  'mens-formal-shoes': ['size', 'color', 'material', 'brand', 'style', 'toe-type'],
  'mens-boots': ['size', 'color', 'material', 'brand', 'height', 'style', 'waterproof'],
  'mens-sandals': ['size', 'color', 'material', 'brand', 'style', 'closure-type'],
  'mens-slippers': ['size', 'color', 'material', 'brand', 'style', 'indoor-outdoor'],
  'womens-shoes': ['size', 'color', 'material', 'brand', 'style', 'heel-height', 'width'],
  'womens-heels': ['size', 'color', 'material', 'brand', 'heel-height', 'heel-type', 'style'],
  'womens-flats': ['size', 'color', 'material', 'brand', 'style', 'toe-type'],
  'womens-sneakers': ['size', 'color', 'material', 'brand', 'style', 'sport-type'],
  'womens-boots': ['size', 'color', 'material', 'brand', 'height', 'heel-height', 'style'],
  'womens-sandals': ['size', 'color', 'material', 'brand', 'heel-height', 'style'],
  'womens-slippers': ['size', 'color', 'material', 'brand', 'style', 'indoor-outdoor'],
  'kids-shoes': ['size', 'color', 'material', 'brand', 'age-group', 'gender', 'closure-type'],
  'boys-shoes': ['size', 'color', 'material', 'brand', 'age-group', 'style', 'closure-type'],
  'girls-shoes': ['size', 'color', 'material', 'brand', 'age-group', 'style', 'closure-type'],
  'baby-shoes': ['size', 'color', 'material', 'brand', 'age-group', 'soft-sole'],
  
  // Bags & Luggage
  'bags': ['color', 'material', 'brand', 'size', 'style', 'capacity', 'gender'],
  'handbags': ['color', 'material', 'brand', 'size', 'style', 'closure-type', 'strap-type'],
  'shoulder-bags': ['color', 'material', 'brand', 'size', 'style', 'strap-adjustable'],
  'crossbody-bags': ['color', 'material', 'brand', 'size', 'style', 'strap-length'],
  'tote-bags': ['color', 'material', 'brand', 'size', 'closure-type', 'pockets'],
  'clutches': ['color', 'material', 'brand', 'size', 'style', 'occasion'],
  'backpacks': ['color', 'material', 'brand', 'size', 'capacity', 'laptop-compartment', 'waterproof'],
  'school-backpacks': ['color', 'material', 'brand', 'size', 'age-group', 'compartments'],
  'travel-backpacks': ['color', 'material', 'brand', 'capacity', 'waterproof', 'laptop-size'],
  'messenger-bags': ['color', 'material', 'brand', 'size', 'laptop-size', 'compartments'],
  'briefcases': ['color', 'material', 'brand', 'size', 'laptop-size', 'lock'],
  'luggage': ['color', 'material', 'brand', 'size', 'wheels', 'expandable', 'lock'],
  'suitcases': ['color', 'material', 'brand', 'size', 'wheels', 'hard-soft', 'expandable'],
  'carry-on-luggage': ['color', 'material', 'brand', 'wheels', 'capacity', 'airline-approved'],
  'duffel-bags': ['color', 'material', 'brand', 'size', 'capacity', 'wheels'],
  'wallets': ['color', 'material', 'brand', 'size', 'gender', 'card-slots', 'coin-pocket'],
  'purses': ['color', 'material', 'brand', 'size', 'closure-type', 'card-slots'],
  
  // Accessories
  'accessories': ['color', 'material', 'brand', 'size', 'gender', 'style'],
  'jewelry': ['material', 'color', 'brand', 'size', 'stone-type', 'plating', 'style'],
  'necklaces': ['material', 'color', 'brand', 'length', 'stone-type', 'style'],
  'earrings': ['material', 'color', 'brand', 'stone-type', 'closure-type', 'style'],
  'bracelets': ['material', 'color', 'brand', 'size', 'stone-type', 'adjustable'],
  'rings': ['material', 'color', 'brand', 'size', 'stone-type', 'style'],
  'watches': ['brand', 'color', 'material', 'gender', 'movement-type', 'water-resistance', 'strap-material'],
  'mens-watches': ['brand', 'color', 'material', 'movement-type', 'water-resistance', 'dial-color'],
  'womens-watches': ['brand', 'color', 'material', 'movement-type', 'water-resistance', 'style'],
  'belts': ['size', 'color', 'material', 'brand', 'gender', 'buckle-type', 'width'],
  'mens-belts': ['size', 'color', 'material', 'brand', 'buckle-type', 'width', 'reversible'],
  'womens-belts': ['size', 'color', 'material', 'brand', 'buckle-type', 'width', 'style'],
  'hats': ['size', 'color', 'material', 'brand', 'gender', 'style', 'season'],
  'caps': ['size', 'color', 'material', 'brand', 'style', 'adjustable'],
  'beanies': ['color', 'material', 'brand', 'style', 'season'],
  'scarves': ['color', 'material', 'brand', 'size', 'pattern', 'season', 'gender'],
  'gloves': ['size', 'color', 'material', 'brand', 'gender', 'season', 'touchscreen'],
  'sunglasses': ['color', 'material', 'brand', 'gender', 'lens-type', 'uv-protection', 'polarized'],
  'eyeglasses': ['color', 'material', 'brand', 'gender', 'frame-shape', 'lens-type'],
  'ties': ['color', 'material', 'brand', 'width', 'pattern', 'length'],
  'bow-ties': ['color', 'material', 'brand', 'style', 'pre-tied'],
  'pocket-squares': ['color', 'material', 'brand', 'size', 'pattern'],
  'hair-accessories': ['color', 'material', 'brand', 'type', 'age-group'],
  
  // ==========================================
  // ELECTRONICS
  // ==========================================
  
  // Main Electronics Category
  'electronics': ['brand', 'color', 'warranty', 'condition'],
  
  // Mobile Devices & Tablets
  'mobile-devices': ['brand', 'color', 'storage', 'ram', 'screen-size', 'network'],
  'phones': ['brand', 'color', 'storage', 'ram', 'screen-size', 'network', 'camera'],
  'smartphones': ['brand', 'color', 'storage', 'ram', 'screen-size', 'network', 'camera', 'battery'],
  'feature-phones': ['brand', 'color', 'battery', 'dual-sim'],
  'tablets': ['brand', 'color', 'storage', 'screen-size', 'connectivity', 'ram'],
  'phone-accessories': ['brand', 'color', 'compatibility', 'material'],
  'phone-cases': ['brand', 'color', 'compatibility', 'material', 'protection-level'],
  'screen-protectors': ['brand', 'compatibility', 'material', 'type'],
  'chargers': ['brand', 'compatibility', 'power', 'fast-charging'],
  'power-banks': ['brand', 'capacity', 'ports', 'fast-charging'],
  
  // Computers & Laptops
  'computers': ['brand', 'processor', 'ram', 'storage', 'os'],
  'laptops': ['brand', 'processor', 'ram', 'storage', 'screen-size', 'os', 'graphics'],
  'notebooks': ['brand', 'processor', 'ram', 'storage', 'screen-size', 'os'],
  'ultrabooks': ['brand', 'processor', 'ram', 'storage', 'screen-size', 'weight'],
  'gaming-laptops': ['brand', 'processor', 'ram', 'storage', 'graphics', 'screen-size', 'refresh-rate'],
  'desktops': ['brand', 'processor', 'ram', 'storage', 'os', 'graphics'],
  'all-in-one-pcs': ['brand', 'processor', 'ram', 'storage', 'screen-size', 'os'],
  'workstations': ['brand', 'processor', 'ram', 'storage', 'graphics', 'os'],
  
  // Computer Components
  'computer-components': ['brand', 'compatibility', 'type'],
  'processors': ['brand', 'cores', 'speed', 'socket'],
  'motherboards': ['brand', 'socket', 'chipset', 'form-factor'],
  'ram': ['brand', 'capacity', 'speed', 'type'],
  'graphics-cards': ['brand', 'memory', 'chipset', 'ports'],
  'hard-drives': ['brand', 'capacity', 'type', 'speed'],
  'ssds': ['brand', 'capacity', 'interface', 'speed'],
  'power-supplies': ['brand', 'wattage', 'efficiency', 'modular'],
  'pc-cases': ['brand', 'size', 'color', 'cooling'],
  'cooling': ['brand', 'type', 'size', 'noise-level'],
  
  // Monitors & Displays
  'monitors': ['brand', 'screen-size', 'resolution', 'refresh-rate', 'panel-type'],
  'gaming-monitors': ['brand', 'screen-size', 'resolution', 'refresh-rate', 'response-time'],
  'professional-monitors': ['brand', 'screen-size', 'resolution', 'color-accuracy', 'panel-type'],
  'portable-monitors': ['brand', 'screen-size', 'resolution', 'connectivity'],
  
  // Computer Accessories
  'computer-accessories': ['brand', 'color', 'connectivity'],
  'keyboards': ['brand', 'connection-type', 'switch-type', 'layout', 'backlight'],
  'mechanical-keyboards': ['brand', 'switch-type', 'layout', 'backlight', 'hot-swappable'],
  'gaming-keyboards': ['brand', 'switch-type', 'backlight', 'macro-keys'],
  'mice': ['brand', 'connection-type', 'dpi', 'sensor-type'],
  'gaming-mice': ['brand', 'dpi', 'sensor-type', 'programmable-buttons', 'weight'],
  'mouse-pads': ['size', 'material', 'rgb', 'surface-type'],
  'webcams': ['brand', 'resolution', 'frame-rate', 'microphone'],
  'usb-hubs': ['brand', 'ports', 'usb-version', 'power-delivery'],
  'laptop-stands': ['material', 'adjustable', 'cooling', 'portability'],
  'docking-stations': ['brand', 'ports', 'power-delivery', 'display-support'],
  
  // Audio Equipment
  'audio': ['brand', 'color', 'connection-type'],
  'headphones': ['brand', 'color', 'connection-type', 'noise-cancellation', 'driver-size'],
  'gaming-headsets': ['brand', 'connection-type', 'microphone', 'surround-sound'],
  'earbuds': ['brand', 'color', 'connection-type', 'noise-cancellation', 'water-resistance'],
  'true-wireless-earbuds': ['brand', 'color', 'noise-cancellation', 'battery-life', 'water-resistance'],
  'speakers': ['brand', 'color', 'connection-type', 'power', 'water-resistance'],
  'bluetooth-speakers': ['brand', 'color', 'battery-life', 'water-resistance', 'power'],
  'soundbars': ['brand', 'channels', 'power', 'connectivity', 'subwoofer'],
  'microphones': ['brand', 'type', 'connection-type', 'polar-pattern'],
  'audio-interfaces': ['brand', 'inputs', 'outputs', 'sample-rate'],
  
  // Cameras & Photography
  'cameras': ['brand', 'megapixels', 'sensor-size', 'lens-mount', 'video-resolution'],
  'dslr-cameras': ['brand', 'megapixels', 'sensor-size', 'lens-mount', 'video-resolution'],
  'mirrorless-cameras': ['brand', 'megapixels', 'sensor-size', 'lens-mount', 'video-resolution'],
  'action-cameras': ['brand', 'resolution', 'water-resistant', 'stabilization', 'frame-rate'],
  'instant-cameras': ['brand', 'film-type', 'color'],
  'camera-lenses': ['brand', 'focal-length', 'aperture', 'mount', 'image-stabilization'],
  'camera-accessories': ['brand', 'compatibility', 'type'],
  'tripods': ['brand', 'height', 'weight-capacity', 'material'],
  'camera-bags': ['brand', 'size', 'material', 'weather-resistant'],
  
  // TVs & Home Entertainment
  'televisions': ['brand', 'screen-size', 'resolution', 'panel-type', 'smart-tv'],
  'smart-tvs': ['brand', 'screen-size', 'resolution', 'os', 'hdr'],
  '4k-tvs': ['brand', 'screen-size', 'hdr', 'refresh-rate', 'smart-tv'],
  '8k-tvs': ['brand', 'screen-size', 'hdr', 'refresh-rate', 'smart-tv'],
  'oled-tvs': ['brand', 'screen-size', 'resolution', 'hdr', 'smart-tv'],
  'qled-tvs': ['brand', 'screen-size', 'resolution', 'hdr', 'smart-tv'],
  'projectors': ['brand', 'resolution', 'brightness', 'throw-distance', 'connectivity'],
  'streaming-devices': ['brand', 'resolution', 'os', 'voice-control'],
  'tv-mounts': ['size-compatibility', 'type', 'weight-capacity', 'adjustable'],
  
  // Gaming
  'gaming': ['brand', 'platform', 'genre'],
  'gaming-consoles': ['brand', 'storage', 'color', 'generation'],
  'console-accessories': ['brand', 'compatibility', 'type'],
  'gaming-controllers': ['brand', 'compatibility', 'wireless', 'programmable'],
  'vr-headsets': ['brand', 'resolution', 'refresh-rate', 'tracking', 'standalone'],
  'gaming-chairs': ['brand', 'material', 'adjustable', 'weight-capacity'],
  
  // Wearables & Smart Devices
  'wearables': ['brand', 'color', 'compatibility'],
  'smartwatches': ['brand', 'color', 'compatibility', 'water-resistance', 'battery-life'],
  'fitness-trackers': ['brand', 'color', 'water-resistance', 'battery-life', 'heart-rate'],
  'smart-bands': ['brand', 'color', 'water-resistance', 'battery-life'],
  'smart-glasses': ['brand', 'connectivity', 'battery-life'],
  
  // Networking & Smart Home
  'networking': ['brand', 'speed', 'connectivity'],
  'routers': ['brand', 'speed', 'wifi-standard', 'coverage', 'ports'],
  'mesh-wifi': ['brand', 'speed', 'coverage', 'nodes'],
  'modems': ['brand', 'speed', 'compatibility', 'ports'],
  'network-switches': ['brand', 'ports', 'speed', 'managed'],
  'wifi-extenders': ['brand', 'speed', 'coverage', 'wifi-standard'],
  'smart-home': ['brand', 'compatibility', 'connectivity'],
  'smart-lights': ['brand', 'color', 'brightness', 'compatibility'],
  'smart-plugs': ['brand', 'power', 'compatibility', 'energy-monitoring'],
  'smart-speakers': ['brand', 'assistant', 'audio-quality', 'smart-home-hub'],
  
  // Storage & Memory
  'storage': ['brand', 'capacity', 'type'],
  'external-hard-drives': ['brand', 'capacity', 'interface', 'portable'],
  'external-ssds': ['brand', 'capacity', 'interface', 'speed'],
  'usb-flash-drives': ['brand', 'capacity', 'usb-version', 'speed'],
  'memory-cards': ['brand', 'capacity', 'speed', 'type'],
  'nas': ['brand', 'bays', 'capacity', 'raid'],
  
  // Printers & Scanners
  'printers': ['brand', 'type', 'color-printing', 'connectivity'],
  'inkjet-printers': ['brand', 'color-printing', 'connectivity', 'duplex'],
  'laser-printers': ['brand', 'color-printing', 'speed', 'connectivity'],
  '3d-printers': ['brand', 'build-volume', 'technology', 'resolution'],
  'scanners': ['brand', 'type', 'resolution', 'connectivity'],
  'printer-ink': ['brand', 'compatibility', 'color', 'yield'],
  
  // Cables & Adapters
  'cables-adapters': ['type', 'length', 'version'],
  'hdmi-cables': ['length', 'version', 'resolution-support'],
  'usb-cables': ['type', 'length', 'version', 'speed'],
  'charging-cables': ['type', 'length', 'compatibility', 'fast-charging'],
  'adapters': ['type', 'compatibility', 'ports'],
  'converters': ['type', 'input', 'output'],
  
  // ==========================================
  // HEALTH & BEAUTY
  // ==========================================
  
  // Main Health & Beauty Category
  'health-beauty': ['brand', 'size', 'scent', 'skin-type', 'gender'],
  'beauty': ['brand', 'size', 'color', 'scent', 'skin-type'],
  
  // Skincare
  'skincare': ['brand', 'size', 'skin-type', 'spf', 'ingredients', 'age-group'],
  'face-wash': ['brand', 'size', 'skin-type', 'ingredients', 'scent'],
  'facial-cleansers': ['brand', 'size', 'skin-type', 'form', 'ingredients'],
  'moisturizers': ['brand', 'size', 'skin-type', 'spf', 'day-night'],
  'face-creams': ['brand', 'size', 'skin-type', 'spf', 'anti-aging'],
  'serums': ['brand', 'size', 'skin-type', 'ingredients', 'concern'],
  'face-oils': ['brand', 'size', 'skin-type', 'ingredients'],
  'toners': ['brand', 'size', 'skin-type', 'alcohol-free'],
  'exfoliators': ['brand', 'size', 'skin-type', 'type', 'frequency'],
  'face-masks': ['brand', 'size', 'skin-type', 'type', 'concern'],
  'sheet-masks': ['brand', 'skin-type', 'ingredients', 'pack-size'],
  'eye-cream': ['brand', 'size', 'concern', 'age-group'],
  'sunscreen': ['brand', 'size', 'spf', 'water-resistant', 'skin-type'],
  'acne-treatment': ['brand', 'size', 'active-ingredient', 'skin-type'],
  'anti-aging': ['brand', 'size', 'type', 'ingredients', 'age-group'],
  'body-lotion': ['brand', 'size', 'skin-type', 'scent', 'spf'],
  'body-butter': ['brand', 'size', 'scent', 'ingredients'],
  'hand-cream': ['brand', 'size', 'scent', 'fast-absorbing'],
  'foot-cream': ['brand', 'size', 'concern', 'ingredients'],
  
  // Makeup
  'makeup': ['brand', 'color', 'shade', 'finish', 'skin-type'],
  'foundation': ['brand', 'shade', 'finish', 'skin-type', 'coverage', 'spf'],
  'concealer': ['brand', 'shade', 'coverage', 'skin-type', 'concern'],
  'powder': ['brand', 'shade', 'finish', 'skin-type', 'pressed-loose'],
  'blush': ['brand', 'color', 'finish', 'skin-type', 'form'],
  'bronzer': ['brand', 'shade', 'finish', 'skin-type'],
  'highlighter': ['brand', 'shade', 'finish', 'form'],
  'contour': ['brand', 'shade', 'form', 'skin-type'],
  'primer': ['brand', 'type', 'skin-type', 'finish'],
  'setting-spray': ['brand', 'size', 'finish', 'skin-type'],
  'lipstick': ['brand', 'color', 'finish', 'long-lasting', 'moisturizing'],
  'lip-gloss': ['brand', 'color', 'finish', 'plumping'],
  'lip-liner': ['brand', 'color', 'long-lasting', 'waterproof'],
  'lip-balm': ['brand', 'flavor', 'spf', 'tinted'],
  'eyeshadow': ['brand', 'color', 'finish', 'palette-size', 'pigmentation'],
  'eyeshadow-palette': ['brand', 'colors', 'finish', 'theme'],
  'eyeliner': ['brand', 'color', 'type', 'waterproof', 'long-lasting'],
  'mascara': ['brand', 'color', 'waterproof', 'volume', 'lengthening'],
  'eyebrow-pencil': ['brand', 'color', 'type', 'waterproof'],
  'eyebrow-gel': ['brand', 'color', 'hold', 'tinted'],
  'false-lashes': ['brand', 'style', 'length', 'reusable'],
  'makeup-remover': ['brand', 'size', 'type', 'skin-type', 'waterproof'],
  'makeup-brushes': ['brand', 'type', 'material', 'set-size'],
  'makeup-sponges': ['brand', 'type', 'material', 'pack-size'],
  
  // Haircare
  'haircare': ['brand', 'size', 'hair-type', 'scent', 'concern'],
  'shampoo': ['brand', 'size', 'hair-type', 'scent', 'sulfate-free'],
  'conditioner': ['brand', 'size', 'hair-type', 'scent', 'leave-in'],
  'hair-masks': ['brand', 'size', 'hair-type', 'concern'],
  'hair-oil': ['brand', 'size', 'hair-type', 'ingredients'],
  'hair-serum': ['brand', 'size', 'hair-type', 'concern'],
  'hair-styling': ['brand', 'size', 'hair-type', 'hold', 'finish'],
  'hair-gel': ['brand', 'size', 'hold', 'shine'],
  'hair-mousse': ['brand', 'size', 'hold', 'volume'],
  'hair-spray': ['brand', 'size', 'hold', 'finish'],
  'hair-wax': ['brand', 'size', 'hold', 'shine'],
  'hair-pomade': ['brand', 'size', 'hold', 'shine'],
  'dry-shampoo': ['brand', 'size', 'scent', 'hair-color'],
  'hair-color': ['brand', 'color', 'type', 'permanent', 'ammonia-free'],
  'hair-dye': ['brand', 'color', 'type', 'duration'],
  'hair-bleach': ['brand', 'volume', 'type'],
  'hair-treatment': ['brand', 'size', 'concern', 'type'],
  'anti-dandruff': ['brand', 'size', 'active-ingredient'],
  'hair-growth': ['brand', 'size', 'type', 'ingredients'],
  'hair-tools': ['brand', 'type', 'heat-settings', 'material'],
  'hair-dryers': ['brand', 'wattage', 'heat-settings', 'attachments'],
  'hair-straighteners': ['brand', 'plate-material', 'heat-settings', 'plate-width'],
  'curling-irons': ['brand', 'barrel-size', 'heat-settings', 'material'],
  'hair-brushes': ['brand', 'type', 'bristle-type', 'size'],
  'hair-combs': ['brand', 'type', 'material', 'teeth-spacing'],
  
  // Fragrance
  'fragrance': ['brand', 'size', 'scent', 'gender', 'concentration'],
  'perfume': ['brand', 'size', 'scent', 'gender', 'concentration', 'notes'],
  'eau-de-parfum': ['brand', 'size', 'scent', 'gender', 'notes'],
  'eau-de-toilette': ['brand', 'size', 'scent', 'gender', 'notes'],
  'cologne': ['brand', 'size', 'scent', 'concentration'],
  'body-spray': ['brand', 'size', 'scent', 'gender'],
  'body-mist': ['brand', 'size', 'scent', 'gender'],
  'fragrance-sets': ['brand', 'pieces', 'scent', 'gender'],
  
  // Personal Care
  'personal-care': ['brand', 'size', 'scent', 'type'],
  'deodorant': ['brand', 'size', 'scent', 'type', 'gender', 'aluminum-free'],
  'antiperspirant': ['brand', 'size', 'scent', 'gender', 'protection-hours'],
  'body-wash': ['brand', 'size', 'scent', 'skin-type', 'moisturizing'],
  'shower-gel': ['brand', 'size', 'scent', 'skin-type'],
  'bar-soap': ['brand', 'scent', 'skin-type', 'pack-size'],
  'hand-soap': ['brand', 'size', 'scent', 'antibacterial', 'moisturizing'],
  'hand-sanitizer': ['brand', 'size', 'scent', 'alcohol-percentage'],
  'bath-salts': ['brand', 'size', 'scent', 'benefits'],
  'bath-bombs': ['brand', 'scent', 'ingredients', 'pack-size'],
  'bubble-bath': ['brand', 'size', 'scent', 'moisturizing'],
  
  // Oral Care
  'oral-care': ['brand', 'size', 'flavor', 'type'],
  'toothpaste': ['brand', 'size', 'flavor', 'whitening', 'fluoride'],
  'toothbrush': ['brand', 'type', 'bristle-softness', 'head-size'],
  'electric-toothbrush': ['brand', 'type', 'modes', 'battery-life'],
  'mouthwash': ['brand', 'size', 'flavor', 'alcohol-free', 'whitening'],
  'dental-floss': ['brand', 'length', 'flavor', 'waxed'],
  'teeth-whitening': ['brand', 'type', 'treatment-duration'],
  'denture-care': ['brand', 'size', 'type'],
  
  // Shaving & Hair Removal
  'shaving': ['brand', 'type', 'gender', 'size'],
  'razors': ['brand', 'type', 'gender', 'blade-count'],
  'electric-shavers': ['brand', 'type', 'gender', 'wet-dry', 'battery-life'],
  'shaving-cream': ['brand', 'size', 'scent', 'gender', 'skin-type'],
  'shaving-gel': ['brand', 'size', 'scent', 'gender'],
  'aftershave': ['brand', 'size', 'scent', 'alcohol-free'],
  'hair-removal-cream': ['brand', 'size', 'body-part', 'skin-type'],
  'wax-strips': ['brand', 'body-part', 'skin-type', 'count'],
  'epilators': ['brand', 'type', 'wet-dry', 'speed-settings'],
  
  // Nail Care
  'nail-care': ['brand', 'color', 'type', 'finish'],
  'nail-polish': ['brand', 'color', 'finish', 'quick-dry'],
  'gel-polish': ['brand', 'color', 'finish', 'led-uv'],
  'nail-polish-remover': ['brand', 'size', 'acetone-free', 'scent'],
  'nail-treatment': ['brand', 'size', 'type', 'concern'],
  'nail-tools': ['brand', 'type', 'material'],
  'nail-clippers': ['brand', 'type', 'size'],
  'nail-files': ['brand', 'grit', 'type', 'pack-size'],
  'cuticle-care': ['brand', 'type', 'size'],
  'artificial-nails': ['brand', 'type', 'length', 'count'],
  
  // Men's Grooming
  'mens-grooming': ['brand', 'type', 'scent', 'size'],
  'beard-oil': ['brand', 'size', 'scent', 'ingredients'],
  'beard-balm': ['brand', 'size', 'scent', 'hold'],
  'beard-wash': ['brand', 'size', 'scent'],
  'beard-trimmer': ['brand', 'length-settings', 'battery-life', 'wet-dry'],
  'hair-clippers': ['brand', 'length-settings', 'attachments', 'battery-life'],
  
  // Beauty Tools & Accessories
  'beauty-tools': ['brand', 'type', 'material', 'use'],
  'makeup-mirrors': ['brand', 'size', 'magnification', 'lighting'],
  'facial-cleansing-brush': ['brand', 'type', 'speed-settings', 'waterproof'],
  'jade-roller': ['brand', 'material', 'type'],
  'gua-sha': ['brand', 'material', 'shape'],
  'eyelash-curler': ['brand', 'type', 'material'],
  'tweezers': ['brand', 'type', 'tip-shape'],
  'cosmetic-bags': ['brand', 'size', 'material', 'compartments'],
  
  // ==========================================
  // BOOKS, MUSIC & MEDIA
  // ==========================================
  
  // Main Books, Music & Media Category
  'books-music-media': ['author', 'language', 'format', 'genre', 'brand'],
  'media': ['format', 'genre', 'language', 'rating'],
  
  // Books
  'books': ['author', 'language', 'format', 'pages', 'publisher', 'genre', 'isbn'],
  'fiction': ['author', 'language', 'format', 'pages', 'genre', 'series'],
  'non-fiction': ['author', 'language', 'format', 'pages', 'topic', 'edition'],
  'biography': ['author', 'language', 'format', 'pages', 'subject'],
  'self-help': ['author', 'language', 'format', 'pages', 'topic'],
  'business-books': ['author', 'language', 'format', 'pages', 'topic'],
  'cookbooks': ['author', 'language', 'format', 'pages', 'cuisine', 'diet-type'],
  'travel-books': ['author', 'language', 'format', 'pages', 'destination'],
  'children-books': ['author', 'language', 'format', 'age-group', 'illustrated', 'pages'],
  'picture-books': ['author', 'language', 'age-group', 'illustrated', 'pages'],
  'young-adult': ['author', 'language', 'format', 'genre', 'pages'],
  'textbooks': ['author', 'language', 'format', 'subject', 'edition', 'level'],
  'reference-books': ['author', 'language', 'format', 'subject', 'edition'],
  'comics': ['author', 'language', 'format', 'genre', 'series', 'issue'],
  'graphic-novels': ['author', 'language', 'format', 'genre', 'pages'],
  'manga': ['author', 'language', 'format', 'genre', 'volume'],
  'poetry': ['author', 'language', 'format', 'pages', 'style'],
  'religious-books': ['author', 'language', 'format', 'religion', 'pages'],
  
  // E-Books & Audiobooks
  'ebooks': ['author', 'language', 'format', 'pages', 'genre', 'file-format'],
  'audiobooks': ['author', 'language', 'duration', 'narrator', 'format', 'genre'],
  
  // Music
  'music': ['artist', 'genre', 'format', 'duration', 'language'],
  'cds': ['artist', 'genre', 'tracks', 'year', 'label'],
  'vinyl': ['artist', 'genre', 'tracks', 'year', 'speed', 'condition'],
  'cassettes': ['artist', 'genre', 'tracks', 'year', 'condition'],
  'digital-music': ['artist', 'genre', 'tracks', 'format', 'bitrate'],
  'music-albums': ['artist', 'genre', 'tracks', 'year', 'format'],
  'singles': ['artist', 'genre', 'format', 'year'],
  'compilations': ['genre', 'tracks', 'year', 'format'],
  'soundtracks': ['genre', 'tracks', 'year', 'format', 'movie-tv'],
  
  // Movies & TV
  'movies': ['genre', 'format', 'language', 'rating', 'duration', 'year'],
  'dvds': ['genre', 'language', 'rating', 'duration', 'region', 'subtitles'],
  'blu-ray': ['genre', 'language', 'rating', 'duration', 'region', 'resolution'],
  '4k-blu-ray': ['genre', 'language', 'rating', 'duration', 'hdr', 'region'],
  'digital-movies': ['genre', 'language', 'rating', 'duration', 'quality', 'platform'],
  'tv-shows': ['genre', 'language', 'rating', 'seasons', 'format', 'episodes'],
  'tv-series-dvd': ['genre', 'language', 'rating', 'seasons', 'region'],
  'documentaries': ['topic', 'language', 'format', 'duration', 'year'],
  'anime': ['genre', 'language', 'format', 'episodes', 'subtitles'],
  
  // Video Games
  'video-games': ['platform', 'genre', 'rating', 'multiplayer', 'language'],
  'pc-games': ['genre', 'rating', 'multiplayer', 'language', 'system-requirements'],
  'playstation-games': ['platform', 'genre', 'rating', 'multiplayer', 'language'],
  'xbox-games': ['platform', 'genre', 'rating', 'multiplayer', 'language'],
  'nintendo-games': ['platform', 'genre', 'rating', 'multiplayer', 'language'],
  'mobile-games': ['platform', 'genre', 'rating', 'in-app-purchases'],
  'vr-games': ['platform', 'genre', 'rating', 'vr-headset'],
  'game-codes': ['platform', 'game-title', 'region', 'edition'],
  'game-subscriptions': ['platform', 'duration', 'games-included'],
  
  // Magazines & Newspapers
  'magazines': ['language', 'frequency', 'topic', 'issue'],
  'fashion-magazines': ['language', 'frequency', 'issue'],
  'tech-magazines': ['language', 'frequency', 'issue'],
  'sports-magazines': ['language', 'frequency', 'sport-type'],
  'news-magazines': ['language', 'frequency', 'topic'],
  'newspapers': ['language', 'frequency', 'region', 'date'],
  
  // Educational Media
  'educational-media': ['subject', 'language', 'format', 'level'],
  'language-learning': ['language', 'format', 'level', 'method'],
  'online-courses': ['subject', 'language', 'duration', 'level', 'platform'],
  'tutorial-videos': ['subject', 'language', 'duration', 'level'],
  
  // Add more categories as needed...
};

/**
 * Get attributes for a category
 * @param {string} categorySlug - The category slug
 * @returns {string[]} Array of attribute slugs
 */
export function getAttributesForCategory(categorySlug) {
  return categoryAttributeMap[categorySlug] || [];
}

/**
 * Get attributes for multiple categories (union)
 * @param {string[]} categorySlugs - Array of category slugs
 * @returns {string[]} Array of unique attribute slugs
 */
export function getAttributesForCategories(categorySlugs) {
  const attributeSet = new Set();
  
  categorySlugs.forEach(slug => {
    const attributes = getAttributesForCategory(slug);
    attributes.forEach(attr => attributeSet.add(attr));
  });
  
  return Array.from(attributeSet);
}

/**
 * Check if a category has specific attribute mapping
 * @param {string} categorySlug - The category slug
 * @returns {boolean}
 */
export function hasAttributeMapping(categorySlug) {
  return categorySlug in categoryAttributeMap;
}
